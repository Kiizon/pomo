from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import verify_google_token, create_access_token, get_or_create_user
from ..config import settings
from .. import schemas
import httpx

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/google")
async def google_login():
    """Redirect to Google OAuth"""
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.google_client_id}&"
        f"redirect_uri={settings.google_redirect_uri}&"
        f"response_type=code&"
        f"scope=openid email profile"
    )
    return RedirectResponse(google_auth_url)

@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    """Handle Google OAuth callback"""
    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.google_redirect_uri,
                "grant_type": "authorization_code",
            }
        )
        
        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get access token")
        
        token_data = token_response.json()
        google_token = token_data["access_token"]
    
    # Get user info from Google
    google_user = await verify_google_token(google_token)
    
    # Get or create user in our database
    user = get_or_create_user(db, google_user)
    
    # Create JWT token with user info
    access_token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "name": user.name,
        "picture": user.picture
    })
    
    # Redirect to frontend with token
    return RedirectResponse(
        f"{settings.frontend_url}?token={access_token}"
    )

@router.post("/token/verify", response_model=schemas.User)
async def verify_token(google_token: str, db: Session = Depends(get_db)):
    """Verify Google token and return JWT + user info"""
    google_user = await verify_google_token(google_token)
    user = get_or_create_user(db, google_user)
    access_token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "name": user.name,
        "picture": user.picture
    })
    return schemas.Token(access_token=access_token, user=user)
