import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./RestaurantDetails.css";

const RestaurantDetails = () => {
  const { restaurantName } = useParams(); // Use restaurantName to match the route parameter
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRestaurantDetails = useCallback(async () => {
    try {
      setLoading(true);

      // Get restaurant details directly by name using the new API endpoint
      const response = await api.get(
        `/api/restaurants/name/${encodeURIComponent(restaurantName)}`
      );

      setRestaurant(response.data);
    } catch (err) {
      setError("Failed to load restaurant details");
      console.error("Error fetching restaurant details:", err);
    } finally {
      setLoading(false);
    }
  }, [restaurantName]);

  useEffect(() => {
    fetchRestaurantDetails();
  }, [fetchRestaurantDetails]);

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const formatOpeningHours = (openingHours) => {
    if (!openingHours || Object.keys(openingHours).length === 0) {
      return "Hours not available";
    }

    const daysOrder = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const dayNames = {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday",
    };

    return daysOrder.map((day) => ({
      day: dayNames[day],
      hours: openingHours[day] || "Closed",
    }));
  };

  const handleBookTable = () => {
    navigate(`/availability/${restaurant.name}`, {
      state: { restaurant },
    });
  };

  if (loading) {
    return (
      <div className="restaurant-details">
        <div className="loading">Loading restaurant details...</div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="restaurant-details">
        <div className="error-message">{error || "Restaurant not found"}</div>
        <button
          className="action-btn secondary"
          onClick={() => navigate("/restaurants")}
        >
          Back to Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="restaurant-details">
      <div className="restaurant-hero">
        <button className="back-btn" onClick={() => navigate("/restaurants")}>
          ← Back to Restaurants
        </button>

        <div className="hero-content">
          <div className="restaurant-header">
            <h1>{restaurant.name}</h1>
            <div className="restaurant-rating">
              <span className="stars">
                {renderStars(restaurant.average_rating)}
              </span>
              <span className="rating-text">
                {restaurant.average_rating}/5 ({restaurant.total_reviews}{" "}
                reviews)
              </span>
            </div>
          </div>

          <div className="restaurant-meta">
            <span className="cuisine">{restaurant.cuisine_type}</span>
            <span className="separator">•</span>
            <span className="location">{restaurant.location}</span>
            <span className="separator">•</span>
            <span className="price-range">{restaurant.price_range}</span>
          </div>

          <p className="restaurant-description">{restaurant.description}</p>

          <div className="primary-actions">
            <button
              className="action-btn primary large"
              onClick={handleBookTable}
            >
              Book a Table
            </button>
            <button
              className="action-btn secondary large"
              onClick={() => window.open(`tel:${restaurant.phone}`, "_self")}
            >
              Call Restaurant
            </button>
          </div>
        </div>
      </div>

      <div className="restaurant-content">
        <div className="content-grid">
          {/* Restaurant Information */}
          <div className="info-section">
            <h2>Restaurant Information</h2>

            <div className="info-grid">
              <div className="info-item">
                <h4>Address</h4>
                <p>{restaurant.address}</p>
              </div>

              <div className="info-item">
                <h4>Phone</h4>
                <p>{restaurant.phone}</p>
              </div>

              {restaurant.website && (
                <div className="info-item">
                  <h4>Website</h4>
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Website
                  </a>
                </div>
              )}

              <div className="info-item">
                <h4>Maximum Party Size</h4>
                <p>{restaurant.max_party_size} guests</p>
              </div>
            </div>

            {/* Features */}
            {restaurant.features && restaurant.features.length > 0 && (
              <div className="features-section">
                <h4>Features & Amenities</h4>
                <div className="features-grid">
                  {restaurant.features.map((feature) => (
                    <span key={feature} className="feature-tag">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dietary Options */}
            {restaurant.dietary_options &&
              restaurant.dietary_options.length > 0 && (
                <div className="dietary-section">
                  <h4>Dietary Options</h4>
                  <div className="dietary-grid">
                    {restaurant.dietary_options.map((option) => (
                      <span key={option} className="dietary-tag">
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Opening Hours */}
          <div className="hours-section">
            <h2>Opening Hours</h2>
            <div className="hours-grid">
              {formatOpeningHours(restaurant.opening_hours).map(
                ({ day, hours }) => (
                  <div key={day} className="hours-item">
                    <span className="day">{day}</span>
                    <span className="hours">{hours}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {restaurant.recent_reviews && restaurant.recent_reviews.length > 0 && (
          <div className="reviews-section">
            <h2>Recent Reviews</h2>
            <div className="reviews-grid">
              {restaurant.recent_reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <span className="reviewer-name">{review.user_name}</span>
                      {review.is_verified && (
                        <span className="verified-badge">Verified</span>
                      )}
                    </div>
                    <div className="review-rating">
                      <span className="stars">
                        {renderStars(review.rating)}
                      </span>
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="review-title">{review.title}</h4>
                  )}

                  <p className="review-text">{review.review_text}</p>

                  {(review.food_rating ||
                    review.service_rating ||
                    review.ambiance_rating ||
                    review.value_rating) && (
                    <div className="detailed-ratings">
                      {review.food_rating && (
                        <div className="rating-item">
                          <span>Food: </span>
                          <span className="rating-stars">
                            {renderStars(review.food_rating)}
                          </span>
                        </div>
                      )}
                      {review.service_rating && (
                        <div className="rating-item">
                          <span>Service: </span>
                          <span className="rating-stars">
                            {renderStars(review.service_rating)}
                          </span>
                        </div>
                      )}
                      {review.ambiance_rating && (
                        <div className="rating-item">
                          <span>Ambiance: </span>
                          <span className="rating-stars">
                            {renderStars(review.ambiance_rating)}
                          </span>
                        </div>
                      )}
                      {review.value_rating && (
                        <div className="rating-item">
                          <span>Value: </span>
                          <span className="rating-stars">
                            {renderStars(review.value_rating)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="review-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="cta-section">
          <div className="cta-content">
            <h2>Ready to dine at {restaurant.name}?</h2>
            <p>Book your table now and enjoy an amazing dining experience!</p>
            <button
              className="action-btn primary large"
              onClick={handleBookTable}
            >
              Book a Table Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;
