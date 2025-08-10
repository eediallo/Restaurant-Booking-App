from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from typing import List, Optional
from datetime import datetime, date
import logging

from ..database import get_db
from ..models import RestaurantReview, User, Booking, Restaurant
from .user import get_current_user
from pydantic import BaseModel

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/reviews", tags=["reviews"])

# Pydantic models for request/response
class ReviewCreate(BaseModel):
    booking_reference: str
    rating: int
    title: str
    review_text: str
    food_rating: Optional[int] = None
    service_rating: Optional[int] = None
    ambiance_rating: Optional[int] = None
    value_rating: Optional[int] = None
    would_recommend: bool = True

    class Config:
        from_attributes = True

class ReviewResponse(BaseModel):
    id: int
    booking_reference: str
    rating: int
    title: str
    review_text: str
    food_rating: Optional[int]
    service_rating: Optional[int]
    ambiance_rating: Optional[int]
    value_rating: Optional[int]
    would_recommend: bool
    created_at: datetime
    user_name: str
    restaurant_name: str

    class Config:
        from_attributes = True

class ReviewSummary(BaseModel):
    restaurant_name: str
    total_reviews: int
    average_rating: float
    rating_distribution: dict
    recommendation_percentage: float

    class Config:
        from_attributes = True

@router.post("/", response_model=dict)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new review for a completed booking"""
    try:
        # Verify the booking exists and belongs to the current user
        booking = db.query(Booking).filter(
            Booking.booking_reference == review_data.booking_reference
        ).first()
        
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
        
        if booking.customer_name != current_user.full_name:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only review your own bookings"
            )
        
        # Check if booking is completed (past date)
        booking_datetime = datetime.combine(booking.visit_date, booking.visit_time)
        if booking_datetime > datetime.now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You can only review completed bookings"
            )
        
        # Check if review already exists
        existing_review = db.query(RestaurantReview).filter(
            RestaurantReview.booking_reference == review_data.booking_reference,
            RestaurantReview.user_id == current_user.id
        ).first()
        
        if existing_review:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already reviewed this booking"
            )
        
        # Get restaurant information
        restaurant = db.query(Restaurant).filter(
            Restaurant.name == booking.restaurant_name
        ).first()
        
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restaurant not found"
            )
        
        # Validate rating values
        if not (1 <= review_data.rating <= 5):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rating must be between 1 and 5"
            )
        
        # Create the review
        review = RestaurantReview(
            user_id=current_user.id,
            restaurant_id=restaurant.id,
            booking_reference=review_data.booking_reference,
            rating=review_data.rating,
            title=review_data.title,
            review_text=review_data.review_text,
            food_rating=review_data.food_rating,
            service_rating=review_data.service_rating,
            ambiance_rating=review_data.ambiance_rating,
            value_rating=review_data.value_rating,
            would_recommend=review_data.would_recommend,
            created_at=datetime.utcnow()
        )
        
        db.add(review)
        db.commit()
        db.refresh(review)
        
        logger.info(f"Review created for booking {review_data.booking_reference} by user {current_user.id}")
        
        return {
            "message": "Review created successfully",
            "review_id": review.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating review: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create review"
        )

@router.get("/restaurant/{restaurant_name}", response_model=List[ReviewResponse])
async def get_restaurant_reviews(
    restaurant_name: str,
    limit: int = 20,
    offset: int = 0,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    min_rating: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get reviews for a specific restaurant"""
    try:
        # Get restaurant
        restaurant = db.query(Restaurant).filter(
            Restaurant.name == restaurant_name
        ).first()
        
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restaurant not found"
            )
        
        # Build query
        query = db.query(RestaurantReview, User).join(User).filter(
            RestaurantReview.restaurant_id == restaurant.id
        )
        
        # Apply filters
        if min_rating:
            query = query.filter(RestaurantReview.rating >= min_rating)
        
        # Apply sorting
        if sort_by == "rating":
            if sort_order == "desc":
                query = query.order_by(desc(RestaurantReview.rating))
            else:
                query = query.order_by(RestaurantReview.rating)
        else:  # default to created_at
            if sort_order == "desc":
                query = query.order_by(desc(RestaurantReview.created_at))
            else:
                query = query.order_by(RestaurantReview.created_at)
        
        # Apply pagination
        reviews_data = query.offset(offset).limit(limit).all()
        
        # Format response
        reviews = []
        for review, user in reviews_data:
            reviews.append(ReviewResponse(
                id=review.id,
                booking_reference=review.booking_reference,
                rating=review.rating,
                title=review.title,
                review_text=review.review_text,
                food_rating=review.food_rating,
                service_rating=review.service_rating,
                ambiance_rating=review.ambiance_rating,
                value_rating=review.value_rating,
                would_recommend=review.would_recommend,
                created_at=review.created_at,
                user_name=user.full_name,
                restaurant_name=restaurant_name
            ))
        
        return reviews
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching restaurant reviews: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch reviews"
        )

