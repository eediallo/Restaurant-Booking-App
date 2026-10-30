"""API tests for booking validation and waitlist workflows."""

from datetime import date, datetime, time, timedelta

from app import auth
from app.models import AvailabilitySlot, Booking, Customer, WaitlistEntry


def headers_for(user):
    token = auth.create_access_token(data={"sub": user.email})
    return {"Authorization": f"Bearer {token}"}


def add_slot(db_session, restaurant, visit_date, available=True):
    slot = AvailabilitySlot(
        restaurant_id=restaurant.id,
        date=visit_date,
        time=time(19, 0),
        max_party_size=4,
        available=available,
    )
    db_session.add(slot)
    db_session.commit()
    return slot


def fill_slot(db_session, restaurant, user, slot):
    customer = Customer(
        user_id=user.id,
        first_name=user.first_name,
        surname=user.last_name,
        email=user.email,
        mobile=user.phone,
    )
    db_session.add(customer)
    db_session.commit()

    for index in range(3):
        booking = Booking(
            booking_reference=f"FULL{index:03d}",
            user_id=user.id,
            restaurant_id=restaurant.id,
            customer_id=customer.id,
            visit_date=slot.date,
            visit_time=slot.time,
            party_size=2,
            channel_code="ONLINE",
            status="confirmed",
        )
        db_session.add(booking)
    db_session.commit()


def booking_data(visit_date, party_size=2):
    return {
        "VisitDate": visit_date.isoformat(),
        "VisitTime": "19:00:00",
        "PartySize": str(party_size),
        "ChannelCode": "ONLINE",
    }


def test_booking_accepts_available_slot(
    client, db_session, test_user, test_restaurant
):
    visit_date = date.today() + timedelta(days=2)
    test_restaurant.max_party_size = 4
    db_session.commit()
    add_slot(db_session, test_restaurant, visit_date)

    response = client.post(
        f"/api/ConsumerApi/v1/Restaurant/{test_restaurant.name}/BookingWithStripeToken",
        data=booking_data(visit_date),
        headers=headers_for(test_user),
    )

    assert response.status_code == 200
    assert response.json()["status"] == "confirmed"


def test_booking_rejects_unavailable_slot(
    client, db_session, test_user, test_restaurant
):
    visit_date = date.today() + timedelta(days=2)
    add_slot(db_session, test_restaurant, visit_date, available=False)

    response = client.post(
        f"/api/ConsumerApi/v1/Restaurant/{test_restaurant.name}/BookingWithStripeToken",
        data=booking_data(visit_date),
        headers=headers_for(test_user),
    )

    assert response.status_code == 409
    assert "available" in response.json()["detail"]


def test_booking_rejects_party_size_above_restaurant_limit(
    client, db_session, test_user, test_restaurant
):
    visit_date = date.today() + timedelta(days=2)
    test_restaurant.max_party_size = 4
    db_session.commit()
    add_slot(db_session, test_restaurant, visit_date)

    response = client.post(
        f"/api/ConsumerApi/v1/Restaurant/{test_restaurant.name}/BookingWithStripeToken",
        data=booking_data(visit_date, party_size=5),
        headers=headers_for(test_user),
    )

    assert response.status_code == 400
    assert "cannot exceed 4" in response.json()["detail"]


def test_booking_rejects_missing_slot(
    client, test_user, test_restaurant
):
    visit_date = date.today() + timedelta(days=2)

    response = client.post(
        f"/api/ConsumerApi/v1/Restaurant/{test_restaurant.name}/BookingWithStripeToken",
        data=booking_data(visit_date),
        headers=headers_for(test_user),
    )

    assert response.status_code == 409
    assert "No availability slot" in response.json()["detail"]


def test_user_can_join_full_slot_waitlist(
    client, db_session, test_user, test_restaurant
):
    visit_date = date.today() + timedelta(days=2)
    slot = add_slot(db_session, test_restaurant, visit_date)
    fill_slot(db_session, test_restaurant, test_user, slot)

    response = client.post(
        f"/api/ConsumerApi/v1/Restaurant/{test_restaurant.name}/Waitlist",
        json={
            "visit_date": visit_date.isoformat(),
            "visit_time": "19:00:00",
            "party_size": 2,
        },
        headers=headers_for(test_user),
    )

    assert response.status_code == 201
    assert response.json()["status"] == "waiting"


