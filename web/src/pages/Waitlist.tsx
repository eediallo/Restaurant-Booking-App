import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { api, waitlistAPI } from "../services/api";
import type { Restaurant, RestaurantListResponse, WaitlistEntry } from "../types";
import "./Waitlist.css";

type State = {
  restaurantId?: number;
  restaurantName?: string;
  visitDate?: string;
  visitTime?: string;
  partySize?: number;
};

const dateText = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const timeText = (value: string) =>
  new Date(`2000-01-01T${value}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

const statusText = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const formatExpiry = (expiresAt?: string | null) => {
  if (!expiresAt) return null;
  const iso = expiresAt.endsWith("Z") || expiresAt.includes("+") ? expiresAt : `${expiresAt}Z`;
  const expiryDate = new Date(iso);
  const now = new Date();
  const diffMinutes = Math.round((expiryDate.getTime() - now.getTime()) / 60000);
  const timeFormatted = expiryDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (diffMinutes <= 0) {
    return `Offer expired at ${timeFormatted}`;
  }
  return `Accept within ~${diffMinutes} min (expires at ${timeFormatted})`;
};

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((item: { msg?: string; detail?: string }) => item.msg || item.detail || JSON.stringify(item))
        .join(", ");
    }
  }
  return error instanceof Error ? error.message : fallback;
};

export default function Waitlist() {
  const navigate = useNavigate();
  const state = (useLocation().state as State | null) || {};
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [form, setForm] = useState({
    restaurantId: state.restaurantId?.toString() || "",
    visitDate: state.visitDate || "",
    visitTime: state.visitTime ? state.visitTime.slice(0, 5) : "",
    partySize: state.partySize || 2,
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      waitlistAPI.getEntries(),
      api.get<RestaurantListResponse>("/api/restaurants/", { params: { limit: 1000 } }),
    ])
      .then(([items, response]) => {
        setEntries(items);
        setRestaurants(response.data.restaurants || []);
      })
      .catch((reason) => {
        console.error("Error loading waitlist:", reason);
        setError(getErrorMessage(reason, "We couldn't load your waitlist."));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (form.restaurantId || !state.restaurantName) return;
    const restaurant = restaurants.find((item) => item.name === state.restaurantName);
    if (restaurant) {
      setForm((current) => ({ ...current, restaurantId: restaurant.id.toString() }));
    }
  }, [form.restaurantId, restaurants, state.restaurantName]);

  const change = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "partySize" ? Number(value) : value,
    }));
  };

  const join = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");
    setBookingSuccess(null);

    try {
      const entry = await waitlistAPI.join({
        restaurant_id: Number(form.restaurantId),
        visit_date: form.visitDate,
        visit_time: form.visitTime,
        party_size: Number(form.partySize),
      });
      setEntries((current) => [...current, entry]);
      setMessage("You're on the list! We'll notify you as soon as this slot opens up.");
    } catch (reason) {
      console.error("Error joining waitlist:", reason);
      setError(getErrorMessage(reason, "That time may have opened up already. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const accept = async (entry: WaitlistEntry) => {
    setBusy(entry.id);
    setError("");
    setMessage("");
    setBookingSuccess(null);

    try {
      const booking = await waitlistAPI.acceptOffer(entry.id);
      setEntries((current) =>
        current.map((item) =>
          item.id === entry.id
            ? { ...item, status: "booked", booking_id: booking.booking_id }
            : item
        )
      );
      setBookingSuccess(booking.booking_reference);
      setMessage(`Your table is booked! Confirmation reference: ${booking.booking_reference}`);
    } catch (reason) {
      console.error("Error accepting waitlist offer:", reason);
      setError(getErrorMessage(reason, "This offer is no longer available."));
    } finally {
      setBusy(null);
    }
  };

  const leave = async (entry: WaitlistEntry) => {
    setBusy(entry.id);
    setError("");
    setBookingSuccess(null);

    try {
      await waitlistAPI.leave(entry.id);
      setEntries((current) =>
        current.map((item) =>
          item.id === entry.id ? { ...item, status: "cancelled" } : item
        )
      );
      setMessage("You have left the waitlist.");
    } catch (reason) {
      console.error("Error leaving waitlist:", reason);
      setError(getErrorMessage(reason, "We couldn't remove you from this waitlist."));
    } finally {
      setBusy(null);
    }
  };

  const name = (id: number) =>
    restaurants.find((restaurant) => restaurant.id === id)?.name || "Restaurant";

  const active = entries.filter((entry) => ["waiting", "offered"].includes(entry.status));
  const previous = entries.filter((entry) => !["waiting", "offered"].includes(entry.status));
  const restaurantLoading = loading && restaurants.length === 0;

  return (
    <main className="waitlist-page">
      <header className="waitlist-header">
        <div>
          <p className="eyebrow">Dining plans</p>
          <h1>My waitlist</h1>
          <p>Keep your preferred time on your radar, even when the restaurant is full.</p>
        </div>
        <button className="waitlist-secondary-btn" onClick={() => navigate("/availability")}>
          Find a table
        </button>
      </header>

      {error && (
        <div className="waitlist-alert error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="waitlist-alert success" role="status">
          <span>{message}</span>
          {bookingSuccess && (
            <button
              type="button"
              className="waitlist-secondary-btn small"
              onClick={() => navigate("/dashboard")}
            >
              View My Bookings
            </button>
          )}
        </div>
      )}

      <section className="waitlist-layout">
        <form className="waitlist-card waitlist-form" onSubmit={join}>
          <div className="card-heading">
            <h2>Join a waitlist</h2>
            <p>We'll notify you when this time becomes available.</p>
          </div>

          <label htmlFor="waitlist-restaurant">
            Restaurant
            <select
              id="waitlist-restaurant"
              name="restaurantId"
              value={form.restaurantId}
              onChange={change}
              required
              disabled={restaurantLoading}
            >
              <option value="">
                {restaurantLoading ? "Loading restaurants..." : "Select a restaurant"}
              </option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </label>

          <div className="waitlist-form-row">
            <label htmlFor="waitlist-date">
              Date
              <input
                id="waitlist-date"
                type="date"
                name="visitDate"
                min={new Date().toISOString().split("T")[0]}
                value={form.visitDate}
                onChange={change}
                required
              />
            </label>
            <label htmlFor="waitlist-time">
              Time
              <input
                id="waitlist-time"
                type="time"
                name="visitTime"
                value={form.visitTime}
                onChange={change}
                required
              />
            </label>
          </div>

          <label htmlFor="waitlist-party-size">
            Party size
            <select
              id="waitlist-party-size"
              name="partySize"
              value={form.partySize}
              onChange={change}
            >
              {Array.from({ length: 8 }, (_, index) => index + 1).map((size) => (
                <option key={size} value={size}>
                  {size} {size === 1 ? "guest" : "guests"}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="waitlist-primary-btn"
            disabled={submitting || restaurantLoading}
          >
            {submitting ? "Joining..." : "Join waitlist"}
          </button>
        </form>

        <section className="waitlist-card">
          <div className="card-heading">
            <h2>Your requests</h2>
            <p>
              {active.length
                ? `${active.length} active request${active.length === 1 ? "" : "s"}`
                : "No active requests yet"}
            </p>
          </div>

          {loading ? (
            <p className="empty-state">Loading your waitlist...</p>
          ) : active.length === 0 ? (
            <p className="empty-state">Join a waitlist to keep an eye on a sold-out time.</p>
          ) : (
            <div className="entry-list">
              {active.map((entry) => (
                <article className={`entry ${entry.status}`} key={entry.id}>
                  <div className="entry-topline">
                    <strong>{name(entry.restaurant_id)}</strong>
                    <span className={`entry-status ${entry.status}`}>
                      {statusText(entry.status)}
                    </span>
                  </div>

                  <p>
                    {dateText(entry.visit_date)} · {timeText(entry.visit_time)} · {entry.party_size} guests
                  </p>

                  {entry.status === "offered" && (
                    <div className="offer-message">
                      <strong>A table is available!</strong>
                      <span>
                        {formatExpiry(entry.offer_expires_at) || "Accept before the offer expires."}
                      </span>
                    </div>
                  )}

                  <div className="entry-actions">
                    {entry.status === "offered" && (
                      <button
                        className="waitlist-primary-btn small"
                        onClick={() => void accept(entry)}
                        disabled={busy === entry.id}
                      >
                        {busy === entry.id ? "Accepting..." : "Accept table"}
                      </button>
                    )}
                    <button
                      className="text-btn"
                      onClick={() => void leave(entry)}
                      disabled={busy === entry.id}
                    >
                      {busy === entry.id ? "Leaving..." : "Leave waitlist"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && previous.length > 0 && (
            <div className="waitlist-history">
              <h3>Previous requests</h3>
              <div className="entry-list">
                {previous.map((entry) => (
                  <article className={`entry ${entry.status}`} key={entry.id}>
                    <div className="entry-topline">
                      <strong>{name(entry.restaurant_id)}</strong>
                      <span className={`entry-status ${entry.status}`}>
                        {statusText(entry.status)}
                      </span>
                    </div>
                    <p>
                      {dateText(entry.visit_date)} · {timeText(entry.visit_time)} · {entry.party_size} guests
                    </p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
