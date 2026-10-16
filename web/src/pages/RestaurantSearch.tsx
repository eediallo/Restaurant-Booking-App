import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./RestaurantSearch.css";

const RestaurantSearch = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [minRating, setMinRating] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [selectedDietary, setSelectedDietary] = useState([]);

  // Filter options
  const [cuisines, setCuisines] = useState([]);
  const [locations, setLocations] = useState([]);
  const [priceRanges, setPriceRanges] = useState([]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);

      // Build params object, only include non-empty values
      const params = {
        limit: 50,
      };

      if (selectedCuisine) params.cuisine_type = selectedCuisine;
      if (selectedLocation) params.location = selectedLocation;
      if (selectedPriceRange) params.price_range = selectedPriceRange;
      if (selectedFeatures.length > 0)
        params.features = selectedFeatures.join(",");
      if (selectedDietary.length > 0)
        params.dietary_options = selectedDietary.join(",");
      if (minRating) params.min_rating = parseInt(minRating);
      if (searchTerm) params.search = searchTerm;

      const response = await api.get("/api/restaurants/", { params });
      setRestaurants(response.data.restaurants || []);
    } catch (err) {
      setError("Failed to load restaurants");
      console.error("Error fetching restaurants:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [cuisinesRes, locationsRes, priceRangesRes] = await Promise.all([
        api.get("/api/restaurants/search/cuisines"),
        api.get("/api/restaurants/search/locations"),
        api.get("/api/restaurants/search/price-ranges"),
      ]);

      setCuisines(cuisinesRes.data);
      setLocations(locationsRes.data);
      setPriceRanges(priceRangesRes.data);
    } catch (err) {
      console.error("Error fetching filter options:", err);
    }
  };

  useEffect(() => {
    fetchRestaurants();
    fetchFilterOptions();
  }, []);

  // Trigger search when filters change
  useEffect(() => {
    if (restaurants.length > 0) {
      // Only search after initial load
      fetchRestaurants();
    }
  }, [
    selectedCuisine,
    selectedLocation,
    selectedPriceRange,
    selectedFeatures,
    selectedDietary,
    minRating,
    searchTerm,
  ]);

  const applyFilters = React.useCallback(() => {
    // Since we're now doing server-side filtering, this function is simplified
    // The filteredRestaurants will be the same as restaurants from the API
    setFilteredRestaurants(restaurants);
  }, [restaurants]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const toggleFeature = (feature) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const toggleDietary = (dietary) => {
    setSelectedDietary((prev) =>
      prev.includes(dietary)
        ? prev.filter((d) => d !== dietary)
        : [...prev, dietary]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCuisine("");
    setSelectedLocation("");
    setSelectedPriceRange("");
    setMinRating("");
    setSelectedFeatures([]);
    setSelectedDietary([]);
  };

  const handleRestaurantSelect = (restaurant) => {
    // Navigate to restaurant details page using restaurant name
    navigate(`/restaurant/${encodeURIComponent(restaurant.name)}`);
  };

  const handleQuickBook = (restaurant) => {
    // Navigate to availability search for this restaurant
    navigate(`/availability/${restaurant.name}`, {
      state: { restaurant },
    });
  };

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const getUniqueFeatures = () => {
    const allFeatures = restaurants.flatMap((r) => r.features);
    return [...new Set(allFeatures)];
  };

  const getUniqueDietaryOptions = () => {
    const allDietary = restaurants.flatMap((r) => r.dietary_options);
    return [...new Set(allDietary)];
  };

  if (loading) {
    return (
      <div className="restaurant-search">
        <div className="loading">Loading restaurants...</div>
      </div>
    );
  }

  return (
    <div className="restaurant-search">
      <div className="search-header">
        <h1>Discover Restaurants</h1>
        <p>Find the perfect dining experience for any occasion</p>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search restaurants, cuisines, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-row">
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="filter-select"
            >
              <option value="">All Cuisines</option>
              {cuisines.map((cuisine) => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="filter-select"
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="filter-select"
            >
              <option value="">All Price Ranges</option>
              {priceRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>

            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="filter-select"
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </div>

          {/* Advanced Filters */}
          <div className="advanced-filters">
            <div className="filter-group">
              <h4>Features</h4>
              <div className="checkbox-group">
                {getUniqueFeatures().map((feature) => (
                  <label key={feature} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                    />
                    <span>{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Dietary Options</h4>
              <div className="checkbox-group">
                {getUniqueDietaryOptions().map((dietary) => (
                  <label key={dietary} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedDietary.includes(dietary)}
                      onChange={() => toggleDietary(dietary)}
                    />
                    <span>{dietary}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button onClick={clearFilters} className="clear-filters-btn">
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="search-results">
        <div className="results-header">
          <h2>
            {filteredRestaurants.length} Restaurant
            {filteredRestaurants.length !== 1 ? "s" : ""} Found
          </h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        {filteredRestaurants.length === 0 ? (
          <div className="no-results">
            <h3>No restaurants match your criteria</h3>
            <p>Try adjusting your filters or search terms.</p>
            <button onClick={clearFilters} className="action-btn primary">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="restaurants-grid">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="restaurant-card"
                onClick={() => handleRestaurantSelect(restaurant)}
              >
                <div className="restaurant-header">
                  <h3>{restaurant.name}</h3>
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

                <div className="restaurant-info">
                  <div className="cuisine-location">
                    <span className="cuisine">{restaurant.cuisine_type}</span>
                    <span className="separator">•</span>
                    <span className="location">{restaurant.location}</span>
                    <span className="separator">•</span>
                    <span className="price-range">
                      {restaurant.price_range}
                    </span>
                  </div>

                  <p className="description">{restaurant.description}</p>

                  <div className="restaurant-features">
                    {restaurant.features.slice(0, 3).map((feature) => (
                      <span key={feature} className="feature-tag">
                        {feature}
                      </span>
                    ))}
                    {restaurant.features.length > 3 && (
                      <span className="feature-tag more">
                        +{restaurant.features.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="restaurant-actions">
                    <button
                      className="action-btn primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickBook(restaurant);
                      }}
                    >
                      Check Availability
                    </button>
                    <button
                      className="action-btn secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          `/restaurant/${encodeURIComponent(restaurant.name)}`
                        );
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantSearch;
