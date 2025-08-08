import { AxiosError } from "axios";

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.detail || error.message || "An error occurred";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const formatTime = (time: string): string => {
  return time.slice(0, 5); // Format HH:MM from HH:MM:SS
};
