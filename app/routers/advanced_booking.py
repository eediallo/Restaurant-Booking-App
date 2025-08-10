"""
This module handles advanced booking operations including status management,
booking history with filters, booking modifications, and bulk operations.

"""

from datetime import date, datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Form
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.database import get_db
from app.models import Booking, Restaurant, Customer, User
from app.routers.user import get_current_user

router = APIRouter(prefix="/api/user/bookings", tags=["advanced-booking"])


@router.get("/history")
def get_booking_history(
    search: Optional[str] = Query(None, description="Search by booking reference, restaurant name, or customer name"),
    status: Optional[str] = Query(None, description="Filter by booking status"),
    restaurant_name: Optional[str] = Query(None, description="Filter by restaurant name"),
    date_from: Optional[date] = Query(None, description="Filter bookings from this date"),
    date_to: Optional[date] = Query(None, description="Filter bookings to this date"),
    sort_by: Optional[str] = Query("date_desc", description="Sort by: date_desc, date_asc, restaurant, status"),
    limit: Optional[int] = Query(50, description="Maximum number of bookings to return"),
    offset: Optional[int] = Query(0, description="Number of bookings to skip"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get enhanced booking history with advanced filtering and search capabilities.
    """
    try:
        # Base query for user's bookings
        query = db.query(Booking).filter(
            Booking.user_id == current_user.id
        ).join(Restaurant).join(Customer)
        
        # Apply search filter
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Booking.booking_reference.ilike(search_term),
                    Restaurant.name.ilike(search_term),
                    Customer.first_name.ilike(search_term),
                    Customer.surname.ilike(search_term)
                )
            )
        
        # Apply status filter
        if status:
            query = query.filter(Booking.status == status)
        
        # Apply restaurant filter
        if restaurant_name:
            query = query.filter(Restaurant.name.ilike(f"%{restaurant_name}%"))
        
        # Apply date range filters
        if date_from:
            query = query.filter(Booking.visit_date >= date_from)
        if date_to:
            query = query.filter(Booking.visit_date <= date_to)
        
        # Apply sorting
        if sort_by == "date_asc":
            query = query.order_by(Booking.visit_date.asc(), Booking.visit_time.asc())
        elif sort_by == "restaurant":
            query = query.order_by(Restaurant.name.asc())
        elif sort_by == "status":
            query = query.order_by(Booking.status.asc())
        else:  # date_desc (default)
            query = query.order_by(Booking.visit_date.desc(), Booking.visit_time.desc())
        
        # Get total count before pagination
        total_count = query.count()
        
        # Apply pagination
        bookings = query.offset(offset).limit(limit).all()
        
        # Format response
        booking_list = []
        for booking in bookings:
            booking_data = {
                "id": booking.id,
                "booking_reference": booking.booking_reference,
                "restaurant_name": booking.restaurant.name,
                "restaurant_id": booking.restaurant.id,
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
                "created_at": booking.created_at.isoformat() if booking.created_at else None,
                "updated_at": booking.updated_at.isoformat() if booking.updated_at else None,
                # Additional metadata for advanced features
                "can_modify": booking.visit_date > date.today(),  # Can modify future bookings
                "can_cancel": booking.status in ["confirmed", "pending"],
                "is_past": booking.visit_date < date.today(),
                "can_review": booking.status == "completed" and not booking.review
            }
            booking_list.append(booking_data)
        
        return {
            "bookings": booking_list,
            "total": total_count,
            "offset": offset,
            "limit": limit,
            "has_more": offset + len(booking_list) < total_count
        }
        
    except Exception as e:
        print(f"Error fetching booking history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch booking history")


@router.get("/stats")
def get_booking_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get booking statistics for the current user.
    """
    try:
        # Get all user bookings
        all_bookings = db.query(Booking).filter(
            Booking.user_id == current_user.id
        ).all()
        
        # Calculate statistics
        total_bookings = len(all_bookings)
        confirmed_bookings = len([b for b in all_bookings if b.status == "confirmed"])
        cancelled_bookings = len([b for b in all_bookings if b.status == "cancelled"])
        completed_bookings = len([b for b in all_bookings if b.status == "completed"])
        upcoming_bookings = len([b for b in all_bookings if b.visit_date >= date.today() and b.status == "confirmed"])
        
        # Get favorite restaurant (most booked)
        restaurant_counts = {}
        for booking in all_bookings:
            restaurant_name = booking.restaurant.name
            restaurant_counts[restaurant_name] = restaurant_counts.get(restaurant_name, 0) + 1
        
        favorite_restaurant = max(restaurant_counts.items(), key=lambda x: x[1])[0] if restaurant_counts else None
        
        return {
            "total_bookings": total_bookings,
            "confirmed_bookings": confirmed_bookings,
            "cancelled_bookings": cancelled_bookings,
            "completed_bookings": completed_bookings,
            "upcoming_bookings": upcoming_bookings,
            "favorite_restaurant": favorite_restaurant,
            "unique_restaurants": len(set(restaurant_counts.keys())),
            "status_breakdown": {
                "confirmed": confirmed_bookings,
                "cancelled": cancelled_bookings,
                "completed": completed_bookings,
                "pending": len([b for b in all_bookings if b.status == "pending"])
            }
        }
        
    except Exception as e:
        print(f"Error fetching booking stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch booking statistics")


@router.patch("/{booking_reference}/status")
def update_booking_status(
    booking_reference: str,
    new_status: str = Form(..., description="New status: confirmed, pending, cancelled, completed, no_show"),
    notes: Optional[str] = Form(None, description="Optional notes about the status change"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update booking status with audit trail.
    """
    try:
        # Valid status options
        valid_statuses = ["confirmed", "pending", "cancelled", "completed", "no_show"]
        if new_status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
        # Find the booking
        booking = db.query(Booking).filter(
            Booking.booking_reference == booking_reference,
            Booking.user_id == current_user.id
        ).first()
        
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Store old status for audit
        old_status = booking.status
        
        # Update status
        booking.status = new_status
        booking.updated_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "booking_reference": booking_reference,
            "old_status": old_status,
            "new_status": new_status,
            "updated_at": booking.updated_at.isoformat(),
            "notes": notes,
            "message": f"Booking status updated from {old_status} to {new_status}"
        }
        
    except Exception as e:
        db.rollback()
        print(f"Error updating booking status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update booking status")


@router.get("/upcoming")
def get_upcoming_bookings(
    days_ahead: Optional[int] = Query(30, description="Number of days ahead to look for bookings"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get upcoming bookings for the user.
    """
    try:
        from datetime import timedelta
        
        end_date = date.today() + timedelta(days=days_ahead)
        
        bookings = db.query(Booking).filter(
            Booking.user_id == current_user.id,
            Booking.visit_date >= date.today(),
            Booking.visit_date <= end_date,
            Booking.status.in_(["confirmed", "pending"])
        ).join(Restaurant).join(Customer).order_by(
            Booking.visit_date.asc(), 
            Booking.visit_time.asc()
        ).all()
        
        booking_list = []
        for booking in bookings:
            days_until = (booking.visit_date - date.today()).days
            booking_data = {
                "id": booking.id,
                "booking_reference": booking.booking_reference,
                "restaurant_name": booking.restaurant.name,
                "restaurant_id": booking.restaurant.id,
                "visit_date": booking.visit_date.isoformat(),
                "visit_time": booking.visit_time.isoformat(),
                "party_size": booking.party_size,
                "status": booking.status,
                "special_requests": booking.special_requests,
                "days_until": days_until,
                "is_today": days_until == 0,
                "is_tomorrow": days_until == 1,
                "customer": {
                    "first_name": booking.customer.first_name,
                    "surname": booking.customer.surname,
                    "email": booking.customer.email,
                    "mobile": booking.customer.mobile
                }
            }
            booking_list.append(booking_data)
        
        return {
            "upcoming_bookings": booking_list,
            "total": len(booking_list),
            "date_range": {
                "from": date.today().isoformat(),
                "to": end_date.isoformat(),
                "days": days_ahead
            }
        }
        
    except Exception as e:
        print(f"Error fetching upcoming bookings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch upcoming bookings")


@router.get("/filters/options")
def get_filter_options(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get available filter options for booking history.
    """
    try:
        # Get unique restaurants from user's bookings
        restaurants = db.query(Restaurant.name).join(Booking).filter(
            Booking.user_id == current_user.id
        ).distinct().all()
        
        # Get unique statuses from user's bookings
        statuses = db.query(Booking.status).filter(
            Booking.user_id == current_user.id
        ).distinct().all()
        
        return {
            "restaurants": [r[0] for r in restaurants],
            "statuses": [s[0] for s in statuses],
            "sort_options": [
                {"value": "date_desc", "label": "Newest First"},
                {"value": "date_asc", "label": "Oldest First"},
                {"value": "restaurant", "label": "Restaurant A-Z"},
                {"value": "status", "label": "Status"}
            ]
        }
        
    except Exception as e:
        print(f"Error fetching filter options: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch filter options")
