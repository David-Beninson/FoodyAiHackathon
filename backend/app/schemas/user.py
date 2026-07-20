from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from app.models.user import Macros, UserGoal, ActivityLevel

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str

class OnboardRequest(BaseModel):
    age: int = Field(..., gt=0, lt=120)
    weight: float = Field(..., gt=10, lt=500)  # in kg
    height: float = Field(..., gt=50, lt=300)  # in cm
    gender: str = Field(..., description="male, female, or other")
    activity_level: ActivityLevel = Field(..., description="Activity level of the user")
    goals: List[UserGoal] = Field(..., min_items=1, description="List of user nutritional goals")
    allergies: List[str] = Field(default_factory=list)
    preferences: List[str] = Field(default_factory=list)
    daily_macros_target: Optional[Macros] = None
