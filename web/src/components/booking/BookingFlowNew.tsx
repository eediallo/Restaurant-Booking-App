import React, { useState } from "react";
import { useCreateBooking } from "../../hooks/useBookingApi";
import { AvailabilitySearch } from "./AvailabilitySearch";
import { TimeSlotSelection } from "./TimeSlotSelection";
import {
  CustomerDetailsForm,
  type CustomerDetailsFormData,
} from "./CustomerDetailsForm";
import { BookingConfirmation } from "./BookingConfirmation";
import { BookingSuccess } from "./BookingSuccess";
import { Button } from "../ui/Button";
import type { AvailabilitySlot, Booking } from "../../types";

interface BookingFlowState {
  step: number;
  visitDate: string;
  partySize: number;
  availableSlots: AvailabilitySlot[];
  selectedTime: string;
  customerDetails: CustomerDetailsFormData | null;
  completedBooking: Booking | null;
}

export const BookingFlow: React.FC = () => {
  const createBookingMutation = useCreateBooking();

  const [flowState, setFlowState] = useState<BookingFlowState>({
    step: 1,
    visitDate: "",
    partySize: 0,
    availableSlots: [],
    selectedTime: "",
    customerDetails: null,
    completedBooking: null,
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
      title: "Customer Details",
      description: "Provide your contact information",
    },
    {
      number: 4,
      title: "Review Booking",
      description: "Confirm your reservation details",
    },
    {
      number: 5,
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

  const handleNextToCustomerDetails = () => {
    if (flowState.step === 2 && flowState.selectedTime) {
      setFlowState((prev) => ({ ...prev, step: 3 }));
    }
  };

  const handlePreviousStep = () => {
    if (flowState.step > 1) {
      setFlowState((prev) => ({ ...prev, step: prev.step - 1 }));
    }
  };

  const handleCustomerDetailsSubmit = (
    customerDetails: CustomerDetailsFormData
  ) => {
    setFlowState((prev) => ({
      ...prev,
      customerDetails,
      step: 4,
    }));
  };

  const handleEditStep = (step: "date" | "time" | "customer") => {
    switch (step) {
      case "date":
        setFlowState((prev) => ({ ...prev, step: 1 }));
        break;
      case "time":
        setFlowState((prev) => ({ ...prev, step: 2 }));
        break;
      case "customer":
        setFlowState((prev) => ({ ...prev, step: 3 }));
        break;
    }
  };

  const handleConfirmBooking = async () => {
    if (!flowState.customerDetails) return;

    try {
      setIsLoading(true);
      setError("");

      const bookingData = {
        VisitDate: flowState.visitDate,
        VisitTime: flowState.selectedTime,
        PartySize: flowState.partySize,
        ChannelCode: "ONLINE",
        SpecialRequests: flowState.customerDetails.specialRequests || "",
      };

      const booking = await createBookingMutation.mutateAsync(bookingData);

      setFlowState((prev) => ({
        ...prev,
        completedBooking: booking,
        step: 5,
      }));
    } catch (err) {
      console.error("Booking creation failed:", err);
      setError("Failed to create booking. Please try again.");
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
      customerDetails: null,
      completedBooking: null,
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
            <Button
              onClick={handleNextToCustomerDetails}
              disabled={!flowState.selectedTime}
            >
              Continue to Customer Details
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Customer Details */}
      {flowState.step === 3 && (
        <div className="space-y-6">
          <CustomerDetailsForm
            onSubmit={handleCustomerDetailsSubmit}
            initialData={flowState.customerDetails || undefined}
          />

          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePreviousStep}>
              Back to Time Selection
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Booking Confirmation */}
      {flowState.step === 4 && flowState.customerDetails && (
        <div className="space-y-6">
          <BookingConfirmation
            visitDate={flowState.visitDate}
            visitTime={flowState.selectedTime}
            partySize={flowState.partySize}
            customerDetails={flowState.customerDetails}
            onConfirm={handleConfirmBooking}
            onEdit={handleEditStep}
            isLoading={isLoading}
          />

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={isLoading}
            >
              Back to Customer Details
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {flowState.step === 5 && flowState.completedBooking && (
        <BookingSuccess
          bookingReference={flowState.completedBooking.booking_reference || "N/A"}
          visitDate={flowState.visitDate}
          visitTime={flowState.selectedTime}
          partySize={flowState.partySize}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
};
