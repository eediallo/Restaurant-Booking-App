import axios from "axios";

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  // Check if we're in production (deployed app)
  if (
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    // We're on the deployed app, use the same origin for API calls
    return window.location.origin;
  }

  // We're in local development
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Default fallback for local development
  return "http://localhost:8547";
};

// Create axios instance with default config
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(
            "http://localhost:8547/api/auth/refresh",
            {
              refresh_token: refreshToken,
            }
          );

          const newAccessToken = response.data.access_token;
          localStorage.setItem("accessToken", newAccessToken);

          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export { api };

// User Profile API functions
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get("/api/user/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.patch("/api/user/profile", profileData);
    return response.data;
  },

  // Get user bookings
  getBookings: async () => {
    const response = await api.get("/api/user/bookings");
    return response.data;
  },
};
