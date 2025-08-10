"""
User management router for profile and booking management.
"""

import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app import models, auth
from app.database import get_db
from app.schemas import UserProfileUpdate, UserProfileResponse

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


@router.get("/profile", response_model=UserProfileResponse)
def get_user_profile(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get the current user's profile with extended preferences.
    """
    # Get user preferences from database
    preferences = db.query(models.UserPreference).filter(
        models.UserPreference.user_id == current_user.id
    ).all()
    
    # Convert preferences to dict
    prefs_dict = {}
    for pref in preferences:
        try:
            prefs_dict[pref.preference_key] = json.loads(pref.preference_value) if pref.preference_value else None
        except (json.JSONDecodeError, TypeError):
            prefs_dict[pref.preference_key] = pref.preference_value
    
    # Build response with user data and preferences
    profile_data = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "phone": current_user.phone,
        "date_of_birth": current_user.date_of_birth,
        "accessibility_needs": current_user.accessibility_needs,
        "is_active": current_user.is_active,
        "dining_preferences": prefs_dict.get("dining_preferences"),
        "notification_preferences": prefs_dict.get("notification_preferences"),
        "emergency_contact": prefs_dict.get("emergency_contact")
    }
    
    return profile_data


@router.patch("/profile", response_model=UserProfileResponse)
def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the current user's profile with extended preferences.
    """
    try:
        # Update basic user fields
        update_data = profile_update.model_dump(exclude_unset=True, exclude_none=True)
        
        # Handle direct user fields
        user_fields = ["first_name", "last_name", "phone", "date_of_birth", "accessibility_needs"]
        for field in user_fields:
            if field in update_data:
                setattr(current_user, field, update_data[field])
        
        # Handle preference fields
        preference_fields = ["dining_preferences", "notification_preferences", "emergency_contact"]
        for field in preference_fields:
            if field in update_data:
                # Check if preference already exists
                existing_pref = db.query(models.UserPreference).filter(
                    models.UserPreference.user_id == current_user.id,
                    models.UserPreference.preference_key == field
                ).first()
                
                if existing_pref:
                    # Update existing preference
                    existing_pref.preference_value = json.dumps(update_data[field])
                else:
                    # Create new preference
                    new_pref = models.UserPreference(
                        user_id=current_user.id,
                        preference_key=field,
                        preference_value=json.dumps(update_data[field])
                    )
                    db.add(new_pref)
        
        # Commit changes
        db.commit()
        db.refresh(current_user)
        
        # Return updated profile
        return get_user_profile(current_user, db)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )


@router.get("/bookings")
def get_user_bookings(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the current user's bookings.
    """
    try:
        # Fetch bookings for the current user with relationships loaded
        bookings = db.query(models.Booking).filter(
            models.Booking.user_id == current_user.id
        ).join(models.Restaurant).join(models.Customer).all()
        
        # Return formatted booking data
        booking_list = []
        for booking in bookings:
            booking_data = {
                "id": booking.id,
                "booking_reference": booking.booking_reference,
                "restaurant_name": booking.restaurant.name,
                "visit_date": booking.visit_date.isoformat(),
                "visit_time": booking.visit_time.isoformat(),
                "party_size": booking.party_size,
                "status": booking.status,
                "special_requests": booking.special_requests,
                "customer": {
                    "title": booking.customer.title,
                    "first_name": booking.customer.first_name,
                    "surname": booking.customer.surname,
                    "email": booking.customer.email,
                    "mobile": booking.customer.mobile
                },
                "created_at": booking.created_at.isoformat() if booking.created_at else None
            }
            booking_list.append(booking_data)
        
        return booking_list
    except Exception as e:
        print(f"Error fetching user bookings: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch bookings")


@router.delete("/account")
def delete_user_account(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Delete the current user's account.
    """
    current_user.is_active = False
    db.commit()
    return {"message": "Account deleted successfully"}
