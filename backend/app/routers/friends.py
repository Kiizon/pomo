from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, date
from uuid import UUID
from ..database import get_db
from ..auth import get_current_user
from .. import models, schemas

router = APIRouter(prefix="/friends", tags=["friends"])

@router.post("/request", status_code=201)
async def send_friend_request(
    request_data: schemas.FriendRequestCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a friend request to a user by email"""
    # Find receiver by email
    receiver = db.query(models.User).filter(
        models.User.email == request_data.receiver_email
    ).first()
    
    if not receiver:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Can't send request to yourself
    if receiver.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")
    
    # Check if already friends
    existing_friendship = db.query(models.Friendship).filter(
        models.Friendship.user_id == current_user.id,
        models.Friendship.friend_id == receiver.id
    ).first()
    
    if existing_friendship:
        raise HTTPException(status_code=400, detail="Already friends")
    
    # Check if request already exists (in either direction)
    existing_request = db.query(models.FriendRequest).filter(
        or_(
            and_(
                models.FriendRequest.sender_id == current_user.id,
                models.FriendRequest.receiver_id == receiver.id
            ),
            and_(
                models.FriendRequest.sender_id == receiver.id,
                models.FriendRequest.receiver_id == current_user.id
            )
        ),
        models.FriendRequest.status == "pending"
    ).first()
    
    if existing_request:
        raise HTTPException(status_code=400, detail="Friend request already exists")
    
    # Create friend request
    friend_request = models.FriendRequest(
        sender_id=current_user.id,
        receiver_id=receiver.id
    )
    db.add(friend_request)
    db.commit()
    
    return {"message": "Friend request sent", "request_id": str(friend_request.id)}

@router.get("/requests/incoming", response_model=List[schemas.FriendRequestResponse])
async def get_incoming_requests(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all incoming friend requests"""
    requests = db.query(models.FriendRequest).filter(
        models.FriendRequest.receiver_id == current_user.id,
        models.FriendRequest.status == "pending"
    ).all()
    
    result = []
    for req in requests:
        sender = db.query(models.User).filter(models.User.id == req.sender_id).first()
        receiver = db.query(models.User).filter(models.User.id == req.receiver_id).first()
        result.append({
            "id": req.id,
            "sender": sender,
            "receiver": receiver,
            "status": req.status,
            "created_at": req.created_at
        })
    
    return result

@router.post("/request/{request_id}/accept")
async def accept_friend_request(
    request_id: UUID,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept a friend request"""
    friend_request = db.query(models.FriendRequest).filter(
        models.FriendRequest.id == request_id,
        models.FriendRequest.receiver_id == current_user.id,
        models.FriendRequest.status == "pending"
    ).first()
    
    if not friend_request:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    # Update request status
    friend_request.status = "accepted"
    friend_request.updated_at = datetime.utcnow()
    
    # Create bidirectional friendship
    friendship1 = models.Friendship(
        user_id=friend_request.sender_id,
        friend_id=friend_request.receiver_id
    )
    friendship2 = models.Friendship(
        user_id=friend_request.receiver_id,
        friend_id=friend_request.sender_id
    )
    
    db.add(friendship1)
    db.add(friendship2)
    db.commit()
    
    return {"message": "Friend request accepted"}

@router.post("/request/{request_id}/reject")
async def reject_friend_request(
    request_id: UUID,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reject a friend request"""
    friend_request = db.query(models.FriendRequest).filter(
        models.FriendRequest.id == request_id,
        models.FriendRequest.receiver_id == current_user.id,
        models.FriendRequest.status == "pending"
    ).first()
    
    if not friend_request:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    friend_request.status = "rejected"
    friend_request.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Friend request rejected"}

@router.get("/", response_model=List[schemas.FriendResponse])
async def get_friends(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all friends with today's Pomodoro count"""
    # Use UTC for consistency with stored session times
    today = datetime.utcnow().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    # Query friends with their session counts for today
    friends_data = db.query(
        models.User.id,
        models.User.name,
        models.User.email,
        models.User.picture,
        func.count(models.Session.id).label('pomodoros_today')
    ).join(
        models.Friendship, 
        models.Friendship.friend_id == models.User.id
    ).outerjoin(
        models.Session,
        and_(
            models.Session.user_id == models.User.id,
            models.Session.started_at >= start_of_day,
            models.Session.started_at <= end_of_day
        )
    ).filter(
        models.Friendship.user_id == current_user.id
    ).group_by(
        models.User.id, models.User.name, models.User.email, models.User.picture
    ).order_by(
        func.count(models.Session.id).desc()
    ).all()
    
    return [
        {
            "id": friend.id,
            "name": friend.name,
            "email": friend.email,
            "picture": friend.picture,
            "pomodoros_today": friend.pomodoros_today
        }
        for friend in friends_data
    ]

@router.get("/search")
async def search_users(
    email: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search for users by email (partial match)"""
    if len(email) < 3:
        raise HTTPException(status_code=400, detail="Search query must be at least 3 characters")
    
    # Find users matching email
    users = db.query(models.User).filter(
        models.User.email.ilike(f"%{email}%"),
        models.User.id != current_user.id
    ).limit(10).all()
    
    # Filter out already friends
    friend_ids = db.query(models.Friendship.friend_id).filter(
        models.Friendship.user_id == current_user.id
    ).all()
    friend_ids = [str(f[0]) for f in friend_ids]
    
    # Filter out pending requests
    pending_ids = db.query(models.FriendRequest.receiver_id).filter(
        models.FriendRequest.sender_id == current_user.id,
        models.FriendRequest.status == "pending"
    ).all()
    pending_ids = [str(p[0]) for p in pending_ids]
    
    filtered_users = [
        {
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
            "picture": user.picture
        }
        for user in users 
        if str(user.id) not in friend_ids and str(user.id) not in pending_ids
    ]
    
    return filtered_users

@router.delete("/{friend_id}")
async def unfriend(
    friend_id: UUID,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a friend (delete friendship)"""
    # Delete both directions of friendship
    db.query(models.Friendship).filter(
        or_(
            and_(
                models.Friendship.user_id == current_user.id,
                models.Friendship.friend_id == friend_id
            ),
            and_(
                models.Friendship.user_id == friend_id,
                models.Friendship.friend_id == current_user.id
            )
        )
    ).delete()
    db.commit()
    
    return {"message": "Friend removed"}

@router.get("/debug/activity")
async def debug_friend_activity(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Debug endpoint to check friend activity data"""
    # Get all friends
    friends = db.query(models.User).join(
        models.Friendship,
        models.Friendship.friend_id == models.User.id
    ).filter(
        models.Friendship.user_id == current_user.id
    ).all()
    
    # Use UTC for consistency with stored session times
    today = datetime.utcnow().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    result = []
    for friend in friends:
        # Get sessions for this friend today
        sessions = db.query(models.Session).filter(
            models.Session.user_id == friend.id,
            models.Session.started_at >= start_of_day,
            models.Session.started_at <= end_of_day
        ).all()
        
        result.append({
            "friend_id": str(friend.id),
            "friend_email": friend.email,
            "sessions_today": len(sessions),
            "session_times": [str(s.started_at) for s in sessions]
        })
    
    return result