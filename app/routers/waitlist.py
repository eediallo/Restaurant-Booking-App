"""Endpoints for managing a signed-in user's restaurant waitlist entries."""

from datetime import date, datetime
from typing import List,Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AvailabilitySlot, Booking, Customer, Restaurant, User, WaitlistEntry
from app.routers.user import get_current_user
from app.schemas import (
    WaitlistEntryCreate,
    WaitlistEntryResponse,
    WaitlistOfferAcceptResponse,
)
from app.services.availability import get_slot_status
from app.services.booking import generate_booking_reference


router = APIRouter(prefix="/api/waitlist", tags=["waitlist"])


@router.post(
    "/",
    response_model=WaitlistEntryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Join a restaurant waitlist",
)
def join_waitlist(
    entry_data: WaitlistEntryCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> WaitlistEntry:
    """Create a waitlist entry for the authenticated user."""
    restaurant = db.query(Restaurant).filter(
        Restaurant.id == entry_data.restaurant_id,
        Restaurant.is_active.is_(True),
    ).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    if entry_data.visit_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Waitlist date cannot be in the past",
        )

    if (
        restaurant.max_party_size is not None
        and entry_data.party_size > restaurant.max_party_size
    ):
        raise HTTPException(
            status_code=400,
            detail=f"Party size cannot exceed {restaurant.max_party_size}",
        )

    slot = db.query(AvailabilitySlot).filter(
        AvailabilitySlot.restaurant_id == restaurant.id,
        AvailabilitySlot.date == entry_data.visit_date,
        AvailabilitySlot.time == entry_data.visit_time,
    ).first()
    if not slot:
        raise HTTPException(
            status_code=404,
            detail="No availability slot exists for that date and time",
        )

    if slot.max_party_size is None or entry_data.party_size > slot.max_party_size:
        raise HTTPException(
            status_code=400,
            detail="The availability slot cannot accommodate this party size",
        )

    _, slot_is_available = get_slot_status(db, slot)
    if slot_is_available:
        raise HTTPException(
            status_code=409,
            detail="This slot is currently available; book it directly instead",
        )

    existing_entry = db.query(WaitlistEntry).filter(
        WaitlistEntry.user_id == current_user.id,
        WaitlistEntry.restaurant_id == restaurant.id,
        WaitlistEntry.visit_date == entry_data.visit_date,
        WaitlistEntry.visit_time == entry_data.visit_time,
        WaitlistEntry.status.in_(["waiting", "offered"]),
    ).first()
    if existing_entry:
        raise HTTPException(
            status_code=409,
            detail="You are already waiting for this restaurant and time",
        )

    entry = WaitlistEntry(
        user_id=current_user.id,
        restaurant_id=restaurant.id,
        visit_date=entry_data.visit_date,
        visit_time=entry_data.visit_time,
        party_size=entry_data.party_size,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get(
    "/",
    response_model=List[WaitlistEntryResponse],
    summary="List my waitlist entries",
)
def list_my_waitlist_entries(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User,Depends(get_current_user)],
) -> List[WaitlistEntry]:
    """Return the authenticated user's entries, oldest first."""
    return (
        db.query(WaitlistEntry)
        .filter(WaitlistEntry.user_id == current_user.id)
        .order_by(WaitlistEntry.created_at.asc())
        .all()
    )


@router.post(
    "/{entry_id}/accept",
    response_model=WaitlistOfferAcceptResponse,
    summary="Accept a waitlist offer",
)
def accept_waitlist_offer(
    entry_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> WaitlistOfferAcceptResponse:
    """Create a booking from an unexpired offer owned by the current user."""
    entry = (
        db.query(WaitlistEntry)
        .filter(
            WaitlistEntry.id == entry_id,
            WaitlistEntry.user_id == current_user.id,
        )
        .with_for_update()
        .first()
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Waitlist entry not found")
    if entry.status != "offered":
        raise HTTPException(status_code=409, detail="This entry has no active offer")

    now = datetime.utcnow()
    if entry.offer_expires_at is None or entry.offer_expires_at <= now:
        entry.status = "expired"
        db.commit()
        raise HTTPException(status_code=409, detail="This waitlist offer has expired")

    slot = (
        db.query(AvailabilitySlot)
        .filter(
            AvailabilitySlot.restaurant_id == entry.restaurant_id,
            AvailabilitySlot.date == entry.visit_date,
            AvailabilitySlot.time == entry.visit_time,
        )
        .with_for_update()
        .first()
    )
    if not slot:
        entry.status = "expired"
        db.commit()
        raise HTTPException(status_code=409, detail="This time slot no longer exists")

    if slot.max_party_size is None or entry.party_size > slot.max_party_size:
        entry.status = "expired"
        db.commit()
        raise HTTPException(
            status_code=409,
            detail="This time slot can no longer accommodate your party size",
        )

    _, slot_is_available = get_slot_status(db, slot)
    if not slot_is_available:
        entry.status = "expired"
        db.commit()
        raise HTTPException(status_code=409, detail="This time slot is no longer available")

    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        customer = Customer(
            user_id=current_user.id,
            first_name=current_user.first_name,
            surname=current_user.last_name,
            email=current_user.email,
            mobile=current_user.phone,
        )
        db.add(customer)
        db.flush()

    booking = Booking(
        booking_reference=generate_booking_reference(db),
        restaurant_id=entry.restaurant_id,
        customer_id=customer.id,
        user_id=current_user.id,
        visit_date=entry.visit_date,
        visit_time=entry.visit_time,
        party_size=entry.party_size,
        channel_code="ONLINE",
        status="confirmed",
    )
    db.add(booking)
    db.flush()

    entry.status = "booked"
    entry.booking_id = booking.id
    db.commit()
    db.refresh(booking)

    return WaitlistOfferAcceptResponse(
        booking_id=booking.id,
        booking_reference=booking.booking_reference,
        status=booking.status,
    )


@router.delete(
    "/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Leave a waitlist",
)
def leave_waitlist(
    entry_id: int,
    db: Annotated[Session,Depends(get_db)],
    current_user:Annotated[User, Depends(get_current_user)],
) -> Response:
    """Mark one of the authenticated user's waiting entries as cancelled."""
    entry = db.query(WaitlistEntry).filter(
        WaitlistEntry.id == entry_id,
        WaitlistEntry.user_id == current_user.id,
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Waitlist entry not found")

    if entry.status not in {"waiting", "offered"}:
        raise HTTPException(
            status_code=409,
            detail="Only waiting or offered entries can be removed",
        )

    entry.status = "cancelled"
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
