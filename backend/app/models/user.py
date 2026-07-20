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

