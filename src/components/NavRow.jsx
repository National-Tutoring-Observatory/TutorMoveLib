import { Link } from "react-router-dom";

/** Back on the left, previous / next on the right. */
export default function NavRow({ back, prev, next }) {
  return (
    <div className="navrow">
      <Link className="navbtn back" to={back.to}>
        <span className="chev">←</span> {back.label}
      </Link>

      {(prev || next) && (
        <div className="navpair">
          {prev ? (
            <Link className="navbtn" to={prev.to} title={prev.label}>
              <span className="chev">←</span>
              <span className="navlabel">{prev.label}</span>
            </Link>
          ) : (
            <span className="navbtn disabled">
              <span className="chev">←</span>
              <span className="navlabel">First</span>
            </span>
          )}
          {next ? (
            <Link className="navbtn" to={next.to} title={next.label}>
              <span className="navlabel">{next.label}</span>
              <span className="chev">→</span>
            </Link>
          ) : (
            <span className="navbtn disabled">
              <span className="navlabel">Last</span>
              <span className="chev">→</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
