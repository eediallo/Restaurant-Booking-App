import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { api } from "../services/api";
import "./BookingSearch.css";

const BookingSearch = () => {
  const navigate = useNavigate();
  const [urlParams] = useSearchParams();
  const { restaurantName } = useParams(); // Get restaurant name from URL path
  const restaurantId = urlParams.get("restaurant");

  const [selectedRestaurant, setSelectedRestaurant] = useState(
    restaurantId || ""
  );
  const [restaurants, setRestaurants] = useState([]);
  const [searchParams, setSearchParams] = useState({
    visitDate: "",
    visitTime: "",
    partySize: 2,
    channelCode: "ONLINE",
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  // Load restaurants on component mount
  useEffect(() => {
    loadRestaurants();
  }, []);

  // Handle restaurant pre-selection from URL
  useEffect(() => {
    if (restaurantName && restaurants.length > 0) {
      // Find restaurant by name and select it
      const restaurant = restaurants.find((r) => r.name === restaurantName);
      if (restaurant) {
        setSelectedRestaurant(restaurant.id.toString());
      }
    }
  }, [restaurantName, restaurants]);

  const loadRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const response = await api.get("/api/restaurants/");
      setRestaurants(response.data.restaurants || []);
    } catch (err) {
      console.error("Error loading restaurants:", err);
      setError("Failed to load restaurants. Please try again.");
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!selectedRestaurant) {
      setError("Please select a restaurant first.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const formData = new FormData();
      formData.append("VisitDate", searchParams.visitDate);
      formData.append("PartySize", searchParams.partySize);
      formData.append("ChannelCode", searchParams.channelCode);

      // Find the selected restaurant to get its name
      const restaurant = restaurants.find(
        (r) => r.id.toString() === selectedRestaurant
      );
      const restaurantName = restaurant ? restaurant.name : selectedRestaurant;

      const response = await api.post(
        `/api/ConsumerApi/v1/Restaurant/${restaurantName}/AvailabilitySearch`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAvailableSlots(response.data.available_slots || []);
    } catch (err) {
      setError("Failed to search availability. Please try again.");
      console.error("Error searching availability:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = (slot) => {
    // Get the selected restaurant information
    const restaurant = restaurants.find(
      (r) => r.id.toString() === selectedRestaurant
    );

    if (!restaurant) {
      setError("Please select a restaurant first");
      return;
    }

    if (!searchParams.visitDate || !searchParams.partySize) {
      setError("Please fill in all search fields");
      return;
    }

    // Navigate to booking form with pre-filled data
    const bookingData = {
      visitDate: searchParams.visitDate,
      visitTime: slot.time,
      partySize: searchParams.partySize,
      channelCode: searchParams.channelCode,
      // Restaurant information
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        cuisine_type: restaurant.cuisine_type,
      },
      // Additional context for the booking form
      selectedSlot: {
        time: slot.time,
        available: slot.available,
        maxPartySize: slot.max_party_size,
        currentBookings: slot.current_bookings,
        formattedTime: formatTime(slot.time),
        formattedDate: formatDate(searchParams.visitDate),
      },
    };

    // Store booking data in localStorage AND navigation state for redundancy
    localStorage.setItem("pendingBooking", JSON.stringify(bookingData));

    // Navigate with state as backup
    navigate("/book", {
      state: {
        bookingData: bookingData,
        fromAvailabilitySearch: true,
      },
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="booking-search">
      <div className="search-header">
        <h1>Find Available Tables</h1>
        <p>Search for available dining times at your chosen restaurant</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="form-group">
          <label htmlFor="restaurant">Restaurant</label>
          <select
            id="restaurant"
            name="restaurant"
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            required
            disabled={loadingRestaurants}
          >
            <option value="">
              {loadingRestaurants
                ? "Loading restaurants..."
                : "Select a restaurant"}
            </option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name} - {restaurant.cuisine_type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="visitDate">Visit Date</label>
          <input
            type="date"
            id="visitDate"
            name="visitDate"
            value={searchParams.visitDate}
            onChange={handleInputChange}
            min={today}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="partySize">Party Size</label>
          <select
            id="partySize"
            name="partySize"
            value={searchParams.partySize}
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

        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? "Searching..." : "Search Availability"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {searched && !loading && (
        <div className="search-results">
          <h2>
            Available Times at{" "}
            {restaurants.find((r) => r.id.toString() === selectedRestaurant)
              ?.name || "Selected Restaurant"}{" "}
            for{" "}
            {searchParams.visitDate
              ? formatDate(searchParams.visitDate)
              : "Selected Date"}
          </h2>

          {availableSlots.length === 0 ? (
            <div className="no-availability">
              <h3>No availability found</h3>
              <p>Try selecting a different date or party size.</p>
            </div>
          ) : (
            <div className="slots-grid">
              {availableSlots.map((slot, index) => (
                <div key={index} className="time-slot">
                  <div className="slot-time">{formatTime(slot.time)}</div>
                  <div className="slot-info">
                    <span
                      className={`available-count ${
                        slot.available ? "available" : "unavailable"
                      }`}
                    >
                      {slot.available
                        ? `${Math.max(
                            0,
                            slot.max_party_size - slot.current_bookings
                          )} tables available`
                        : "Fully booked"}
                    </span>
                  </div>
                  <button
                    className="book-slot-btn"
                    onClick={() => handleBookSlot(slot)}
                    disabled={!slot.available}
                  >
                    {slot.available ? "Book This Time" : "Unavailable"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingSearch;
