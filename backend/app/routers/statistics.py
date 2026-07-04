from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta, timezone
from typing import List

from app.database import get_db
from app.models.forbidden_word import ForbiddenWord
from app.models.chat_message import ChatMessage
from app.models.violation_log import ViolationLog
from app.models.user import User
from app.schemas.statistics import (
    OverviewStats, WordFrequency, TimelineData,
    RecentViolation, StatisticsOverview
)
from app.utils.security import get_current_admin_user

router = APIRouter(prefix="/api/statistics", tags=["Statistics"])


@router.get("/overview", response_model=StatisticsOverview)
async def get_statistics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get comprehensive statistics overview"""
    
    # Overview stats
    total_messages = db.query(ChatMessage).count()
    total_violations = db.query(ViolationLog).count()
    active_words = db.query(ForbiddenWord).filter(ForbiddenWord.is_active == True).count()
    
    # Today's stats
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    messages_today = db.query(ChatMessage).filter(ChatMessage.created_at >= today_start).count()
    violations_today = db.query(ViolationLog).filter(ViolationLog.created_at >= today_start).count()
    
    violation_rate = (total_violations / total_messages * 100) if total_messages > 0 else 0
    
    overview = OverviewStats(
        total_messages=total_messages,
        total_violations=total_violations,
        violation_rate=round(violation_rate, 2),
        active_forbidden_words=active_words,
        messages_today=messages_today,
        violations_today=violations_today
    )
    
    # Top detected words
    top_words_query = (
        db.query(
            ViolationLog.detected_word,
            func.count(ViolationLog.id).label('count'),
            ForbiddenWord.category,
            ForbiddenWord.severity
        )
        .outerjoin(ForbiddenWord, ViolationLog.forbidden_word_id == ForbiddenWord.id)
        .group_by(ViolationLog.detected_word, ForbiddenWord.category, ForbiddenWord.severity)
        .order_by(desc('count'))
        .limit(10)
        .all()
    )
    
    top_words = [
        WordFrequency(
            word=w[0],
            count=w[1],
            category=w[2] or "unknown",
            severity=w[3] or 1
        )
        for w in top_words_query
    ]
    
    # Timeline data (last 7 days)
    timeline = []
    for i in range(6, -1, -1):
        date = datetime.now(timezone.utc).date() - timedelta(days=i)
        date_start = datetime.combine(date, datetime.min.time())
        date_end = datetime.combine(date, datetime.max.time())
        
        day_messages = db.query(ChatMessage).filter(
            ChatMessage.created_at >= date_start,
            ChatMessage.created_at <= date_end
        ).count()
        
        day_violations = db.query(ViolationLog).filter(
            ViolationLog.created_at >= date_start,
            ViolationLog.created_at <= date_end
        ).count()
        
        timeline.append(TimelineData(
            date=date.strftime("%Y-%m-%d"),
            violations=day_violations,
            messages=day_messages
        ))
    
    # Recent violations
    recent_violations_query = (
        db.query(ViolationLog, ChatMessage)
        .join(ChatMessage, ViolationLog.message_id == ChatMessage.id)
        .order_by(desc(ViolationLog.created_at))
        .limit(10)
        .all()
    )
    
    recent_violations = [
        RecentViolation(
            id=v.id,
            detected_word=v.detected_word,
            sender_name=m.sender_name,
            message_preview=m.original_text[:50] + "..." if len(m.original_text) > 50 else m.original_text,
            created_at=v.created_at
        )
        for v, m in recent_violations_query
    ]
    
    return StatisticsOverview(
        overview=overview,
        top_words=top_words,
        timeline=timeline,
        recent_violations=recent_violations
    )


@router.get("/top-words", response_model=List[WordFrequency])
async def get_top_words(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get top detected forbidden words"""
    top_words_query = (
        db.query(
            ViolationLog.detected_word,
            func.count(ViolationLog.id).label('count'),
            ForbiddenWord.category,
            ForbiddenWord.severity
        )
        .outerjoin(ForbiddenWord, ViolationLog.forbidden_word_id == ForbiddenWord.id)
        .group_by(ViolationLog.detected_word, ForbiddenWord.category, ForbiddenWord.severity)
        .order_by(desc('count'))
        .limit(limit)
        .all()
    )
    
    return [
        WordFrequency(
            word=w[0],
            count=w[1],
            category=w[2] or "unknown",
            severity=w[3] or 1
        )
        for w in top_words_query
    ]


@router.get("/timeline", response_model=List[TimelineData])
async def get_timeline(
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get violations timeline for the specified number of days"""
    timeline = []
    
    for i in range(days - 1, -1, -1):
        date = datetime.utcnow().date() - timedelta(days=i)
        date_start = datetime.combine(date, datetime.min.time())
        date_end = datetime.combine(date, datetime.max.time())
        
        day_messages = db.query(ChatMessage).filter(
            ChatMessage.created_at >= date_start,
            ChatMessage.created_at <= date_end
        ).count()
        
        day_violations = db.query(ViolationLog).filter(
            ViolationLog.created_at >= date_start,
            ViolationLog.created_at <= date_end
        ).count()
        
        timeline.append(TimelineData(
            date=date.strftime("%Y-%m-%d"),
            violations=day_violations,
            messages=day_messages
        ))
    
    return timeline
