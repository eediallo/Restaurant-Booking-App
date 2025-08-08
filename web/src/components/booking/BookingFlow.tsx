import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCreateBooking } from "../../hooks/useBookingApi";
import { AvailabilitySearch } from "./AvailabilitySearch";
import { TimeSlotSelection } from "./TimeSlotSelection";
import { BookingConfirmation } from "./BookingConfirmation";
import { BookingSuccess } from "./BookingSuccess";
import { Button } from "../ui/Button";
import type { AvailabilitySlot, BookingRequest } from "../../types";

interface BookingFlowState {
  step: number;
  visitDate: string;
  partySize: number;
  availableSlots: AvailabilitySlot[];
  selectedTime: string;
  specialRequests: string;
  bookingReference: string;
}

export const BookingFlow: React.FC = () => {
  const { user } = useAuth();
  const createBookingMutation = useCreateBooking();

  const [flowState, setFlowState] = useState<BookingFlowState>({
    step: 1,
    visitDate: "",
    partySize: 0,
    availableSlots: [],
    selectedTime: "",
    specialRequests: "",
    bookingReference: "",
  });

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const steps = [
    {
      number: 1,
      title: "Date & Party Size",
      description: "Choose your preferred date and party size",
    },
    {
      number: 2,
      title: "Select Time",
      description: "Pick your ideal time slot",
    },
    {
      number: 3,
      title: "Review Booking",
      description: "Confirm your reservation details",
    },
    {
      number: 4,
      title: "Confirmation",
      description: "Your booking is confirmed!",
    },
  ];

  const handleAvailabilityFound = (data: {
    visitDate: string;
    partySize: number;
    availableSlots: AvailabilitySlot[];
  }) => {
    setFlowState((prev) => ({
      ...prev,
      visitDate: data.visitDate,
      partySize: data.partySize,
      availableSlots: data.availableSlots,
      step: 2,
    }));
    setError("");
  };

  const handleTimeSelect = (time: string) => {
    setFlowState((prev) => ({
      ...prev,
      selectedTime: time,
    }));
  };

  const handleNextStep = () => {
    if (flowState.step === 2 && flowState.selectedTime) {
      setFlowState((prev) => ({ ...prev, step: 3 }));
    }
  };

  const handlePreviousStep = () => {
    if (flowState.step > 1) {
      setFlowState((prev) => ({ ...prev, step: prev.step - 1 }));
    }
  };

  const handleConfirmBooking = async (specialRequests: string) => {
    try {
      setIsLoading(true);
      setError("");

      const bookingData: BookingRequest = {
        VisitDate: flowState.visitDate,
        VisitTime: flowState.selectedTime,
        PartySize: flowState.partySize,
        ChannelCode: "ONLINE",
        SpecialRequests: specialRequests,
      };

      const booking = await createBookingMutation.mutateAsync(bookingData);

      setFlowState((prev) => ({
        ...prev,
        specialRequests,
        bookingReference: booking.booking_reference || "N/A",
        step: 4,
      }));
    } catch (err) {
      setError("Failed to create booking. Please try again.");
      console.error("Booking creation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setFlowState({
      step: 1,
      visitDate: "",
      partySize: 0,
      availableSlots: [],
      selectedTime: "",
      specialRequests: "",
      bookingReference: "",
    });
    setError("");
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const ProgressIndicator: React.FC = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${
                  flowState.step >= step.number
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }
              `}
            >
              {flowState.step > step.number ? (
                <svg
                  className="w-6 h-6"
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
              ) : (
                step.number
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-4
                  ${
                    flowState.step > step.number ? "bg-blue-600" : "bg-gray-200"
                  }
                `}
              />
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">
          {steps[flowState.step - 1].title}
        </h2>
        <p className="text-gray-600">{steps[flowState.step - 1].description}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <ProgressIndicator />

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Step 1: Date and Party Size Selection */}
      {flowState.step === 1 && (
        <AvailabilitySearch
          onAvailabilityFound={handleAvailabilityFound}
          onError={handleError}
        />
      )}

      {/* Step 2: Time Slot Selection */}
      {flowState.step === 2 && (
        <div className="space-y-6">
          <TimeSlotSelection
            availableSlots={flowState.availableSlots}
            selectedTime={flowState.selectedTime}
            onTimeSelect={handleTimeSelect}
            partySize={flowState.partySize}
            visitDate={flowState.visitDate}
          />

          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePreviousStep}>
              Back to Date Selection
            </Button>
            <Button onClick={handleNextStep} disabled={!flowState.selectedTime}>
              Continue to Review
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Booking Confirmation */}
      {flowState.step === 3 && user && (
        <div className="space-y-6">
          <BookingConfirmation
            visitDate={flowState.visitDate}
            visitTime={flowState.selectedTime}
            partySize={flowState.partySize}
            user={user}
            onConfirm={handleConfirmBooking}
            isLoading={isLoading}
          />

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={isLoading}
            >
              Back to Time Selection
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {flowState.step === 4 && (
        <BookingSuccess
          bookingReference={flowState.bookingReference}
          visitDate={flowState.visitDate}
          visitTime={flowState.selectedTime}
          partySize={flowState.partySize}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
};
