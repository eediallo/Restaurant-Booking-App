"""
Restaurant management router for Phase 3B - Advanced Restaurant Features.
"""

import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from app import models
from app.database import get_db

router = APIRouter(prefix="/api/restaurants", tags=["restaurants"])


@router.get("/")
def get_restaurants(
    cuisine_type: Optional[str] = Query(None, description="Filter by cuisine type"),
    location: Optional[str] = Query(None, description="Filter by location"),
    price_range: Optional[str] = Query(None, description="Filter by price range"),
    features: Optional[str] = Query(None, description="Filter by features (comma-separated)"),
    dietary_options: Optional[str] = Query(None, description="Filter by dietary options (comma-separated)"),
    min_rating: Optional[int] = Query(None, description="Minimum rating (1-5)"),
    search: Optional[str] = Query(None, description="Search in name, description, or cuisine"),
    limit: int = Query(10, description="Number of restaurants to return"),
    offset: int = Query(0, description="Number of restaurants to skip"),
    db: Session = Depends(get_db)
):
    """
    Get restaurants with advanced filtering and search capabilities.
    """
    query = db.query(models.Restaurant).filter(models.Restaurant.is_active.is_(True))
    
    # Apply filters
    if cuisine_type:
        query = query.filter(models.Restaurant.cuisine_type.ilike(f"%{cuisine_type}%"))
    
    if location:
        query = query.filter(models.Restaurant.location.ilike(f"%{location}%"))
    
    if price_range:
        query = query.filter(models.Restaurant.price_range == price_range)
    
    if min_rating:
        query = query.filter(models.Restaurant.average_rating >= min_rating)
    
    if search:
        query = query.filter(
            or_(
                models.Restaurant.name.ilike(f"%{search}%"),
                models.Restaurant.description.ilike(f"%{search}%"),
                models.Restaurant.cuisine_type.ilike(f"%{search}%")
            )
        )
    
    # Filter by features (if restaurant has JSON features matching any provided)
    if features:
        feature_list = [f.strip() for f in features.split(",")]
        for feature in feature_list:
            query = query.filter(models.Restaurant.features.like(f'%"{feature}"%'))
    
    # Filter by dietary options
    if dietary_options:
        dietary_list = [d.strip() for d in dietary_options.split(",")]
        for dietary in dietary_list:
            query = query.filter(models.Restaurant.dietary_options.like(f'%"{dietary}"%'))
    
    # Apply pagination
    restaurants = query.offset(offset).limit(limit).all()
    
    # Format response
    restaurant_list = []
    for restaurant in restaurants:
        try:
            # Safely parse JSON fields
            features = []
            if restaurant.features:
                try:
                    features = json.loads(restaurant.features)
                except (json.JSONDecodeError, TypeError):
                    features = []
            
            dietary_options = []
            if restaurant.dietary_options:
                try:
                    dietary_options = json.loads(restaurant.dietary_options)
                except (json.JSONDecodeError, TypeError):
                    dietary_options = []
            
            opening_hours = {}
            if restaurant.opening_hours:
                try:
                    opening_hours = json.loads(restaurant.opening_hours)
                except (json.JSONDecodeError, TypeError):
                    opening_hours = {}
            
            restaurant_data = {
                "id": restaurant.id,
                "name": restaurant.name,
                "microsite_name": restaurant.microsite_name,
                "description": restaurant.description,
                "cuisine_type": restaurant.cuisine_type,
                "location": restaurant.location,
                "address": restaurant.address,
                "phone": restaurant.phone,
                "email": restaurant.email,
                "website": restaurant.website,
                "price_range": restaurant.price_range,
                "features": features,
                "dietary_options": dietary_options,
                "average_rating": restaurant.average_rating,
                "total_reviews": restaurant.total_reviews,
                "opening_hours": opening_hours,
                "max_party_size": restaurant.max_party_size,
                "accepts_reservations": restaurant.accepts_reservations
            }
            restaurant_list.append(restaurant_data)
        except Exception as e:
            # Log the error and skip this restaurant
            print(f"Error processing restaurant {restaurant.id}: {str(e)}")
            continue
    
    return {
        "restaurants": restaurant_list,
        "total": len(restaurant_list),
        "offset": offset,
        "limit": limit
    }


