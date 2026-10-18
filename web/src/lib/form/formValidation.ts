export type ErrorMessage = Record<string, string>;

export type RegistrationFormFields = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export type PasswordFields = Pick<RegistrationFormFields, 'password' | 'confirmPassword'>;


export function validateRequiredField(
  value: string,
  fieldName: string,
  newErrors: ErrorMessage,
) {
  if (!value.trim()) {
    newErrors[fieldName] = `${fieldName} is required`;
  }
}

export function validateInputRegistrationFormFields(
  formData: RegistrationFormFields,
  newErrors: ErrorMessage,
) {
  validateRequiredField(formData.firstName, "firstName", newErrors);
  validateRequiredField(formData.lastName, "lastName", newErrors);
  validateRequiredField(formData.username, "username", newErrors);
  validateUsername(newErrors, formData);
  validateEmail(formData.email, newErrors);
  validatePhoneNumber(formData, newErrors);
  validatePassword(formData.password, newErrors);
  validateConfirmPassword(formData, newErrors);
}

function validateUsername(
  newErrors: ErrorMessage,
  formData: RegistrationFormFields,
) {
  if (!newErrors.username && formData.username.length < 3) {
    newErrors.username = "Username must be at least 3 characters";
  }
}

export function validateEmail(email: string, newErrors: ErrorMessage) {
  validateRequiredField(email, "email", newErrors);

  const emailRegex = /\S+@\S+\.\S+/;
  if (!newErrors.email && !emailRegex.test(email)) {
    newErrors.email = "Please enter a valid email address";
  }
}

function validatePhoneNumber(
  formData: RegistrationFormFields,
  newErrors: ErrorMessage,
) {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  if (formData.phone && !phoneRegex.test(formData.phone)) {
    newErrors.phone = "Please enter a valid phone number";
  }
}

export function validatePassword(password: string, newErrors: ErrorMessage) {
  validateRequiredField(password, "password", newErrors);

  const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/

  if (!newErrors.password) {
    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!passwordRegex.test(password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }
  }
}

export function validateConfirmPassword(
  formData: PasswordFields,
  newErrors: ErrorMessage,
) {
  if (!formData.confirmPassword.trim()) {
    newErrors.confirmPassword = "Please confirm your password";
  } else if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = "Passwords do not match";
  }
}
