import React from "react";
import { Link, useLocation } from "react-router-dom";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  showBreadcrumbs?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  breadcrumbs,
  showBreadcrumbs = true,
  maxWidth = "lg",
  className = "",
}) => {
  const location = useLocation();

  const maxWidthClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-none",
  };

  // Auto-generate breadcrumbs based on route if not provided
  const autoBreadcrumbs = React.useMemo(() => {
    if (breadcrumbs) return breadcrumbs;

    const pathSegments = location.pathname.split("/").filter(Boolean);
    const crumbs: Array<{ label: string; href?: string }> = [
      { label: "Home", href: "/" },
    ];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Format segment name
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      if (isLast) {
        crumbs.push({ label });
      } else {
        crumbs.push({ label, href: currentPath });
      }
    });

    return crumbs.length > 1 ? crumbs : [];
  }, [location.pathname, breadcrumbs]);

  return (
    <div
      className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}
    >
      {/* Breadcrumbs */}
      {showBreadcrumbs && autoBreadcrumbs.length > 0 && (
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            {autoBreadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <svg
                    className="h-4 w-4 text-gray-400 mx-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-medium">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Page Title */}
      {title && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
      )}

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};
