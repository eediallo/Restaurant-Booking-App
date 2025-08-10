import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./ReviewForm.css";

const ReviewForm = () => {
  const { bookingReference } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: "",
    reviewText: "",
    foodRating: 5,
    serviceRating: 5,
    ambianceRating: 5,
    valueRating: 5,
    wouldRecommend: true,
  });

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        // Get user's bookings to find the restaurant name
        const userBookingsResponse = await api.get("/api/user/bookings");
        const userBooking = userBookingsResponse.data.find(
          (b) => b.booking_reference === bookingReference
        );

        if (userBooking) {
          const restaurantName = userBooking.restaurant_name;
          const response = await api.get(
            `/api/ConsumerApi/v1/Restaurant/${restaurantName}/Booking/${bookingReference}`
          );
          setBooking({
            ...response.data,
            restaurant_name: restaurantName,
          });
        } else {
          setError("Booking not found");
        }
      } catch (err) {
        setError("Failed to load booking details");
        console.error("Error fetching booking:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingReference]);

  const handleInputChange = (field, value) => {
    setReviewData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRatingChange = (field, rating) => {
    setReviewData((prev) => ({
      ...prev,
      [field]: rating,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const reviewPayload = {
        booking_reference: bookingReference,
        rating: reviewData.rating,
        title: reviewData.title,
        review_text: reviewData.reviewText,
        food_rating: reviewData.foodRating,
        service_rating: reviewData.serviceRating,
        ambiance_rating: reviewData.ambianceRating,
        value_rating: reviewData.valueRating,
        would_recommend: reviewData.wouldRecommend,
      };

      await api.post("/api/reviews", reviewPayload);

      setSuccess("Review submitted successfully! Thank you for your feedback.");

      // Redirect to booking details after a delay
      setTimeout(() => {
        navigate(`/booking/${bookingReference}`);
      }, 2000);
    } catch (err) {
      setError("Failed to submit review. Please try again.");
      console.error("Error submitting review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarRating = (currentRating, onRatingChange, label) => {
    return (
      <div className="star-rating-input">
        <label>{label}</label>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star ${star <= currentRating ? "filled" : ""}`}
              onClick={() => onRatingChange(star)}
            >
              ★
            </button>
          ))}
        </div>
        <span className="rating-text">
          {currentRating} star{currentRating !== 1 ? "s" : ""}
        </span>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="review-form">
        <div className="loading">Loading booking details...</div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="review-form">
        <div className="error-message">{error}</div>
        <button
          className="action-btn secondary"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="review-form">
      <div className="review-header">
        <button
          className="back-btn"
          onClick={() => navigate(`/booking/${bookingReference}`)}
        >
          ← Back to Booking Details
        </button>
        <h1>Write a Review</h1>
        <p>Share your experience at {booking?.restaurant_name}</p>
      </div>

      {/* Booking Summary */}
      <div className="booking-summary">
        <h3>Your Visit</h3>
        <div className="summary-details">
          <div className="detail-item">
            <span className="label">Restaurant:</span>
            <span className="value">{booking?.restaurant_name}</span>
          </div>
          <div className="detail-item">
            <span className="label">Date:</span>
            <span className="value">{formatDate(booking?.visit_date)}</span>
          </div>
          <div className="detail-item">
            <span className="label">Time:</span>
            <span className="value">{formatTime(booking?.visit_time)}</span>
          </div>
          <div className="detail-item">
            <span className="label">Party Size:</span>
            <span className="value">{booking?.party_size} guests</span>
          </div>
          <div className="detail-item">
            <span className="label">Reference:</span>
            <span className="value">{booking?.booking_reference}</span>
          </div>
        </div>
      </div>

      {success && <div className="success-message">{success}</div>}

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="review-form-content">
        {/* Overall Rating */}
        <div className="form-section">
          <h3>Overall Rating</h3>
          {renderStarRating(
            reviewData.rating,
            (rating) => handleRatingChange("rating", rating),
            "How would you rate your overall experience?"
          )}
        </div>

        {/* Review Title */}
        <div className="form-section">
          <h3>Review Title</h3>
          <input
            type="text"
            placeholder="Summarize your experience..."
            value={reviewData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            maxLength={100}
            required
          />
          <small>{reviewData.title.length}/100 characters</small>
        </div>

        {/* Review Text */}
        <div className="form-section">
          <h3>Your Review</h3>
          <textarea
            placeholder="Tell us about your experience! What did you enjoy? What could be improved?"
            value={reviewData.reviewText}
            onChange={(e) => handleInputChange("reviewText", e.target.value)}
            rows={6}
            maxLength={1000}
            required
          />
          <small>{reviewData.reviewText.length}/1000 characters</small>
        </div>

        {/* Category Ratings */}
        <div className="form-section">
          <h3>Rate by Category</h3>
          <div className="category-ratings">
            {renderStarRating(
              reviewData.foodRating,
              (rating) => handleRatingChange("foodRating", rating),
              "Food Quality"
            )}
            {renderStarRating(
              reviewData.serviceRating,
              (rating) => handleRatingChange("serviceRating", rating),
              "Service"
            )}
            {renderStarRating(
              reviewData.ambianceRating,
              (rating) => handleRatingChange("ambianceRating", rating),
              "Ambiance"
            )}
            {renderStarRating(
              reviewData.valueRating,
              (rating) => handleRatingChange("valueRating", rating),
              "Value for Money"
            )}
          </div>
        </div>

        {/* Recommendation */}
        <div className="form-section">
          <h3>Would you recommend this restaurant?</h3>
          <div className="recommendation-options">
            <label className="radio-option">
              <input
                type="radio"
                name="recommendation"
                checked={reviewData.wouldRecommend === true}
                onChange={() => handleInputChange("wouldRecommend", true)}
              />
              <span>Yes, I would recommend it</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="recommendation"
                checked={reviewData.wouldRecommend === false}
                onChange={() => handleInputChange("wouldRecommend", false)}
              />
              <span>No, I would not recommend it</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            className="action-btn secondary"
            onClick={() => navigate(`/booking/${bookingReference}`)}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="action-btn primary"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
