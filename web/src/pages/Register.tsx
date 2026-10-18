import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import "./Register.css";
import {
  type RegistrationFormFields,
  type ErrorMessage,
  validateInputRegistrationFormFields,
} from "../lib/form/formValidation";

const Register = () => {
  const [formData, setFormData] = useState<RegistrationFormFields>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ErrorMessage>({});
  const [isLoading, setIsLoading] = useState(false);

  const { register, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors: ErrorMessage = {};
    validateInputRegistrationFormFields(formData, newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
      });

      // Navigate to home after successful registration
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Registration error:", error);
      // Error is handled by AuthContext and displayed via authError
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Join Our Restaurant Network</h1>
          <p>Create your account to start booking tables</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          {authError && (
            <div className="error-banner" role="alert">
              {authError}
            </div>
          )}

          <div className="form-row">
            <Input
              type="text"
              name="firstName"
              label="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter your first name"
              required
              error={errors.firstName}
              disabled={isLoading}
            />
            <Input
              type="text"
              name="lastName"
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter your last name"
              required
              error={errors.lastName}
              disabled={isLoading}
            />
          </div>

          <Input
            type="text"
            name="username"
            label="Username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Choose a username"
            required
            error={errors.username}
            disabled={isLoading}
          />

          <Input
            type="email"
            name="email"
            label="Email Address"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            required
            error={errors.email}
            disabled={isLoading}
          />

          <Input
            type="tel"
            name="phone"
            label="Phone Number"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number (optional)"
            error={errors.phone}
            disabled={isLoading}
          />

          <Input
            type="password"
            showPasswordToggle
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Create a strong password"
            required
            error={errors.password}
            disabled={isLoading}
          />

          <Input
            type="password"
            showPasswordToggle
            name="confirmPassword"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            required
            error={errors.confirmPassword}
            disabled={isLoading}
          />

          <div className="form-actions">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="register-button"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>

          <div className="form-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </form>

        <div className="back-to-home">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
