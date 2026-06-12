'use strict';

const FACT_ICONS  = ['🎈', '🌟', '🎯', '🚀', '💫'];
let factRotationInterval = null;
let imageRotationInterval = null;
let secondaryRotationInterval = null;
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
  const [dd, mm, yyyy] = dateStr.split('/');
  const target = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

// Returns events whose promo window is active today.
// Sorted by priority (1=main first) then by days remaining.
function getActiveEvents(events) {
  return events
    .map(e => ({ ...e, days: daysUntil(e.date), priority: e.priority ?? 1 }))
    .filter(e => e.days >= 0 && e.days <= e.promo_days_before)
    .sort((a, b) => a.priority - b.priority || a.days - b.days);
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

function nl2br(str) { return (str || '').replace(/\n/g, '<br>'); }

function eventGradient(color) {
  if (!color) return null;
  if (Array.isArray(color)) return `linear-gradient(135deg, ${color[0]} 0%, ${color[1]} 100%)`;
  return `linear-gradient(135deg, #0a0814 0%, ${color} 55%, #0d0d1a 100%)`;
}

function secondaryHighlightHtml(highlight) {
  const img    = highlight.image;
  const isPath = img && img.includes('/');
  const isEmoji = img && !isPath;
  return `
    ${isPath ? `
      <div class="event-minor-graphic">
        <img class="event-minor-img" src="${img}" alt="${highlight.title}">
      </div>` : ''}
    <div class="event-minor-info${isEmoji ? ' event-minor-info--menu' : ''}">
      <div class="event-label">Í dag</div>
      ${isEmoji ? `<div class="secondary-highlight-emoji">${img}</div>` : ''}
      <div class="event-minor-title">${highlight.title}</div>
      <div class="event-minor-description">${nl2br(highlight.text)}</div>
    </div>`;
}

function secondaryEventHtml(event) {
  const imgs = Array.isArray(event.graphic) ? event.graphic : [event.graphic];
  return `
    <div class="event-minor-graphic">
      <img class="event-minor-img" src="${imgs[0]}" alt="${event.title}">
    </div>
    <div class="event-minor-info">
      <div class="event-label">Einnig væntanlegt</div>
      <div class="event-minor-title">${event.title}</div>
      <div class="event-minor-countdown">${countdownText(event.days)}</div>
      ${event.description ? `<div class="event-minor-description">${nl2br(event.description)}</div>` : ''}
    </div>`;
}

function secondaryMenuHtml(cafeteria) {
  const items = cafeteria.items.split('\n').map(s => s.trim()).filter(Boolean);
  return `
    ${cafeteria.graphic ? `
      <div class="event-minor-graphic">
        <img class="event-minor-img" src="${cafeteria.graphic}" alt="${cafeteria.title ?? ''}">
      </div>` : ''}
    <div class="event-minor-info event-minor-info--menu">
      <div class="event-label">Í matinn 🍽️</div>
      ${cafeteria.title ? `<div class="event-minor-title">${cafeteria.title}</div>` : ''}
      <ul class="event-menu-list">
        ${items.map(item => `<li class="event-menu-item">${item}</li>`).join('')}
      </ul>
    </div>`;
}

function resetProgressBar() {
  const bar = document.getElementById('secondary-progress-bar');
  if (!bar) return;
  bar.style.transition = 'none';
  bar.style.width = '0%';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    bar.style.transition = 'width 60s linear';
    bar.style.width = '100%';
  }));
}

function startSecondaryRotation(panels) {
  if (secondaryRotationInterval) clearInterval(secondaryRotationInterval);
  let idx = 0;
  resetProgressBar();
  secondaryRotationInterval = setInterval(() => {
    idx = (idx + 1) % panels.length;
    const el = document.getElementById('secondary-panel');
    if (!el) { clearInterval(secondaryRotationInterval); return; }
    el.style.opacity = '0';
    setTimeout(() => {
      const current = document.getElementById('secondary-panel');
      if (!current) return;
      current.querySelector('.secondary-footer')?.remove();
      current.innerHTML = panels[idx] + `
        <div class="secondary-footer">
          <div class="secondary-dots">
            ${panels.map((_, i) => `<span class="secondary-dot${i === idx ? ' active' : ''}"></span>`).join('')}
          </div>
          <div class="secondary-progress"><div class="secondary-progress-bar" id="secondary-progress-bar"></div></div>
        </div>`;
      current.style.opacity = '1';
      resetProgressBar();
    }, 600);
  }, 10 * 1000);
}

