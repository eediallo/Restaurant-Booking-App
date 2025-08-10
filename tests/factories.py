"""
Factory classes for generating test data using factory-boy.
"""

import factory
from datetime import datetime, date, time
from factory.alchemy import SQLAlchemyModelFactory
from app.models import User, Restaurant, Booking, Customer, RestaurantReview
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserFactory(SQLAlchemyModelFactory):
    """Factory for creating test users."""
    
    class Meta:
        model = User
        sqlalchemy_session_persistence = "commit"
    
    username = factory.Sequence(lambda n: f"testuser{n}")
    email = factory.LazyAttribute(lambda obj: f"{obj.username}@example.com")
    password_hash = factory.LazyFunction(lambda: pwd_context.hash("testpassword123"))
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    phone = factory.Faker("phone_number")
    date_of_birth = factory.Faker("date_of_birth", minimum_age=18, maximum_age=80)
    accessibility_needs = factory.Faker("text", max_nb_chars=200)
    is_active = True
    created_at = factory.LazyFunction(datetime.utcnow)
    updated_at = factory.LazyFunction(datetime.utcnow)


class RestaurantFactory(SQLAlchemyModelFactory):
    """Factory for creating test restaurants."""
    
    class Meta:
        model = Restaurant
        sqlalchemy_session_persistence = "commit"
    
    name = factory.Faker("company")
    microsite_name = factory.LazyAttribute(lambda obj: obj.name.replace(" ", ""))
    description = factory.Faker("text", max_nb_chars=500)
    cuisine_type = factory.Faker("random_element", elements=("Italian", "French", "Asian", "American", "Mexican"))
    location = factory.Faker("city")
    address = factory.Faker("address")
    phone = factory.Faker("phone_number")
    website = factory.Faker("url")
    email = factory.Faker("email")
    price_range = factory.Faker("random_element", elements=("$", "$$", "$$$", "$$$$"))
    max_party_size = factory.Faker("random_int", min=2, max=12)
    accepts_reservations = True
    is_active = True
    created_at = factory.LazyFunction(datetime.utcnow)
    updated_at = factory.LazyFunction(datetime.utcnow)


class CustomerFactory(SQLAlchemyModelFactory):
    """Factory for creating test customers."""
    
    class Meta:
        model = Customer
        sqlalchemy_session_persistence = "commit"
    
    user_id = None  # Can be overridden in tests
    title = factory.Faker("random_element", elements=("Mr", "Mrs", "Ms", "Dr"))
    first_name = factory.Faker("first_name")
    surname = factory.Faker("last_name")
    mobile_country_code = "+1"
    mobile = factory.Faker("phone_number")
    email = factory.Faker("email")
    receive_email_marketing = factory.Faker("boolean")
    receive_sms_marketing = factory.Faker("boolean")
    created_at = factory.LazyFunction(datetime.utcnow)


class BookingFactory(SQLAlchemyModelFactory):
    """Factory for creating test bookings."""
    
    class Meta:
        model = Booking
        sqlalchemy_session_persistence = "commit"
    
    booking_reference = factory.Faker("random_element", elements=("XB123KM", "YZ456NP", "AB789QR", "CD012ST"))
    restaurant_id = 1  # Will be overridden in tests
    customer_id = 1    # Will be overridden in tests  
    user_id = 1        # Will be overridden in tests
    visit_date = factory.Faker("date_between", start_date="+1d", end_date="+30d")
    visit_time = factory.Faker("time_object")
    party_size = factory.Faker("random_int", min=1, max=8)
    channel_code = "ONLINE"
    special_requests = factory.Faker("text", max_nb_chars=200)
    is_leave_time_confirmed = True
    status = "confirmed"
    created_at = factory.LazyFunction(datetime.utcnow)
    updated_at = factory.LazyFunction(datetime.utcnow)


class RestaurantReviewFactory(SQLAlchemyModelFactory):
    """Factory for creating test restaurant reviews."""
    
    class Meta:
        model = RestaurantReview
        sqlalchemy_session_persistence = "commit"
    
    restaurant_id = 1  # Will be overridden in tests
    user_id = 1        # Will be overridden in tests
    booking_id = 1     # Will be overridden in tests
    rating = factory.Faker("random_int", min=1, max=5)
    title = factory.Faker("sentence", nb_words=6)
    review_text = factory.Faker("text", max_nb_chars=500)
    food_rating = factory.Faker("random_int", min=1, max=5)
    service_rating = factory.Faker("random_int", min=1, max=5)
    ambiance_rating = factory.Faker("random_int", min=1, max=5)
    value_rating = factory.Faker("random_int", min=1, max=5)
    would_recommend = factory.Faker("boolean")
    booking_reference = factory.Faker("random_element", elements=("XB123KM", "YZ456NP", "AB789QR"))
    is_verified = True
    is_published = True
    created_at = factory.LazyFunction(datetime.utcnow)
    updated_at = factory.LazyFunction(datetime.utcnow)
