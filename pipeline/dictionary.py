#!/usr/bin/env python3
"""Write src/data/dictionary.json, the move definitions the site's dictionary
sidebar reads.

    npm run dictionary      (or: python3 pipeline/dictionary.py)

pipeline/dictionary_entries.json holds the 29 moves parsed from the taxonomy's
definitions sheet: definition, examples, and the near-miss / near-hit /
non-example columns. Only definition and examples are shipped; the rest stay
here for when they are wanted.
"""
import json
from pathlib import Path

HERE = Path(__file__).parent
OUT = HERE.parent / "src" / "data" / "dictionary.json"
SHIPPED = ("code", "name", "cat", "def", "ex", "rung")

entries = json.loads((HERE / "dictionary_entries.json").read_text(encoding="utf-8"))
shipped = [{k: e[k] for k in SHIPPED} for e in entries]
OUT.write_text(json.dumps(shipped, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(f"wrote {OUT.relative_to(HERE.parent)}: {len(shipped)} entries")