// secondaries: array of {type: 'event'|'menu', data}
function renderEvent(main, secondaries = []) {
  const images = Array.isArray(main.graphic) ? main.graphic : [main.graphic];
  preloadImages(images);

  const panels = secondaries.map(s =>
    typeof s === 'string'  ? s :
    s.type === 'menu'      ? secondaryMenuHtml(s.data) :
    s.type === 'highlight' ? secondaryHighlightHtml(s.data) :
                             secondaryEventHtml(s.data)
  );
  const hasSecondary = panels.length > 0;

  document.body.className = 'mode-event';
  document.body.style.background = eventGradient(main.color) ?? '';
  document.getElementById('app').innerHTML = `
    <div class="event-screen${hasSecondary ? ' split' : ''}">
      <div class="event-main">
        <div class="event-graphic">
          <img id="event-img-a" class="event-img" src="${images[0]}" alt="${main.title}">
          <img id="event-img-b" class="event-img" src="" alt="${main.title}" style="opacity:0">
        </div>
        <div class="event-info">
          <div class="event-label">Væntanlegt</div>
          <div class="event-title">${main.title}</div>
          <div class="event-countdown">${countdownText(main.days)}</div>
          <div class="event-description">${nl2br(main.description)}</div>
          ${main.facts && main.facts.length > 0 ? `
            <div class="event-fact-section">
              <div class="event-fact-label">Vissir þú að...</div>
              <div id="event-fact" class="event-fact"></div>
            </div>
          ` : ''}
        </div>
      </div>
      ${hasSecondary ? `
        <div class="event-minor" id="secondary-panel" style="transition: opacity 0.6s ease;">
          ${panels[0]}
          ${panels.length > 1 ? `
            <div class="secondary-footer">
              <div class="secondary-dots">
                ${panels.map((_, i) => `<span class="secondary-dot${i === 0 ? ' active' : ''}"></span>`).join('')}
              </div>
              <div class="secondary-progress"><div class="secondary-progress-bar" id="secondary-progress-bar"></div></div>
            </div>` : ''}
        </div>` : ''}
    </div>
  `;
  if (main.facts && main.facts.length > 0) startEventFactRotation(main.facts);
  if (images.length > 1) startEventImageRotation(images);
  if (panels.length > 1) startSecondaryRotation(panels);
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

  document.body.style.background = '';
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

function renderHighlight(highlight) {
  document.body.style.background = '';
  document.body.className = 'mode-highlight';
  const img    = highlight.image;
  const isPath = img && img.includes('/');
  const isEmoji = img && !isPath;

  document.getElementById('app').innerHTML = `
    <div class="highlight-screen">
      <div class="highlight-header">✨ Í dag ✨</div>
      <div class="highlight-card${img ? '' : ' no-image'}">
        ${isPath ? `
          <div class="highlight-image-wrap">
            <img class="highlight-img" src="${img}" alt="${highlight.title}">
          </div>
        ` : isEmoji ? `
          <div class="highlight-emoji">${img}</div>
        ` : ''}
        <div class="highlight-content">
          <div class="highlight-title">${highlight.title}</div>
          <div class="highlight-text">${nl2br(highlight.text)}</div>
        </div>
      </div>
    </div>
  `;
}

function renderDefault() {
  document.body.style.background = '';
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

/* ── Hourly auto-reload ───────────────────────────────────── */
// Reloads every hour so pushed changes and new data are
// picked up without anyone needing to touch the TV.
function scheduleHourlyReload() {
  setInterval(() => location.reload(), 60 * 60 * 1000);
}

/* ── Bootstrap ───────────────────────────────────────────── */

async function init() {
  const canvas   = document.getElementById('confetti');
  const confetti = makeConfetti(canvas);

  try {
    const { people, events = [], highlights = [], cafeterias = [], menu = [], cakes_since: cakesSince = 2026 } = await fetch('data/calendar.json').then(r => r.json());
    const dates         = getRelevantDates();
    const celebrants    = people.filter(p => dates.includes(birthdayToMMDD(p.birthday)));
    const now    = new Date();
    const todayDD = String(now.getDate()).padStart(2, '0');
    const todayMM = String(now.getMonth() + 1).padStart(2, '0');
    const todayYY = String(now.getFullYear());
    const todayHighlights = highlights.filter(h => {
      const [dd, mm, yyyy] = h.date.split('/');
      return dd === todayDD && mm === todayMM && (!yyyy || yyyy === todayYY);
    });
    const wcHighlight = await getWorldCupHighlight();
    if (wcHighlight) todayHighlights.push(wcHighlight);

    const activeEvents = getActiveEvents(events);

    if (celebrants.length > 0) {
      renderBirthday(celebrants, confetti, cakesSince);
    } else if (activeEvents.length > 0) {
      const secondaries = [];
      if (activeEvents.length > 1 && activeEvents[1].priority > activeEvents[0].priority)
        secondaries.push({ type: 'event', data: activeEvents[1] });
      const cafeteriaMap = Object.fromEntries(cafeterias.map(c => [c.id, c]));
      const todayMenuEntries = menu.filter(m => {
        const [dd, mm, yyyy] = m.date.split('/');
        return dd === todayDD && mm === todayMM && (!yyyy || yyyy === todayYY);
      });
      if (now.getHours() < 13) {
        todayMenuEntries.forEach(entry => {
          const cafDef = cafeteriaMap[entry.cafeteria] ?? cafeterias[0] ?? {};
          secondaries.push({ type: 'menu', data: { ...cafDef, items: entry.items } });
        });
      }
      todayHighlights.forEach(h => secondaries.push({ type: 'highlight', data: h }));
      const wcStandings = await getWorldCupStandingsPanel();
      if (wcStandings) secondaries.push(wcStandings);
      renderEvent(activeEvents[0], secondaries);
    } else if (todayHighlights.length > 0) {
      renderHighlight(todayHighlights[0]);
    } else {
      renderDefault();
    }

    renderUpcomingWidget(people);
  } catch (err) {
    console.error('Failed to load calendar data:', err);
    renderDefault();
  }

  scheduleHourlyReload();
}

init();