import api from "./api";
import type { AvailabilityResponse, BookingRequest, Booking } from "../types";

export const bookingService = {
  // Search availability for a specific date and party size
  async searchAvailability(
    visitDate: string,
    partySize: number,
    channelCode: string = "ONLINE"
  ): Promise<AvailabilityResponse> {
    const formData = new FormData();
    formData.append("VisitDate", visitDate);
    formData.append("PartySize", partySize.toString());
    formData.append("ChannelCode", channelCode);

    const response = await api.post<AvailabilityResponse>(
      "/api/ConsumerApi/v1/Restaurant/TheHungryUnicorn/AvailabilitySearch",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Create a new booking
  async createBooking(bookingData: BookingRequest): Promise<Booking> {
    const formData = new FormData();
    formData.append("VisitDate", bookingData.VisitDate);
    formData.append("VisitTime", bookingData.VisitTime);
    formData.append("PartySize", bookingData.PartySize.toString());
    formData.append("ChannelCode", bookingData.ChannelCode);

    if (bookingData.SpecialRequests) {
      formData.append("SpecialRequests", bookingData.SpecialRequests);
    }
    if (bookingData.IsLeaveTimeConfirmed !== undefined) {
      formData.append(
        "IsLeaveTimeConfirmed",
        bookingData.IsLeaveTimeConfirmed.toString()
      );
    }
    if (bookingData.RoomNumber) {
      formData.append("RoomNumber", bookingData.RoomNumber);
    }

    const response = await api.post<Booking>(
      "/api/ConsumerApi/v1/Restaurant/TheHungryUnicorn/BookingWithStripeToken",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
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
    const formData = new FormData();

    if (updates.VisitDate) {
      formData.append("VisitDate", updates.VisitDate);
    }
    if (updates.VisitTime) {
      formData.append("VisitTime", updates.VisitTime);
    }
    if (updates.PartySize !== undefined) {
      formData.append("PartySize", updates.PartySize.toString());
    }
    if (updates.SpecialRequests) {
      formData.append("SpecialRequests", updates.SpecialRequests);
    }

    const response = await api.patch<Booking>(
      `/api/ConsumerApi/v1/Restaurant/TheHungryUnicorn/Booking/${bookingReference}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Cancel a booking
  async cancelBooking(
    bookingReference: string,
    cancellationReasonId: number
  ): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append("cancellationReasonId", cancellationReasonId.toString());

    const response = await api.post<{ message: string }>(
      `/api/ConsumerApi/v1/Restaurant/TheHungryUnicorn/Booking/${bookingReference}/Cancel`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
