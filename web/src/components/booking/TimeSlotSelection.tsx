import React from "react";
import type { AvailabilitySlot } from "../../types";

interface TimeSlotSelectionProps {
  availableSlots: AvailabilitySlot[];
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  partySize: number;
  visitDate: string;
}

export const TimeSlotSelection: React.FC<TimeSlotSelectionProps> = ({
  availableSlots,
  selectedTime,
  onTimeSelect,
  partySize,
  visitDate,
}) => {
  // Group slots by meal period
  const lunchSlots = availableSlots.filter((slot) => {
    const hour = parseInt(slot.time.split(":")[0]);
    return hour >= 12 && hour < 15; // 12:00 - 14:59
  });

  const dinnerSlots = availableSlots.filter((slot) => {
    const hour = parseInt(slot.time.split(":")[0]);
    return hour >= 17 && hour < 22; // 17:00 - 21:59
  });

  const otherSlots = availableSlots.filter((slot) => {
    const hour = parseInt(slot.time.split(":")[0]);
    return hour < 12 || (hour >= 15 && hour < 17) || hour >= 22;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPopularityLevel = (slot: AvailabilitySlot) => {
    // Mock popularity based on available capacity vs max capacity
    const occupancyRate =
      (slot.max_party_size - slot.current_bookings) / slot.max_party_size;
    if (occupancyRate > 0.8) return "low";
    if (occupancyRate > 0.5) return "medium";
    return "high";
  };

  const TimeSlotCard: React.FC<{
    slot: AvailabilitySlot;
    isSelected: boolean;
    onClick: () => void;
  }> = ({ slot, isSelected, onClick }) => {
    const isAvailable = slot.available && slot.max_party_size >= partySize;
    const popularity = getPopularityLevel(slot);

    return (
      <button
        onClick={onClick}
        disabled={!isAvailable}
        className={`
          relative p-4 rounded-lg border-2 transition-all duration-200 text-left
          ${
            isSelected
              ? "border-blue-500 bg-blue-50 shadow-md"
              : isAvailable
              ? "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
              : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
          }
        `}
      >
        {/* Popular indicator */}
        {isAvailable && popularity === "high" && (
          <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            Popular
          </div>
        )}

        <div className="flex justify-between items-start mb-2">
          <span
            className={`text-lg font-semibold ${
              isAvailable ? "text-gray-900" : "text-gray-400"
            }`}
          >
            {slot.time}
          </span>
          <span
            className={`text-sm ${
              isAvailable ? "text-green-600" : "text-red-500"
            }`}
          >
            {isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <div>Capacity: {slot.max_party_size} people</div>
          <div>Current bookings: {slot.current_bookings}</div>
          {!isAvailable && slot.max_party_size < partySize && (
            <div className="text-red-500 text-xs">
              Too small for party of {partySize}
            </div>
          )}
        </div>

        {/* Popularity indicator */}
        {isAvailable && (
          <div className="mt-2 flex items-center space-x-1">
            <div className="flex space-x-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <
                    (popularity === "high"
                      ? 3
                      : popularity === "medium"
                      ? 2
                      : 1)
                      ? "bg-orange-400"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {popularity === "high"
                ? "High demand"
                : popularity === "medium"
                ? "Moderate demand"
                : "Low demand"}
            </span>
          </div>
        )}
      </button>
    );
  };

  const SlotSection: React.FC<{
    title: string;
    slots: AvailabilitySlot[];
    icon: string;
  }> = ({ title, slots, icon }) => {
    if (slots.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">{icon}</span>
          {title}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {slots.map((slot) => (
            <TimeSlotCard
              key={slot.time}
              slot={slot}
              isSelected={selectedTime === slot.time}
              onClick={() =>
                slot.available &&
                slot.max_party_size >= partySize &&
                onTimeSelect(slot.time)
              }
            />
          ))}
        </div>
      </div>
    );
  };

  if (availableSlots.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Available Times
        </h3>
        <p className="text-gray-600 mb-4">
          Sorry, there are no available time slots for {formatDate(visitDate)}{" "}
          for a party of {partySize}.
        </p>
        <p className="text-sm text-gray-500">
          Try selecting a different date or adjusting your party size.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Available Time Slots
        </h2>
        <p className="text-gray-600">
          {formatDate(visitDate)} • Party of {partySize}
        </p>
      </div>

      <SlotSection title="Lunch Service" slots={lunchSlots} icon="🍽️" />

      <SlotSection title="Dinner Service" slots={dinnerSlots} icon="🌙" />

      {otherSlots.length > 0 && (
        <SlotSection title="Other Times" slots={otherSlots} icon="⏰" />
      )}

      {selectedTime && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-blue-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-blue-800 font-medium">
              Selected time: {selectedTime} on {formatDate(visitDate)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
