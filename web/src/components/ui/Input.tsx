import React ,{useState} from "react";
import "./Input.css";

const Input = ({
  type = "text",
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = "",
  showPasswordToggle = false,
  ...props
}) => {
  const[passwordVisible,setPasswordVisible] = useState(false);
  const isPasswordField = type=="password";
  const inputType = isPasswordField && showPasswordToggle && passwordVisible ? "text" : type;
  const inputClasses = `input ${error ? "input-error" : ""} ${className}`;


  return (
    <div className="input-group">
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
        <div className = "input-wrapper">
          <input
            type={inputType}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={inputClasses}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${name}-error` : undefined}
            {...props}
          />
          {isPasswordField && showPasswordToggle && (
            <button
              type="button"
              className="password-toggle"
              onClick={()=> setPasswordVisible((visible)=>!visible)}
              disabled={disabled}
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              aria-pressed={passwordVisible}
            >
              {passwordVisible ? "Hide" : "Show"}
            </button>
          )}
        </div>  
      {error && (
        <span id={`${name}-error`} className="input-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
