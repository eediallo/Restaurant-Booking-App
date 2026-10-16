import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../services/api";
import Input from "../components/ui/Input";
import "./BookingForm.css";

const BookingForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [bookingData, setBookingData] = useState({
    visitDate: "",
    visitTime: "",
    partySize: 2,
    channelCode: "ONLINE",
    specialRequests: "",
    isLeaveTimeConfirmed: false,
    // Customer fields
    title: "",
    firstName: "",
    surname: "",
    mobile: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    let bookingDataSource = null;
    let sourceType = "";

    // First check if there's booking data from navigation state
    if (location.state?.bookingData && location.state?.fromAvailabilitySearch) {
      bookingDataSource = location.state.bookingData;
      sourceType = "navigation state";
    } else {
      // Fall back to localStorage
      const pendingBooking = localStorage.getItem("pendingBooking");

      if (pendingBooking) {
        try {
          bookingDataSource = JSON.parse(pendingBooking);
          sourceType = "localStorage";
        } catch {
          // Error parsing data, redirect to availability
          navigate("/availability");
          return;
        }
      }
    }

    if (bookingDataSource) {
      // Set both booking data and selected slot information
      setBookingData((prev) => ({
        ...prev,
        visitDate: bookingDataSource.visitDate || prev.visitDate,
        visitTime: bookingDataSource.visitTime || prev.visitTime,
        partySize: bookingDataSource.partySize || prev.partySize,
        channelCode: bookingDataSource.channelCode || prev.channelCode,
      }));

      if (bookingDataSource.selectedSlot) {
        setSelectedSlot(bookingDataSource.selectedSlot);
      }

      if (bookingDataSource.restaurant) {
        setRestaurant(bookingDataSource.restaurant);
      }

      // Clean up localStorage if we used it
      if (sourceType === "localStorage") {
        localStorage.removeItem("pendingBooking");
      }
    } else {
      // No restaurant context - redirect to availability search
      navigate("/availability");
    }
  }, [navigate, location.state]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      // Booking details
      formData.append("VisitDate", bookingData.visitDate);
      formData.append("VisitTime", bookingData.visitTime);
      formData.append("PartySize", bookingData.partySize);
      formData.append("ChannelCode", bookingData.channelCode);
      formData.append("SpecialRequests", bookingData.specialRequests);
      formData.append("IsLeaveTimeConfirmed", bookingData.isLeaveTimeConfirmed);

      // Customer details
      formData.append("Customer[Title]", bookingData.title);
      formData.append("Customer[FirstName]", bookingData.firstName);
      formData.append("Customer[Surname]", bookingData.surname);
      formData.append("Customer[Mobile]", bookingData.mobile);
      formData.append("Customer[Email]", bookingData.email);

      // Use restaurant name from the pending booking, fallback to default
      const restaurantName = restaurant?.name || "TheHungryUnicorn"; // Default to original restaurant if none selected

      const response = await api.post(
        `/api/ConsumerApi/v1/Restaurant/${restaurantName}/BookingWithStripeToken`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess(
        `Booking confirmed! Your reference number is: ${response.data.booking_reference}`
      );

      // Reset form
      setBookingData({
        visitDate: "",
        visitTime: "",
        partySize: 2,
        channelCode: "ONLINE",
        specialRequests: "",
        isLeaveTimeConfirmed: false,
        title: "",
        firstName: "",
        surname: "",
        mobile: "",
        email: user?.email || "",
      });

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to create booking. Please try again."
      );
      console.error("Error creating booking:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="booking-form">
      <div className="booking-header">
        <h1>Complete Your Booking</h1>
        <p>Book your table at {restaurant?.name || "our restaurant"}</p>
      </div>

      {success && (
        <div className="success-message">
          <h3>🎉 Booking Successful!</h3>
          <p>{success}</p>
          <p>Redirecting to your dashboard...</p>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="booking-form-container">
          {selectedSlot && (
            <div className="section selected-booking-summary">
              <h2>Selected Reservation</h2>
              <div className="booking-summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Date:</span>
                  <span className="summary-value">
                    {selectedSlot.formattedDate}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Time:</span>
                  <span className="summary-value">
                    {selectedSlot.formattedTime}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Party Size:</span>
                  <span className="summary-value">
                    {bookingData.partySize}{" "}
                    {bookingData.partySize === 1 ? "person" : "people"}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Restaurant:</span>
                  <span className="summary-value">
                    {restaurant?.name || "Restaurant"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="section">
            <h2>Reservation Details</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="visitDate">Visit Date *</label>
                <input
                  type="date"
                  id="visitDate"
                  name="visitDate"
                  value={bookingData.visitDate}
                  onChange={handleInputChange}
                  min={today}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="visitTime">Visit Time *</label>
                <input
                  type="time"
                  id="visitTime"
                  name="visitTime"
                  value={bookingData.visitTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="partySize">Party Size *</label>
                <select
                  id="partySize"
                  name="partySize"
                  value={bookingData.partySize}
                  onChange={handleInputChange}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                    <option key={size} value={size}>
                      {size} {size === 1 ? "person" : "people"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="specialRequests">Special Requests</label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={bookingData.specialRequests}
                onChange={handleInputChange}
                placeholder="Any dietary requirements, special occasions, or other requests..."
                rows="3"
              />
            </div>
          </div>

          <div className="section">
            <h2>Contact Information</h2>

            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Title"
                  type="text"
                  name="title"
                  value={bookingData.title}
                  onChange={handleInputChange}
                  placeholder="Mr/Mrs/Ms/Dr"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <Input
                  label="First Name *"
                  type="text"
                  name="firstName"
                  value={bookingData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <Input
                  label="Surname *"
                  type="text"
                  name="surname"
                  value={bookingData.surname}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Mobile Number *"
                  type="tel"
                  name="mobile"
                  value={bookingData.mobile}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <Input
                  label="Email Address *"
                  type="email"
                  name="email"
                  value={bookingData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isLeaveTimeConfirmed"
                name="isLeaveTimeConfirmed"
                checked={bookingData.isLeaveTimeConfirmed}
                onChange={handleInputChange}
              />
              <label htmlFor="isLeaveTimeConfirmed">
                I understand the restaurant's leave time policy
              </label>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating Booking..." : "Confirm Reservation"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookingForm;
