"""Shared booking helpers."""

import random
import string

from sqlalchemy.orm import Session

from app.models import Booking


def generate_booking_reference(
    db: Session,
    max_retries: int = 10,
) -> str:
    """Generate a unique 7-character booking reference."""
    for _ in range(max_retries):
        reference = "".join(
            random.choices(
                string.ascii_uppercase + string.digits,
                k=7,
            )
        )

        exists = db.query(
            db.query(Booking.id)
            .filter(Booking.booking_reference == reference)
            .exists()
        ).scalar()

        if not exists:
            return reference

    raise RuntimeError(
        "Failed to generate a unique booking reference after maximum retries."
    )