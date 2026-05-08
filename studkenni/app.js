'use strict';

const FACT_ICONS  = ['🎈', '🌟', '🎯', '🚀', '💫'];
let factRotationInterval = null;
let imageRotationInterval = null;
let personImageIntervals = [];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
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
      particles = Array.from({ length: 80 }, (_, i) =>
        spawn(i < 60 ? Math.random() * window.innerHeight : -Math.random() * 300)
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

/* ── Events ──────────────────────────────────────────────── */

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

// Returns events whose promo window is active today, soonest first.
function getActiveEvents(events) {
  return events
    .map(e => ({ ...e, days: daysUntil(e.date) }))
    .filter(e => e.days >= 0 && e.days <= e.promo_days_before)
    .sort((a, b) => a.days - b.days);
}

function countdownText(days) {
  if (days === 0) return '🎉 Í dag!';
  if (days === 1) return '✨ Á morgun!';
  return `Eftir ${days} daga`;
}

function startEventFactRotation(facts) {
  if (factRotationInterval) clearInterval(factRotationInterval);
  let pool = shuffle(facts);
  let idx = 0;

  function showFact() {
    const el = document.getElementById('event-fact');
    if (!el) { clearInterval(factRotationInterval); return; }
    if (idx >= pool.length) { pool = shuffle(facts); idx = 0; }
    const text = pool[idx++];
    el.style.opacity = '0';
    setTimeout(() => {
      const current = document.getElementById('event-fact');
      if (!current) return;
      current.textContent = text;
      current.style.opacity = '1';
    }, 600);
  }

  showFact();
  factRotationInterval = setInterval(showFact, 10 * 60 * 1000);
}

function startEventImageRotation(images) {
  if (imageRotationInterval) clearInterval(imageRotationInterval);
  let idx = 0;
  let activeId = 'event-img-a';
  let hiddenId = 'event-img-b';

  imageRotationInterval = setInterval(() => {
    idx = (idx + 1) % images.length;
    const hidden = document.getElementById(hiddenId);
    if (!hidden) { clearInterval(imageRotationInterval); return; }

    hidden.onload = () => {
      const active = document.getElementById(activeId);
      const h = document.getElementById(hiddenId);
      if (!active || !h) return;
      h.style.opacity = '1';
      active.style.opacity = '0';
      [activeId, hiddenId] = [hiddenId, activeId];
    };
    hidden.src = images[idx];
  }, 5 * 60 * 1000);
}

function startPersonImageRotation(images, personIdx) {
  let idx = 0;
  let activeId = `person-img-a-${personIdx}`;
  let hiddenId = `person-img-b-${personIdx}`;

  const interval = setInterval(() => {
    idx = (idx + 1) % images.length;
    const hidden = document.getElementById(hiddenId);
    if (!hidden) { clearInterval(interval); return; }

    hidden.onload = () => {
      const active = document.getElementById(activeId);
      const h = document.getElementById(hiddenId);
      if (!active || !h) return;
      h.style.opacity = '1';
      active.style.opacity = '0';
      [activeId, hiddenId] = [hiddenId, activeId];
    };
    hidden.src = images[idx];
  }, 5 * 60 * 1000);

  personImageIntervals.push(interval);
}

function preloadImages(urls) {
  urls.forEach(url => { const img = new Image(); img.src = url; });
}

function renderEvent(event) {
  const images = Array.isArray(event.graphic) ? event.graphic : [event.graphic];
  preloadImages(images);

  document.body.className = 'mode-event';
  document.getElementById('app').innerHTML = `
    <div class="event-screen">
      <div class="event-graphic">
        <img id="event-img-a" class="event-img" src="${images[0]}" alt="${event.title}">
        <img id="event-img-b" class="event-img" src="" alt="${event.title}" style="opacity:0">
      </div>
      <div class="event-info">
        <div class="event-label">Væntanlegt</div>
        <div class="event-title">${event.title}</div>
        <div class="event-countdown">${countdownText(event.days)}</div>
        <div class="event-description">${event.description}</div>
        
        ${event.facts && event.facts.length > 0 ? `
          <div class="event-fact-section">
            <div class="event-fact-label">Vissir þú að...</div>
            <div id="event-fact" class="event-fact"></div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  if (event.facts && event.facts.length > 0) {
    startEventFactRotation(event.facts);
  }
  if (images.length > 1) {
    startEventImageRotation(images);
  }
}

/* ── Rendering ───────────────────────────────────────────── */

function renderCakeHistory(cakes, cakesSince) {
  const lastYear = new Date().getFullYear() - 1;
  const years = [];
  for (let y = cakesSince; y <= lastYear; y++) years.push(y);
  if (years.length === 0) return '';
  return `
    <div class="cake-history">
      ${years.map(y => `
        <div class="cake-year ${cakes.includes(y) ? 'cake-yes' : 'cake-no'}">
          <span class="cake-icon">${cakes.includes(y) ? '🎂' : '🚫'}</span>
          <span class="cake-label">${y}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderBirthday(people, confetti, cakesSince) {
  personImageIntervals.forEach(clearInterval);
  personImageIntervals = [];

  document.body.className = 'mode-birthday';
  confetti.start();

  document.getElementById('app').innerHTML = `
    <div class="birthday-screen">
      <div class="birthday-header">
        🎂 Til hamingju með daginn! 🎂
      </div>
      <div class="people-container">
        ${people.map((p, i) => {
          const imgs = Array.isArray(p.image) ? p.image : [p.image];
          return `
          <div class="person-card${p.facts && p.facts.length > 0 ? '' : ' no-facts'}">
            <div class="photo-section">
              <div class="photo-frame">
                <img id="person-img-a-${i}" class="person-photo" src="${imgs[0]}" alt="${p.nickname ?? p.name}">
                <img id="person-img-b-${i}" class="person-photo" src="" alt="${p.nickname ?? p.name}" style="opacity:0">
              </div>
              <div class="person-name">${p.nickname ?? p.name}</div>
              <div class="person-date">${prettyDate(p.birthday)}</div>
              ${renderCakeHistory(p.cakes ?? [], cakesSince)}
            </div>
            ${p.facts && p.facts.length > 0 ? `
              <div class="facts-section">
                <div class="facts-label">Skemmtilegar staðreyndir</div>
                ${p.facts.slice(0, 5).map((fact, fi) => `
                  <div class="fact-card">
                    <span class="fact-icon">${FACT_ICONS[fi]}</span>
                    <span>${fact}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `}).join('')}
      </div>
    </div>
  `;

  people.forEach((p, i) => {
    const imgs = Array.isArray(p.image) ? p.image : [p.image];
    if (imgs.length > 1) {
      preloadImages(imgs);
      startPersonImageRotation(imgs, i);
    }
  });
}

function renderDefault() {
  document.body.className = 'mode-default';
  document.getElementById('app').innerHTML = `
    <div class="logo-screen">
      <img class="logo-img" src="images/logo_with_text.svg" alt="Auðkenni">
    </div>
  `;
}

/* ── Upcoming birthdays widget ───────────────────────────── */

function getRecentAndUpcomingBirthdays(people) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isMonday = today.getDay() === 1;

  // Offsets already covered by the main birthday screen
  const mainScreenOffsets = new Set([0]);
  if (isMonday) { mainScreenOffsets.add(-1); mainScreenOffsets.add(-2); }

  const result = [];
  for (let i = -3; i <= 4; i++) {
    if (i === 0 || mainScreenOffsets.has(i)) continue;
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    people
      .filter(p => birthdayToMMDD(p.birthday) === toMMDD(d))
      .forEach(p => result.push({ ...p, daysOffset: i }));
  }
  return result;
}

function offsetLabel(n) {
  if (n === -1) return 'Í gær';
  if (n < 0)   return `Fyrir ${Math.abs(n)} dögum`;
  if (n === 1)  return 'Á morgun';
  return `Eftir ${n} daga`;
}

function renderUpcomingWidget(people) {
  const list = getRecentAndUpcomingBirthdays(people);
  if (list.length === 0) return;

  const widget = document.createElement('div');
  widget.className = 'upcoming-widget';
  widget.innerHTML = `
    <button class="upcoming-close" aria-label="Loka">&times;</button>
    <div class="upcoming-title">Nýleg og væntanleg afmæli</div>
    ${list.map(p => `
      <div class="upcoming-person">
        <img class="upcoming-photo" src="${Array.isArray(p.image) ? p.image[0] : p.image}" alt="${p.nickname ?? p.name}">
        <div class="upcoming-info">
          <div class="upcoming-name">${p.nickname ?? p.name}</div>
          <div class="upcoming-date">${offsetLabel(p.daysOffset)} · ${prettyDate(p.birthday).trim()}</div>
        </div>
      </div>
    `).join('')}
  `;
  widget.querySelector('.upcoming-close').addEventListener('click', () => widget.remove());
  document.body.appendChild(widget);
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
    const { people, events = [], cakes_since: cakesSince = 2026 } = await fetch('data/calendar.json').then(r => r.json());
    const dates      = getRelevantDates();
    const celebrants = people.filter(p => dates.includes(birthdayToMMDD(p.birthday)));

    if (celebrants.length > 0) {
      renderBirthday(celebrants, confetti, cakesSince);
    } else {
      const activeEvents = getActiveEvents(events);
      if (activeEvents.length > 0) {
        renderEvent(activeEvents[0]);
      } else {
        renderDefault();
      }
    }

    renderUpcomingWidget(people);
  } catch (err) {
    console.error('Failed to load calendar data:', err);
    renderDefault();
  }

  scheduleMidnightReload();
}

init();