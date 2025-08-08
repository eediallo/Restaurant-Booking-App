// Authentication types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface LoginRequest {
  username: string; // This is actually email in our API
  password: string;
}

export interface AuthResponse {
  user_id: number;
  access_token: string;
  refresh_token: string;
  user_info: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// Booking types
export interface Booking {
  id: number;
  booking_reference: string;
  restaurant_id: number;
  visit_date: string;
  visit_time: string;
  party_size: number;
  channel_code: string;
  special_requests?: string;
  status: "confirmed" | "cancelled" | "completed";
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySlot {
  time: string;
  available: boolean;
  max_party_size: number;
  current_bookings: number;
}

export interface AvailabilityResponse {
  restaurant: string;
  restaurant_id: number;
  visit_date: string;
  party_size: number;
  channel_code: string;
  available_slots: AvailabilitySlot[];
  total_slots: number;
}

export interface BookingRequest {
  VisitDate: string;
  VisitTime: string;
  PartySize: number;
  ChannelCode: string;
  SpecialRequests?: string;
  IsLeaveTimeConfirmed?: boolean;
  RoomNumber?: string;
}

// Booking response types
export interface BookingResponse extends Booking {
  user_id: number;
  restaurant_name: string;
}

export interface CancelBookingRequest {
  micrositeName: string;
  bookingReference: string;
  cancellationReasonId: number;
}

export interface UserBookingsResponse {
  bookings: Booking[];
  total: number;
  page: number;
  pages: number;
}

// API Error types
export interface ApiError {
  detail: string;
}

// Auth Context types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
