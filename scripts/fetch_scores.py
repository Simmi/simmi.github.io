import csv
import io
import json
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone

URL = "https://leikir.betra.is/export.php?a=cvs&c=54&l=4887"

req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req) as r:
    content = r.read().decode("utf-8-sig")

reader = csv.DictReader(io.StringIO(content))
totals = defaultdict(lambda: {"points": 0})

for row in reader:
    name = row["user_name"].strip()
    if not name:
        continue
    totals[name]["points"] += int(row["user_points"] or 0)

sorted_users = sorted(totals.items(), key=lambda x: (-x[1]["points"], x[0]))

standings = []
for i, (name, data) in enumerate(sorted_users):
    if i > 0 and data["points"] == sorted_users[i - 1][1]["points"]:
        rank = standings[-1]["rank"]
    else:
        rank = i + 1
    standings.append({"rank": rank, "name": name, "points": data["points"]})

out = {
    "updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "standings": standings,
}

with open("studkenni/data/scores.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

print(f"Wrote {len(standings)} entries to studkenni/data/scores.json")