import React from "react";

interface BookingSuccessProps {
  bookingReference: string;
  visitDate: string;
  visitTime: string;
  partySize: number;
  onStartOver: () => void;
}

export const BookingSuccess: React.FC<BookingSuccessProps> = ({
  bookingReference,
  visitDate,
  visitTime,
  partySize,
  onStartOver,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const generateCalendarEvent = () => {
    const startDate = new Date(`${visitDate}T${visitTime}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hour duration

    const eventDetails = {
      title: "Dinner at The Hungry Unicorn",
      start: startDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
      end: endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
      details: `Booking Reference: ${bookingReference}
Party Size: ${partySize}
Restaurant: The Hungry Unicorn
Address: 123 Main Street, City, State 12345`,
      location: "The Hungry Unicorn, 123 Main Street, City, State 12345",
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventDetails.title
    )}&dates=${eventDetails.start}/${
      eventDetails.end
    }&details=${encodeURIComponent(
      eventDetails.details
    )}&location=${encodeURIComponent(eventDetails.location)}`;

    window.open(googleCalendarUrl, "_blank");
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
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
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-gray-600">
          Your table has been successfully reserved at The Hungry Unicorn
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Reservation Details
          </h2>
          <span className="text-sm font-mono bg-blue-100 text-blue-800 px-3 py-1 rounded">
            #{bookingReference}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Date & Time</h3>
            <p className="text-gray-900">{formatDate(visitDate)}</p>
            <p className="text-gray-900">{formatTime(visitTime)}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Party Size</h3>
            <p className="text-gray-900">
              {partySize} {partySize === 1 ? "guest" : "guests"}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-700 mb-2">Restaurant</h3>
          <p className="text-gray-900 font-medium">The Hungry Unicorn</p>
          <p className="text-gray-600">123 Main Street, City, State 12345</p>
          <p className="text-gray-600">(123) 456-7890</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-4 mb-8">
        <button
          onClick={generateCalendarEvent}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
        >
          Add to Calendar
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={onStartOver}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 font-medium"
          >
            Make Another Booking
          </button>

          <button
            onClick={() => window.print()}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 font-medium"
          >
            Print Confirmation
          </button>
        </div>
      </div>

      {/* Email Confirmation Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              Confirmation Email Sent
            </h4>
            <p className="text-blue-800 text-sm">
              A confirmation email with all the details has been sent to your
              email address. Please check your inbox and spam folder.
            </p>
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
        <h4 className="font-medium text-amber-900 mb-2">
          Important Information
        </h4>
        <ul className="text-amber-800 text-sm space-y-1">
          <li>• Please arrive 10-15 minutes before your reservation time</li>
          <li>• Tables are held for 15 minutes past reservation time</li>
          <li>• For parties of 6 or more, please call to confirm</li>
          <li>• Cancellations must be made at least 2 hours in advance</li>
        </ul>
      </div>

      {/* Contact Information */}
      <div className="text-center border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-900 mb-2">
          Questions about your booking?
        </h4>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-gray-600">
          <a
            href="tel:+1234567890"
            className="flex items-center hover:text-blue-600"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            (123) 456-7890
          </a>
          <a
            href="mailto:bookings@thehungryunicorn.com"
            className="flex items-center hover:text-blue-600"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            bookings@thehungryunicorn.com
          </a>
        </div>
      </div>
    </div>
  );
};
