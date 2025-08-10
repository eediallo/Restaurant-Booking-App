"""
Unit tests for database models.
"""

import pytest
from datetime import datetime, date
from sqlalchemy.exc import IntegrityError

from app.models import User, Restaurant, Booking, Customer, RestaurantReview
from tests.factories import UserFactory, RestaurantFactory, BookingFactory, CustomerFactory


@pytest.mark.unit
class TestUserModel:
    """Test cases for User model."""
    
    def test_user_creation(self, db_session):
        """Test user creation with valid data."""
        user = UserFactory.build()
        db_session.add(user)
        db_session.commit()
        
        assert user.id is not None
        assert user.username is not None
        assert user.email is not None
        assert user.password_hash is not None
        assert user.is_active is True
        assert user.created_at is not None
    
    def test_user_full_name_property(self, db_session):
        """Test user full_name property."""
        user = UserFactory.build(first_name="John", last_name="Doe")
        db_session.add(user)
        db_session.commit()
        
        assert user.full_name == "John Doe"
    
    def test_user_full_name_with_missing_names(self, db_session):
        """Test full_name property with missing first or last name."""
        user = UserFactory.build(first_name="John", last_name=None)
        db_session.add(user)
        db_session.commit()
        
        assert user.full_name == "John"
        
        user2 = UserFactory.build(first_name=None, last_name="Doe")
        db_session.add(user2)
        db_session.commit()
        
        assert user2.full_name == "Doe"
    
    def test_user_full_name_fallback_to_username(self, db_session):
        """Test full_name falls back to username when names are missing."""
        user = UserFactory.build(first_name=None, last_name=None, username="testuser")
        db_session.add(user)
        db_session.commit()
        
        assert user.full_name == "testuser"
    
    def test_unique_username_constraint(self, db_session):
        """Test that usernames must be unique."""
        user1 = UserFactory.build(username="duplicate")
        user2 = UserFactory.build(username="duplicate")
        
        db_session.add(user1)
        db_session.commit()
        
        db_session.add(user2)
        with pytest.raises(IntegrityError):
            db_session.commit()
    
    def test_unique_email_constraint(self, db_session):
        """Test that emails must be unique."""
        user1 = UserFactory.build(email="test@example.com")
        user2 = UserFactory.build(email="test@example.com")
        
        db_session.add(user1)
        db_session.commit()
        
        db_session.add(user2)
        with pytest.raises(IntegrityError):
            db_session.commit()


@pytest.mark.unit
class TestRestaurantModel:
    """Test cases for Restaurant model."""
    
    def test_restaurant_creation(self, db_session):
        """Test restaurant creation with valid data."""
        restaurant = RestaurantFactory.build()
        db_session.add(restaurant)
        db_session.commit()
        
        assert restaurant.id is not None
        assert restaurant.name is not None
        assert restaurant.microsite_name is not None
        assert restaurant.is_active is True
        assert restaurant.accepts_reservations is True
    
    def test_restaurant_slug_property(self, db_session):
        """Test restaurant slug property."""
        restaurant = RestaurantFactory.build(name="The Hungry Unicorn")
        db_session.add(restaurant)
        db_session.commit()
        
        assert restaurant.slug == "TheHungryUnicorn"
    
    def test_unique_name_constraint(self, db_session):
        """Test that restaurant names must be unique."""
        restaurant1 = RestaurantFactory.build(name="Duplicate Name")
        restaurant2 = RestaurantFactory.build(name="Duplicate Name")
        
        db_session.add(restaurant1)
        db_session.commit()
        
        db_session.add(restaurant2)
        with pytest.raises(IntegrityError):
            db_session.commit()


