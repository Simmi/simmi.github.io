'use strict';

const FACT_ICONS  = ['🎈', '🌟', '🎯', '🚀', '💫'];
const MONTHS      = ['janúar','febrúar','mars','apríl','maí','júní',
                     'júlí','ágúst','september','október','nóvember','desember'];
const CONF_COLORS = ['#FF6B6B','#FECA57','#48DBFB','#C56CF0','#FF9F43',
                     '#55EFC4','#FD79A8','#54A0FF'];

/* ── Date utilities ─────────────────────────────────────── */

function toMMDD(d) {
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Converts a DD/MM/YYYY birthday string to MM-DD for date comparison.
function birthdayToMMDD(birthday) {
  const [dd, mm] = birthday.split('/');
  return `${mm}-${dd}`;
}

function prettyDate(birthday) {
  const [dd, mm] = birthday.split('/').map(Number);
  return `${dd}. ${MONTHS[mm - 1]} `;
}

// Returns the set of MM-DD strings to check for birthdays.
// On Mondays we also include last Saturday and Sunday so
// weekend birthdays get their moment on the office TVs.
function getRelevantDates() {
  const today = new Date();
  const dates  = [toMMDD(today)];
  if (today.getDay() === 1) {
    const sun = new Date(today); sun.setDate(today.getDate() - 1);
    const sat = new Date(today); sat.setDate(today.getDate() - 2);
    dates.push(toMMDD(sun), toMMDD(sat));
  }
  return dates;
}

/* ── Confetti ─────────────────────────────────────────────── */

function makeConfetti(canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let raf;
  let running = false;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function spawn(startY) {
    const w = Math.random() * 11 + 5;
    return {
      x:        Math.random() * canvas.width,
      y:        startY,
      w,
      h:        w * (Math.random() * 0.4 + 0.3),
      color:    CONF_COLORS[Math.floor(Math.random() * CONF_COLORS.length)],
      vy:       Math.random() * 2.5 + 1,
      vx:       (Math.random() - 0.5) * 2,
      rot:      Math.random() * 360,
      rotV:     (Math.random() - 0.5) * 6,
      wave:     Math.random() * Math.PI * 2,
      waveA:    Math.random() * 0.8 + 0.3,
      isCircle: Math.random() < 0.3,
    };
  }

  function tick(t) {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.y   += p.vy;
      p.x   += p.vx + Math.sin(t * 0.001 + p.wave) * p.waveA;
      p.rot += p.rotV;

      if (p.y > canvas.height + 20) Object.assign(p, spawn(-20));

      ctx.save();
      ctx.globalAlpha = 0.88;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;

      if (p.isCircle) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }

      ctx.restore();
    }

    raf = requestAnimationFrame(tick);
  }

  return {
    start() {
      resize();
      window.addEventListener('resize', resize);
      // Seed some particles across the full screen so it looks
      // full immediately, then the rest rain in from the top.
      particles = Array.from({ length: 200 }, (_, i) =>
        spawn(i < 150 ? Math.random() * window.innerHeight : -Math.random() * 300)
      );
      running = true;
      raf = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
}

/* ── Rendering ───────────────────────────────────────────── */

function renderBirthday(people, confetti) {
  document.body.className = 'mode-birthday';
  confetti.start();

  document.getElementById('app').innerHTML = `
    <div class="birthday-screen">
      <div class="birthday-header">
        🎂 Til hamingju með daginn! 🎂
      </div>
      <div class="people-container">
        ${people.map(p => `
          <div class="person-card${p.facts && p.facts.length > 0 ? '' : ' no-facts'}">
            <div class="photo-section">
              <img class="person-photo" src="${p.image}" alt="${p.nickname}">
              <div class="person-name">${p.nickname}</div>
              <div class="person-date">${prettyDate(p.birthday)}</div>
            </div>
            ${p.facts && p.facts.length > 0 ? `
              <div class="facts-section">
                <div class="facts-label">Skemmtilegar staðreyndir</div>
                ${p.facts.slice(0, 5).map((fact, i) => `
                  <div class="fact-card">
                    <span class="fact-icon">${FACT_ICONS[i]}</span>
                    <span>${fact}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderDefault() {
  document.body.className = 'mode-default';
  document.getElementById('app').innerHTML = `
    <div class="logo-screen">
      <img class="logo-img" src="images/logo_with_text.jpg" alt="Auðkenni">
    </div>
  `;
}

/* ── Midnight auto-reload ─────────────────────────────────── */
// The page auto-reloads at midnight so it picks up the new
// day's birthdays without anyone needing to touch it.
function scheduleMidnightReload() {
  const now      = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  setTimeout(() => location.reload(), midnight - now);
}

/* ── Bootstrap ───────────────────────────────────────────── */

async function init() {
  const canvas   = document.getElementById('confetti');
  const confetti = makeConfetti(canvas);

  try {
    const { people } = await fetch('data/calendar.json').then(r => r.json());
    const dates      = getRelevantDates();
    const celebrants = people.filter(p => dates.includes(birthdayToMMDD(p.birthday)));

    if (celebrants.length > 0) {
      renderBirthday(celebrants, confetti);
    } else {
      renderDefault();
    }
  } catch (err) {
    console.error('Failed to load calendar data:', err);
    renderDefault();
  }

  scheduleMidnightReload();
}

init();