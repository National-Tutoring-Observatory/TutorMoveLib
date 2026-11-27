# Starling

**Starling** is the Tutoring Moves Library, part of the
National Tutoring Observatory (NTO).

A searchable library of real tutoring exemplars, each labelled with the teaching
move it demonstrates — and each able to explain, in plain language, why it was
labelled that way.

Built for the NSF CAREER project *Improving Educators' Trust in and Effective
Uses of Predictive Learning Analytics* (NSF DRL-2237593), using transcripts from
the National Tutoring Observatory.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

| Command | What it does |
| --- | --- |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run data` | Rebuild `src/data/corpus.json` from the source workbook |
| `npm run dictionary` | Rebuild `src/data/dictionary.json` from the taxonomy definitions |

## The corpus

The transcripts and their move labels are real: they come from the coded
Eedi workbook, `source/codedTranscript_Eedi.xlsx` (one sheet,
`tutoring_transcripts_combined`, one row per message). A script turns that
workbook into `src/data/corpus.json`, the file the site reads. That file is
committed, so the site builds without the spreadsheet. Rebuild it only when
the transcripts or the explanation copy change:

```bash
npm run data
```

The pipeline lives in `pipeline/`. It:

- reads the workbook's OOXML parts directly (openpyxl cannot open it — it has a
  dangling `xl/drawings/drawing1.xml` relationship);
- restores fractions the spreadsheet turned into dates (a typed `2/3` is stored
  as a date and is put back as `2/3`);
- takes each session's question text and answer options from
  `source/dq-question-metadata.csv` and its strand from
  `source/dialogue-subjects.csv`;
- **de-identifies** every transcript, replacing all 27 personal names with
  stable pseudonyms, and asserts none survive;
- attaches an explanation to each of the 1,301 classified tutor turns — 30
  written by hand for the two worked sessions, the rest assembled from
  per-move templates plus cue phrases actually present in the text. The
  explanations are the only text on a session page that does not come from the
  source data;
- asserts the workbook still matches its known shape (76 sessions, 2,665
  messages, 1,597 tutor / 1,068 student) so a silent data change cannot slip
  through.

Three things about the data worth knowing:

- **73 of the 76 sessions are shown.** Sessions `258`, `4069` and `5642` are
  held back, each with its reason recorded in `pipeline/questions.py`. The site
  therefore carries 2,592 messages (1,555 tutor / 1,037 student).
- **Only tutor turns carry labels.** All student turns are unlabelled by
  design; they are context, not classification targets. 254 tutor turns
  (greetings, filler) are unlabelled too.
- **The labels are the annotators' agreed labels.** The workbook holds a
  primary and, for 137 of the shown turns, a secondary agreed label; both are
  shown. It does not record disagreements between annotators, so no turn is
  marked as contested.

## The dictionary

The 29 moves of the taxonomy are available anywhere in the site as a sidebar,
opened from the **Dictionary** button in the top bar or the third door on the
landing page. Every move is listed under its part with its definition and
example quotations. The search box at the top filters by name, and if you
describe a situation instead ("my student is stuck and won't try the next
step") it suggests the moves that fit, with a one-line tip for each.

Move names elsewhere in the site (the tags on a session, the taxonomy list)
are underlined; hovering or focusing one shows the definition in a small card
at the top left, and clicking it opens the dictionary at that entry.

The dictionary is built by a script from the taxonomy's own definitions, not
written by hand in the app. `pipeline/dictionary_entries.json` holds the moves as
parsed from the taxonomy's definitions sheet, including the near-miss /
near-hit / non-example columns that are kept but not shown. Edit it, then:

```bash
npm run dictionary        # writes src/data/dictionary.json
```

The situation matcher lives in `src/data/askMoves.js`: a hand-written list of
cue phrases and a tip per move, plus word overlap with the definitions.

## Deploying

Pushing to `main` builds and publishes to GitHub Pages via
`.github/workflows/deploy.yml`. In the repo settings, set **Pages → Source** to
**GitHub Actions**.

Two choices already account for Pages:

- `base: "./"` in `vite.config.js`, so the build works at any path — a project
  site (`user.github.io/repo/`) or a user site (`user.github.io/`).
- `HashRouter`, because Pages serves static files with no SPA fallback. Without
  it, refreshing on `/mathematics` would 404.
