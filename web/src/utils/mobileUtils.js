// Phase 3A: Touch gesture utilities for enhanced mobile experience
// Simple swipe detection for booking cards

export const useSwipeGesture = (onSwipeLeft, onSwipeRight, threshold = 50) => {
  let startX = 0;
  let startY = 0;
  let endX = 0;
  let endY = 0;

  const handleTouchStart = (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    endX = e.touches[0].clientX;
    endY = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    // Check if horizontal swipe is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > threshold && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < -threshold && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};

// Haptic feedback utility for mobile devices
export const triggerHapticFeedback = (type = "light") => {
  if (navigator.vibrate) {
    switch (type) {
      case "light":
        navigator.vibrate(10);
        break;
      case "medium":
        navigator.vibrate(20);
        break;
      case "heavy":
        navigator.vibrate(50);
        break;
      default:
        navigator.vibrate(10);
    }
  }
};

// Mobile viewport utilities
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export const isTouchDevice = () => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

// Enhanced mobile scroll utilities
export const smoothScrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

export const getViewportHeight = () => {
  return Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0
  );
};

// Mobile keyboard handling
export const handleMobileKeyboard = (element) => {
  let initialViewportHeight = window.innerHeight;

  const handleResize = () => {
    const currentViewportHeight = window.innerHeight;
    const heightDifference = initialViewportHeight - currentViewportHeight;

    // If viewport height decreased significantly, keyboard is likely open
    if (heightDifference > 150) {
      element.style.paddingBottom = `${heightDifference}px`;
    } else {
      element.style.paddingBottom = "0px";
    }
  };

  window.addEventListener("resize", handleResize);

  return () => {
    window.removeEventListener("resize", handleResize);
    element.style.paddingBottom = "0px";
  };
};
