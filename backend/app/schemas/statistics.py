from pydantic import BaseModel
from typing import List
from datetime import datetime


class OverviewStats(BaseModel):
    total_messages: int
    total_violations: int
    violation_rate: float
    active_forbidden_words: int
    messages_today: int
    violations_today: int


class WordFrequency(BaseModel):
    word: str
    count: int
    category: str
    severity: int


class TimelineData(BaseModel):
    date: str
    violations: int
    messages: int


class RecentViolation(BaseModel):
    id: int
    detected_word: str
    sender_name: str
    message_preview: str
    created_at: datetime


class StatisticsOverview(BaseModel):
    overview: OverviewStats
    top_words: List[WordFrequency]
    timeline: List[TimelineData]
    recent_violations: List[RecentViolation]
