from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import datetime


class DetectionResultSchema(BaseModel):
    word: str
    original_word: str
    position_start: int
    position_end: int
    severity: int
    category: str
    forbidden_word_id: int


class ChatMessageRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    sender_name: str = Field(default="Anonymous", max_length=100)


class ValidationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)


class ValidationResponse(BaseModel):
    is_clean: bool
    original_text: str
    filtered_text: str
    violations: List[DetectionResultSchema]
    violation_count: int


class ChatMessageResponse(BaseModel):
    id: int
    original_text: str
    filtered_text: Optional[str]
    sender_name: str
    has_violation: bool
    violations: List[DetectionResultSchema]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ChatMessageListResponse(BaseModel):
    items: List[ChatMessageResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
