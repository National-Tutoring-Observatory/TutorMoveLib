import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Router navigation does not reset the scroll position, so moving from a
 * long move page into a session left the reader part-way down the new page.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}
