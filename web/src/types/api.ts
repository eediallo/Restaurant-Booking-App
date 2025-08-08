// Re-export all types from the main types file for API-specific usage
export type {
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  RefreshTokenRequest,
  Booking,
  BookingResponse,
  AvailabilitySlot,
  AvailabilityResponse,
  BookingRequest,
  CancelBookingRequest,
  UserBookingsResponse,
  ApiError,
  AuthContextType,
} from "./index";

// Additional API-specific types
export interface ApiSuccessResponse<T = unknown> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  error: string;
  detail?: string;
  status_code?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Request/Response wrapper types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// HTTP method types for API calls
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Common request options
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
  retries?: number;
}
