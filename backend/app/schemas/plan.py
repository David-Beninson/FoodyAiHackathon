from pydantic import BaseModel, Field
from typing import Optional

class GeneratePlanRequest(BaseModel):
    user_id: str
    week_start_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Start date of the week (Sunday) in YYYY-MM-DD format")
    prompt_override: Optional[str] = None

class UpdateMealStatusRequest(BaseModel):
    status: str = Field(..., pattern="^(planned|eaten|skipped|replaced)$", description="Must be 'planned', 'eaten', 'skipped', or 'replaced'")
    replaced_with_meal_name: Optional[str] = None

class RegenerateMealRequest(BaseModel):
    user_id: str
    week_start_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    day: str = Field(..., pattern="^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)$")
    meal_type: str = Field(..., pattern="^(breakfast|lunch|dinner)$")
    prompt_override: Optional[str] = None
