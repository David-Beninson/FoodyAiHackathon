import logging
import json
import random
from typing import List, Optional, Dict
from pydantic import BaseModel
from app.config import settings
from app.models.user import UserProfile, Macros
from app.models.plan import MealPlan, DayPlan

logger = logging.getLogger("uvicorn")

# --- Pydantic models for structured AI output ---
class AIMeal(BaseModel):
    name: str
    description: str
    calories: float
    protein: float
    carbs: float
    fat: float
    ai_explanation: str

class AIDay(BaseModel):
    breakfast: AIMeal
    lunch: AIMeal
    dinner: AIMeal

class AIWeeklyPlanResponse(BaseModel):
    Sunday: AIDay
    Monday: AIDay
    Tuesday: AIDay
    Wednesday: AIDay
    Thursday: AIDay
    Friday: AIDay
    Saturday: AIDay


class AIService:
    @staticmethod
    def _get_openai_client():
        if not settings.OPENAI_API_KEY:
            return None
        try:
            from openai import OpenAI
            return OpenAI(api_key=settings.OPENAI_API_KEY)
        except ImportError:
            logger.warning("openai package is not available, falling back.")
            return None

    @staticmethod
    def _get_gemini_client():
        if not settings.GEMINI_API_KEY:
            return None
        try:
            from google import genai
            from google.genai import types
            return genai.Client(
                api_key=settings.GEMINI_API_KEY,
                http_options=types.HttpOptions(timeout=15_000)  # 15 seconds timeout
            )
        except ImportError:
            logger.warning("google-genai package is not available, falling back.")
            return None

    @classmethod
    def generate_weekly_plan(
        cls, user: UserProfile, prompt_override: Optional[str] = None
    ) -> AIWeeklyPlanResponse:
        """
        Generates a 7-day weekly meal plan based on user profile and optional custom requests.
        """
        system_prompt = f"""
        You are FoodyAI, an expert nutritionist. Generate a personalized 7-day weekly meal plan (Sunday to Saturday) based on:
        Age: {user.age}
        Weight: {user.weight} kg
        Height: {user.height} cm
        Gender: {user.gender}
        Activity Level: {user.activity_level}
        Goals: {", ".join(user.goals)}
        Allergies: {", ".join(user.allergies) if user.allergies else 'None'}
        Preferences: {", ".join(user.preferences) if user.preferences else 'None'}
        Daily Target Macros: Calories: {user.daily_macros_target.calories} kcal, Protein: {user.daily_macros_target.protein}g, Carbs: {user.daily_macros_target.carbs}g, Fat: {user.daily_macros_target.fat}g

        Strict Rules:
        1. 90% of meals must follow the user's preferences and completely avoid all listed allergies.
        2. 10% of meals should introduce healthy variety or address the user's request: '{prompt_override or "None"}'.
        3. The sum of macros for breakfast, lunch, and dinner each day must match the daily target macros (within 10% tolerance).
        4. Meals should be described in English to match the user's interface language.
        5. Provide a short explanation (in English) for why this meal fits their goal in the 'ai_explanation' field.
        """

        user_prompt = "Generate the 7-day meal plan conforming to the requested schema."

        # 1. Try Gemini
        gemini_client = cls._get_gemini_client()
        if gemini_client:
            logger.info("Generating weekly plan using Gemini API...")
            try:
                from google.genai import types
                response = gemini_client.models.generate_content(
                    model='gemini-3.5-flash',
                    contents=f"{system_prompt}\n\n{user_prompt}",
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=AIWeeklyPlanResponse,
                        temperature=0.7,
                    ),
                )
                data = json.loads(response.text)
                return AIWeeklyPlanResponse(**data)
            except Exception as e:
                logger.error(f"Gemini weekly plan generation failed: {e}. Trying OpenAI...")

        # 2. Try OpenAI
        openai_client = cls._get_openai_client()
        if openai_client:
            logger.info("Generating weekly plan using OpenAI API...")
            try:
                response = openai_client.beta.chat.completions.parse(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format=AIWeeklyPlanResponse,
                    temperature=0.7,
                )
                if response.choices[0].message.parsed:
                    return response.choices[0].message.parsed
            except Exception as e:
                logger.error(f"OpenAI weekly plan generation failed: {e}.")

        # 3. Fallback to mock generation if no keys or API failed
        logger.warning("No API keys set or APIs failed. Using fallback rule-based generator.")
        return cls._generate_mock_weekly_plan(user, prompt_override)

    @classmethod
    def generate_single_meal(
        cls, user: UserProfile, meal_type: str, prompt_override: Optional[str] = None
    ) -> AIMeal:
        """
        Generates a single meal (breakfast, lunch, dinner) matching the user's macros and preferences.
        """
        multiplier = 0.3 if meal_type in ["breakfast", "dinner"] else 0.4
        target_calories = user.daily_macros_target.calories * multiplier
        target_protein = user.daily_macros_target.protein * multiplier
        target_carbs = user.daily_macros_target.carbs * multiplier
        target_fat = user.daily_macros_target.fat * multiplier

        system_prompt = f"""
        You are FoodyAI, an expert nutritionist. Generate a single healthy meal of type '{meal_type}' based on the user's profile:
        Age: {user.age}
        Weight: {user.weight} kg
        Height: {user.height} cm
        Goals: {", ".join(user.goals)}
        Allergies: {", ".join(user.allergies) if user.allergies else 'None'}
        Preferences: {", ".join(user.preferences) if user.preferences else 'None'}
        Target macros for this specific meal: Calories: {target_calories} kcal, Protein: {target_protein}g, Carbs: {target_carbs}g, Fat: {target_fat}g

        Strict Rules:
        1. Fully respect allergies and preferences.
        2. Address custom requests if specified: '{prompt_override or "None"}'.
        3. Meal description and name must be in English.
        4. Provide an explanation in English why it fits their goal in the 'ai_explanation' field.
        """

        # 1. Try Gemini
        gemini_client = cls._get_gemini_client()
        if gemini_client:
            try:
                from google.genai import types
                response = gemini_client.models.generate_content(
                    model='gemini-3.5-flash',
                    contents=system_prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=AIMeal,
                    ),
                )
                return AIMeal(**json.loads(response.text))
            except Exception as e:
                logger.error(f"Gemini single meal generation failed: {e}")

        # 2. Try OpenAI
        openai_client = cls._get_openai_client()
        if openai_client:
            try:
                response = openai_client.beta.chat.completions.parse(
                    model="gpt-4o-mini",
                    messages=[{"role": "system", "content": system_prompt}],
                    response_format=AIMeal,
                )
                if response.choices[0].message.parsed:
                    return response.choices[0].message.parsed
            except Exception as e:
                logger.error(f"OpenAI single meal generation failed: {e}")

        # 3. Fallback mock
        return cls._generate_mock_meal(meal_type, user.daily_macros_target, user)

    @classmethod
    def generate_completion_meal(
        cls, user: UserProfile, date: str, skipped_meal_type: str, missing_macros: Macros
    ) -> AIMeal:
        """
        Generates a small meal or snack to make up for missed calories and protein from a skipped meal.
        """
        system_prompt = f"""
        You are FoodyAI. The user skipped their '{skipped_meal_type}' today and has a nutritional deficit of:
        Calories: {missing_macros.calories} kcal
        Protein: {missing_macros.protein}g
        Carbs: {missing_macros.carbs}g
        Fat: {missing_macros.fat}g

        Generate a single meal or snack (called a 'Completion Meal') that closely matches these missing macros.
        - Respect allergies: {", ".join(user.allergies) if user.allergies else 'None'}
        - Respect preferences: {", ".join(user.preferences) if user.preferences else 'None'}
        - Language: English.
        """

        # 1. Try Gemini
        gemini_client = cls._get_gemini_client()
        if gemini_client:
            try:
                from google.genai import types
                response = gemini_client.models.generate_content(
                    model='gemini-3.5-flash',
                    contents=system_prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        response_schema=AIMeal,
                    ),
                )
                return AIMeal(**json.loads(response.text))
            except Exception as e:
                logger.error(f"Gemini completion generation failed: {e}")

        # 2. Try OpenAI
        openai_client = cls._get_openai_client()
        if openai_client:
            try:
                response = openai_client.beta.chat.completions.parse(
                    model="gpt-4o-mini",
                    messages=[{"role": "system", "content": system_prompt}],
                    response_format=AIMeal,
                )
                if response.choices[0].message.parsed:
                    return response.choices[0].message.parsed
            except Exception as e:
                logger.error(f"OpenAI completion generation failed: {e}")

        # 3. Fallback mock
        return cls._generate_mock_meal("completion", missing_macros, user)

    @classmethod
    def chat_advisor(cls, user: UserProfile, message: str, history: List[Dict[str, str]]) -> str:
        """
        Maintains an interactive chat conversation with the user as an AI food advisor.
        """
        system_prompt = f"""
        You are FoodyAI, a friendly AI Food Adviser helping the user organize their meals.
        User Profile details:
        Age: {user.age}, Weight: {user.weight} kg, Height: {user.height} cm, Gender: {user.gender}
        Goals: {", ".join(user.goals)}
        Allergies: {", ".join(user.allergies) if user.allergies else 'None'}
        Preferences: {", ".join(user.preferences) if user.preferences else 'None'}
        Daily Target: {user.daily_macros_target.calories} kcal, Protein: {user.daily_macros_target.protein}g

        Help the user, answer questions, recommend healthy substitutions, and give friendly nutritional tips.
        Speak in English. Keep responses concise, friendly, and supportive.
        """

        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": message})

        # 1. Try Gemini
        gemini_client = cls._get_gemini_client()
        if gemini_client:
            try:
                # Format history for google-genai Client
                from google.genai import types
                contents = []
                for m in messages:
                    # Client takes strings, or Content objects. We can compile into a single prompt for simplicity.
                    contents.append(f"{m['role'].upper()}: {m['content']}")
                prompt = "\n\n".join(contents)
                
                response = gemini_client.models.generate_content(
                    model='gemini-3.5-flash',
                    contents=prompt,
                )
                return response.text
            except Exception as e:
                logger.error(f"Gemini chat failed: {e}")

        # 2. Try OpenAI
        openai_client = cls._get_openai_client()
        if openai_client:
            try:
                response = openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                )
                return response.choices[0].message.content
            except Exception as e:
                logger.error(f"OpenAI chat failed: {e}")

        # 3. Fallback mock
        return "Hello! Currently, the system developer has not configured the AI API key. I will be happy to help you once the AI keys are configured! In the meantime, I can tell you that it is very important to drink water and ensure you consume enough protein."

    @classmethod
    def generate_meal_explanation(cls, user: UserProfile, meal_name: str, meal_description: str) -> str:
        """
        Generates an explanation for why a specific meal is suitable for the user (info button logic).
        """
        system_prompt = f"""
        Explain in English why the meal '{meal_name}' ({meal_description}) fits a user with goals: {', '.join(user.goals)} and target calories: {user.daily_macros_target.calories} kcal.
        Keep the explanation positive, brief (2-3 sentences), and scientifically grounded but easy to read.
        """

        # 1. Try Gemini
        gemini_client = cls._get_gemini_client()
        if gemini_client:
            try:
                response = gemini_client.models.generate_content(
                    model='gemini-3.5-flash',
                    contents=system_prompt,
                )
                return response.text.strip()
            except Exception as e:
                logger.error(f"Gemini explanation failed: {e}")

        # 2. Try OpenAI
        openai_client = cls._get_openai_client()
        if openai_client:
            try:
                response = openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": system_prompt}],
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                logger.error(f"OpenAI explanation failed: {e}")

        # 3. Fallback mock
        return f"This meal was selected for you because it is rich in protein and dietary fiber, which contribute to a prolonged feeling of fullness and help achieve your goals: {', '.join(user.goals)}. Additionally, it perfectly fits your daily target macros."

    # --- Fallback Mock Data Generation ---
    @classmethod
    def _generate_mock_weekly_plan(cls, user: UserProfile, prompt_override: Optional[str] = None) -> AIWeeklyPlanResponse:
        days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        result = {}
        for d in days:
            result[d] = AIDay(
                breakfast=cls._generate_mock_meal("breakfast", user.daily_macros_target, user),
                lunch=cls._generate_mock_meal("lunch", user.daily_macros_target, user),
                dinner=cls._generate_mock_meal("dinner", user.daily_macros_target, user)
            )
        return AIWeeklyPlanResponse(**result)

    @classmethod
    def _generate_mock_meal(cls, meal_type: str, daily_target: Macros, user: UserProfile) -> AIMeal:
        # Split target macros: breakfast (30%), lunch (40%), dinner (30%)
        multiplier = 0.3 if meal_type in ["breakfast", "dinner", "completion"] else 0.4
        
        target_calories = daily_target.calories * multiplier
        target_protein = daily_target.protein * multiplier
        target_carbs = daily_target.carbs * multiplier
        target_fat = daily_target.fat * multiplier

        is_veg = "vegetarian" in [p.lower() for p in user.preferences] or "vegan" in [p.lower() for p in user.preferences]

        # Delicious mock English meals
        breakfast_meals = [
            ("Delicious Oatmeal Bowl", "Oatmeal cooked in water/almond milk with banana slices, peanut butter, and maple syrup"),
            ("High-Protein Greek Yogurt", "Greek protein yogurt cup (20g) with sugar-free granola, blueberries, and a teaspoon of honey"),
            ("Classic Homemade Shakshuka", "Two eggs poached in a rich tomato, garlic, and bell pepper sauce, served with whole wheat toast on the side")
        ]
        
        lunch_meals_meat = [
            ("Stir-Fried Chicken Breast with Veggies", "Grilled chicken breast stir-fried with broccoli, bell peppers, and onions, served on a bed of basmati rice"),
            ("Oven-Baked Salmon Fillet", "Salmon fillet baked with herbs, served with sweet potato mash and sautéed green beans"),
            ("Meatballs in Tomato Sauce", "Lean beef meatballs simmered in a rich tomato sauce, served alongside whole wheat pasta")
        ]
        
        lunch_meals_veg = [
            ("Red Lentil Patties with Tahini", "Baked red lentil patties in a zesty tomato sauce, served with quinoa"),
            ("Tofu and Chickpea Curry", "Tofu cubes sautéed with chickpeas, carrots, and squash in green curry and coconut milk, over brown rice"),
            ("Vegan Buddha Bowl", "Health bowl containing quinoa, seared tofu, avocado cubes, carrots, cucumbers, and a green tahini dressing")
        ]

        dinner_meals = [
            ("Veggie Omelette with Cheese", "Two-egg omelette with parsley and green onions, served with 5% cottage cheese, chopped salad, and a slice of whole wheat bread"),
            ("Spelt Cheese Toast", "Two slices of spelt bread toasted with 15% yellow cheese, tomato slices, hyssop (za'atar), and kalamata olives"),
            ("Tuna and Hard-Boiled Egg Salad", "Rich vegetable salad with a can of water-packed tuna, a hard-boiled egg, pickles, light mayonnaise, and lemon")
        ]

        completion_meals = [
            ("Rich Protein Shake", "Shake blended with protein powder, banana, peanut butter, and almond milk"),
            ("Rice Cakes with Tuna and Avocado", "Three brown rice cakes topped with a quarter mashed avocado and tuna"),
            ("Apple Slices with Almonds and Yogurt", "Sliced apple served with a handful of raw almonds and probiotic yogurt")
        ]

        if meal_type == "breakfast":
            meal_pool = breakfast_meals
        elif meal_type == "lunch":
            meal_pool = lunch_meals_veg if is_veg else lunch_meals_meat
        elif meal_type == "dinner":
            meal_pool = dinner_meals
        else:
            meal_pool = completion_meals

        name, description = random.choice(meal_pool)
        
        # Adjust macros with a slight random variation (+/- 10%)
        scale = random.uniform(0.9, 1.1)
        
        return AIMeal(
            name=name,
            description=description,
            calories=round(target_calories * scale, 1),
            protein=round(target_protein * scale, 1),
            carbs=round(target_carbs * scale, 1),
            fat=round(target_fat * scale, 1),
            ai_explanation="This meal is perfectly tailored to your targets, providing a high-quality source of protein and maintaining an optimal caloric balance that supports your goals."
        )
