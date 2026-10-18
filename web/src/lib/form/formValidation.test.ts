import { describe, expect, it } from "vitest";
import {
  type ErrorMessage,
  type RegistrationFormFields,
  validateConfirmPassword,
  validateEmail,
  validateInputRegistrationFormFields,
  validatePassword,
  validateRequiredField,
} from "./formValidation";

function registrationData(
  overrides: Partial<RegistrationFormFields> = {},
): RegistrationFormFields {
  return {
    firstName: "Alice",
    lastName: "Diallo",
    email: "alice@example.com",
    phone: "+1 (555) 123-4567",
    password: "StrongPass1",
    confirmPassword: "StrongPass1",
    username: "alice",
    ...overrides,
  };
}

describe("validateRequiredField", () => {
  it.each(["", "   ", "\t\n"])('marks "%s" as required', (value) => {
    const errors: ErrorMessage = {};

    validateRequiredField(value, "displayName", errors);

    expect(errors).toEqual({ displayName: "displayName is required" });
  });

  it.each(["Alice", " Alice "])('accepts the non-empty value "%s"', (value) => {
    const errors: ErrorMessage = {};

    validateRequiredField(value, "displayName", errors);

    expect(errors).toEqual({});
  });

  it("does not remove an existing error when the value is non-empty", () => {
    const errors: ErrorMessage = { displayName: "Previous error" };

    validateRequiredField("Alice", "displayName", errors);

    expect(errors.displayName).toBe("Previous error");
  });
});

describe("validateEmail", () => {
  it.each(["alice@example.com", "alice+booking@example.co.uk"])(
    "accepts a valid email: %s",
    (email) => {
      const errors: ErrorMessage = {};

      validateEmail(email, errors);

      expect(errors).toEqual({});
    },
  );

  it.each(["", "   "])('reports a required error for "%s"', (email) => {
    const errors: ErrorMessage = {};

    validateEmail(email, errors);

    expect(errors).toEqual({ email: "email is required" });
  });

  it.each([
    "alice",
    "alice@",
    "@example.com",
    "alice@example",
    "alice @example.com",
  ])("rejects a malformed email: %s", (email) => {
    const errors: ErrorMessage = {};

    validateEmail(email, errors);

    expect(errors).toEqual({ email: "Please enter a valid email address" });
  });

  it("does not replace an existing email error with a format error", () => {
    const errors: ErrorMessage = { email: "Email is unavailable" };

    validateEmail("not-an-email", errors);

    expect(errors.email).toBe("Email is unavailable");
  });
});

