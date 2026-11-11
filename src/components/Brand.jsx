import { Link } from "react-router-dom";

import mark from "../assets/starling-mark.png";
import { flyStarling, preloadStarling } from "./flyStarling.js";

/* Starling's mark and name, at the left of every top bar. The name is the way
   back to the front door from anywhere. `sub` adds the descriptor beside the
   name, for pages with room for it.

   Easter egg: clicking the bird itself sends it flying across the screen
   (see flyStarling.js) instead of going to the front page. */
export default function Brand({ sub = false }) {
  const fly = (e) => {
    e.preventDefault();
    flyStarling(e.currentTarget);
  };
  return (
    <Link className="brand" to="/" aria-label="Starling, the Tutoring Moves Library: back to the front page">
      <img className="brand-mark" src={mark} alt="" width="83" height="56" onClick={fly} onPointerEnter={preloadStarling} />
      <span className="brand-name">Starling</span>
      {sub && <span className="brand-sub">Tutoring Moves Library</span>}
    </Link>
  );
}
