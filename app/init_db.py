"""
Database Initialization Module.

This module handles database table creation and population with sample data
for the restaurant booking mock API. It sets up realistic test data including
restaurants, availability slots, and cancellation reasons.

"""

import random
from datetime import time, datetime, timedelta

from app.database import engine, SessionLocal
from app.models import Base, Restaurant, AvailabilitySlot, CancellationReason, RestaurantReview


def create_tables() -> None:
    """
    Create all database tables based on SQLAlchemy models.

    This function creates the database schema by calling SQLAlchemy's
    metadata.create_all() method.
    """
    Base.metadata.create_all(bind=engine)


def init_sample_data() -> None:
    """
    Initialize database with sample data for testing Phase 3B multi-restaurant features.

    Creates multiple restaurants with different cuisines, locations, and features.
    This function is idempotent - it will skip initialization if data already exists.

    Sample data includes:
    - 5 diverse restaurants with different cuisines and features
    - 365 days of availability slots for each restaurant (1 year)
    - 5 predefined cancellation reasons
    - Sample reviews for restaurants

    Raises:
        Exception: If database operations fail (logged and rolled back)
    """
    db = SessionLocal()

    try:
        # Check if data already exists
        if db.query(Restaurant).first():
            print("Sample data already exists, skipping initialization")
            return

        # Create diverse sample restaurants for Phase 3B
        restaurants_data = [
            {
                "name": "TheHungryUnicorn",
                "microsite_name": "TheHungryUnicorn",
                "description": "A magical dining experience with contemporary European cuisine in an enchanting atmosphere.",
                "cuisine_type": "European",
                "location": "Downtown",
                "address": "123 Magic Lane, Downtown District",
                "phone": "+1 (555) 123-4567",
                "email": "reservations@thehungryunicorn.com",
                "website": "https://thehungryunicorn.com",
                "price_range": "$$$",
                "features": '["Outdoor Seating", "Wine Bar", "Private Dining", "Valet Parking"]',
                "dietary_options": '["Vegetarian", "Vegan", "Gluten-Free"]',
                "average_rating": 4,
                "total_reviews": 127,
                "opening_hours": '{"monday": "17:00-22:00", "tuesday": "17:00-22:00", "wednesday": "17:00-22:00", "thursday": "17:00-22:00", "friday": "17:00-23:00", "saturday": "12:00-23:00", "sunday": "12:00-21:00"}',
                "max_party_size": 8
            },
            {
                "name": "Bella Vista Italian",
                "microsite_name": "BellaVistaItalian",
                "description": "Authentic Italian cuisine with handmade pasta and wood-fired pizzas in a cozy trattoria setting.",
                "cuisine_type": "Italian",
                "location": "Little Italy",
                "address": "456 Pasta Street, Little Italy",
                "phone": "+1 (555) 234-5678",
                "email": "ciao@bellavista.com",
                "website": "https://bellavistaitalian.com",
                "price_range": "$$",
                "features": '["Wood-Fired Pizza", "Wine Cellar", "Family-Friendly", "Takeout"]',
                "dietary_options": '["Vegetarian", "Gluten-Free Options"]',
                "average_rating": 5,
                "total_reviews": 89,
                "opening_hours": '{"monday": "11:30-21:00", "tuesday": "11:30-21:00", "wednesday": "11:30-21:00", "thursday": "11:30-21:00", "friday": "11:30-22:00", "saturday": "11:30-22:00", "sunday": "12:00-20:00"}',
                "max_party_size": 10
            },
            {
                "name": "Sakura Sushi Bar",
                "microsite_name": "SakuraSushiBar",
                "description": "Fresh sushi and Japanese cuisine with a modern twist, featuring omakase and sake pairings.",
                "cuisine_type": "Japanese",
                "location": "Arts District",
                "address": "789 Sushi Way, Arts District",
                "phone": "+1 (555) 345-6789",
                "email": "konnichiwa@sakurasushi.com",
                "website": "https://sakurasushi.com",
                "price_range": "$$$$",
                "features": '["Sushi Bar", "Sake Selection", "Omakase", "Modern Decor"]',
                "dietary_options": '["Gluten-Free", "Raw Options"]',
                "average_rating": 5,
                "total_reviews": 156,
                "opening_hours": '{"monday": "closed", "tuesday": "17:30-22:00", "wednesday": "17:30-22:00", "thursday": "17:30-22:00", "friday": "17:30-23:00", "saturday": "17:30-23:00", "sunday": "17:30-21:00"}',
                "max_party_size": 6
            },
            {
                "name": "Green Garden Cafe",
                "microsite_name": "GreenGardenCafe",
                "description": "Farm-to-table restaurant focusing on organic, locally-sourced ingredients with extensive vegan options.",
                "cuisine_type": "Healthy/Organic",
                "location": "Riverside",
                "address": "321 Garden Path, Riverside",
                "phone": "+1 (555) 456-7890",
                "email": "hello@greengarden.com",
                "website": "https://greengardencafe.com",
                "price_range": "$$",
                "features": '["Organic", "Garden Seating", "Farm-to-Table", "Brunch"]',
                "dietary_options": '["Vegan", "Vegetarian", "Gluten-Free", "Organic", "Raw"]',
                "average_rating": 4,
                "total_reviews": 73,
                "opening_hours": '{"monday": "08:00-15:00", "tuesday": "08:00-15:00", "wednesday": "08:00-15:00", "thursday": "08:00-15:00", "friday": "08:00-21:00", "saturday": "08:00-21:00", "sunday": "08:00-15:00"}',
                "max_party_size": 8
            },
            {
                "name": "Spice Route Indian",
                "microsite_name": "SpiceRouteIndian",
                "description": "Traditional Indian cuisine with regional specialties, tandoor cooking, and an extensive spice selection.",
                "cuisine_type": "Indian",
                "location": "Spice Quarter",
                "address": "654 Curry Lane, Spice Quarter",
                "phone": "+1 (555) 567-8901",
                "email": "namaste@spiceroute.com",
                "website": "https://spicerouteindian.com",
                "price_range": "$$",
                "features": '["Tandoor Oven", "Buffet Lunch", "Live Music", "Catering"]',
                "dietary_options": '["Vegetarian", "Vegan", "Halal", "Gluten-Free Options"]',
                "average_rating": 4,
                "total_reviews": 92,
                "opening_hours": '{"monday": "11:30-14:30,17:00-22:00", "tuesday": "11:30-14:30,17:00-22:00", "wednesday": "11:30-14:30,17:00-22:00", "thursday": "11:30-14:30,17:00-22:00", "friday": "11:30-14:30,17:00-22:30", "saturday": "11:30-22:30", "sunday": "11:30-21:00"}',
                "max_party_size": 12
            }
        ]

        # Create restaurants
        created_restaurants = []
        for restaurant_data in restaurants_data:
            restaurant = Restaurant(**restaurant_data)
            db.add(restaurant)
            db.commit()
            db.refresh(restaurant)
            created_restaurants.append(restaurant)
            print(f"Created restaurant: {restaurant.name}")

        # Create sample availability slots for each restaurant (next 30 days)
        for restaurant in created_restaurants:
            # Different time slots based on restaurant type
            if restaurant.cuisine_type == "Japanese":
                sample_times = [time(17, 30), time(18, 0), time(18, 30), time(19, 0), time(19, 30), time(20, 0), time(20, 30), time(21, 0)]
            elif restaurant.cuisine_type == "Healthy/Organic":
                sample_times = [time(8, 0), time(9, 0), time(10, 0), time(11, 0), time(12, 0), time(13, 0), time(14, 0), time(18, 0), time(19, 0), time(20, 0)]
            else:
                sample_times = [time(12, 0), time(12, 30), time(13, 0), time(13, 30), time(19, 0), time(19, 30), time(20, 0), time(20, 30)]

            start_date = datetime.now().date()
            for i in range(365):  # Next 365 days (1 year)
                current_date = start_date + timedelta(days=i)
                for slot_time in sample_times:
                    # Randomly make some slots unavailable (higher availability for new restaurants)
                    available = random.random() > 0.15  # 85% availability

                    slot = AvailabilitySlot(
                        restaurant_id=restaurant.id,
                        date=current_date,
                        time=slot_time,
                        max_party_size=restaurant.max_party_size,
                        available=available
                    )
                    db.add(slot)

        # Create sample cancellation reasons
        cancellation_reasons = [
            {
                "id": 1,
                "reason": "Customer Request",
                "description": "Customer requested cancellation"
            },
            {
                "id": 2,
                "reason": "Restaurant Closure",
                "description": "Restaurant temporarily closed"
            },
            {
                "id": 3,
                "reason": "Weather",
                "description": "Cancelled due to weather conditions"
            },
            {"id": 4, "reason": "Emergency", "description": "Emergency cancellation"},
            {"id": 5, "reason": "No Show", "description": "Customer did not show up"}
        ]

        for reason_data in cancellation_reasons:
            reason = CancellationReason(**reason_data)
            db.add(reason)

        db.commit()
        print("Database initialized with sample data successfully!")

    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Creating database tables...")
    create_tables()
    print("Initializing sample data...")
    init_sample_data()
    print("Database setup complete!")
