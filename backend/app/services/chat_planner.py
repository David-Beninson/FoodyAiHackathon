import logging
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from typing_extensions import TypedDict

from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage, AIMessage
from langchain_core.tools import tool
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode

from app.config import settings
from app.models.user import UserProfile
from app.models.chat_session import ChatSession, ChatMessage
from app.services.ai import AIService

logger = logging.getLogger("uvicorn")

class PlannerState(TypedDict):
    messages: List[BaseMessage]
    user_profile: Dict[str, Any]
    ingredients: List[str]
    shopping_list: List[str]
    draft_plan: Optional[Dict[str, Any]]
    agent_response: str

class ChatPlannerService:
    @staticmethod
    def get_llm():
        """Get Gemini client wrapped for LangChain."""
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set in environment settings.")
        return ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=api_key,
            temperature=0.7
        )

    @classmethod
    def create_agent_graph(cls, user: UserProfile):
        """Creates and compiles the LangGraph workflow."""
        llm = cls.get_llm()

        profile_summary = (
            f"Goals: {', '.join(user.goals) if user.goals else 'None'}\n"
            f"Allergies: {', '.join(user.allergies) if user.allergies else 'None'}\n"
            f"Preferences: {', '.join(user.preferences) if user.preferences else 'None'}\n"
            f"Daily Targets: {user.daily_macros_target.calories} kcal, "
            f"Protein: {user.daily_macros_target.protein}g, "
            f"Carbs: {user.daily_macros_target.carbs}g, "
            f"Fat: {user.daily_macros_target.fat}g"
        )

        @tool
        def generate_weekly_menu(prompt_notes: str) -> str:
            """
            Call this tool when the user explicitly requests to generate the weekly plan/menu,
            or when you have gathered enough details (like ingredients, preferences) to formulate it.
            prompt_notes: Any custom ingredients, items to buy, or changes specified by the user.
            """
            try:
                response_obj = AIService.generate_weekly_plan(user, prompt_override=prompt_notes)
                return json.dumps(response_obj.model_dump())
            except Exception as e:
                logger.error(f"Error in generate_weekly_menu tool: {e}")
                return json.dumps({"error": str(e)})

        tools = [generate_weekly_menu]
        llm_with_tools = llm.bind_tools(tools)

        def agent_node(state: PlannerState) -> Dict[str, Any]:
            system_instruction = (
                "You are FoodyAI Planner Advisor, a helper to design weekly menus.\n"
                f"User Profile Info:\n{profile_summary}\n\n"
                f"Current Ingredients in house: {', '.join(state['ingredients']) if state['ingredients'] else 'None'}\n"
                f"Current Shopping List: {', '.join(state['shopping_list']) if state['shopping_list'] else 'None'}\n\n"
                "Your job:\n"
                "1. Talk with the user to understand what ingredients they have, what they want to cook, or what to buy.\n"
                "2. When they ask to generate the menu or when you have all needed ingredients/preferences, call the `generate_weekly_menu` tool.\n"
                "3. In your dialogue, be concise, friendly, and speak in English.\n"
                "4. If you call `generate_weekly_menu`, briefly explain to the user in English that you have generated their menu and they can review it below."
            )

            messages = [SystemMessage(content=system_instruction)] + state["messages"]
            response = llm_with_tools.invoke(messages)
            
            # Safe extraction for agent text (if it's a tool call, content might be empty)
            agent_text = response.content if response.content else ""
            
            return {
                "messages": [response],
                "agent_response": agent_text
            }

        def tool_routing(state: PlannerState):
            last_message = state["messages"][-1]
            if hasattr(last_message, "tool_calls") and last_message.tool_calls:
                return "execute_tools"
            return END

        def process_tool_output_node(state: PlannerState) -> Dict[str, Any]:
            draft_plan = state.get("draft_plan")
            for msg in reversed(state["messages"]):
                if msg.type == "tool" and msg.name == "generate_weekly_menu":
                    try:
                        res_dict = json.loads(msg.content)
                        if "error" not in res_dict:
                            draft_plan = res_dict
                    except Exception:
                        pass
            return {"draft_plan": draft_plan}

        # Build graph
        workflow = StateGraph(PlannerState)
        workflow.add_node("agent", agent_node)
        workflow.add_node("execute_tools", ToolNode(tools))
        workflow.add_node("process_tool_output", process_tool_output_node)

        workflow.add_edge(START, "agent")
        workflow.add_conditional_edges("agent", tool_routing, {
            "execute_tools": "execute_tools",
            END: END
        })
        workflow.add_edge("execute_tools", "process_tool_output")
        workflow.add_edge("process_tool_output", END)

        return workflow.compile()

    @classmethod
    async def process_chat_message(
        cls, session: ChatSession, user: UserProfile, user_message: str
    ) -> ChatSession:
        """Processes a new user message, updates chat session history & draft plan."""
        lc_messages: List[BaseMessage] = []
        for msg in session.messages:
            if msg.role == "user":
                lc_messages.append(HumanMessage(content=msg.content))
            else:
                lc_messages.append(AIMessage(content=msg.content))
        
        lc_messages.append(HumanMessage(content=user_message))
        
        state: PlannerState = {
            "messages": lc_messages,
            "user_profile": user.model_dump(),
            "ingredients": session.ingredients,
            "shopping_list": session.shopping_list,
            "draft_plan": session.draft_plan,
            "agent_response": ""
        }

        try:
            graph = cls.create_agent_graph(user)
            final_state = await graph.ainvoke(state)
            
            agent_text = final_state["agent_response"]
            
            # If the tool generated a new plan but agent text is empty, provide a clean response
            if not agent_text and final_state.get("draft_plan") != session.draft_plan:
                agent_text = "I have successfully generated your customized weekly menu draft! You can see it below."

            session.messages.append(ChatMessage(role="user", content=user_message))
            session.messages.append(ChatMessage(role="assistant", content=agent_text))
            
            session.draft_plan = final_state.get("draft_plan")
            session.updated_at = datetime.now(timezone.utc) # Fixed timezone call
            
            await session.save()
        except Exception as e:
            logger.error(f"Failed to process chat in LangGraph: {e}")
            session.messages.append(ChatMessage(role="user", content=user_message))
            
            # Fallback logic
            user_msg_lower = user_message.lower()
            if any(k in user_msg_lower for k in ["generate", "menu", "plan", "מתכון", "תפריט", "תכין"]):
                try:
                    response_obj = AIService.generate_weekly_plan(user, prompt_override=user_message)
                    session.draft_plan = response_obj.model_dump()
                    reply = "I've successfully generated a fallback weekly menu for you! You can see it below."
                except Exception as ex:
                    reply = f"Sorry, I ran into an issue generating the menu: {str(ex)}"
            else:
                reply = "I'm here to help you plan! Tell me what ingredients you have at home or if you would like me to generate a menu."
                
            session.messages.append(ChatMessage(role="assistant", content=reply))
            session.updated_at = datetime.now(timezone.utc)
            await session.save()

        return session
