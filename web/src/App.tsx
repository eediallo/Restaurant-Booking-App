import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/layout/Layout";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Routes with layout */}
            <Route
              path="/"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />

            {/* Protected routes */}
            <Route
              path="/booking"
              element={
                <PrivateRoute>
                  <Layout>
                    <div className="text-center">
                      <h1 className="text-2xl font-bold">Make a Booking</h1>
                      <p className="text-gray-600 mt-2">
                        Booking functionality coming soon...
                      </p>
                    </div>
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/my-bookings"
              element={
                <PrivateRoute>
                  <Layout>
                    <div className="text-center">
                      <h1 className="text-2xl font-bold">My Bookings</h1>
                      <p className="text-gray-600 mt-2">
                        Your bookings will appear here...
                      </p>
                    </div>
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/booking/:reference"
              element={
                <PrivateRoute>
                  <Layout>
                    <div className="text-center">
                      <h1 className="text-2xl font-bold">Booking Details</h1>
                      <p className="text-gray-600 mt-2">
                        Booking details coming soon...
                      </p>
                    </div>
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/booking-confirmation"
              element={
                <PrivateRoute>
                  <Layout>
                    <div className="text-center">
                      <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
                      <p className="text-gray-600 mt-2">
                        Your booking has been confirmed.
                      </p>
                    </div>
                  </Layout>
                </PrivateRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Layout>
                    <div className="text-center">
                      <h1 className="text-2xl font-bold">Profile</h1>
                      <p className="text-gray-600 mt-2">
                        Profile management coming soon...
                      </p>
                    </div>
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* 404 fallback */}
            <Route
              path="*"
              element={
                <Layout>
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900">404</h1>
                    <p className="text-gray-600 mt-2">Page not found</p>
                  </div>
                </Layout>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
