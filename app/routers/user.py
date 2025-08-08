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
    
    # Check if the account is still active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Account has been deactivated",
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
def get_user_bookings(
    page: int = 1,
    limit: int = 10,
    status: str = None,
    date_from: str = None,
    date_to: str = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the current user's bookings with pagination and filtering.
    """
    from sqlalchemy import and_
    from datetime import datetime
    
    query = db.query(models.Booking).filter(models.Booking.user_id == current_user.id)
    
    # Apply filters
    if status:
        query = query.filter(models.Booking.status == status)
    
    if date_from:
        try:
            from_date = datetime.strptime(date_from, "%Y-%m-%d").date()
            query = query.filter(models.Booking.visit_date >= from_date)
        except ValueError:
            pass
    
    if date_to:
        try:
            to_date = datetime.strptime(date_to, "%Y-%m-%d").date()
            query = query.filter(models.Booking.visit_date <= to_date)
        except ValueError:
            pass
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    bookings = query.order_by(models.Booking.visit_date.desc(), models.Booking.visit_time.desc()).offset(offset).limit(limit).all()
    
    # Calculate total pages
    pages = (total + limit - 1) // limit
    
    return {
        "bookings": bookings,
        "total": total,
        "page": page,
        "pages": pages,
        "limit": limit
    }


@router.delete("/account")
def delete_user_account(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Delete the current user's account.
    """
    current_user.is_active = False
    db.commit()
    return {"message": "Account deleted successfully"}
