// Export all custom hooks from a central location
export { useAuth } from "./useAuth";
export * from "./useBookingApi";

// Re-export for convenience
export {
  useAvailabilitySearch,
  useCreateBooking,
  useBookingDetails,
  useUpdateBooking,
  useCancelBooking,
  useUserBookings,
  useUserBookingsList,
} from "./useBookingApi";
