export interface UserData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface AuthUser {
  id?: number;
  username: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user_info: AuthUser;
}

export interface DiningPreferences {
  dietary_restrictions: string[];
  preferred_cuisine: string[];
  seating_preference: string;
  occasion_types: string[];
}

export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  booking_reminders: boolean;
  promotional_emails: boolean;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface ProfileData {
  id?: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  accessibility_needs: string;
  dining_preferences: DiningPreferences;
  notification_preferences: NotificationPreferences;
  emergency_contact: EmergencyContact;
}

export interface ProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  accessibility_needs?: string;
  dining_preferences?: DiningPreferences;
  notification_preferences?: NotificationPreferences;
  emergency_contact?: EmergencyContact;
}

export interface UserProfile extends AuthUser {
  id: number;
  is_active: boolean;
  date_of_birth: string | null;
  accessibility_needs: string | null;
  dining_preferences: DiningPreferences | null;
  notification_preferences: NotificationPreferences | null;
  emergency_contact: EmergencyContact | null;
}

export interface BookingCustomer {
  title?: string | null;
  first_name?: string | null;
  surname?: string | null;
  email?: string | null;
  mobile?: string | null;
}

export interface Booking {
  id?: number;
  booking_reference: string;
  restaurant?: string;
  restaurant_name?: string;
  visit_date: string;
  visit_time: string;
  party_size: number;
  status: string;
  special_requests?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  customer?: BookingCustomer | null;
}

export interface Review {
  id: number;
  booking_reference: string;
  rating: number;
  title: string;
  review_text: string;
  food_rating: number | null;
  service_rating: number | null;
  ambiance_rating: number | null;
  value_rating: number | null;
  would_recommend: boolean;
  created_at: string;
  user_name?: string;
  reviewer_name?: string;
  is_verified?: boolean;
  restaurant_name: string;
}

export interface RestaurantReview {
  id: number;
  rating: number;
  title?: string | null;
  review_text: string;
  food_rating?: number | null;
  service_rating?: number | null;
  ambiance_rating?: number | null;
  value_rating?: number | null;
  created_at: string | null;
  reviewer_name?: string;
  user_name?: string;
  is_verified?: boolean;
}

export interface Restaurant {
  id: number;
  name: string;
  microsite_name?: string | null;
  description?: string | null;
  cuisine_type?: string | null;
  location?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  price_range?: string | null;
  features: string[];
  dietary_options: string[];
  average_rating: number;
  total_reviews: number;
  opening_hours: Record<string, string>;
  max_party_size: number;
  accepts_reservations?: boolean;
  recent_reviews?: RestaurantReview[];
}

export interface AvailabilitySlot {
  id?: number | string;
  time: string;
  available: boolean;
  max_party_size: number;
  current_bookings: number;
  formattedDate?: string;
  formattedTime?: string;
}

export interface BookingTemplate {
  id: number | string;
  name: string;
  preferred_time?: string;
  party_size: number;
  special_requests?: string;
}

export type BookingTemplatePreset = Pick<
  BookingTemplate,
  "preferred_time" | "party_size" | "special_requests"
>;

export interface PendingBooking {
  visitDate?: string;
  visitTime?: string;
  partySize?: number;
  channelCode?: string;
  selectedSlot?: AvailabilitySlot;
  restaurant?: Restaurant;
}

export interface CancellationReason {
  id: number;
  reason: string;
}

export interface RestaurantListResponse {
  restaurants: Restaurant[];
  total: number;
  offset: number;
  limit: number;
}

export interface AvailabilitySearchResponse {
  restaurant: string;
  restaurant_id: number;
  visit_date: string;
  party_size: number;
  channel_code: string;
  available_slots: AvailabilitySlot[];
  total_slots: number;
}

export interface BookingHistoryRecord extends Booking {
  can_modify: boolean;
  can_cancel: boolean;
  is_past: boolean;
  can_review: boolean;
}

export interface BookingHistoryPage {
  bookings: BookingHistoryRecord[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

export interface BookingConfirmation {
  booking_reference: string;
}
