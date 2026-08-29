import {
  ComputerScience,
  EnglishLanguageArts,
  Health,
  Mathematics,
  Other,
  PhysicalEducation,
  Science,
  SocialStudies,
  WorldLanguages,
} from "../components/SubjectIcons.jsx";

// The nine subject areas, each with its own colour. `wash` and `line` are
// light derivations of `ink`, used for the card surface and its border.
//
// Only Mathematics is built. The rest are shown on purpose — the advisory
// board should see the intended shape — but they are visibly inert.
export const subjects = [
  {
    id: "english-language-arts",
    blurb: "Reading, writing, speaking and listening across genres.",
    name: "English Language Arts",
    tint: { ink: "#c2185b", wash: "#fdf0f5", line: "#f3cbdc" },
    icon: EnglishLanguageArts,
    available: false,
  },
  {
    id: "math",
    blurb: "Number and place value, operations, ratio, percentages and algebra.",
    name: "Math",
    tint: { ink: "#4527a0", wash: "#f1eefb", line: "#d2c7ed" },
    icon: Mathematics,
    available: true,
    path: "/mathematics",
  },
  {
    id: "science",
    blurb: "Investigation and explanation across physical, life and earth science.",
    name: "Science",
    tint: { ink: "#1a237e", wash: "#edeef7", line: "#c5c8e4" },
    icon: Science,
    available: false,
  },
  {
    id: "social-studies",
    blurb: "History, geography, civics and economics.",
    name: "Social Studies",
    tint: { ink: "#1976d2", wash: "#edf4fc", line: "#c3dcf5" },
    icon: SocialStudies,
    available: false,
  },
  {
    id: "world-languages",
    blurb: "Communication and culture in languages beyond English.",
    name: "World Languages",
    tint: { ink: "#00796b", wash: "#e9f4f2", line: "#b7dbd5" },
    icon: WorldLanguages,
    available: false,
  },
  {
    id: "computer-science",
    blurb: "Computational thinking, data, networks and digital citizenship.",
    name: "Computer Science",
    tint: { ink: "#827717", wash: "#f8f6e8", line: "#e0dbb4" },
    icon: ComputerScience,
    available: false,
  },
  {
    id: "health",
    blurb: "Wellbeing, safety and healthy decision-making.",
    name: "Health",
    tint: { ink: "#7b1fa2", wash: "#f7effa", line: "#e0c6eb" },
    icon: Health,
    available: false,
  },
  {
    id: "physical-education",
    blurb: "Movement skills, fitness and lifelong activity.",
    name: "Physical Education",
    tint: { ink: "#1565c0", wash: "#ecf3fb", line: "#c0d8f2" },
    icon: PhysicalEducation,
    available: false,
  },
  {
    id: "other",
    blurb: "Early learning foundations across every domain.",
    name: "Other",
    tint: { ink: "#2e7d32", wash: "#edf5ee", line: "#c3dec5" },
    icon: Other,
    available: false,
  },
];
