import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { DictionaryProvider } from "./components/Dictionary.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import PrototypeNotice from "./components/PrototypeNotice.jsx";
import Door from "./pages/Door.jsx";
import Grade from "./pages/Grade.jsx";
import Landing from "./pages/Landing.jsx";
import Move from "./pages/Move.jsx";
import Research from "./pages/Research.jsx";
import Session from "./pages/Session.jsx";
import YourSession from "./pages/YourSession.jsx";
import "./styles.css";

// HashRouter, not BrowserRouter: GitHub Pages serves static files with no
// SPA fallback, so a refresh on /mathematics would 404. Hash routes never hit
// the server.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <DictionaryProvider>
      <PrototypeNotice />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Door />} />
        <Route path="/subjects" element={<Landing />} />
        {/* The grades now live on the subject page, so the old grade picker
            sends people there; old links and bookmarks keep working. */}
        <Route path="/mathematics" element={<Navigate to="/subjects" replace />} />
        <Route path="/mathematics/g/:grade" element={<Grade />} />
        <Route path="/mathematics/s/:id" element={<Session />} />
        <Route path="/research" element={<Research />} />
        <Route path="/research/m/:code" element={<Move />} />
        <Route path="/your-session" element={<YourSession />} />
      </Routes>
      </DictionaryProvider>
    </HashRouter>
  </React.StrictMode>
);
