"""
SQLAlchemy Database Models for Restaurant Booking System.

This module defines the database schema and relationships for the restaurant
booking mock API. All models inherit from the declarative base and include
proper relationships and constraints.

Author: AI Assistant
"""

from datetime import datetime, date
from typing import TYPE_CHECKING

from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, Date, Time, Text, ForeignKey
)
from sqlalchemy.orm import relationship

from app.database import Base

if TYPE_CHECKING:
    # Import for type hints only - avoids circular imports
    pass


class User(Base):
    """
    User model for authentication and profile management.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(50))
    last_name = Column(String(50))
    phone = Column(String(20))
    date_of_birth = Column(Date)
    accessibility_needs = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    bookings = relationship("Booking", back_populates="user")
    preferences = relationship("UserPreference", back_populates="user")
    customer = relationship("Customer", uselist=False, back_populates="user")
    reviews = relationship("RestaurantReview", back_populates="user")


class UserPreference(Base):
    """
    User preferences model.
    """
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    preference_key = Column(String(50), nullable=False)
    preference_value = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="preferences")


class Restaurant(Base):
    """
    Restaurant model representing individual restaurant entities with extended features.
    """
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    microsite_name = Column(String, unique=True, index=True, nullable=False)
    
    # Phase 3B: Extended restaurant information
    description = Column(Text)
    cuisine_type = Column(String)  # Italian, French, Asian, etc.
    location = Column(String)
    address = Column(Text)
    phone = Column(String)
    email = Column(String)
    website = Column(String)
    
    # Pricing and features
    price_range = Column(String)  # $, $$, $$$, $$$$
    features = Column(Text)  # JSON string: outdoor seating, parking, etc.
    dietary_options = Column(Text)  # JSON string: vegetarian, vegan, gluten-free
    
    # Ratings and reviews
    average_rating = Column(Integer, default=0)  # 1-5 stars
    total_reviews = Column(Integer, default=0)
    
    # Operating information
    opening_hours = Column(Text)  # JSON string with daily hours
    max_party_size = Column(Integer, default=8)
    accepts_reservations = Column(Boolean, default=True)
    
    @property
    def slug(self):
        """Generate a URL-friendly slug from restaurant name."""
        import re
        return re.sub(r'[^a-zA-Z0-9]+', '', self.name.replace(' ', ''))
    
    # Status and metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    bookings = relationship("Booking", back_populates="restaurant")
    availability_slots = relationship("AvailabilitySlot", back_populates="restaurant")
    reviews = relationship("RestaurantReview", back_populates="restaurant")


class Customer(Base):
    """
    Customer model storing customer information and marketing preferences.
    """
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String)
    first_name = Column(String)
    surname = Column(String)
    mobile_country_code = Column(String)
    mobile = Column(String)
    phone_country_code = Column(String)
    phone = Column(String)
    email = Column(String, index=True)
    receive_email_marketing = Column(Boolean, default=False)
    receive_sms_marketing = Column(Boolean, default=False)
    group_email_marketing_opt_in_text = Column(Text)
    group_sms_marketing_opt_in_text = Column(Text)
    receive_restaurant_email_marketing = Column(Boolean, default=False)
    receive_restaurant_sms_marketing = Column(Boolean, default=False)
    restaurant_email_marketing_opt_in_text = Column(Text)
    restaurant_sms_marketing_opt_in_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    bookings = relationship("Booking", back_populates="customer")
    user = relationship("User", back_populates="customer")


class Booking(Base):
    """
    Booking model representing restaurant reservations.
    """
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_reference = Column(String, unique=True, index=True, nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    visit_date = Column(Date, nullable=False)
    visit_time = Column(Time, nullable=False)
    party_size = Column(Integer, nullable=False)
    channel_code = Column(String, nullable=False)
    special_requests = Column(Text)
    is_leave_time_confirmed = Column(Boolean, default=False)
    room_number = Column(String)
    status = Column(String, default="confirmed")  # confirmed, cancelled, completed
    cancellation_reason_id = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="bookings")
    customer = relationship("Customer", back_populates="bookings")
    user = relationship("User", back_populates="bookings")
    review = relationship("RestaurantReview", back_populates="booking", uselist=False)


class AvailabilitySlot(Base):
    """
    Availability slot model defining when restaurants accept bookings.
    """
    __tablename__ = "availability_slots"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    max_party_size = Column(Integer, default=8)
    available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="availability_slots")


class CancellationReason(Base):
    """
    Cancellation reason model for tracking why bookings are cancelled.
    """
    __tablename__ = "cancellation_reasons"

    id = Column(Integer, primary_key=True, index=True)
    reason = Column(String, nullable=False)
    description = Column(Text)


class RestaurantReview(Base):
    """
    Restaurant review model for customer feedback and ratings.
    """
    __tablename__ = "restaurant_reviews"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    
    # Review content
    rating = Column(Integer, nullable=False)  # 1-5 stars
    title = Column(String)
    review_text = Column(Text)
    
    # Review categories
    food_rating = Column(Integer)  # 1-5 stars
    service_rating = Column(Integer)  # 1-5 stars
    ambiance_rating = Column(Integer)  # 1-5 stars
    value_rating = Column(Integer)  # 1-5 stars
    
    # Metadata
    is_verified = Column(Boolean, default=False)  # Verified if from actual booking
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
    booking = relationship("Booking", back_populates="review")