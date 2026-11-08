import nto from "../assets/logo.png";

/* The foot of every inner page: Starling named as part of the National
   Tutoring Observatory, with the observatory's logo and where the data is
   from. One line on a laptop, so it never crowds the page above it. */
export default function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="site-foot-inner">
        <img className="site-foot-logo" src={nto} alt="National Tutoring Observatory" />
        <p>
          <b>Starling</b> is part of the National Tutoring Observatory.{" "}
          Every tutoring session is de-identified, from Eedi.
        </p>
      </div>
    </footer>
  );
}
