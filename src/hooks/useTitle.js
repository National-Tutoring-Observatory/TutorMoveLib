import { useEffect } from "react";

// The browser tab names the page, then Starling: "Grade 6 – Starling".
// With no page name it is Starling's own title.
export default function useTitle(page) {
  useEffect(() => {
    document.title = page ? `${page} – Starling` : "Starling: the Tutoring Moves Library";
  }, [page]);
}
