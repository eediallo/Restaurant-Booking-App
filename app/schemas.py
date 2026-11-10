"""
Pydantic schemas for request/response validation.
"""

from datetime import date, datetime, time
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile information."""
    
    # Basic information
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    accessibility_needs: Optional[str] = None
    
    # Dining preferences (stored as JSON in UserPreference table)
    dining_preferences: Optional[Dict[str, Any]] = None
    
    # Notification preferences (stored as JSON in UserPreference table)
    notification_preferences: Optional[Dict[str, Any]] = None
    
    # Emergency contact (stored as JSON in UserPreference table)
    emergency_contact: Optional[Dict[str, Any]] = None


class UserProfileResponse(BaseModel):
    """Schema for user profile response."""
    
    id: int
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    accessibility_needs: Optional[str] = None
    is_active: bool
    
    # Extended profile data from preferences
    dining_preferences: Optional[Dict[str, Any]] = None
    notification_preferences: Optional[Dict[str, Any]] = None
    emergency_contact: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True


class BookingResponse(BaseModel):
    """Schema for booking response."""
    
    id: int
    booking_reference: str
    restaurant_name: str
    visit_date: str
    visit_time: str
    party_size: int
    status: str
    special_requests: Optional[str] = None
    created_at: Optional[str] = None
    
    customer: Dict[str, Any]
    
    class Config:
        from_attributes = True


class WaitlistEntryCreate(BaseModel):
    """Fields a signed-in user provides to join a restaurant waitlist."""

    restaurant_id: Optional[int] = None
    visit_date: date
    visit_time: time
    party_size: int = Field(gt=0)


class WaitlistEntryResponse(BaseModel):
    """Public fields returned for a user's waitlist entry."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    restaurant_id: int
    visit_date: date
    visit_time: time
    party_size: int
    status: str
    created_at: datetime
    offered_at: Optional[datetime] = None
    offer_expires_at: Optional[datetime] = None
    booking_id: Optional[int] = None


class WaitlistOfferAcceptResponse(BaseModel):
    """Booking details returned after a user accepts a waitlist offer."""

    booking_id: int
    booking_reference: str
    status: str
