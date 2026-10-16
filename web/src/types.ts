export interface ProfileData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  accessibility_needs: string;
  dining_preferences: {
    dietary_restrictions: string[];
    preferred_cuisine: string[];
    seating_preference: string;
    occasion_types: string[];
  };
  notification_preferences: {
    email_notifications: boolean;
    sms_notifications: boolean;
    booking_reminders: boolean;
    promotional_emails: boolean;
  };
  emergency_contact: { name: string; phone: string; relationship: string };
  [key: string]: any;
}

export interface Booking {
  id?: number | string;
  booking_reference: string;
  restaurant?: string;
  restaurant_name?: string;
  visit_date: string;
  visit_time: string;
  party_size: number;
  status: string;
  special_requests?: string;
  created_at?: string;
  updated_at?: string;
  customer?: {
    first_name?: string;
    surname?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface Restaurant {
  id: number | string;
  name: string;
  cuisine_type?: string;
  location?: string;
  price_range?: string;
  average_rating?: number;
  total_reviews?: number;
  description?: string;
  phone?: string;
  address?: string;
  website?: string;
  max_party_size?: number;
  features: string[];
  dietary_options: string[];
  opening_hours?: Record<string, string>;
  recent_reviews?: any[];
  [key: string]: any;
}

export interface AvailabilitySlot {
  id: number | string;
  time: string;
  available: boolean;
  max_party_size: number;
  current_bookings: number;
  formattedDate?: string;
  formattedTime?: string;
  [key: string]: any;
}

export interface BookingTemplate {
  id?: number | string;
  name?: string;
  preferred_time?: string;
  party_size: number;
  special_requests?: string;
  [key: string]: any;
}

export interface CancellationReason {
  id: number;
  reason: string;
}

export type UserData = Pick<
  ProfileData,
  "first_name" | "last_name" | "username" | "email"
> & { password: string; phone?: string };
