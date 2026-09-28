# Tutoring Moves Library

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
| `npm run data` | Regenerate `src/data/corpus.json` from the source workbook |
| `npm run dictionary` | Regenerate `src/data/dictionary.json` from the taxonomy definitions |

## The corpus

`src/data/corpus.json` is generated and committed, so the site builds without
the source spreadsheet. Regenerate it only when the transcripts or the
explanation copy change:

```bash
npm run data
```

The pipeline lives in `pipeline/` and reads the consensus workbook from
`source/codedTranscript_Eedi.xlsx`. It:

- reads the OOXML parts directly (openpyxl cannot open that workbook — it has a
  dangling `xl/drawings/drawing1.xml` relationship);
- **de-identifies** every transcript, replacing all 27 personal names with
  stable pseudonyms, and asserts none survive;
- attaches an explanation to each of the 344 classified tutor turns — 40 written
  by hand for the two worked sessions, the rest generated from per-move
  templates plus cue phrases actually present in the text;
- asserts the corpus still matches its known shape (668 messages, 402 tutor /
  266 student, 82 contested) so a silent data change cannot slip through.

Two things about the data worth knowing:

- **Only tutor turns carry labels.** All 266 student turns are unlabelled by
  design; they are context, not classification targets.
- **24% of labelled tutor turns are contested** — two trained annotators
  disagreed and never settled it, most often `STRATEGIZING` vs
  `EXPLAINING_PROCEDURAL` (16 times). The interface shows both readings rather
  than picking one and looking certain.

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

The data is generated. `pipeline/dictionary_entries.json` holds the moves as
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
