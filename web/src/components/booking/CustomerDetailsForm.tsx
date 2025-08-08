import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Validation schema
const customerDetailsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  phone: z.string().optional(),
  specialRequests: z.string().optional(),
  emailConsent: z.boolean(),
  smsConsent: z.boolean(),
});

export type CustomerDetailsFormData = z.infer<typeof customerDetailsSchema>;

interface CustomerDetailsFormProps {
  onSubmit: (data: CustomerDetailsFormData) => void;
  initialData?: Partial<CustomerDetailsFormData>;
  isLoading?: boolean;
}

const titleOptions = [
  { value: "Mr", label: "Mr" },
  { value: "Mrs", label: "Mrs" },
  { value: "Ms", label: "Ms" },
  { value: "Miss", label: "Miss" },
  { value: "Dr", label: "Dr" },
  { value: "Prof", label: "Prof" },
];

const countryOptions = [
  { value: "+1", label: "🇺🇸 +1", flag: "🇺🇸" },
  { value: "+44", label: "🇬🇧 +44", flag: "🇬🇧" },
  { value: "+33", label: "🇫🇷 +33", flag: "🇫🇷" },
  { value: "+49", label: "🇩🇪 +49", flag: "🇩🇪" },
  { value: "+86", label: "🇨🇳 +86", flag: "🇨🇳" },
  { value: "+81", label: "🇯🇵 +81", flag: "🇯🇵" },
  { value: "+91", label: "🇮🇳 +91", flag: "🇮🇳" },
  { value: "+61", label: "🇦🇺 +61", flag: "🇦🇺" },
  { value: "+39", label: "🇮🇹 +39", flag: "🇮🇹" },
  { value: "+34", label: "🇪🇸 +34", flag: "🇪🇸" },
];

export const CustomerDetailsForm: React.FC<CustomerDetailsFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CustomerDetailsFormData>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: {
      title: "",
      firstName: "",
      surname: "",
      email: "",
      mobile: "",
      phone: "",
      specialRequests: "",
      emailConsent: false,
      smsConsent: false,
      ...initialData,
    },
    mode: "onChange",
  });

  const [selectedCountryCode, setSelectedCountryCode] = React.useState("+1");

  const handleFormSubmit = (data: CustomerDetailsFormData) => {
    // Combine country code with mobile number
    const formattedData = {
      ...data,
      mobile: `${selectedCountryCode}${data.mobile.replace(/^\+?\d{1,4}/, "")}`,
    };
    onSubmit(formattedData);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Customer Details
        </h2>
        <p className="text-gray-600">
          Please provide your contact information for the booking.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Title and Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <select
              id="title"
              {...register("title")}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              aria-describedby={errors.title ? "title-error" : undefined}
            >
              <option value="">Select title</option>
              {titleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.title && (
              <p
                id="title-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              {...register("firstName")}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
              aria-describedby={
                errors.firstName ? "firstName-error" : undefined
              }
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p
                id="firstName-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="surname"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Surname <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="surname"
              {...register("surname")}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                errors.surname ? "border-red-500" : "border-gray-300"
              }`}
              aria-describedby={errors.surname ? "surname-error" : undefined}
              placeholder="Enter surname"
            />
            {errors.surname && (
              <p
                id="surname-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.surname.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            {...register("email")}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p
              id="email-error"
              className="mt-1 text-sm text-red-600"
              role="alert"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Mobile and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="mobile"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <select
                value={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
                className="px-3 py-2 border border-r-0 rounded-l-lg border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ minWidth: "100px" }}
              >
                {countryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                id="mobile"
                {...register("mobile")}
                className={`flex-1 px-3 py-2 border rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                  errors.mobile ? "border-red-500" : "border-gray-300"
                }`}
                aria-describedby={errors.mobile ? "mobile-error" : undefined}
                placeholder="Enter mobile number"
              />
            </div>
            {errors.mobile && (
              <p
                id="mobile-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.mobile.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phone"
              {...register("phone")}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              placeholder="Enter alternative phone number"
            />
            {errors.phone && (
              <p
                id="phone-error"
                className="mt-1 text-sm text-red-600"
                role="alert"
              >
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label
            htmlFor="specialRequests"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Special Requests (Optional)
          </label>
          <textarea
            id="specialRequests"
            {...register("specialRequests")}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-vertical"
            placeholder="Any dietary requirements, accessibility needs, or special requests..."
          />
          <p className="mt-1 text-sm text-gray-500">
            Let us know about any allergies, dietary restrictions, or special
            occasions.
          </p>
        </div>

        {/* Marketing Consent */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Marketing Preferences
          </h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="emailConsent"
                {...register("emailConsent")}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <label
                  htmlFor="emailConsent"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Marketing
                </label>
                <p className="text-sm text-gray-500">
                  Receive special offers, new menu items, and restaurant updates
                  via email.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                id="smsConsent"
                {...register("smsConsent")}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <label
                  htmlFor="smsConsent"
                  className="text-sm font-medium text-gray-700"
                >
                  SMS Marketing
                </label>
                <p className="text-sm text-gray-500">
                  Receive booking reminders and special offers via text message.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Continue to Confirmation"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
