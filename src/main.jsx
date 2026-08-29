import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop.jsx";
import Door from "./pages/Door.jsx";
import Grade from "./pages/Grade.jsx";
import Landing from "./pages/Landing.jsx";
import Mathematics from "./pages/Mathematics.jsx";
import Move from "./pages/Move.jsx";
import Research from "./pages/Research.jsx";
import Session from "./pages/Session.jsx";
import "./styles.css";

// HashRouter, not BrowserRouter: GitHub Pages serves static files with no
// SPA fallback, so a refresh on /mathematics would 404. Hash routes never hit
// the server.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Door />} />
        <Route path="/subjects" element={<Landing />} />
        <Route path="/mathematics" element={<Mathematics />} />
        <Route path="/mathematics/g/:grade" element={<Grade />} />
        <Route path="/mathematics/s/:id" element={<Session />} />
        <Route path="/research" element={<Research />} />
        <Route path="/research/m/:code" element={<Move />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
