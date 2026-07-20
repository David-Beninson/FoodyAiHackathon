from beanie import Document
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Dict, Optional

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatSession(Document):
    user_id: str = Field(index=True)
    messages: List[ChatMessage] = Field(default_factory=list)
    ingredients: List[str] = Field(default_factory=list)
    shopping_list: List[str] = Field(default_factory=list)
    draft_plan: Optional[Dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "chat_sessions"
