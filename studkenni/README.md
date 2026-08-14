# Stuðkenni

TV display app for Auðkenni: rotates through birthday, highlight, event, and default screens, plus a World Cup guessing standings view.

This is a static site (HTML/CSS/JS) that loads its data via `fetch()` from the JSON files in `data/`. Because of that, it must be served over HTTP — opening `index.html` directly in a browser (`file://`) will fail to load the data due to CORS restrictions.

## Running locally

From the `studkenni` directory, start any static file server, for example:

```bash
cd studkenni
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

Alternatively, with Node.js installed:

```bash
cd studkenni
npx serve .
```

or with the VS Code "Live Server" extension: right-click `index.html` → **Open with Live Server**.

## Data

- `data/calendar.json` — people, events, highlights, cafeterias, menu (dates in `DD/MM/YYYY` format)
- `data/scores.json` — World Cup guess scores
- `data/worldcup_2026.json` — World Cup 2026 match data

Edit these files and refresh the browser to see changes — no build step is required.
