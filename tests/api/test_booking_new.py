"""
API tests for booking endpoints.
"""

import pytest
from datetime import date, timedelta

from tests.factories import UserFactory, RestaurantFactory, BookingFactory


@pytest.mark.api
class TestBookingAPI:
    """Test cases for booking API endpoints."""
    
    def test_search_availability_invalid_restaurant(self, client):
        """Test availability search for non-existent restaurant."""
        search_params = {
            "date": "2025-08-15",
            "time": "19:00",
            "party_size": "2"
        }
        
        response = client.get(
            "/api/ConsumerApi/v1/Restaurant/NonExistentRestaurant/AvailableTimeSlots",
            params=search_params
        )
        
        assert response.status_code == 404
