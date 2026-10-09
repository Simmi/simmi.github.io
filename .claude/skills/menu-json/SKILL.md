---
name: menu-json
description: Convert a pasted weekly cafeteria menu (Icelandic text, Mon-Fri blocks) into the "menu" JSON array used by our app. Use whenever the user pastes weekly menu text or says "next week's menu".
---

# Weekly menu → JSON

## Input
Raw Icelandic text for one week. Days are separated by divider lines of dashes
(`--`, `---`, `-----`, any length). Blocks appear in order Monday to Friday.
Each dish is: a name line, then a description line, then optionally an
"Ofnæmisvaldar: ..." line. Blank lines may be scattered anywhere.

## Output
Only a JSON fragment, in this exact shape, one object per day:

"menu": [
{
"date": "DD/MM/YYYY",
"cafeteria": "root",
"items": "Dish 1\nDish 2\nDish 3"
}
],

## Rules
- Keep ONLY the dish name lines, in the original order (soup first, as given).
- Drop every description line and every "Ofnæmisvaldar:" line.
- Keep names verbatim: same wording, punctuation, dashes and any "(V)" tag.
  Do not translate or "fix" Icelandic.
- Trim trailing whitespace and strip invisible characters (soft hyphens U+00AD,
  zero-width spaces, non-breaking spaces) from names.
- Dessert or extra items (e.g. a cake) count as normal items; include them.
- Items are joined with a literal `\n` inside a single JSON string.
- `cafeteria` is always "root".
- Dates are DD/MM/YYYY, Monday to Friday, continuing directly from the previous
  week's Friday. If the start date isn't stated or obvious from the existing
  data file, ask for it rather than guessing.
- Days can have 3-5 items; don't pad or merge.
- Append the new week to menu object in data/calendar.json  and delete any old weeks that are no longer relevant (e.g. past weeks). The app only shows the current week and the next week.

## Checks before answering
- Exactly 5 day blocks (if not, flag it).
- No "Ofnæmisvaldar" text in the output.
- Dates are consecutive weekdays.