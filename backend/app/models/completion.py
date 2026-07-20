from beanie import Document
from pydantic import Field
from datetime import datetime
from app.models.user import Macros

class CompletionMeal(Document):
    user_id: str = Field(index=True)
    date: str = Field(index=True)  # YYYY-MM-DD
    skipped_meal_type: str  # "breakfast", "lunch", "dinner"
    name: str
    description: str
    suggested_macros: Macros
    status: str = "suggested"  # "suggested", "eaten", "ignored"
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "completion_meals"
        indexes = [
            ["user_id", "date"]
        ]