def test_user_cannot_join_available_slot_waitlist(
    client, db_session, test_user, test_restaurant
):
    visit_date = date.today() + timedelta(days=2)
    add_slot(db_session, test_restaurant, visit_date)

    response = client.post(
        f"/api/ConsumerApi/v1/Restaurant/{test_restaurant.name}/Waitlist",
        json={
            "visit_date": visit_date.isoformat(),
            "visit_time": "19:00:00",
            "party_size": 2,
        },
        headers=headers_for(test_user),
    )

    assert response.status_code == 409
    assert "currently available" in response.json()["detail"]


def test_user_can_accept_waitlist_offer(
    client, db_session, test_user, test_restaurant
):
    visit_date = date.today() + timedelta(days=2)
    slot = add_slot(db_session, test_restaurant, visit_date)
    offered_at = datetime.utcnow()
    entry = WaitlistEntry(
        user_id=test_user.id,
        restaurant_id=test_restaurant.id,
        visit_date=slot.date,
        visit_time=slot.time,
        party_size=2,
        status="offered",
        offered_at=offered_at,
        offer_expires_at=offered_at + timedelta(minutes=15),
    )
    db_session.add(entry)
    db_session.commit()

    response = client.post(
        f"/api/waitlist/{entry.id}/accept",
        headers=headers_for(test_user),
    )

    assert response.status_code == 200
    assert response.json()["status"] == "confirmed"

    db_session.refresh(entry)
    assert entry.status == "booked"
    assert entry.booking_id is not None


def test_user_cannot_join_same_slot_waitlist_twice(
    client, db_session, test_user, test_restaurant
):
    visit_date = date.today() + timedelta(days=2)
    slot = add_slot(db_session, test_restaurant, visit_date)
    fill_slot(db_session, test_restaurant, test_user, slot)
    data = {
        "restaurant_id": test_restaurant.id,
        "visit_date": visit_date.isoformat(),
        "visit_time": "19:00:00",
        "party_size": 2,
    }

    first_response = client.post(
        "/api/waitlist/",
        json=data,
        headers=headers_for(test_user),
    )
    second_response = client.post(
        "/api/waitlist/",
        json=data,
        headers=headers_for(test_user),
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 409
    assert "already waiting" in second_response.json()["detail"]


def test_expired_waitlist_offer_cannot_be_accepted(
    client, db_session, test_user, test_restaurant
):
    visit_date = date.today() + timedelta(days=2)
    slot = add_slot(db_session, test_restaurant, visit_date)
    expired_at = datetime.utcnow() - timedelta(minutes=1)
    entry = WaitlistEntry(
        user_id=test_user.id,
        restaurant_id=test_restaurant.id,
        visit_date=slot.date,
        visit_time=slot.time,
        party_size=2,
        status="offered",
        offered_at=expired_at - timedelta(minutes=15),
        offer_expires_at=expired_at,
    )
    db_session.add(entry)
    db_session.commit()

    response = client.post(
        f"/api/waitlist/{entry.id}/accept",
        headers=headers_for(test_user),
    )

    assert response.status_code == 409
    assert "expired" in response.json()["detail"]
    db_session.refresh(entry)
    assert entry.status == "expired"


def test_waiting_entry_cannot_be_accepted_as_offer(
    client, db_session, test_user, test_restaurant
):
    visit_date = date.today() + timedelta(days=2)
    entry = WaitlistEntry(
        user_id=test_user.id,
        restaurant_id=test_restaurant.id,
        visit_date=visit_date,
        visit_time=time(19, 0),
        party_size=2,
        status="waiting",
    )
    db_session.add(entry)
    db_session.commit()

    response = client.post(
        f"/api/waitlist/{entry.id}/accept",
        headers=headers_for(test_user),
    )

    assert response.status_code == 409
    assert "no active offer" in response.json()["detail"]


def test_user_can_leave_waitlist(
    client, db_session, test_user, test_restaurant
):
    entry = WaitlistEntry(
        user_id=test_user.id,
        restaurant_id=test_restaurant.id,
        visit_date=date.today() + timedelta(days=2),
        visit_time=time(19, 0),
        party_size=2,
        status="waiting",
    )
    db_session.add(entry)
    db_session.commit()

    response = client.delete(
        f"/api/waitlist/{entry.id}",
        headers=headers_for(test_user),
    )

    assert response.status_code == 204
    db_session.refresh(entry)
    assert entry.status == "cancelled"
