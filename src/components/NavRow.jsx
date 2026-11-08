import { Link } from "react-router-dom";

/** Back on the left, previous / next on the right. */
export default function NavRow({ back, prev, next }) {
  return (
    <div className="navrow">
      <Link className="navbtn back" to={back.to}>
        <span className="chev" aria-hidden="true">←</span> {back.label}
      </Link>

      {(prev || next) && (
        <div className="navpair">
          {prev ? (
            <Link className="navbtn" to={prev.to} title={prev.label} aria-label={`Previous: ${prev.label}`}>
              <span className="chev" aria-hidden="true">←</span>
              <span className="navlabel">{prev.label}</span>
            </Link>
          ) : (
            <span className="navbtn disabled" aria-disabled="true">
              <span className="chev" aria-hidden="true">←</span>
              <span className="navlabel">First</span>
            </span>
          )}
          {next ? (
            <Link className="navbtn" to={next.to} title={next.label} aria-label={`Next: ${next.label}`}>
              <span className="navlabel">{next.label}</span>
              <span className="chev" aria-hidden="true">→</span>
            </Link>
          ) : (
            <span className="navbtn disabled" aria-disabled="true">
              <span className="navlabel">Last</span>
              <span className="chev" aria-hidden="true">→</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
