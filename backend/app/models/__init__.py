from app.models.user import UserProfile, Macros
from app.models.plan import WeeklyPlan, DayPlan, MealPlan
from app.models.completion import CompletionMeal

__all__ = [
    "UserProfile",
    "Macros",
    "WeeklyPlan",
    "DayPlan",
    "MealPlan",
    "CompletionMeal",
]

# Beanie documents list
ALL_MODELS = [UserProfile, WeeklyPlan, CompletionMeal]
