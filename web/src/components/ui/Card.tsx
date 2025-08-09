import React from "react";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  padding?: "sm" | "md" | "lg" | "none";
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = "md",
  className = "",
}) => {
  const baseClasses = "rounded-lg bg-white";

  const variants = {
    default: "shadow-sm border border-gray-200",
    elevated: "shadow-lg border border-gray-200",
    outlined: "border-2 border-gray-300",
  };

  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${className}`;

  return <div className={classes}>{children}</div>;
};
