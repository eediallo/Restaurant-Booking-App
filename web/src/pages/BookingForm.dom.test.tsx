// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BookingForm from "./BookingForm";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  post: vi.fn(),
  user: {
    email: "alex@example.com",
    first_name: "Alex",
    last_name: "Morgan",
    phone: "+441234567890",
  },
  locationState: {
    fromAvailabilitySearch: true,
    bookingData: { visitDate: "2026-12-01", visitTime: "19:00", partySize: 2 },
  },
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mocks.user,
  }),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mocks.navigate,
  useLocation: () => ({ state: mocks.locationState }),
}));

vi.mock("../services/api", () => ({
  api: { post: mocks.post },
}));

describe("BookingForm contact details", () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.post.mockReset();
    localStorage.clear();
  });

  it("prefills contact fields from the signed-in user and lets them edit them", () => {
    render(<BookingForm />);

    const firstName = screen.getByLabelText(/First Name/);
    const surname = screen.getByLabelText(/Surname/);
    const mobile = screen.getByLabelText(/Mobile Number/);
    const email = screen.getByLabelText(/Email Address/);

    expect((firstName as HTMLInputElement).value).toBe("Alex");
    expect((surname as HTMLInputElement).value).toBe("Morgan");
    expect((mobile as HTMLInputElement).value).toBe("+441234567890");
    expect((email as HTMLInputElement).value).toBe("alex@example.com");

    fireEvent.change(firstName, { target: { value: "Alexandra" } });
    expect((firstName as HTMLInputElement).value).toBe("Alexandra");
  });
});
