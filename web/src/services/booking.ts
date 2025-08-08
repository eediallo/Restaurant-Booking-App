import api from "./api";
import type { AvailabilityResponse, BookingRequest, Booking } from "../types";

export const bookingService = {
  // Search availability for a specific date and party size
  async searchAvailability(
    visitDate: string,
    partySize: number,
    channelCode: string = "ONLINE"
  ): Promise<AvailabilityResponse> {
    const response = await api.post<AvailabilityResponse>(
      "/api/ConsumerApi/v1/Restaurant/TheHungryUnicorn/AvailabilitySearch",
      {
        VisitDate: visitDate,
        PartySize: partySize,
        ChannelCode: channelCode,
      }
    );
    return response.data;
  },

  // Create a new booking
  async createBooking(bookingData: BookingRequest): Promise<Booking> {
    const response = await api.post<Booking>(
      "/api/ConsumerApi/v1/Restaurant/TheHungryUnicorn/BookingWithStripeToken",
      bookingData
    );
    return response.data;
  },

  // Get booking details by reference
  async getBookingDetails(bookingReference: string): Promise<Booking> {
    const response = await api.get<Booking>(
      `/api/ConsumerApi/v1/Restaurant/TheHungryUnicorn/Booking/${bookingReference}`
    );
    return response.data;
  },

  // Update an existing booking
  async updateBooking(
    bookingReference: string,
    updates: Partial<BookingRequest>
  ): Promise<Booking> {
    const response = await api.patch<Booking>(
      `/api/ConsumerApi/v1/Restaurant/TheHungryUnicorn/Booking/${bookingReference}`,
      updates
    );
    return response.data;
  },

  // Cancel a booking
  async cancelBooking(
    bookingReference: string,
    cancellationReasonId: number = 1
  ): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `/api/ConsumerApi/v1/Restaurant/TheHungryUnicorn/Booking/${bookingReference}/Cancel`,
      {
        micrositeName: "TheHungryUnicorn",
        bookingReference,
        cancellationReasonId,
      }
    );
    return response.data;
  },

  // Get user's bookings with pagination and filtering
  async getUserBookings(
    page: number = 1,
    limit: number = 10,
    status?: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<{
    bookings: Booking[];
    total: number;
    page: number;
    pages: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) params.append("status", status);
    if (dateFrom) params.append("date_from", dateFrom);
    if (dateTo) params.append("date_to", dateTo);

    const response = await api.get<{
      bookings: Booking[];
      total: number;
      page: number;
      pages: number;
    }>(`/api/user/bookings?${params.toString()}`);
    return response.data;
  },
};
