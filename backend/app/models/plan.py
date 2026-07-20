from enum import Enum
from beanie import Document
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, Optional
from app.models.user import Macros

class MealStatus(str, Enum):
    PLANNED = "planned"
    EATEN = "eaten"
    SKIPPED = "skipped"
    REPLACED = "replaced"

class MealPlan(BaseModel):
    name: str
    description: str
    status: MealStatus = MealStatus.PLANNED
    planned_macros: Macros
    actual_macros: Macros = Field(default_factory=Macros)
    ai_explanation: Optional[str] = None
    is_completion: bool = False
    replaced_with_meal_name: Optional[str] = None

    def update_actual_macros(self):
        """Helper to sync actual macros according to status."""
        if self.status == MealStatus.EATEN:
            self.actual_macros = self.planned_macros
        elif self.status == MealStatus.SKIPPED:
            self.actual_macros = Macros(calories=0, protein=0, carbs=0, fat=0)
        # For "replaced", actual_macros can be set to different values than planned,
        # but if not explicitly set, we could leave it.

class DayPlan(BaseModel):
    meals: Dict[str, MealPlan]  # Keys: "breakfast", "lunch", "dinner"
    
    @property
    def summary_planned_macros(self) -> Macros:
        calories = sum(m.planned_macros.calories for m in self.meals.values())
        protein = sum(m.planned_macros.protein for m in self.meals.values())
        carbs = sum(m.planned_macros.carbs for m in self.meals.values())
        fat = sum(m.planned_macros.fat for m in self.meals.values())
        return Macros(calories=calories, protein=protein, carbs=carbs, fat=fat)
        
    @property
    def summary_actual_macros(self) -> Macros:
        calories = sum(m.actual_macros.calories for m in self.meals.values())
        protein = sum(m.actual_macros.protein for m in self.meals.values())
        carbs = sum(m.actual_macros.carbs for m in self.meals.values())
        fat = sum(m.actual_macros.fat for m in self.meals.values())
        return Macros(calories=calories, protein=protein, carbs=carbs, fat=fat)

class WeeklyPlan(Document):
    user_id: str = Field(index=True)
    week_start_date: str = Field(index=True)  # YYYY-MM-DD (Always a Sunday, e.g. "2026-07-19")
    days: Dict[str, DayPlan]  # Keys: "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "weekly_plans"
