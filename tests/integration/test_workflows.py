"""
Integration tests for complete booking workflows.
"""

import pytest
from datetime import datetime, date, time

from tests.factories import UserFactory, RestaurantFactory


@pytest.mark.integration
class TestErrorHandlingWorkflows:
    """Test error handling in booking workflows."""
    
    def test_booking_with_expired_token(self, client, db_session, sample_booking_data):
        """Test booking with expired authentication token."""
        
        restaurant = RestaurantFactory.build(name="TestRestaurant")
        db_session.add(restaurant)
        db_session.commit()
        
        # Use invalid/expired token
        invalid_headers = {"Authorization": "Bearer invalid_token_here"}
        
        response = client.post(
            f"/api/ConsumerApi/v1/Restaurant/{restaurant.name}/BookingWithStripeToken",
            data=sample_booking_data,
            headers=invalid_headers
        )
        
        assert response.status_code == 401
