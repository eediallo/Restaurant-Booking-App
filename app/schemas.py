"""
Pydantic schemas for request/response validation.
"""

from datetime import date
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr


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
