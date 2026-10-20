"""Shared availability rules for restaurant time slots."""

from sqlalchemy.orm import Session

from app.models import AvailabilitySlot, Booking


MAX_BOOKINGS_PER_SLOT = 3


def get_slot_status(db: Session, slot: AvailabilitySlot) -> tuple[int, bool]:
    """Return the confirmed booking count and whether the slot can be booked."""
    confirmed_bookings = db.query(Booking).filter(
        Booking.restaurant_id == slot.restaurant_id,
        Booking.visit_date == slot.date,
        Booking.visit_time == slot.time,
        Booking.status == "confirmed",
    ).count()

    is_available = slot.available and confirmed_bookings < MAX_BOOKINGS_PER_SLOT
    return confirmed_bookings, is_available
