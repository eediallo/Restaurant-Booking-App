"""Business logic for advancing restaurant waitlist entries."""

from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.models import AvailabilitySlot, Booking, WaitlistEntry
from app.services.availability import get_slot_status


OFFER_DURATION_MINUTES = 15


def offer_next_waitlist_entry(db: Session, booking: Booking) -> Optional[WaitlistEntry]:
    """Offer a newly available slot to the oldest compatible waitlist entry."""
    slot = db.query(AvailabilitySlot).filter(
        AvailabilitySlot.restaurant_id == booking.restaurant_id,
        AvailabilitySlot.date == booking.visit_date,
        AvailabilitySlot.time == booking.visit_time,
    ).first()
    if not slot or slot.max_party_size is None:
        return None

    _, is_available = get_slot_status(db, slot)
    if not is_available:
        return None

    entry = db.query(WaitlistEntry).filter(
        WaitlistEntry.restaurant_id == booking.restaurant_id,
        WaitlistEntry.visit_date == booking.visit_date,
        WaitlistEntry.visit_time == booking.visit_time,
        WaitlistEntry.user_id != booking.user_id,
        WaitlistEntry.party_size <= slot.max_party_size,
        WaitlistEntry.status == "waiting",
    ).order_by(
        WaitlistEntry.created_at.asc(),
        WaitlistEntry.id.asc(),
    ).first()
    if not entry:
        return None

    offered_at = datetime.utcnow()
    entry.status = "offered"
    entry.offered_at = offered_at
    entry.offer_expires_at = offered_at + timedelta(minutes=OFFER_DURATION_MINUTES)
    return entry
