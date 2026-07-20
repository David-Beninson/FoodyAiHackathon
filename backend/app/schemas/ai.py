from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str

class ChatRequest(BaseModel):
    user_id: str
    message: str
    history: List[ChatMessage] = Field(default_factory=list)

class ExplainMealRequest(BaseModel):
    user_id: str
    meal_name: str
    meal_description: str

class CompletionRequest(BaseModel):
    user_id: str
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    skipped_meal_type: str = Field(..., pattern="^(breakfast|lunch|dinner)$")

class PlannerChatRequest(BaseModel):
    user_id: str
    message: str

class AutoPlannerRequest(BaseModel):
    user_id: str
    week_start_date: str

