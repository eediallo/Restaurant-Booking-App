import axios from "axios";

export type ErrorDetail =
  | { kind: "response"; data: { detail?: string }; status?: number }
  | { kind: "request"; request: XMLHttpRequest, detail: string }
  | { kind: "setup"; message: string };

export function handleApiError(error: unknown): ErrorDetail {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return {
        kind: "response",
        data: error.response.data || {},
        status: error.response.status,
      };
    } else if (error.request) {
      return {
        kind: "request",
        request: error.request,
        detail: error.message || 'No response received'
      };
    }
  }

  const message =
    error instanceof Error ? error.message : "An unexpected error occurred";
  return { kind: "setup", message };
}
