"""
Booking Router for Restaurant Booking API.

This module handles all booking-related operations including creation,
retrieval, updates, and cancellation of restaurant bookings.

Author: AI Assistant
"""

import random
import string
from datetime import date, time, datetime
from typing import Optional

from fastapi import APIRouter, Form, HTTPException, Depends, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Restaurant, Customer, Booking, CancellationReason, User
from app.routers.user import get_current_user

router = APIRouter(prefix="/api/ConsumerApi/v1/Restaurant", tags=["booking"])

def generate_booking_reference() -> str:
    """
    Generate a unique 7-character alphanumeric booking reference.
    """
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=7))


@router.post("/{restaurant_name}/BookingWithStripeToken")
async def create_booking_with_stripe(
    restaurant_name: str,
    current_user: User = Depends(get_current_user),
    VisitDate: date = Form(...),
    VisitTime: time = Form(...),
    PartySize: int = Form(...),
    ChannelCode: str = Form(...),
    SpecialRequests: Optional[str] = Form(None),
    IsLeaveTimeConfirmed: Optional[bool] = Form(None),
    RoomNumber: Optional[str] = Form(None),
    # Customer fields from form
    Title: Optional[str] = Form(None, alias="Customer[Title]"),
    FirstName: Optional[str] = Form(None, alias="Customer[FirstName]"),
    Surname: Optional[str] = Form(None, alias="Customer[Surname]"),
    Mobile: Optional[str] = Form(None, alias="Customer[Mobile]"),
    Email: Optional[str] = Form(None, alias="Customer[Email]"),
    db: Session = Depends(get_db),
):
    """Create a new booking, linked to the authenticated user."""
    restaurant = db.query(Restaurant).filter(Restaurant.name == restaurant_name).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Find or create a customer record linked to the user
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        customer = Customer(
            user_id=current_user.id,
            title=Title or current_user.first_name,
            first_name=FirstName or current_user.first_name,
            surname=Surname or current_user.last_name,
            email=Email or current_user.email,
            mobile=Mobile or current_user.phone,
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

    booking_reference = generate_booking_reference()
    while db.query(Booking).filter(Booking.booking_reference == booking_reference).first():
        booking_reference = generate_booking_reference()

    booking = Booking(
        booking_reference=booking_reference,
        restaurant_id=restaurant.id,
        customer_id=customer.id,
        user_id=current_user.id,  # Link booking to user
        visit_date=VisitDate,
        visit_time=VisitTime,
        party_size=PartySize,
        channel_code=ChannelCode,
        special_requests=SpecialRequests,
        status="confirmed",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    return {
        "booking_reference": booking.booking_reference,
        "booking_id": booking.id,
        "restaurant": restaurant.name,
        "status": "confirmed",
    }


@router.get("/{restaurant_name}/Booking/{booking_reference}")
async def get_booking(
    restaurant_name: str,
    booking_reference: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get booking details by reference, ensuring user ownership."""
    booking = (
        db.query(Booking)
        .join(Restaurant)
        .filter(
            Restaurant.name == restaurant_name,
            Booking.booking_reference == booking_reference,
            Booking.user_id == current_user.id,  # Ownership check
        )
        .first()
    )

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or access denied")

    return booking


@router.patch("/{restaurant_name}/Booking/{booking_reference}")
async def update_booking(
    restaurant_name: str,
    booking_reference: str,
    current_user: User = Depends(get_current_user),
    VisitDate: Optional[date] = Form(None),
    VisitTime: Optional[time] = Form(None),
    PartySize: Optional[int] = Form(None),
    SpecialRequests: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """Update an existing booking, ensuring user ownership."""
    booking = (
        db.query(Booking)
        .join(Restaurant)
        .filter(
            Restaurant.name == restaurant_name,
            Booking.booking_reference == booking_reference,
            Booking.user_id == current_user.id,
        )
        .first()
    )

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or access denied")

    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Cannot update a cancelled booking")

    update_data = {
        "visit_date": VisitDate,
        "visit_time": VisitTime,
        "party_size": PartySize,
        "special_requests": SpecialRequests,
    }

    updated_fields = False
    for key, value in update_data.items():
        if value is not None:
            setattr(booking, key, value)
            updated_fields = True

    if updated_fields:
        booking.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(booking)

    return {"message": "Booking updated successfully", "booking": booking}


@router.post("/{restaurant_name}/Booking/{booking_reference}/Cancel")
async def cancel_booking(
    restaurant_name: str,
    booking_reference: str,
    cancellationReasonId: int = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel an existing booking, ensuring user ownership."""
    booking = (
        db.query(Booking)
        .join(Restaurant)
        .filter(
            Restaurant.name == restaurant_name,
            Booking.booking_reference == booking_reference,
            Booking.user_id == current_user.id,
        )
        .first()
    )

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found or access denied")

    if booking.status == "cancelled":
        raise HTTPException(status_code=400, detail="Booking is already cancelled")

    cancellation_reason = db.query(CancellationReason).get(cancellationReasonId)
    if not cancellation_reason:
        raise HTTPException(status_code=400, detail="Invalid cancellation reason ID")

    booking.status = "cancelled"
    booking.cancellation_reason_id = cancellationReasonId
    booking.updated_at = datetime.utcnow()
    db.commit()

    return {"message": f"Booking {booking_reference} has been successfully cancelled"}