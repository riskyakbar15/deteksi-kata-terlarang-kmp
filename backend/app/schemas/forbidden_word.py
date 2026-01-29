from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class WordCategory(str, Enum):
    PROFANITY = "profanity"
    HATE_SPEECH = "hate_speech"
    SPAM = "spam"
    INAPPROPRIATE = "inappropriate"


class ForbiddenWordBase(BaseModel):
    word: str = Field(..., min_length=1, max_length=100)
    category: WordCategory = WordCategory.PROFANITY
    severity: int = Field(default=1, ge=1, le=5)


class ForbiddenWordCreate(ForbiddenWordBase):
    pass


class ForbiddenWordUpdate(BaseModel):
    word: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[WordCategory] = None
    severity: Optional[int] = Field(None, ge=1, le=5)
    is_active: Optional[bool] = None


class ForbiddenWordResponse(ForbiddenWordBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ForbiddenWordList(BaseModel):
    items: list[ForbiddenWordResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
