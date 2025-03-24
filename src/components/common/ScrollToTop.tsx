import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls the window to the top whenever
 * the route changes. This ensures challenges always open at the top of the page.
 */
export function ScrollToTop() {
  const { pathname, hash, search } = useLocation();

  useEffect(() => {
    // Scroll to top when the route changes, including query params and hash changes
    // This ensures all navigation, even within challenges, scrolls to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto' // Use 'auto' instead of 'smooth' for immediate scrolling
    });
  }, [pathname, hash, search]); // React to all URL changes

  return null; // This component doesn't render anything
}

/**
 * Custom hook that can be used by individual components to scroll to top
 * This is particularly useful for challenges with internal navigation
 * @param dependencies - Array of dependencies that trigger scrolling when changed
 */
export function useScrollToTop(dependencies: any[] = []) {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });
  }, dependencies);
}

export default ScrollToTop;
