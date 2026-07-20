from beanie import Document
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class Macros(BaseModel):
    calories: float = 0.0
    protein: float = 0.0  # in grams
    carbs: float = 0.0    # in grams
    fat: float = 0.0      # in grams

class UserProfile(Document):
    email: str = Field(unique=True, index=True)
    username: str
    hashed_password: str
    age: Optional[int] = None
    weight: Optional[float] = None  # in kg
    height: Optional[float] = None  # in cm
    gender: Optional[str] = None    # "male", "female", "other"
    activity_level: Optional[str] = None  # "sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"
    goals: List[str] = Field(default_factory=list)  # e.g. ["lose weight", "gain muscle", "eat healthier"]
    allergies: List[str] = Field(default_factory=list)      # e.g. ["nuts", "gluten", "dairy"]
    preferences: List[str] = Field(default_factory=list)    # e.g. ["vegetarian", "low-carb", "kosher"]
    daily_macros_target: Optional[Macros] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"

def calculate_target_macros(
    age: int,
    weight: float,
    height: float,
    gender: str,
    activity_level: str,
    goals: List[str]
) -> Macros:
    """
    Calculates target calories and macros using the Mifflin-St Jeor equation:
    BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) + s (s is +5 for male, -161 for female)
    """
    # 1. Calculate BMR
    gender_offset = 5 if gender.lower() == "male" else -161
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + gender_offset

    # 2. Adjust for activity level (TDEE multiplier)
    activity_multipliers = {
        "sedentary": 1.2,
        "lightly_active": 1.375,
        "moderately_active": 1.55,
        "very_active": 1.725,
        "extremely_active": 1.9
    }
    multiplier = activity_multipliers.get(activity_level.lower(), 1.2)
    tdee = bmr * multiplier

    # 3. Adjust calories for goals
    calories = tdee
    goal_str = " ".join(goals).lower()
    if "lose" in goal_str:
        calories -= 500  # calorie deficit
    elif "gain" in goal_str or "build" in goal_str:
        calories += 300  # calorie surplus

    # Keep a safe floor
    calories = max(calories, 1200)

    # 4. Standard macro split (e.g. 30% Protein, 40% Carbs, 30% Fat)
    # 1g Protein = 4 kcal, 1g Carb = 4 kcal, 1g Fat = 9 kcal
    protein_calories = calories * 0.30
    carb_calories = calories * 0.40
    fat_calories = calories * 0.30

    protein = protein_calories / 4
    carbs = carb_calories / 4
    fat = fat_calories / 9

    return Macros(
        calories=round(calories, 1),
        protein=round(protein, 1),
        carbs=round(carbs, 1),
        fat=round(fat, 1)
    )
