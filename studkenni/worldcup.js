'use strict';

const WORLDCUP_IMAGE_2 = "https://digitalhub.fifa.com/transform/ac004beb-13cb-4cb9-923b-dc5f030eb34f/Detail-Image-03_3200x1800?&io=transform:fill,width:1366&quality=75";
const WORLDCUP_IMAGE = "images/events/wc_2.jpg";
const WORLDCUP_IMAGE_3 = "images/events/wc_1.png";

async function getWorldCupStandingsPanel() {
  try {
    const scores = await fetch('data/scores.json').then(r => r.json());
    if (!scores.standings?.length) return null;
    const rows = scores.standings.slice(0, 12);
    return `
      <div class="event-minor-graphic">
        <img class="event-minor-img" src="${WORLDCUP_IMAGE}" alt="HM 2026">
      </div>
      <div class="event-minor-info event-minor-info--menu">
        <div class="event-label">⚽ Staðan í tippleiknum</div>
        <div class="standings-list">
          ${rows.map(r => `
            <div class="standings-row">
              <span class="standings-rank">${r.rank}</span>
              <span class="standings-name">${r.name}</span>
              <span class="standings-pts">${r.points}</span>
            </div>`).join('')}
          ${scores.standings.length > 12 ? `<div class="standings-more">+ ${scores.standings.length - 12} fleiri</div>` : ''}
        </div>
      </div>`;
  } catch {
    return null;
  }
}

async function getWorldCupHighlight() {
  const now  = new Date();
  const dd   = String(now.getDate()).padStart(2, '0');
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = String(now.getFullYear());
  const today = `${dd}/${mm}/${yyyy}`;

  try {
    const { matches } = await fetch('data/worldcup_2026.json').then(r => r.json());
    const todayMatches = matches.filter(m => m.date === today);
    if (todayMatches.length === 0) return null;

    const text = todayMatches
      .map(m => `${m.time}  ${m.team1} - ${m.team2}`)
      .join('\n');

    return {
      date:  today,
      title: 'Leikir dagsins',
      text,
      image: WORLDCUP_IMAGE_2,
    };
  } catch {
    return null;
  }
}