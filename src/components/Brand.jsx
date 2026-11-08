import { Link } from "react-router-dom";

import mark from "../assets/starling-mark.png";

/* Starling's mark and name, at the left of every top bar. It is the way back
   to the front door from anywhere. `sub` adds the descriptor beside the name,
   for pages with room for it. */
export default function Brand({ sub = false }) {
  return (
    <Link className="brand" to="/" aria-label="Starling, the Tutoring Moves Library: back to the front page">
      <img className="brand-mark" src={mark} alt="" width="83" height="56" />
      <span className="brand-name">Starling</span>
      {sub && <span className="brand-sub">Tutoring Moves Library</span>}
    </Link>
  );
}
