import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "../services/booking";
import type { AvailabilityResponse, BookingRequest, Booking } from "../types";

// Hook for searching availability
export const useAvailabilitySearch = () => {
  return useMutation<
    AvailabilityResponse,
    Error,
    { visitDate: string; partySize: number; channelCode?: string }
  >({
    mutationFn: ({ visitDate, partySize, channelCode = "ONLINE" }) =>
      bookingService.searchAvailability(visitDate, partySize, channelCode),
  });
};

// Hook for creating a booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, BookingRequest>({
    mutationFn: bookingService.createBooking,
    onSuccess: () => {
      // Invalidate user bookings to refresh the list
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
  });
};

// Hook for getting booking details
export const useBookingDetails = (bookingReference: string) => {
  return useQuery<Booking, Error>({
    queryKey: ["booking", bookingReference],
    queryFn: () => bookingService.getBookingDetails(bookingReference),
    enabled: !!bookingReference,
  });
};

// Hook for updating a booking
export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Booking,
    Error,
    { bookingReference: string; updates: Partial<BookingRequest> }
  >({
    mutationFn: ({ bookingReference, updates }) =>
      bookingService.updateBooking(bookingReference, updates),
    onSuccess: (data, variables) => {
      // Update the specific booking in cache
      queryClient.setQueryData(["booking", variables.bookingReference], data);
      // Invalidate user bookings to refresh the list
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
  });
};

// Hook for cancelling a booking
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string },
    Error,
    { bookingReference: string; cancellationReasonId?: number }
  >({
    mutationFn: ({ bookingReference, cancellationReasonId = 1 }) =>
      bookingService.cancelBooking(bookingReference, cancellationReasonId),
    onSuccess: (_, variables) => {
      // Invalidate the specific booking and user bookings
      queryClient.invalidateQueries({
        queryKey: ["booking", variables.bookingReference],
      });
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
  });
};

// Hook for getting user bookings with pagination and filtering
export const useUserBookings = (
  page: number = 1,
  limit: number = 10,
  status?: string,
  dateFrom?: string,
  dateTo?: string
) => {
  return useQuery<
    {
      bookings: Booking[];
      total: number;
      page: number;
      pages: number;
    },
    Error
  >({
    queryKey: ["userBookings", page, limit, status, dateFrom, dateTo],
    queryFn: () =>
      bookingService.getUserBookings(page, limit, status, dateFrom, dateTo),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for getting all user bookings (simplified version)
export const useUserBookingsList = () => {
  return useQuery<Booking[], Error>({
    queryKey: ["userBookingsList"],
    queryFn: async () => {
      const response = await bookingService.getUserBookings(1, 100); // Get up to 100 bookings
      return response.bookings;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
