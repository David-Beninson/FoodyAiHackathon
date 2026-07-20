from typing import List, Union
from app.models.user import Macros, UserGoal, ActivityLevel

def calculate_target_macros(
    age: int,
    weight: float,
    height: float,
    gender: str,
    activity_level: Union[ActivityLevel, str],
    goals: List[Union[UserGoal, str]]
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
    act_str = activity_level.value if hasattr(activity_level, "value") else str(activity_level)
    multiplier = activity_multipliers.get(act_str.strip().lower(), 1.2)
    tdee = bmr * multiplier

    # 3. Adjust calories for goals
    calories = tdee
    has_lose = False
    has_gain = False
    
    for goal in goals:
        goal_val = goal.value if hasattr(goal, "value") else str(goal)
        goal_val = goal_val.lower()
        if "lose" in goal_val:
            has_lose = True
        elif "gain" in goal_val or "build" in goal_val:
            has_gain = True

    if has_lose:
        calories -= 500  # calorie deficit
    elif has_gain:
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