@pytest.mark.unit
class TestBookingModel:
    """Test cases for Booking model."""
    
    def test_booking_creation(self, db_session):
        """Test booking creation with valid data."""
        user = UserFactory.build()
        restaurant = RestaurantFactory.build()
        customer = CustomerFactory.build()
        
        db_session.add_all([user, restaurant, customer])
        db_session.commit()
        
        booking = BookingFactory.build(
            user_id=user.id,
            restaurant_id=restaurant.id,
            customer_id=customer.id
        )
        db_session.add(booking)
        db_session.commit()
        
        assert booking.id is not None
        assert booking.booking_reference is not None
        assert booking.user_id == user.id
        assert booking.restaurant_id == restaurant.id
        assert booking.customer_id == customer.id
        assert booking.status == "confirmed"
    
    def test_booking_relationships(self, db_session):
        """Test booking model relationships."""
        user = UserFactory.build()
        restaurant = RestaurantFactory.build()
        customer = CustomerFactory.build()
        
        db_session.add_all([user, restaurant, customer])
        db_session.commit()
        
        booking = BookingFactory.build(
            user_id=user.id,
            restaurant_id=restaurant.id,
            customer_id=customer.id
        )
        db_session.add(booking)
        db_session.commit()
        
        # Test relationships
        assert booking.user == user
        assert booking.restaurant == restaurant
        assert booking.customer == customer
        assert booking in user.bookings
        assert booking in restaurant.bookings
    
    def test_unique_booking_reference(self, db_session):
        """Test that booking references must be unique."""
        user = UserFactory.build()
        restaurant = RestaurantFactory.build()
        customer = CustomerFactory.build()
        
        db_session.add_all([user, restaurant, customer])
        db_session.commit()
        
        booking1 = BookingFactory.build(
            booking_reference="DUPLICATE123",
            user_id=user.id,
            restaurant_id=restaurant.id,
            customer_id=customer.id
        )
        booking2 = BookingFactory.build(
            booking_reference="DUPLICATE123",
            user_id=user.id,
            restaurant_id=restaurant.id,
            customer_id=customer.id
        )
        
        db_session.add(booking1)
        db_session.commit()
        
        db_session.add(booking2)
        with pytest.raises(IntegrityError):
            db_session.commit()


@pytest.mark.unit
class TestRestaurantReviewModel:
    """Test cases for RestaurantReview model."""
    
    def test_review_creation(self, db_session):
        """Test review creation with valid data."""
        user = UserFactory.build()
        restaurant = RestaurantFactory.build()
        customer = CustomerFactory.build()
        
        db_session.add_all([user, restaurant, customer])
        db_session.commit()
        
        booking = BookingFactory.build(
            user_id=user.id,
            restaurant_id=restaurant.id,
            customer_id=customer.id
        )
        db_session.add(booking)
        db_session.commit()
        
        review = RestaurantReview(
            user_id=user.id,
            restaurant_id=restaurant.id,
            booking_id=booking.id,
            rating=5,
            title="Great experience!",
            review_text="Amazing food and service",
            food_rating=5,
            service_rating=5,
            ambiance_rating=4,
            value_rating=4,
            would_recommend=True,
            booking_reference=booking.booking_reference,
            created_at=datetime.utcnow()
        )
        
        db_session.add(review)
        db_session.commit()
        
        assert review.id is not None
        assert review.rating == 5
        assert review.title == "Great experience!"
        assert review.would_recommend is True
        assert review.is_published is True
    
    def test_review_relationships(self, db_session):
        """Test review model relationships."""
        user = UserFactory()
        restaurant = RestaurantFactory()
        customer = CustomerFactory()
        booking = BookingFactory(
            user_id=user.id,
            restaurant_id=restaurant.id,
            customer_id=customer.id
        )
        
        db_session.add_all([user, restaurant, customer, booking])
        db_session.commit()
        
        review = RestaurantReview(
            user_id=user.id,
            restaurant_id=restaurant.id,
            booking_id=booking.id,
            rating=5,
            title="Great experience!",
            review_text="Amazing food and service",
            food_rating=5,
            service_rating=5,
            ambiance_rating=4,
            value_rating=4,
            would_recommend=True,
            booking_reference=booking.booking_reference,
            created_at=datetime.utcnow()
        )
        
        db_session.add(review)
        db_session.commit()
        
        assert review.id is not None
        assert review.rating == 5
        assert review.title == "Great experience!"
        assert review.would_recommend is True
        assert review.is_published is True

    def test_review_relationships(self, db_session):
        """Test review model relationships."""
        user = UserFactory.build()
        restaurant = RestaurantFactory.build()
        customer = CustomerFactory.build()
        
        db_session.add_all([user, restaurant, customer])
        db_session.commit()
        
        booking = BookingFactory.build(
            user_id=user.id,
            restaurant_id=restaurant.id,
            customer_id=customer.id
        )
        db_session.add(booking)
        db_session.commit()
        
        review = RestaurantReview(
            user_id=user.id,
            restaurant_id=restaurant.id,
            booking_id=booking.id,
            rating=5,
            title="Great experience!",
            review_text="Amazing food and service",
            booking_reference=booking.booking_reference,
            created_at=datetime.utcnow()
        )
        
        db_session.add(review)
        db_session.commit()
        
        # Test relationships
        assert review.user == user
        assert review.restaurant == restaurant
        assert review.booking == booking
        assert review in user.reviews
        assert review in restaurant.reviews
        
        db_session.add(review)
        db_session.commit()
        
        # Test relationships
        assert review.user == user
        assert review.restaurant == restaurant
        assert review.booking == booking
        assert review in user.reviews
        assert review in restaurant.reviews
