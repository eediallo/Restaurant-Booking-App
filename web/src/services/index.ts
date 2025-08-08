// Export all API services from a central location
export { authService } from "./auth";
export { bookingService } from "./booking";
export { default as api } from "./api";

// Re-export for convenience
export * from "./auth";
export * from "./booking";
