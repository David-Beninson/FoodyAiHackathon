from pydantic import BaseModel, Field
from typing import Optional
from app.models.plan import MealStatus

class GeneratePlanRequest(BaseModel):
    user_id: str
    week_start_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Start date of the week (Sunday) in YYYY-MM-DD format")
    prompt_override: Optional[str] = None

class UpdateMealStatusRequest(BaseModel):
    status: MealStatus

class RegenerateMealRequest(BaseModel):
    user_id: str
    week_start_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    day: str = Field(..., pattern="^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)$")
    meal_type: str = Field(..., pattern="^(breakfast|lunch|dinner)$")
    prompt_override: Optional[str] = None