describe("validatePassword", () => {
  it("reports an empty or whitespace-only password as required", () => {
    for (const password of ["", "   "]) {
      const errors: ErrorMessage = {};

      validatePassword(password, errors);

      expect(errors).toEqual({ password: "password is required" });
    }
  });

  it("accepts a password with exactly eight characters and all required character classes", () => {
    const errors: ErrorMessage = {};

    validatePassword("Abcdef1!", errors);

    expect(errors).toEqual({});
  });

  it("rejects a password shorter than eight characters", () => {
    const errors: ErrorMessage = {};

    validatePassword("Abc1234", errors);

    expect(errors).toEqual({
      password: "Password must be at least 8 characters",
    });
  });

  it.each(["longpassword", "LONGPASSWORD1", "LongPassword"])(
    "requires uppercase, lowercase, and a number in %s",
    (password) => {
      const errors: ErrorMessage = {};

      validatePassword(password, errors);

      expect(errors).toEqual({
        password:
          "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      });
    },
  );

  it("does not replace an existing password error", () => {
    const errors: ErrorMessage = { password: "Password was compromised" };

    validatePassword("invalid", errors);

    expect(errors.password).toBe("Password was compromised");
  });
});

describe("validateConfirmPassword", () => {
  it.each(["", "   "])(
    'requires confirmation when it is "%s"',
    (confirmPassword) => {
      const errors: ErrorMessage = {};

      validateConfirmPassword(
        { password: "StrongPass1", confirmPassword },
        errors,
      );

      expect(errors).toEqual({
        confirmPassword: "Please confirm your password",
      });
    },
  );

  it("reports a mismatch", () => {
    const errors: ErrorMessage = {};

    validateConfirmPassword(
      { password: "StrongPass1", confirmPassword: "StrongPass2" },
      errors,
    );

    expect(errors).toEqual({ confirmPassword: "Passwords do not match" });
  });

  it("accepts matching passwords", () => {
    const errors: ErrorMessage = {};

    validateConfirmPassword(
      { password: "StrongPass1", confirmPassword: "StrongPass1" },
      errors,
    );

    expect(errors).toEqual({});
  });
});

describe("validateInputRegistrationFormFields", () => {
  it("accepts a complete valid registration", () => {
    const errors: ErrorMessage = {};

    validateInputRegistrationFormFields(registrationData(), errors);

    expect(errors).toEqual({});
  });

  it.each([
    ["firstName", "firstName is required"],
    ["lastName", "lastName is required"],
    ["username", "username is required"],
    ["email", "email is required"],
    ["password", "password is required"],
    ["confirmPassword", "Please confirm your password"],
  ] as const)("reports an empty required field: %s", (field, message) => {
    const errors: ErrorMessage = {};
    const data = registrationData({ [field]: "" });

    validateInputRegistrationFormFields(data, errors);

    expect(errors[field]).toBe(message);
  });

  it("treats whitespace-only names and username as missing", () => {
    const errors: ErrorMessage = {};

    validateInputRegistrationFormFields(
      registrationData({ firstName: " ", lastName: "\t", username: " " }),
      errors,
    );

    expect(errors.firstName).toBe("firstName is required");
    expect(errors.lastName).toBe("lastName is required");
    expect(errors.username).toBe("username is required");
  });

  it.each(["a", "ab"])(
    "rejects a username shorter than three characters: %s",
    (username) => {
      const errors: ErrorMessage = {};

      validateInputRegistrationFormFields(
        registrationData({ username }),
        errors,
      );

      expect(errors.username).toBe("Username must be at least 3 characters");
    },
  );

  it("accepts a username at the three-character minimum", () => {
    const errors: ErrorMessage = {};

    validateInputRegistrationFormFields(
      registrationData({ username: "abc" }),
      errors,
    );

    expect(errors.username).toBeUndefined();
  });

  it("allows an omitted optional phone number", () => {
    const errors: ErrorMessage = {};

    validateInputRegistrationFormFields(
      registrationData({ phone: "" }),
      errors,
    );

    expect(errors.phone).toBeUndefined();
  });

  it.each(["123456789", "555-CALL-NOW"])(
    "rejects an invalid non-empty phone number: %s",
    (phone) => {
      const errors: ErrorMessage = {};

      validateInputRegistrationFormFields(registrationData({ phone }), errors);

      expect(errors.phone).toBe("Please enter a valid phone number");
    },
  );

  it.each(["5551234567", "+1 (555) 123-4567"])(
    "accepts a phone number in the supported format: %s",
    (phone) => {
      const errors: ErrorMessage = {};

      validateInputRegistrationFormFields(registrationData({ phone }), errors);

      expect(errors.phone).toBeUndefined();
    },
  );

  it("reports independent errors together", () => {
    const errors: ErrorMessage = {};

    validateInputRegistrationFormFields(
      registrationData({
        firstName: "",
        username: "ab",
        email: "bad-email",
        phone: "555-CALL-NOW",
        password: "short",
        confirmPassword: "different",
      }),
      errors,
    );

    expect(errors).toMatchObject({
      firstName: "firstName is required",
      username: "Username must be at least 3 characters",
      email: "Please enter a valid email address",
      phone: "Please enter a valid phone number",
      password: "Password must be at least 8 characters",
      confirmPassword: "Passwords do not match",
    });
  });
});