@router.get("/restaurant/{restaurant_name}/summary", response_model=ReviewSummary)
async def get_restaurant_review_summary(
    restaurant_name: str,
    db: Session = Depends(get_db)
):
    """Get review summary statistics for a restaurant"""
    try:
        # Get restaurant
        restaurant = db.query(Restaurant).filter(
            Restaurant.name == restaurant_name
        ).first()
        
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restaurant not found"
            )
        
        # Get review statistics
        reviews = db.query(RestaurantReview).filter(RestaurantReview.restaurant_id == restaurant.id).all()
        
        if not reviews:
            return ReviewSummary(
                restaurant_name=restaurant_name,
                total_reviews=0,
                average_rating=0.0,
                rating_distribution={},
                recommendation_percentage=0.0
            )
        
        # Calculate statistics
        total_reviews = len(reviews)
        average_rating = sum(review.rating for review in reviews) / total_reviews
        
        # Rating distribution
        rating_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        recommendation_count = 0
        
        for review in reviews:
            rating_counts[review.rating] += 1
            if review.would_recommend:
                recommendation_count += 1
        
        rating_distribution = {
            str(rating): count for rating, count in rating_counts.items()
        }
        
        recommendation_percentage = (recommendation_count / total_reviews) * 100
        
        return ReviewSummary(
            restaurant_name=restaurant_name,
            total_reviews=total_reviews,
            average_rating=round(average_rating, 1),
            rating_distribution=rating_distribution,
            recommendation_percentage=round(recommendation_percentage, 1)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching restaurant review summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch review summary"
        )

@router.get("/user", response_model=List[ReviewResponse])
async def get_user_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all reviews by the current user"""
    try:
        reviews_data = db.query(RestaurantReview, Restaurant).join(Restaurant).filter(
            RestaurantReview.user_id == current_user.id
        ).order_by(desc(RestaurantReview.created_at)).all()
        
        reviews = []
        for review, restaurant in reviews_data:
            reviews.append(ReviewResponse(
                id=review.id,
                booking_reference=review.booking_reference,
                rating=review.rating,
                title=review.title,
                review_text=review.review_text,
                food_rating=review.food_rating,
                service_rating=review.service_rating,
                ambiance_rating=review.ambiance_rating,
                value_rating=review.value_rating,
                would_recommend=review.would_recommend,
                created_at=review.created_at,
                user_name=current_user.full_name,
                restaurant_name=restaurant.name
            ))
        
        return reviews
        
    except Exception as e:
        logger.error(f"Error fetching user reviews: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user reviews"
        )

@router.get("/booking/{booking_reference}", response_model=Optional[ReviewResponse])
async def get_booking_review(
    booking_reference: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get review for a specific booking by the current user"""
    try:
        review_data = db.query(RestaurantReview, Restaurant).join(Restaurant).filter(
            RestaurantReview.booking_reference == booking_reference,
            RestaurantReview.user_id == current_user.id
        ).first()
        
        if not review_data:
            return None
        
        review, restaurant = review_data
        
        return ReviewResponse(
            id=review.id,
            booking_reference=review.booking_reference,
            rating=review.rating,
            title=review.title,
            review_text=review.review_text,
            food_rating=review.food_rating,
            service_rating=review.service_rating,
            ambiance_rating=review.ambiance_rating,
            value_rating=review.value_rating,
            would_recommend=review.would_recommend,
            created_at=review.created_at,
            user_name=current_user.full_name,
            restaurant_name=restaurant.name
        )
        
    except Exception as e:
        logger.error(f"Error fetching booking review: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch booking review"
        )
