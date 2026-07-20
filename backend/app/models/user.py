from beanie import Document
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import List, Optional

from enum import Enum

class UserGoal(str, Enum):
    LOSE_WEIGHT = "lose weight"
    GAIN_MUSCLE = "gain muscle"
    EAT_HEALTHIER = "eat healthier"

class ActivityLevel(str, Enum):
    SEDENTARY = "sedentary"
    LIGHTLY_ACTIVE = "lightly_active"
    MODERATELY_ACTIVE = "moderately_active"
    VERY_ACTIVE = "very_active"
    EXTREMELY_ACTIVE = "extremely_active"

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
    activity_level: Optional[ActivityLevel] = None
    goals: List[UserGoal] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)      # e.g. ["nuts", "gluten", "dairy"]
    preferences: List[str] = Field(default_factory=list)    # e.g. ["vegetarian", "low-carb", "kosher"]
    daily_macros_target: Optional[Macros] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator("activity_level", mode="before")
    @classmethod
    def validate_activity_level(cls, v):
        if not v:
            return v
        mapping = {
            "sedentary": ActivityLevel.SEDENTARY,
            "lightly_active": ActivityLevel.LIGHTLY_ACTIVE,
            "moderately_active": ActivityLevel.MODERATELY_ACTIVE,
            "very_active": ActivityLevel.VERY_ACTIVE,
            "extremely_active": ActivityLevel.EXTREMELY_ACTIVE,
        }
        val_str = v.value if hasattr(v, "value") else str(v)
        val_lower = val_str.strip().lower()
        if val_lower in mapping:
            return mapping[val_lower]
        return v

    @field_validator("goals", mode="before")
    @classmethod
    def validate_goals(cls, v):
        if not v:
            return v
        mapping = {
            "lose weight": UserGoal.LOSE_WEIGHT,
            "lose": UserGoal.LOSE_WEIGHT,
            "gain weight": UserGoal.GAIN_MUSCLE,
            "gain muscle": UserGoal.GAIN_MUSCLE,
            "build muscle": UserGoal.GAIN_MUSCLE,
            "build": UserGoal.GAIN_MUSCLE,
            "eat healthier": UserGoal.EAT_HEALTHIER,
        }
        validated = []
        for item in v:
            item_str = item.value if hasattr(item, "value") else str(item)
            item_lower = item_str.strip().lower()
            if item_lower in mapping:
                validated.append(mapping[item_lower])
            else:
                validated.append(item)
        return validated

    class Settings:
        name = "users"

