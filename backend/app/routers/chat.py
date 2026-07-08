from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import func
from threading import Lock
from typing import Optional
from math import ceil

from app.database import get_db
from app.models.forbidden_word import ForbiddenWord
from app.models.chat_message import ChatMessage
from app.models.violation_log import ViolationLog
from app.models.user import User
from app.schemas.chat import (
    ChatMessageRequest, ChatMessageResponse, 
    ValidationRequest, ValidationResponse,
    ChatMessageListResponse, DetectionResultSchema
)
from app.services.word_detector import WordDetector
from app.utils.security import get_current_admin_user

router = APIRouter(prefix="/api/chat", tags=["Chat"])

# Process-wide detector cache. Rebuilt only when the set of active forbidden
# words changes, detected via a lightweight signature query.
_detector_cache: dict = {"signature": None, "detector": None}
_cache_lock = Lock()


def get_detector(db: Session) -> WordDetector:
    """
    Get a word detector for the current active forbidden words.

    The detector (and its precomputed LPS arrays) is cached across requests and
    only rebuilt when the active words change. The cache signature is derived
    from the number of active words and the most recent update timestamp, so
    additions, edits, deletions, and activation toggles all invalidate it.
    """
    signature = db.query(
        func.count(ForbiddenWord.id),
        func.max(ForbiddenWord.updated_at),
    ).filter(ForbiddenWord.is_active == True).one()

    with _cache_lock:
        if (
            _detector_cache["detector"] is not None
            and _detector_cache["signature"] == signature
        ):
            return _detector_cache["detector"]

    words = db.query(ForbiddenWord).filter(ForbiddenWord.is_active == True).all()
    forbidden_words = [
        {
            "id": w.id,
            "word": w.word,
            "category": w.category,
            "severity": w.severity
        }
        for w in words
    ]
    detector = WordDetector(forbidden_words)

    with _cache_lock:
        _detector_cache["signature"] = signature
        _detector_cache["detector"] = detector

    return detector


@router.post("/validate", response_model=ValidationResponse)
async def validate_message(
    request: ValidationRequest,
    db: Session = Depends(get_db)
):
    """
    Validate a message for forbidden words without saving.
    Uses KMP algorithm for efficient pattern matching.
    """
    detector = get_detector(db)
    is_clean, filtered_text, violations = detector.validate_only(request.text)
    
    return ValidationResponse(
        is_clean=is_clean,
        original_text=request.text,
        filtered_text=filtered_text,
        violations=[
            DetectionResultSchema(
                word=v.word,
                original_word=v.original_word,
                position_start=v.position_start,
                position_end=v.position_end,
                severity=v.severity,
                category=v.category,
                forbidden_word_id=v.forbidden_word_id
            )
            for v in violations
        ],
        violation_count=len(violations)
    )


@router.post("/send", response_model=ChatMessageResponse)
async def send_message(
    request: ChatMessageRequest,
    db: Session = Depends(get_db)
):
    """
    Send a chat message with automatic forbidden word detection.
    Message is saved and violations are logged.
    """
    detector = get_detector(db)
    filtered_text, violations = detector.detect(request.text)
    
    # Create chat message
    message = ChatMessage(
        original_text=request.text,
        filtered_text=filtered_text,
        sender_name=request.sender_name,
        has_violation=len(violations) > 0
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # Log violations
    for v in violations:
        violation_log = ViolationLog(
            message_id=message.id,
            forbidden_word_id=v.forbidden_word_id if v.forbidden_word_id else None,
            detected_word=v.word,
            position_start=v.position_start,
            position_end=v.position_end
        )
        db.add(violation_log)
    
    db.commit()
    
    return ChatMessageResponse(
        id=message.id,
        original_text=message.original_text,
        filtered_text=message.filtered_text,
        sender_name=message.sender_name,
        has_violation=message.has_violation,
        violations=[
            DetectionResultSchema(
                word=v.word,
                original_word=v.original_word,
                position_start=v.position_start,
                position_end=v.position_end,
                severity=v.severity,
                category=v.category,
                forbidden_word_id=v.forbidden_word_id
            )
            for v in violations
        ],
        created_at=message.created_at
    )


@router.get("/messages", response_model=ChatMessageListResponse)
async def get_messages(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    has_violation: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get chat messages with pagination (admin only)."""
    query = db.query(ChatMessage).options(
        selectinload(ChatMessage.violations).selectinload(ViolationLog.forbidden_word)
    )
    
    if has_violation is not None:
        query = query.filter(ChatMessage.has_violation == has_violation)
    
    total = query.count()
    total_pages = ceil(total / page_size) if total > 0 else 1
    
    offset = (page - 1) * page_size
    messages = query.order_by(ChatMessage.created_at.desc()).offset(offset).limit(page_size).all()
    
    # Get violations for each message
    result_items = []
    for msg in messages:
        violation_details = []
        for v in msg.violations:
            fw = v.forbidden_word
            violation_details.append(
                DetectionResultSchema(
                    word=v.detected_word,
                    original_word=fw.word if fw else v.detected_word,
                    position_start=v.position_start,
                    position_end=v.position_end,
                    severity=fw.severity if fw else 1,
                    category=fw.category if fw else "unknown",
                    forbidden_word_id=v.forbidden_word_id or 0
                )
            )
        
        result_items.append(
            ChatMessageResponse(
                id=msg.id,
                original_text=msg.original_text,
                filtered_text=msg.filtered_text,
                sender_name=msg.sender_name,
                has_violation=msg.has_violation,
                violations=violation_details,
                created_at=msg.created_at
            )
        )
    
    return ChatMessageListResponse(
        items=result_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )
