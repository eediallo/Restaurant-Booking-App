import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/layout/Layout";
import { PageLayout } from "./components/layout/PageLayout";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { BookingFlow } from "./components/booking/BookingFlow";
import { BookingDetails } from "./components/booking/BookingDetails";
import { UserBookings } from "./components/booking/UserBookings";
import { UserProfile } from "./components/user/UserProfile";
import { Button } from "./components/ui/Button";

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
    <ErrorBoundary>
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
                      <PageLayout title="Make a Reservation">
                        <BookingFlow />
                      </PageLayout>
                    </Layout>
                  </PrivateRoute>
                }
              />{" "}
              <Route
                path="/my-bookings"
                element={
                  <PrivateRoute>
                    <Layout>
                      <PageLayout title="My Bookings">
                        <UserBookings />
                      </PageLayout>
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/booking/:reference"
                element={
                  <PrivateRoute>
                    <Layout>
                      <BookingDetails />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/booking-confirmation"
                element={
                  <PrivateRoute>
                    <Layout>
                      <PageLayout title="Booking Confirmed">
                        <div className="text-center">
                          <h1 className="text-2xl font-bold">
                            Booking Confirmed!
                          </h1>
                          <p className="text-gray-600 mt-2">
                            Your booking has been confirmed.
                          </p>
                        </div>
                      </PageLayout>
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Layout>
                      <PageLayout title="Profile Settings">
                        <UserProfile />
                      </PageLayout>
                    </Layout>
                  </PrivateRoute>
                }
              />
              {/* 404 fallback */}
              <Route
                path="*"
                element={
                  <Layout>
                    <PageLayout title="Page Not Found">
                      <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                          <svg
                            className="h-8 w-8 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                          404
                        </h1>
                        <p className="text-gray-600 mb-8">
                          The page you're looking for doesn't exist.
                        </p>
                        <Link to="/">
                          <Button variant="primary">Go back home</Button>
                        </Link>
                      </div>
                    </PageLayout>
                  </Layout>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
