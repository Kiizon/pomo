from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, date
from ..database import get_db
from ..auth import get_current_user
from .. import models, schemas

router = APIRouter(prefix="/sessions", tags=["sessions"])

@router.post("/", response_model=schemas.SessionResponse, status_code=201)
async def create_session(
    session_data: schemas.SessionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log a new Pomodoro session"""
    session = models.Session(
        user_id=current_user.id,
        **session_data.model_dump()
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/recent", response_model=List[schemas.SessionResponse])
async def get_recent_sessions(
    limit: int = 10,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent sessions for current user"""
    sessions = db.query(models.Session).filter(
        models.Session.user_id == current_user.id
    ).order_by(
        models.Session.started_at.desc()
    ).limit(limit).all()
    return sessions

@router.get("/today/total")
async def get_today_total(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get total minutes for today"""
    # Use UTC for consistency with stored session times
    today = datetime.utcnow().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    total = db.query(
        func.sum(models.Session.duration_min)
    ).filter(
        models.Session.user_id == current_user.id,
        models.Session.started_at >= start_of_day,
        models.Session.started_at <= end_of_day
    ).scalar()
    
    return {"total_minutes": total or 0}

@router.get("/stats/heatmap")
async def get_heatmap_data(
    days: int = 90,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily session counts for heatmap"""
    from datetime import timedelta
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    sessions = db.query(
        func.date(models.Session.started_at).label('date'),
        func.count(models.Session.id).label('count'),
        func.sum(models.Session.duration_min).label('total_minutes')
    ).filter(
        models.Session.user_id == current_user.id,
        models.Session.started_at >= start_date
    ).group_by(
        func.date(models.Session.started_at)
    ).all()
    
    return [
        {
            "date": str(s.date),
            "count": s.count,
            "total_minutes": s.total_minutes
        }
        for s in sessions
    ]
