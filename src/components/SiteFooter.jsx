import nto from "../assets/logo.png";
import award from "../assets/nsf-career-award.png";

/* The funders' acknowledgement, shared by this footer and the front page's. */
export function FundingNote() {
  return (
    <>
      This material is based upon initial work completed under National Science
      Foundation Grant No. 2321499, support from the Gates Foundation and the
      Chan Zuckerberg Initiative, and under NSF Grant No. 2237593. Any opinions,
      findings, and conclusions or recommendations expressed in this material are
      those of the authors and do not necessarily reflect the views of the funders.
    </>
  );
}

/* The foot of every inner page: Starling named as part of the National
   Tutoring Observatory, with the observatory's logo and where the data is
   from, then the NSF CAREER award and the funding acknowledgement. */
export default function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="site-foot-inner">
        <div className="site-foot-logos">
          <img className="site-foot-logo" src={nto} alt="National Tutoring Observatory" />
          <img
            className="site-foot-award"
            src={award}
            alt="NSF Faculty Early Career Development Program (CAREER) Award"
          />
        </div>
        <div className="site-foot-text">
          <p>
            <b>Starling</b> is part of the National Tutoring Observatory.{" "}
            Every tutoring session is de-identified, from Eedi.
          </p>
          <p className="site-foot-fund">
            <FundingNote />
          </p>
        </div>
      </div>
    </footer>
  );
}
