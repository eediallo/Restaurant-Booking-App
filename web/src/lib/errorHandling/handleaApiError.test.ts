import { describe, expect, it } from "vitest";
import axios, { AxiosError } from "axios";
import { handleApiError } from "./handleApiError";

describe("handleApiError", () => {
  it("should handle axios response errors correctly", () => {
    const mockAxiosError = {
      isAxiosError: true,
      response: {
        status: 400,
        data: { detail: "Username already taken" },
      },
    } as unknown as AxiosError;

    const result = handleApiError(mockAxiosError);

    expect(result).toEqual({
      kind: "response",
      data: { detail: "Username already taken" },
      status: 400,
    });
  });

  it("should handle Axios request errors (network / no response correctly", () => {
    const mockRequest = {} as XMLHttpRequest;

    const mockAxiosError = {
      isAxiosError: true,
      request: mockRequest,
      detail: null,
    } as unknown as AxiosError;

    const result = handleApiError(mockAxiosError);

    expect(result).toEqual({
      kind: "request",
      request: mockRequest,
      detail: "No response received",
    });
  });

  it("should handle non-Axios or general setup errors correctly", () => {
    const genericError = new Error("Something went wrong");

    const result = handleApiError(genericError);

    expect(result).toEqual({
      kind: "setup",
      message: "Something went wrong",
    });
  });

  it("should handle non-Error objects thrown in setup/catch blocks", () => {
    const result = handleApiError("A string error");

    expect(result).toEqual({
      kind: "setup",
      message: "An unexpected error occurred",
    });
  });
});
