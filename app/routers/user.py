"""
User management router for profile and booking management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app import models, auth
from app.database import get_db

router = APIRouter(prefix="/api/user", tags=["user"])

security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> models.User:
    """
    Get the current user from the authentication token.
    """
    payload = auth.decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(models.User).filter(models.User.email == payload["sub"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@router.get("/profile")
def get_user_profile(current_user: models.User = Depends(get_current_user)):
    """
    Get the current user's profile.
    """
    return current_user


@router.patch("/profile")
def update_user_profile(updates: dict, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Update the current user's profile.
    """
    for key, value in updates.items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/bookings")
def get_user_bookings(current_user: models.User = Depends(get_current_user)):
    """
    Get the current user's bookings.
    """
    return current_user.bookings


@router.delete("/account")
def delete_user_account(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Delete the current user's account.
    """
    current_user.is_active = False
    db.commit()
    return {"message": "Account deleted successfully"}
