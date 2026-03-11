# Music Tools

A collection of browser-based tools for musicians. No frameworks, no build steps — just vanilla HTML, CSS, and JavaScript served via a local HTTP server.

## Quick Start

Double-click `start.bat` (Windows) or run:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Project Structure

```
Music_Tools/
├── index.html              # Landing page — links to each tool
├── start.bat               # One-click launcher (Windows)
├── shared/
│   └── css/
│       └── base.css        # Global dark-theme design tokens & reset
├── metronome/              # Metronome tool
│   ├── index.html
│   ├── css/metronome.css
│   └── js/
│       ├── main.js              # Entry point (imports & wires modules)
│       ├── metronome-engine.js  # Web Audio scheduling & playback
│       ├── metronome-ui.js      # DOM bindings & event handlers
│       ├── metronome-worker.js  # Web Worker for timing accuracy
│       ├── sound-library.js     # Click/accent sound definitions
│       └── tempo-presets.js     # Named tempo ranges (Largo, Allegro…)
└── rhythm/                 # Rhythm Imitation Practice tool
    ├── index.html
    ├── css/rhythm.css
    └── js/
        ├── main.js              # Entry point
        ├── rhythm-engine.js     # Playback, recording & scoring logic
        ├── rhythm-ui.js         # DOM bindings & event handlers
        ├── rhythm-worker.js     # Web Worker for timing
        ├── rhythm-patterns.js   # Pattern generation per difficulty
        └── rhythm-notation.js   # SVG/canvas rhythm notation rendering
```

## Tools

### Metronome

Precise tempo keeping with Web Audio API scheduling.

- **BPM range:** 20–600
- **Time signatures:** 2/4, 3/4, 4/4, 5/4, 6/8, 7/8
- **Subdivisions:** quarter, eighth, triplet, sixteenth
- **Features:** tap tempo, multiple click sounds, volume control, tempo marking presets
- **Keyboard shortcuts:** Space (play/stop), arrows (BPM), T (tap), M (mute), 1-4 (subdivision), [ ] (time sig)

### Rhythm Imitation Practice

Ear training tool — listen to a rhythm pattern, then reproduce it by tapping.

- **Difficulty levels:** beginner, intermediate, advanced
- **Configurable:** BPM, time signature (2/4, 3/4, 4/4), number of measures (1–4)
- **Scoring:** per-hit timing accuracy with letter grades
- **Keyboard shortcuts:** Space (start/stop), any key (tap), R (retry), N (next)

## Architecture Notes

- **No dependencies.** Pure vanilla JS with ES modules (`type="module"`).
- **Web Workers** handle timing to avoid jank from main-thread blocking.
- **Web Audio API** provides sample-accurate click scheduling.
- **Shared base CSS** (`shared/css/base.css`) defines a dark theme via CSS custom properties. Each tool adds its own stylesheet on top.
- Each tool is a self-contained directory with its own `index.html`, and can be developed independently.

## Adding a New Tool

1. Create a new directory (e.g., `scales/`) with `index.html`, `css/`, and `js/`.
2. Link `../shared/css/base.css` for consistent theming.
3. Add a card to the root `index.html` tool grid.
