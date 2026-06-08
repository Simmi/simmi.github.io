'use strict';

const WORLDCUP_IMAGE = "https://digitalhub.fifa.com/transform/ac004beb-13cb-4cb9-923b-dc5f030eb34f/Detail-Image-03_3200x1800?&io=transform:fill,width:1366&quality=75";

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
      image: WORLDCUP_IMAGE,
    };
  } catch {
    return null;
  }
}