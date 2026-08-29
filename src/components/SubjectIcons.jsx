// Simple stroke icons, drawn in currentColor so each card's colour carries
// straight through to its icon.
const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const EnglishLanguageArts = () => (
  <svg {...base}>
    <path d="M12 6.5C10.4 5 8.3 4.4 4.5 4.4v13c3.8 0 5.9.6 7.5 2.1 1.6-1.5 3.7-2.1 7.5-2.1v-13C15.7 4.4 13.6 5 12 6.5Z" />
    <path d="M12 6.5v13" />
  </svg>
);

export const Mathematics = () => (
  <svg {...base}>
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <path d="M7 8.5h4M9 6.5v4M13.5 8.5h3.5M13.5 15.5h3.5M7 14l3 3M10 14l-3 3" />
  </svg>
);

export const Science = () => (
  <svg {...base}>
    <path d="M9.5 3v6.2L4.8 17a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3l-4.7-7.8V3" />
    <path d="M8 3h8M7.2 14h9.6" />
  </svg>
);

export const SocialStudies = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3Z" />
  </svg>
);

export const WorldLanguages = () => (
  <svg {...base}>
    <path d="M3 5.5h9M7.5 3.5v2M9.8 5.5c-.6 4-3 6.6-6.8 8" />
    <path d="M5.5 9.8c1.4 2.2 3.4 3.6 5.8 4.4M13 20.5l4-10 4 10M14.6 17h4.8" />
  </svg>
);

export const ComputerScience = () => (
  <svg {...base}>
    <rect x="2.5" y="4" width="19" height="13.5" rx="2" />
    <path d="M7 9l2.5 2.2L7 13.4M12 13.5h5M9 21h6" />
  </svg>
);

export const Health = () => (
  <svg {...base}>
    <path d="M12 20.5S3.5 15.6 3.5 9.6A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.5 2.6c0 6-8.5 10.9-8.5 10.9Z" />
    <path d="M7 12h2.5l1.2-2 1.8 3.6 1.2-1.6H17" />
  </svg>
);

export const PhysicalEducation = () => (
  <svg {...base}>
    <circle cx="14.5" cy="4.6" r="1.9" />
    <path d="M6 21l3.2-5.4 3.1-1.7.9-4.4-3.6 1.9-1.5 3M13.2 9.5l3.4 2.2 1.1 4.2M18.4 21l-1.4-4.6" />
  </svg>
);

export const Other = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.2 8.8-1.9 4.5-4.5 1.9 1.9-4.5 4.5-1.9Z" />
  </svg>
);