@router.get("/{restaurant_id}")
def get_restaurant_details(restaurant_id: int, db: Session = Depends(get_db)):
    """
    Get detailed information about a specific restaurant.
    """
    restaurant = db.query(models.Restaurant).filter(
        models.Restaurant.id == restaurant_id,
        models.Restaurant.is_active.is_(True)
    ).first()
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    # Get recent reviews
    recent_reviews = db.query(models.RestaurantReview).filter(
        models.RestaurantReview.restaurant_id == restaurant_id,
        models.RestaurantReview.is_published.is_(True)
    ).order_by(models.RestaurantReview.created_at.desc()).limit(5).all()
    
    reviews_data = []
    for review in recent_reviews:
        review_data = {
            "id": review.id,
            "rating": review.rating,
            "title": review.title,
            "review_text": review.review_text,
            "food_rating": review.food_rating,
            "service_rating": review.service_rating,
            "ambiance_rating": review.ambiance_rating,
            "value_rating": review.value_rating,
            "is_verified": review.is_verified,
            "created_at": review.created_at.isoformat() if review.created_at else None,
            "user_name": f"{review.user.first_name} {review.user.last_name[0]}." if review.user.first_name and review.user.last_name else "Anonymous"
        }
        reviews_data.append(review_data)
    
    # Safely parse JSON fields
    features = []
    if restaurant.features:
        try:
            features = json.loads(restaurant.features)
        except (json.JSONDecodeError, TypeError):
            features = []
    
    dietary_options = []
    if restaurant.dietary_options:
        try:
            dietary_options = json.loads(restaurant.dietary_options)
        except (json.JSONDecodeError, TypeError):
            dietary_options = []
    
    opening_hours = {}
    if restaurant.opening_hours:
        try:
            opening_hours = json.loads(restaurant.opening_hours)
        except (json.JSONDecodeError, TypeError):
            opening_hours = {}

    restaurant_data = {
        "id": restaurant.id,
        "name": restaurant.name,
        "microsite_name": restaurant.microsite_name,
        "description": restaurant.description,
        "cuisine_type": restaurant.cuisine_type,
        "location": restaurant.location,
        "address": restaurant.address,
        "phone": restaurant.phone,
        "email": restaurant.email,
        "website": restaurant.website,
        "price_range": restaurant.price_range,
        "features": features,
        "dietary_options": dietary_options,
        "average_rating": restaurant.average_rating,
        "total_reviews": restaurant.total_reviews,
        "opening_hours": opening_hours,
        "max_party_size": restaurant.max_party_size,
        "accepts_reservations": restaurant.accepts_reservations,
        "recent_reviews": reviews_data
    }
    
    return restaurant_data


@router.get("/search/cuisines")
def get_available_cuisines(db: Session = Depends(get_db)):
    """
    Get list of available cuisine types.
    """
    cuisines = db.query(models.Restaurant.cuisine_type).filter(
        models.Restaurant.is_active.is_(True),
        models.Restaurant.cuisine_type.isnot(None)
    ).distinct().all()
    
    return [cuisine[0] for cuisine in cuisines if cuisine[0]]


@router.get("/search/locations")
def get_available_locations(db: Session = Depends(get_db)):
    """
    Get list of available locations.
    """
    locations = db.query(models.Restaurant.location).filter(
        models.Restaurant.is_active.is_(True),
        models.Restaurant.location.isnot(None)
    ).distinct().all()
    
    return [location[0] for location in locations if location[0]]


@router.get("/search/price-ranges")
def get_price_ranges():
    """
    Get available price range options.
    """
    return ["$", "$$", "$$$", "$$$$"]


@router.get("/{restaurant_id}/availability")
def get_restaurant_availability(
    restaurant_id: int,
    visit_date: str,
    party_size: int = Query(..., ge=1, le=20),
    db: Session = Depends(get_db)
):
    """
    Get availability for a specific restaurant on a given date.
    """
    from datetime import datetime
    
    # Verify restaurant exists
    restaurant = db.query(models.Restaurant).filter(
        models.Restaurant.id == restaurant_id,
        models.Restaurant.is_active.is_(True)
    ).first()
    
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    try:
        target_date = datetime.strptime(visit_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Get availability slots
    slots = db.query(models.AvailabilitySlot).filter(
        models.AvailabilitySlot.restaurant_id == restaurant_id,
        models.AvailabilitySlot.date == target_date,
        models.AvailabilitySlot.available.is_(True),
        models.AvailabilitySlot.max_party_size >= party_size
    ).order_by(models.AvailabilitySlot.time).all()
    
    available_slots = []
    for slot in slots:
        slot_data = {
            "time": slot.time.strftime("%H:%M:%S"),
            "max_party_size": slot.max_party_size,
            "available": slot.available
        }
        available_slots.append(slot_data)
    
    return {
        "restaurant_name": restaurant.name,
        "date": visit_date,
        "party_size": party_size,
        "available_slots": available_slots
    }
