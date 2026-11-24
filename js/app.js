/* Code Route Quest — single-page study app (no build step, works from file://) */
(() => {
  'use strict';
  const CONTENT = window.CONTENT || { themes: [] };
  const QUIZ = (window.QUIZ || []).map((q, i) => ({ ...q, id: q.id || `q${i}` }));
  const GLOSSARY = window.GLOSSARY || [];
  const OFFICIAL = window.OFFICIAL || [];
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const view = $('#view');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const LETTERS = 'ABCDEF';

  /* ---------- Theme metadata (colour + emoji + French name) ---------- */
  const META = {
    1: { emoji: '🚦', color: '#ff6b4a', fr: 'La circulation routière' },
    2: { emoji: '🧠', color: '#8b5cf6', fr: 'Le conducteur' },
    3: { emoji: '🛣️', color: '#0ea5e9', fr: 'La route' },
    4: { emoji: '🚲', color: '#10b981', fr: 'Les autres usagers' },
    5: { emoji: '📄', color: '#f59e0b', fr: 'Notions diverses' },
    6: { emoji: '🩹', color: '#e11d48', fr: 'Les premiers secours' },
    7: { emoji: '🚪', color: '#ec4899', fr: 'Prendre et quitter son véhicule' },
    8: { emoji: '🔧', color: '#64748b', fr: 'La mécanique et les équipements' },
    9: { emoji: '🛡️', color: '#6366f1', fr: 'La sécurité du passager et du véhicule' },
    10: { emoji: '🌱', color: '#22c55e', fr: "L'environnement" },
  };
  const themeName = (t) => t.name.replace('Micellaneous', 'Miscellaneous');

  /* ---------- Interactive tools ---------- */
  const TOOLS = [
    { id: 'signs', file: 'tools/signs-lab.html', icon: '🛑', title: 'Road Signs & Panonceaux Lab', desc: 'Decode sign shapes/colours, combine sub-panels, multi-answer drill.', subs: ['Road Signs'] },
    { id: 'priority', file: 'tools/priority-explorer.html', icon: '🔀', title: 'Priority Scenario Explorer', desc: 'Animated intersections: priorité à droite, giratoire vs rond-point.', subs: ['The Intersections', 'Circulate'] },
    { id: 'speed', file: 'tools/speed-calculator.html', icon: '⏱️', title: 'Speed Limit & Gap Calculator', desc: 'Legal limit by road, weather & probation status, plus following gaps.', subs: ['Speed', 'Driving in difficult conditions', 'Driving on the motorway'] },
    { id: 'stopping', file: 'tools/stopping-distance.html', icon: '🛑', title: 'Stopping Distance Visualiser', desc: 'Watch reaction + braking distance grow with speed, dry vs wet.', subs: ['Speed', 'To drive', 'Driving in difficult conditions'] },
    { id: 'points', file: 'tools/points-licence.html', icon: '🎯', title: 'Points Licence Simulator', desc: 'Probation, offences and how points come back.', subs: ['The points-based driving licence'] },
    { id: 'alcohol', file: 'tools/alcohol-fitness.html', icon: '🍷', title: 'Alcohol & Fitness Explainer', desc: 'g/L vs mg/L, limits, elimination time, medicine pictograms.', subs: ['To be fit to drive'] },
  ];

  /* ---------- Flatten lessons ---------- */
  const LESSONS = [];
  CONTENT.themes.forEach((t) => t.subtopics.forEach((st, si) => st.lessons.forEach((l, li) => {
    LESSONS.push({ id: `${t.num}-${si}-${li}`, t: t.num, s: si, l: li, theme: t, sub: st, lesson: l, idx: LESSONS.length });
  })));
  const lessonById = (id) => LESSONS.find((x) => x.id === id);
  const themeByNum = (n) => CONTENT.themes.find((t) => t.num === +n);
  const lessonText = (L) => L.lesson.blocks.map((b) => b.x || b.cap || '').join(' ');

  /* ---------- Persistent state (localStorage, best effort) ---------- */
  const KEY = 'codeRouteQuest.v1';
  const fresh = () => ({ read: {}, answers: {}, exams: [], official: {}, last: null, days: [], badges: {}, theme: null, timer: true });
  let S = fresh();
  try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* private mode */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };
  const today = () => new Date().toISOString().slice(0, 10);
  function touchDay() { const d = today(); if (!S.days.includes(d)) { S.days.push(d); S.days = S.days.slice(-400); } }
  function streak() {
    const set = new Set(S.days); let n = 0; const d = new Date();
    if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
    while (set.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  const readCount = (filter = () => true) => LESSONS.filter((L) => filter(L) && S.read[L.id]).length;
  const mistakes = () => QUIZ.filter((q) => S.answers[q.id] && !S.answers[q.id].ok);
  function accuracy() {
    const a = Object.values(S.answers); if (!a.length) return null;
    return Math.round(100 * a.filter((x) => x.ok).length / a.length);
  }
  function recordAnswer(q, ok) {
    const a = S.answers[q.id] || { n: 0, wrong: 0 };
    a.n++; if (!ok) a.wrong++; a.ok = ok; a.at = Date.now();
    S.answers[q.id] = a; touchDay(); save();
  }
  function markRead(id, silent) {
    if (S.read[id]) return;
    S.read[id] = Date.now(); touchDay(); save();
    if (!silent) toast('✅ Lesson complete!');
    checkBadges(); renderChrome();
  }

  /* ---------- Badges ---------- */
  const BADGES = [
    { id: 'first', emo: '🔑', name: 'Ignition', desc: 'Finish your first lesson', test: () => readCount() >= 1 },
    { id: 'ten', emo: '📚', name: 'Bookworm', desc: 'Finish 10 lessons', test: () => readCount() >= 10 },
    { id: 'half', emo: '🛣️', name: 'Halfway There', desc: 'Finish half of all lessons', test: () => readCount() >= LESSONS.length / 2 },
    { id: 'all', emo: '🏁', name: 'Finish Line', desc: 'Finish every lesson', test: () => readCount() >= LESSONS.length },
    { id: 'theme', emo: '🎖️', name: 'Theme Master', desc: 'Finish all lessons in a theme', test: () => CONTENT.themes.some((t) => readCount((L) => L.t === t.num) === LESSONS.filter((L) => L.t === t.num).length) },
    { id: 'q50', emo: '🧩', name: 'Quiz Cruiser', desc: 'Answer 50 practice questions', test: () => Object.keys(S.answers).length >= 50 },
    { id: 'q150', emo: '🚀', name: 'Question Machine', desc: 'Answer 150 different questions', test: () => Object.keys(S.answers).length >= 150 },
    { id: 'perfect', emo: '💯', name: 'Perfect Round', desc: 'Score 100% on a practice quiz (5+ questions)', test: () => !!S.badges.perfect },
    { id: 'exam', emo: '📝', name: 'Mock Exam Taker', desc: 'Complete a mock exam', test: () => S.exams.length >= 1 },
    { id: 'pass', emo: '🏆', name: 'Exam Ready', desc: 'Pass a mock exam (35/40+)', test: () => S.exams.some((e) => e.score >= 35) },
    { id: 'ace', emo: '👑', name: 'Flawless', desc: 'Score 40/40 on a mock exam', test: () => S.exams.some((e) => e.score >= 40) },
    { id: 'official', emo: '🇫🇷', name: 'Official Business', desc: 'Try all 20 official sample questions', test: () => Object.keys(S.official).length >= OFFICIAL.length && OFFICIAL.length > 0 },
    { id: 'streak3', emo: '🔥', name: 'On a Roll', desc: 'Study 3 days in a row', test: () => streak() >= 3 },
    { id: 'streak7', emo: '☄️', name: 'Unstoppable', desc: 'Study 7 days in a row', test: () => streak() >= 7 },
    { id: 'clean', emo: '🧽', name: 'Clean Slate', desc: 'Clear your mistakes list after 10+ answers', test: () => Object.keys(S.answers).length >= 10 && mistakes().length === 0 },
  ];
  function checkBadges() {
    BADGES.forEach((b) => {
      if (!S.badges['got_' + b.id] && b.test()) {
        S.badges['got_' + b.id] = Date.now(); save();
        setTimeout(() => { toast(`${b.emo} Badge unlocked: ${b.name}!`); confetti(60); }, 400);
      }
    });
  }

  /* ---------- UI helpers ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }
  function confetti(n = 120) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors = ['#ff6b4a', '#ffd84d', '#4f46e5', '#22c55e', '#ec4899', '#0ea5e9'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i'); c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw'; c.style.background = colors[i % colors.length];
      c.style.animationDuration = 1.8 + Math.random() * 1.8 + 's'; c.style.animationDelay = Math.random() * .4 + 's';
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(c); setTimeout(() => c.remove(), 4200);
    }
  }
  function ring(pct, size = 64, stroke = 8, label, color) {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
    return `<span class="ring" style="width:${size}px;height:${size}px;color:${color || 'var(--tc)'}">
      <svg width="${size}" height="${size}"><circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"/>
      <circle class="val" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg>
      <b style="font-size:${Math.round(size / 4.2)}px;color:var(--ink)">${label ?? Math.round(pct) + '%'}</b></span>`;
  }
  const tc = (n) => `--tc:${META[n]?.color || 'var(--brand)'}`;
  const lessonHref = (L) => `#/lesson/${L.id}`;
  function speak(text) {
    try { const u = new SpeechSynthesisUtterance(text); u.lang = 'fr-FR'; u.rate = .9; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { toast('Speech not available in this browser'); }
  }

  /* ---------- Theme (light/dark) ---------- */
  function applyTheme() {
    if (S.theme) document.documentElement.dataset.theme = S.theme; else delete document.documentElement.dataset.theme;
    const dark = S.theme ? S.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    $('#theme-btn').textContent = dark ? '☀️' : '🌙';
  }

  /* ---------- Sidebar + top stats ---------- */
  function renderChrome() {
    const route = location.hash || '#/';
    const nm = mistakes().length;
    const link = (href, emo, label, extra = '', color) => `<a class="nav-link ${route === href || (href !== '#/' && route.startsWith(href + '/')) ? 'active' : ''}" href="${href}" style="--tc:${color || 'var(--brand)'}"><span class="emoji">${emo}</span><span class="grow">${label}</span>${extra}</a>`;
    $('#sidebar').innerHTML = `
      <div class="nav-group">${link('#/', '🏠', 'Home')}${link('#/progress', '🏅', 'Progress & badges')}</div>
      <div class="nav-group"><div class="nav-label">Practice</div>
        ${link('#/quiz/all', '🧩', 'Quick quiz (15)', '', '#4f46e5')}
        ${link('#/quiz/mistakes', '🔁', 'My mistakes', nm ? `<span class="badge">${nm}</span>` : '', '#e11d48')}
        ${link('#/exam', '📝', 'Mock exam (40)', '', '#0ea5e9')}
        ${link('#/official', '🇫🇷', 'Official samples', '', '#1d4ed8')}
      </div>
      <div class="nav-group"><div class="nav-label">Themes</div>
        ${CONTENT.themes.map((t) => {
          const tot = LESSONS.filter((L) => L.t === t.num).length, done = readCount((L) => L.t === t.num);
          return link(`#/theme/${t.num}`, META[t.num].emoji, themeName(t), `<small class="muted">${done}/${tot}</small>`, META[t.num].color);
        }).join('')}
      </div>
      <div class="nav-group"><div class="nav-label">Explore</div>
        ${link('#/tools', '🎮', 'Interactive tools', '', '#8b5cf6')}
        ${link('#/glossary', '🇫🇷', 'French glossary', '', '#10b981')}
      </div>`;
    const acc = accuracy();
    $('#top-stats').innerHTML = `<span class="pill" title="Day streak">🔥 ${streak()}</span>
      <span class="pill" title="Lessons finished">📚 ${readCount()}/${LESSONS.length}</span>
      ${acc !== null ? `<span class="pill" title="Quiz accuracy">🎯 ${acc}%</span>` : ''}`;
  }

  /* =========================================================
     VIEWS
     ========================================================= */
  function viewHome() {
    const total = LESSONS.length, done = readCount(), pct = total ? 100 * done / total : 0;
    const last = S.last && lessonById(S.last);
    const nextUnread = LESSONS.find((L) => !S.read[L.id]);
    const cont = last && !S.read[last.id] ? last : nextUnread;
    const best = S.exams.length ? Math.max(...S.exams.map((e) => e.score)) : null;
    const hour = new Date().getHours();
    const hello = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
    return `<div class="wrap">
      <section class="hero">
        <div class="hero-inner">
          <div class="hero-text">
            <h1>${hello}! Ready to ace the Code? 🚗💨</h1>
            <p>${total} lessons across 10 themes, ${QUIZ.length} practice questions, a timed mock exam and interactive tools. Everything here comes from your Ornikar notes.</p>
            <div class="row">
              ${cont ? `<a class="btn" href="${lessonHref(cont)}">▶ ${last && cont === last ? 'Continue' : 'Start'}: ${esc(cont.lesson.title)}</a>` : `<a class="btn" href="#/exam">🏆 Take a mock exam</a>`}
              <a class="btn alt" href="#/quiz/all">🧩 Quick quiz</a>
            </div>
          </div>
          <div class="big-ring" style="color:#fff">${ring(pct, 120, 12, `${done}/${total}`, '#fff').replace('color:var(--ink)', 'color:#fff')}</div>
        </div>
        <div class="road"></div><div class="road-car">🚗</div>
      </section>

      <div class="stats">
        <div class="stat"><div class="v">🔥 ${streak()}</div><div class="l">day streak</div></div>
        <div class="stat"><div class="v">📚 ${done}</div><div class="l">lessons finished</div></div>
        <div class="stat"><div class="v">🎯 ${accuracy() ?? '–'}${accuracy() !== null ? '%' : ''}</div><div class="l">quiz accuracy</div></div>
        <div class="stat"><div class="v">🏆 ${best ?? '–'}${best !== null ? '/40' : ''}</div><div class="l">best mock exam</div></div>
        <div class="stat"><div class="v">🔁 ${mistakes().length}</div><div class="l">mistakes to review</div></div>
      </div>

      <div class="section-title"><h2>Your 10 themes</h2><span class="muted small">Tap a theme to start</span></div>
      <div class="grid cols-3">
        ${CONTENT.themes.map((t) => {
          const tot = LESSONS.filter((L) => L.t === t.num).length, d = readCount((L) => L.t === t.num);
          const qn = QUIZ.filter((q) => q.t === t.num).length;
          return `<a class="tile" href="#/theme/${t.num}" style="${tc(t.num)}">
            <div class="top"><span class="emo">${META[t.num].emoji}</span><div><div class="num">Theme ${t.num}</div><h3>${esc(themeName(t))}</h3><div class="tag-fr small">${META[t.num].fr}</div></div></div>
            <div class="bar"><i style="width:${tot ? 100 * d / tot : 0}%"></i></div>
            <div class="row small muted" style="font-weight:700"><span>📖 ${d}/${tot} lessons</span><span class="spacer"></span><span>🧩 ${qn} questions</span></div>
          </a>`;
        }).join('')}
      </div>

      <div class="section-title"><h2>Play & practise</h2></div>
      <div class="grid cols-4">
        <a class="tile" href="#/exam" style="--tc:#0ea5e9"><span class="emo">📝</span><h3>Mock exam</h3><span class="muted small">40 questions · 20s each · pass at 35</span></a>
        <a class="tile" href="#/quiz/mistakes" style="--tc:#e11d48"><span class="emo">🔁</span><h3>Fix my mistakes</h3><span class="muted small">${mistakes().length} waiting</span></a>
        <a class="tile" href="#/official" style="--tc:#1d4ed8"><span class="emo">🇫🇷</span><h3>Official samples</h3><span class="muted small">20 real ETG-style questions</span></a>
        <a class="tile" href="#/tools" style="--tc:#8b5cf6"><span class="emo">🎮</span><h3>Interactive tools</h3><span class="muted small">${TOOLS.length} visual explainers</span></a>
      </div>
    </div>`;
  }

  function viewTheme(n) {
    const t = themeByNum(n); if (!t) return notFound();
    const tot = LESSONS.filter((L) => L.t === t.num).length, d = readCount((L) => L.t === t.num);
    const firstUnread = LESSONS.find((L) => L.t === t.num && !S.read[L.id]) || LESSONS.find((L) => L.t === t.num);
    const tools = TOOLS.filter((x) => t.subtopics.some((st) => x.subs.includes(st.name)));
    return `<div class="wrap" style="${tc(t.num)}">
      <section class="theme-head">
        <span class="emo">${META[t.num].emoji}</span>
        <div style="flex:1;min-width:220px"><div class="small" style="font-weight:800;opacity:.9">THEME ${t.num} · <i>${META[t.num].fr}</i></div><h1>${esc(themeName(t))}</h1>
          <div class="small" style="font-weight:700;opacity:.95">${d} of ${tot} lessons finished · ${QUIZ.filter((q) => q.t === t.num).length} practice questions</div></div>
        ${ring(tot ? 100 * d / tot : 0, 86, 10, null, '#fff').replace('color:var(--ink)', 'color:#fff')}
        <div class="row" style="width:100%">
          ${firstUnread ? `<a class="btn" href="${lessonHref(firstUnread)}">▶ ${d ? 'Continue reading' : 'Start reading'}</a>` : ''}
          <a class="btn" href="#/quiz/t/${t.num}">🧩 Theme quiz</a>
        </div>
      </section>
      ${t.subtopics.map((st, si) => {
        const ls = LESSONS.filter((L) => L.t === t.num && L.s === si);
        const qn = QUIZ.filter((q) => q.t === t.num && q.s === si).length;
        return `<div class="sub-block"><h2>${esc(st.name)} <span class="chip">${ls.length} lesson${ls.length > 1 ? 's' : ''}</span>
          ${qn ? `<a class="btn small theme" href="#/quiz/s/${t.num}-${si}">🧩 ${qn} questions</a>` : ''}</h2>
          <div class="lesson-list">${ls.map((L, i) => `<a class="lesson-item ${S.read[L.id] ? 'done' : ''}" href="${lessonHref(L)}">
            <span class="dot">${S.read[L.id] ? '✓' : i + 1}</span><span><span>${esc(L.lesson.title)}</span><br><span class="meta">⏱ ${esc(L.lesson.duration || '2 minutes')} · 🖼 ${L.lesson.blocks.filter((b) => b.t === 'img').length} visuals</span></span></a>`).join('')}</div></div>`;
      }).join('')}
      ${tools.length ? `<div class="section-title"><h2>🎮 Interactive tools for this theme</h2></div>
        <div class="tool-callouts">${tools.map(toolCard).join('')}</div>` : ''}
    </div>`;
  }

  const toolCard = (x) => `<a class="tool-card" href="${x.file}"><span class="ico">${x.icon}</span><span><b>${esc(x.title)}</b><span class="small muted">${esc(x.desc)}</span></span></a>`;

  /* Lesson body → HTML (with list grouping, labels, formulas) */
  const CALLOUT = /^(warning|attention|information|informations|reminder|rappel|aide-m[ée]moire|definition|définition|good behavior|bon comportement|comportement à adopter|sanction|sanctions|recap|best practices|le bon comportement à adopter|-)$/i;
  function inline(text) {
    let h = esc(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // "Label : explanation" → bold label
    h = h.replace(/^([^:.]{2,48}?)\s:\s/, '<strong class="lbl">$1</strong> : ');
    return h.replace(/\n/g, '<br>');
  }
  function renderBlocks(blocks) {
    const out = []; let list = null; let prevP = '';
    const flush = () => { if (list) { out.push(`<ul>${list.join('')}</ul>`); list = null; } };
    blocks.forEach((b) => {
      if (b.t === 'p') {
        const x = b.x.trim();
        if (/^[A-Z0-9 +=.]+$/.test(x) && x.includes('=') && x.length < 90) { flush(); out.push(`<p class="formula">${esc(x)}</p>`); prevP = x; return; }
        const listy = x.length < 240 && !x.endsWith(':') && (list || /:\s*$/.test(prevP));
        if (listy) { (list ||= []).push(`<li>${inline(x)}</li>`); }
        else { flush(); out.push(`<p>${inline(x)}</p>`); }
        prevP = x; return;
      }
      flush(); prevP = '';
      if (b.t === 'h2') out.push(`<h2>${esc(b.x)}</h2>`);
      else if (b.t === 'h3') out.push(`<h3>${esc(b.x)}</h3>`);
      else if (b.t === 'caption') out.push(`<p class="small muted">${esc(b.x)}</p>`);
      else if (b.t === 'img') {
        const cap = b.cap || b.alt || '';
        const callout = CALLOUT.test(cap.trim());
        out.push(`<figure class="${callout ? 'callout' : ''}"><img loading="lazy" src="img/${esc(b.src)}" alt="${esc(cap)}" data-zoom>${cap && !callout ? `<figcaption>${esc(cap)}</figcaption>` : ''}</figure>`);
      }
    });
    flush();
    return out.join('\n');
  }

  function viewLesson(id) {
    const L = lessonById(id); if (!L) return notFound();
    S.last = id; touchDay(); save();
    const prev = LESSONS[L.idx - 1], next = LESSONS[L.idx + 1];
    const tools = TOOLS.filter((x) => x.subs.includes(L.sub.name));
    const qn = QUIZ.filter((q) => q.t === L.t && q.s === L.s).length;
    const blocks = L.lesson.blocks.slice();
    if (blocks[0] && blocks[0].t === 'h2' && blocks[0].x === L.lesson.title) blocks.shift();
    const posInSub = L.l + 1, subLen = L.sub.lessons.length;
    return `<div class="narrow" style="${tc(L.t)}">
      <div class="reading-bar" id="reading-bar"></div>
      <nav class="crumbs"><a href="#/theme/${L.t}">${META[L.t].emoji} Theme ${L.t} · ${esc(themeName(L.theme))}</a><span>›</span><span>${esc(L.sub.name)}</span></nav>
      <header class="lesson-head">
        <h1>${esc(L.lesson.title)}</h1>
        <div class="row"><span class="chip">⏱ ${esc(L.lesson.duration || '2 minutes')}</span><span class="chip">Lesson ${posInSub} of ${subLen}</span>
          ${S.read[L.id] ? '<span class="chip" style="--tc:var(--good)">✓ Finished</span>' : ''}</div>
      </header>
      <article class="lesson-body" id="lesson-body">${renderBlocks(blocks)}</article>
      ${tools.length ? `<div class="tool-callouts">${tools.map(toolCard).join('')}</div>` : ''}
      <div id="lesson-end"></div>
      <section class="lesson-foot">
        <div class="row">
          <button class="btn ${S.read[L.id] ? 'good' : 'theme'}" data-action="mark-read" data-id="${L.id}">${S.read[L.id] ? '✓ Finished' : '✓ Mark as finished'}</button>
          ${qn ? `<a class="btn alt" href="#/quiz/s/${L.t}-${L.s}">🧩 Practise “${esc(L.sub.name)}” (${qn})</a>` : ''}
        </div>
        <div class="pager">
          ${prev ? `<a href="${lessonHref(prev)}"><small>← Previous</small>${esc(prev.lesson.title)}</a>` : '<span></span>'}
          ${next ? `<a class="next" href="${lessonHref(next)}"><small>Next →</small>${esc(next.lesson.title)}</a>` : '<span></span>'}
        </div>
      </section>
    </div>`;
  }

  /* Glossary term chips inside lessons / quiz text */
  let termRe = null; const termMap = new Map();
  function buildTerms() {
    const parts = [];
    GLOSSARY.forEach((g) => {
      (g.match || [g.en]).forEach((m) => { termMap.set(m.toLowerCase(), { g, lang: 'en' }); parts.push(m); });
      if (g.fr && g.fr.length > 4) { termMap.set(g.fr.toLowerCase(), { g, lang: 'fr' }); parts.push(g.fr); }
    });
    parts.sort((a, b) => b.length - a.length);
    if (parts.length) termRe = new RegExp(`(^|[^\\p{L}])(${parts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![\\p{L}])`, 'giu');
  }
  function decorateTerms(root, max = 999) {
    if (!termRe) return;
    const used = new Set(); let count = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement.closest('figcaption, .term, a, button, h1') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (count >= max) return;
      const text = node.nodeValue; termRe.lastIndex = 0; let m; let last = 0; const frag = document.createDocumentFragment(); let changed = false;
      while ((m = termRe.exec(text))) {
        const word = m[2]; const hit = termMap.get(word.toLowerCase());
        if (!hit || used.has(hit.g.fr)) continue;
        used.add(hit.g.fr); count++; changed = true;
        const start = m.index + m[1].length;
        frag.appendChild(document.createTextNode(text.slice(last, start)));
        const span = document.createElement('span'); span.className = 'term'; span.tabIndex = 0;
        span.innerHTML = `${esc(word)}<span class="fr">${hit.lang === 'en' ? '🇫🇷 ' + esc(hit.g.fr) : '🇬🇧 ' + esc(hit.g.en)}</span><span class="tip"><b>${esc(hit.g.fr)}</b> = ${esc(hit.g.en)}<br>${esc(hit.g.def || '')}</span>`;
        frag.appendChild(span); last = start + word.length;
        if (count >= max) break;
      }
      if (changed) { frag.appendChild(document.createTextNode(text.slice(last))); node.replaceWith(frag); }
    });
  }

  /* ---------- Quiz engine (practice) ---------- */
  let session = null;
  function pickQuiz(kind, arg) {
    if (kind === 't') return { title: `Theme ${arg}: ${themeName(themeByNum(arg))}`, t: +arg, qs: shuffle(QUIZ.filter((q) => q.t === +arg)).slice(0, 15) };
    if (kind === 's') { const [t, s] = arg.split('-').map(Number); const st = themeByNum(t).subtopics[s]; return { title: st.name, t, qs: shuffle(QUIZ.filter((q) => q.t === t && q.s === s)) }; }
    if (kind === 'mistakes') return { title: 'My mistakes', t: null, qs: shuffle(mistakes()) };
    return { title: 'Quick quiz — all themes', t: null, qs: shuffle(QUIZ).slice(0, 15) };
  }
  function startQuiz(kind, arg) {
    const p = pickQuiz(kind, arg);
    session = { mode: 'practice', kind, arg, ...p, i: 0, sel: new Set(), done: false, results: [], key: location.hash, order: p.qs.map((q) => shuffleOpts(q)) };
  }
  // Keep options in original order (letters matter for multi-answer) but allow future shuffle
  const shuffleOpts = (q) => q.o.map((_, i) => i);
  const isExact = (q, sel) => { const a = new Set(q.a); return a.size === sel.size && [...a].every((x) => sel.has(x)); };

  function viewQuiz(kind, arg) {
    if (!session || session.key !== location.hash || session.mode !== 'practice') startQuiz(kind, arg);
    const s = session;
    if (!s.qs.length) return `<div class="quiz-shell"><div class="card empty"><div class="e">${kind === 'mistakes' ? '🎉' : '🤷'}</div>
      <h2>${kind === 'mistakes' ? 'No mistakes to review!' : 'No questions here yet'}</h2>
      <p>${kind === 'mistakes' ? 'Answer some quizzes first — anything you get wrong lands here.' : ''}</p><a class="btn" href="#/quiz/all">🧩 Quick quiz</a></div></div>`;
    if (s.i >= s.qs.length) return quizResults(s);
    return questionCard(s);
  }

  function questionCard(s) {
    const q = s.qs[s.i]; const answered = s.done; const color = META[q.t]?.color || '#4f46e5';
    const multi = q.a.length > 1;
    const L = q.l != null ? LESSONS.find((x) => x.t === q.t && x.s === q.s && x.l === q.l) : LESSONS.find((x) => x.t === q.t && x.s === q.s);
    const ok = answered && isExact(q, s.sel);
    const opts = s.order[s.i].map((oi, k) => {
      let cls = s.sel.has(oi) ? 'sel' : '';
      if (answered && s.mode === 'practice') {
        const correct = q.a.includes(oi);
        cls = correct && s.sel.has(oi) ? 'right' : !correct && s.sel.has(oi) ? 'wrong' : correct ? 'right missed' : '';
      }
      return `<button class="opt ${cls}" data-action="pick" data-opt="${oi}" ${answered ? 'disabled' : ''}><span class="key">${LETTERS[k]}</span><span>${esc(q.o[oi])}</span></button>`;
    }).join('');
    const exam = s.mode === 'exam';
    return `<div class="quiz-shell" style="--tc:${color}">
      <div class="quiz-top">
        <a class="icon-btn" href="${exam ? '#/exam' : '#/'}" data-action="${exam ? 'quit-exam' : ''}" aria-label="Quit">✕</a>
        <div class="bar"><i style="width:${100 * s.i / s.qs.length}%"></i></div>
        <b>${s.i + 1}/${s.qs.length}</b>
      </div>
      <div class="q-card" id="qcard">
        <div class="row"><span class="chip">${META[q.t]?.emoji || ''} ${esc(themeName(themeByNum(q.t)))}</span>
          <span class="q-hint">${exam ? 'Une ou plusieurs réponses' : multi ? `${q.a.length} correct answers` : '1 correct answer'}</span></div>
        <div class="q-text" id="qtext">${esc(q.q)}</div>
        ${q.img ? `<figure><img src="img/${esc(q.img)}" alt="" data-zoom></figure>` : ''}
        <div class="opts">${opts}</div>
        ${exam && S.timer ? `<div class="timer"><i id="timer-bar" style="width:100%"></i></div>` : ''}
        ${answered && !exam ? `<div class="feedback ${ok ? 'ok' : 'ko'}">
            <h3>${ok ? pickPraise() : '❌ Not quite — zero partial credit!'}</h3>
            ${!ok ? `<p><b>Correct answer${q.a.length > 1 ? 's' : ''}:</b> ${q.a.map((x) => LETTERS[s.order[s.i].indexOf(x)]).join(' + ')}</p>` : ''}
            <p>${esc(q.e || '')}</p>
            ${L ? `<p class="small"><a href="${lessonHref(L)}">📖 Review: ${esc(L.lesson.title)}</a></p>` : ''}
          </div>` : ''}
        <div class="row" style="margin-top:18px">
          <span class="small muted">Keys: <span class="kbd">A</span>–<span class="kbd">D</span> select · <span class="kbd">Enter</span> ${answered ? 'next' : 'validate'}</span>
          <span class="spacer"></span>
          ${answered && !exam ? `<button class="btn" data-action="next">${s.i + 1 < s.qs.length ? 'Next →' : 'See results 🏁'}</button>`
            : `<button class="btn" data-action="submit" ${s.sel.size ? '' : 'disabled'}>${exam ? 'Valider ✓' : 'Check ✓'}</button>`}
        </div>
      </div>
    </div>`;
  }
  const PRAISE = ['🎉 Correct!', '🚀 Nailed it!', '✨ Parfait !', '💪 Spot on!', '🏁 Exactly right!', '👏 Bravo !'];
  const pickPraise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];

  function quizResults(s) {
    const right = s.results.filter((r) => r.ok).length, n = s.results.length, pct = n ? 100 * right / n : 0;
    if (!s.celebrated) {
      s.celebrated = true;
      if (pct >= 80) confetti();
      if (pct === 100 && n >= 5) { S.badges.perfect = true; save(); }
      checkBadges(); renderChrome();
    }
    return `<div class="quiz-shell">
      <div class="card result-hero">
        <div class="emoji-big">${pct === 100 ? '🏆' : pct >= 80 ? '🎉' : pct >= 50 ? '💪' : '📚'}</div>
        <h1>${right} / ${n} correct</h1>
        ${ring(pct, 110, 12, null, pct >= 80 ? 'var(--good)' : pct >= 50 ? 'var(--warn)' : 'var(--bad)')}
        <p class="muted">${pct >= 80 ? 'Excellent work — you’re exam-ready on this!' : pct >= 50 ? 'Good progress. Review the misses below and go again.' : 'Worth re-reading the lessons, then retry.'}</p>
        <div class="row" style="justify-content:center">
          <button class="btn" data-action="retry">🔄 Try again</button>
          ${mistakes().length ? `<a class="btn alt" href="#/quiz/mistakes">🔁 Review mistakes (${mistakes().length})</a>` : ''}
          <a class="btn alt" href="#/">🏠 Home</a>
        </div>
      </div>
      ${reviewList(s)}
    </div>`;
  }
  function reviewList(s, onlyWrong = true) {
    const items = s.results.filter((r) => !onlyWrong || !r.ok);
    if (!items.length) return '';
    return `<div class="section-title"><h2>${onlyWrong ? 'Review what you missed' : 'All answers'}</h2></div>
      <div class="grid">${items.map((r) => {
        const q = r.q; const L = LESSONS.find((x) => x.t === q.t && x.s === q.s && (q.l == null || x.l === q.l));
        return `<div class="card review-item ${r.ok ? 'ok' : ''}" style="${tc(q.t)}">
          <div class="row"><span class="chip">${META[q.t].emoji} Theme ${q.t}</span>${r.ok ? '<span class="chip" style="--tc:var(--good)">✓</span>' : '<span class="chip" style="--tc:var(--bad)">✗</span>'}</div>
          <p><b>${esc(q.q)}</b></p>
          <ul>${q.o.map((o, i) => `<li>${q.a.includes(i) ? '✅' : r.sel.includes(i) ? '❌' : '▫️'} ${LETTERS[i]}. ${esc(o)}</li>`).join('')}</ul>
          <p class="muted small">${esc(q.e || '')}</p>
          ${L ? `<a class="small" href="${lessonHref(L)}">📖 ${esc(L.lesson.title)}</a>` : ''}
        </div>`;
      }).join('')}</div>`;
  }

  /* ---------- Mock exam ---------- */
  const EXAM_N = 40, PASS = 35, SECS = 20;
  let timerId = null;
  function buildExam() {
    const byTheme = {}; QUIZ.forEach((q) => (byTheme[q.t] ||= []).push(q));
    let picked = [];
    Object.values(byTheme).forEach((arr) => { picked.push(...shuffle(arr).slice(0, 4)); });
    const rest = shuffle(QUIZ.filter((q) => !picked.includes(q)));
    while (picked.length < EXAM_N && rest.length) picked.push(rest.pop());
    return shuffle(picked).slice(0, EXAM_N);
  }
  function viewExam() {
    if (session && session.mode === 'exam' && location.hash === '#/exam/run') {
      if (session.i >= session.qs.length) return examResults(session);
      return questionCard(session);
    }
    const hist = S.exams.slice(-8);
    return `<div class="narrow">
      <div class="card" style="--tc:#0ea5e9">
        <div class="row"><span style="font-size:3rem">📝</span><div><h1 style="margin:0">Mock exam</h1><div class="tag-fr">Examen blanc — Épreuve théorique générale</div></div></div>
        <div class="grid cols-2" style="margin:18px 0">
          <div class="stat"><div class="v">40</div><div class="l">questions, all 10 themes</div></div>
          <div class="stat"><div class="v">20 s</div><div class="l">per question (like the real ETG)</div></div>
          <div class="stat"><div class="v">35/40</div><div class="l">needed to pass</div></div>
          <div class="stat"><div class="v">0</div><div class="l">partial credit — select every correct answer</div></div>
        </div>
        <p>Just like the real exam: you can't go back, you won't see whether you were right until the end, and when the timer runs out whatever you've selected is submitted.</p>
        <label class="row" style="font-weight:800;margin:10px 0 18px"><input type="checkbox" data-action="toggle-timer" ${S.timer ? 'checked' : ''} style="width:20px;height:20px"> ⏱ Use the 20-second timer</label>
        <button class="btn" data-action="start-exam" style="font-size:1.15rem">🚦 Start the exam</button>
      </div>
      ${hist.length ? `<div class="section-title"><h2>Your recent exams</h2></div>
        <div class="card">${examChart(hist)}</div>` : ''}
    </div>`;
  }
  function examChart(hist) {
    const w = 640, h = 200, pad = 28, bw = (w - pad * 2) / Math.max(hist.length, 1);
    const y = (v) => h - pad - (v / 40) * (h - pad * 2);
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Recent mock exam scores">
      <line x1="${pad}" x2="${w - pad}" y1="${y(PASS)}" y2="${y(PASS)}" stroke="var(--good)" stroke-dasharray="6 6" stroke-width="2"/>
      <text x="${w - pad}" y="${y(PASS) - 6}" text-anchor="end" fill="var(--good)" font-size="12" font-weight="800">pass 35</text>
      ${hist.map((e, i) => `<rect x="${pad + i * bw + bw * .2}" y="${y(e.score)}" width="${bw * .6}" height="${h - pad - y(e.score)}" rx="8" fill="${e.score >= PASS ? 'var(--good)' : 'var(--bad)'}"/>
        <text x="${pad + i * bw + bw / 2}" y="${y(e.score) - 6}" text-anchor="middle" font-size="13" font-weight="800" fill="var(--ink)">${e.score}</text>
        <text x="${pad + i * bw + bw / 2}" y="${h - 8}" text-anchor="middle" font-size="11" fill="var(--ink-3)">${e.date.slice(5)}</text>`).join('')}
    </svg>`;
  }
  function startExam() {
    const qs = buildExam();
    session = { mode: 'exam', title: 'Mock exam', qs, i: 0, sel: new Set(), done: false, results: [], key: '#/exam/run', order: qs.map(shuffleOpts) };
    location.hash = '#/exam/run';
  }
  function startTimer() {
    clearInterval(timerId);
    if (!session || session.mode !== 'exam' || !S.timer || session.i >= session.qs.length) return;
    const start = Date.now(); const idx = session.i;
    timerId = setInterval(() => {
      const bar = $('#timer-bar'); const left = SECS - (Date.now() - start) / 1000;
      if (!session || session.i !== idx) { clearInterval(timerId); return; }
      if (bar) { bar.style.width = Math.max(0, 100 * left / SECS) + '%'; bar.style.backgroundPosition = `${100 * (1 - left / SECS)}% 0`; }
      if (left <= 0) { clearInterval(timerId); submitAnswer(true); }
    }, 100);
  }
  function examResults(s) {
    const score = s.results.filter((r) => r.ok).length; const pass = score >= PASS;
    if (!s.saved) {
      s.saved = true;
      const byTheme = {}; s.results.forEach((r) => { const b = (byTheme[r.q.t] ||= { n: 0, ok: 0 }); b.n++; if (r.ok) b.ok++; });
      S.exams.push({ date: today(), score, byTheme }); touchDay(); save();
      if (pass) confetti(180);
      checkBadges(); renderChrome();
    }
    const byTheme = {}; s.results.forEach((r) => { const b = (byTheme[r.q.t] ||= { n: 0, ok: 0 }); b.n++; if (r.ok) b.ok++; });
    return `<div class="quiz-shell">
      <div class="card result-hero">
        <div class="emoji-big">${pass ? '🏆' : '🚧'}</div>
        <h1>${score} / 40</h1>
        <div class="verdict ${pass ? 'pass' : 'fail'}">${pass ? 'FAVORABLE — you passed! 🎉' : `DÉFAVORABLE — ${PASS - score} more needed`}</div>
        <p class="muted">${pass ? 'That’s an exam-level score. Keep it consistent across several mock exams.' : 'Check which themes cost you points, read those lessons again, then retry.'}</p>
        <div class="row" style="justify-content:center"><button class="btn" data-action="start-exam">🔄 New exam</button><a class="btn alt" href="#/quiz/mistakes">🔁 Practise mistakes</a></div>
      </div>
      <div class="section-title"><h2>Score by theme</h2></div>
      <div class="card theme-bars">${Object.keys(byTheme).sort((a, b) => a - b).map((t) => {
        const b = byTheme[t]; const p = 100 * b.ok / b.n;
        return `<div class="theme-bar" style="${tc(t)}"><a href="#/theme/${t}" style="color:var(--ink);text-decoration:none">${META[t].emoji} ${esc(themeName(themeByNum(t)))}</a><div class="bar"><i style="width:${p}%;background:${p === 100 ? 'var(--good)' : p >= 50 ? 'var(--warn)' : 'var(--bad)'}"></i></div><b>${b.ok}/${b.n}</b></div>`;
      }).join('')}</div>
      ${reviewList(s)}
    </div>`;
  }

  /* ---------- Official sample questions ---------- */
  const offSel = {};
  function viewOfficial() {
    const tried = Object.keys(S.official).length, right = Object.values(S.official).filter(Boolean).length;
    return `<div class="wrap" style="--tc:#1d4ed8">
      <div class="row"><span style="font-size:3rem">🇫🇷</span><div><h1 style="margin:0">Official sample questions</h1>
        <div class="muted">From the government PDF <i>“Exemples de nouvelles questions à l'examen du code de la route”</i>. Pick your answers, then check.</div></div></div>
      <div class="row" style="margin:16px 0"><span class="pill">✅ ${right} correct</span><span class="pill">📝 ${tried}/${OFFICIAL.length} tried</span>
        <span class="small muted">Tip: there may be 1 or several correct letters. Questions are in French — just like the real exam!</span></div>
      <div class="grid cols-2">${OFFICIAL.map((o, i) => {
        const sel = offSel[i] || new Set(); const res = S.official[i];
        const shown = offSel['shown' + i];
        return `<div class="card off-card" id="off-${i}">
          <div class="row"><b>Question ${i + 1}</b><span class="spacer"></span>${res === undefined ? '' : res ? '<span class="chip" style="--tc:var(--good)">✓ Correct</span>' : '<span class="chip" style="--tc:var(--bad)">✗ Missed</span>'}</div>
          <img src="img/exam/${o.img}" alt="Official question ${i + 1}" data-zoom loading="lazy" style="margin-top:10px">
          <div class="off-opts">${'ABCD'.split('').map((l) => {
            let cls = sel.has(l) ? 'sel' : '';
            if (shown) cls = o.a.includes(l) ? (sel.has(l) ? 'right' : 'right missed') : sel.has(l) ? 'wrong' : '';
            return `<button class="opt ${cls}" data-action="off-pick" data-i="${i}" data-l="${l}" ${shown ? 'disabled' : ''}><span class="key">${l}</span></button>`;
          }).join('')}
          <span class="spacer"></span>
          ${shown ? `<button class="btn small alt" data-action="off-reset" data-i="${i}">↺ Retry</button>` : `<button class="btn small" data-action="off-check" data-i="${i}" ${sel.size ? '' : 'disabled'}>Check</button>`}</div>
          ${shown ? `<p class="small"><b>Bonne(s) réponse(s) :</b> ${o.a.split('').join(' + ')}${o.note ? ` — ${esc(o.note)}` : ''}</p>` : ''}
        </div>`;
      }).join('')}</div>
    </div>`;
  }

  /* ---------- Tools ---------- */
  function viewTools() {
    return `<div class="wrap"><div class="row"><span style="font-size:3rem">🎮</span><div><h1 style="margin:0">Interactive tools</h1>
      <div class="muted">Play with the rules — visual simulators and drills. Each opens as its own page (use your browser's back button to return).</div></div></div>
      <div class="tool-callouts" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">${TOOLS.map((x) => `<a class="tool-card" href="${x.file}" style="padding:22px"><span class="ico" style="font-size:2.6rem">${x.icon}</span><span><b>${esc(x.title)}</b><span class="small muted">${esc(x.desc)}</span><br><span class="small" style="font-weight:800;color:var(--accent)">Related: ${x.subs.map(esc).join(', ')}</span></span></a>`).join('')}</div></div>`;
  }

  /* ---------- Glossary ---------- */
  let gFilter = 0, gQuery = '';
  function viewGlossary() {
    return `<div class="wrap" style="--tc:#10b981"><div class="row"><span style="font-size:3rem">🇫🇷</span><div><h1 style="margin:0">French exam glossary</h1>
      <div class="muted">${GLOSSARY.length} terms you'll meet in the real exam. Tap 🔊 to hear the French.</div></div></div>
      <input class="text-input" id="g-search" placeholder="Filter: e.g. priorité, roundabout, alcool…" value="${esc(gQuery)}" style="margin-top:16px">
      <div class="g-filters"><button class="${gFilter ? '' : 'on'}" data-action="g-filter" data-t="0">All</button>
        ${CONTENT.themes.map((t) => `<button class="${gFilter === t.num ? 'on' : ''}" data-action="g-filter" data-t="${t.num}" style="${tc(t.num)}">${META[t.num].emoji} ${t.num}</button>`).join('')}</div>
      <div class="grid cols-3" id="g-list">${glossaryCards()}</div></div>`;
  }
  function glossaryCards() {
    const q = gQuery.trim().toLowerCase();
    const list = GLOSSARY.filter((g) => (!gFilter || g.t === gFilter) && (!q || `${g.fr} ${g.en} ${g.def}`.toLowerCase().includes(q)));
    if (!list.length) return `<div class="empty"><div class="e">🔍</div>No terms match.</div>`;
    return list.map((g) => `<div class="card g-card" style="${tc(g.t)}"><div class="fr">${esc(g.fr)} <button class="say" data-action="say" data-text="${esc(g.fr)}" aria-label="Pronounce ${esc(g.fr)}">🔊</button></div>
      <div class="en">${esc(g.en)}</div><p>${esc(g.def || '')}</p><span class="chip">${META[g.t]?.emoji || ''} Theme ${g.t}</span></div>`).join('');
  }

  /* ---------- Search ---------- */
  function viewSearch(q) {
    q = decodeURIComponent(q || '').trim();
    $('#search-input').value = q;
    if (q.length < 2) return `<div class="narrow empty"><div class="e">🔎</div>Type at least 2 letters to search.</div>`;
    const ql = q.toLowerCase();
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const hits = LESSONS.map((L) => {
      const text = lessonText(L); const i = text.toLowerCase().indexOf(ql);
      const inTitle = L.lesson.title.toLowerCase().includes(ql) || L.sub.name.toLowerCase().includes(ql);
      if (i < 0 && !inTitle) return null;
      const snip = i >= 0 ? text.slice(Math.max(0, i - 70), i + 120) : text.slice(0, 160);
      return { L, score: (inTitle ? 10 : 0) + (text.toLowerCase().split(ql).length - 1), snip };
    }).filter(Boolean).sort((a, b) => b.score - a.score);
    const gh = GLOSSARY.filter((g) => `${g.fr} ${g.en}`.toLowerCase().includes(ql));
    const qh = QUIZ.filter((x) => x.q.toLowerCase().includes(ql)).length;
    return `<div class="narrow"><h1>Results for “${esc(q)}”</h1>
      ${gh.length ? `<div class="section-title"><h2>🇫🇷 Glossary</h2></div><div class="grid cols-2">${gh.slice(0, 6).map((g) => `<div class="card g-card" style="${tc(g.t)}"><div class="fr">${esc(g.fr)} <button class="say" data-action="say" data-text="${esc(g.fr)}">🔊</button></div><div class="en">${esc(g.en)}</div><p>${esc(g.def || '')}</p></div>`).join('')}</div>` : ''}
      <div class="section-title"><h2>📖 Lessons (${hits.length})</h2>${qh ? `<span class="small muted">· ${qh} quiz questions mention it</span>` : ''}</div>
      ${hits.length ? `<div class="grid">${hits.slice(0, 40).map((h) => `<a class="card result" href="${lessonHref(h.L)}" style="${tc(h.L.t)}">
        <div class="row"><span class="chip">${META[h.L.t].emoji} ${esc(h.L.sub.name)}</span></div>
        <h3 style="margin:8px 0 4px">${esc(h.L.lesson.title)}</h3><div class="muted small">…${esc(h.snip).replace(re, (m) => `<mark>${m}</mark>`)}…</div></a>`).join('')}</div>`
        : `<div class="empty"><div class="e">🤔</div>No lessons match. Try an English or French keyword.</div>`}
    </div>`;
  }

  /* ---------- Progress ---------- */
  function viewProgress() {
    const total = LESSONS.length, done = readCount();
    return `<div class="wrap"><h1>🏅 Progress & badges</h1>
      <div class="stats">
        <div class="stat"><div class="v">${Math.round(100 * done / total)}%</div><div class="l">of lessons finished</div></div>
        <div class="stat"><div class="v">${Object.keys(S.answers).length}</div><div class="l">questions answered</div></div>
        <div class="stat"><div class="v">${accuracy() ?? '–'}${accuracy() !== null ? '%' : ''}</div><div class="l">accuracy (latest attempts)</div></div>
        <div class="stat"><div class="v">${S.exams.length}</div><div class="l">mock exams · ${S.exams.filter((e) => e.score >= PASS).length} passed</div></div>
        <div class="stat"><div class="v">🔥 ${streak()}</div><div class="l">day streak · ${S.days.length} study days</div></div>
      </div>
      <div class="section-title"><h2>Badges (${BADGES.filter((b) => S.badges['got_' + b.id]).length}/${BADGES.length})</h2></div>
      <div class="grid cols-4">${BADGES.map((b) => `<div class="card badge-card ${S.badges['got_' + b.id] ? 'earned' : ''}"><div class="b-emo">${b.emo}</div><b>${b.name}</b><small>${b.desc}</small></div>`).join('')}</div>
      <div class="section-title"><h2>By theme</h2></div>
      <div class="card theme-bars">${CONTENT.themes.map((t) => {
        const tot = LESSONS.filter((L) => L.t === t.num).length, d = readCount((L) => L.t === t.num);
        const qs = QUIZ.filter((q) => q.t === t.num), ans = qs.filter((q) => S.answers[q.id]), ok = ans.filter((q) => S.answers[q.id].ok).length;
        return `<div class="theme-bar" style="${tc(t.num)}"><a href="#/theme/${t.num}" style="color:var(--ink);text-decoration:none">${META[t.num].emoji} ${esc(themeName(t))}</a>
          <div><div class="bar" title="Lessons"><i style="width:${100 * d / tot}%"></i></div><div class="small muted">📖 ${d}/${tot} lessons · 🧩 ${ok}/${qs.length} questions right</div></div><b>${Math.round(100 * d / tot)}%</b></div>`;
      }).join('')}</div>
      ${S.exams.length ? `<div class="section-title"><h2>Mock exam history</h2></div><div class="card">${examChart(S.exams.slice(-12))}</div>` : ''}
      <div class="section-title"><h2>Danger zone</h2></div>
      <div class="card"><p class="muted">Your progress is saved in this browser only (on this Mac). Resetting clears lessons read, quiz answers, exams and badges.</p>
        <button class="btn alt" data-action="reset">🗑 Reset all progress</button></div>
    </div>`;
  }

  const notFound = () => `<div class="narrow empty"><div class="e">🚧</div><h2>Road closed</h2><p>That page doesn't exist.</p><a class="btn" href="#/">🏠 Home</a></div>`;

  /* =========================================================
     ROUTER
     ========================================================= */
  function render() {
    clearInterval(timerId);
    const h = (location.hash || '#/').slice(1);
    const [path, ...rest] = h.split('/').filter(Boolean);
    let html;
    document.body.classList.remove('menu-open');
    if (!path) html = viewHome();
    else if (path === 'theme') html = viewTheme(rest[0]);
    else if (path === 'lesson') html = viewLesson(rest[0]);
    else if (path === 'quiz') html = viewQuiz(rest[0], rest[1]);
    else if (path === 'exam') html = viewExam();
    else if (path === 'official') html = viewOfficial();
    else if (path === 'tools') html = viewTools();
    else if (path === 'glossary') html = viewGlossary();
    else if (path === 'progress') html = viewProgress();
    else if (path === 'search') html = viewSearch(rest.join('/'));
    else html = notFound();
    view.innerHTML = html;
    renderChrome();
    afterRender(path);
  }
  let readObserver;
  function afterRender(path) {
    if (readObserver) readObserver.disconnect();
    if (path === 'lesson') {
      decorateTerms($('#lesson-body'), 14);
      const end = $('#lesson-end'); const id = location.hash.split('/')[2];
      readObserver = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting) && !S.read[id]) { markRead(id); const b = $('[data-action="mark-read"]'); if (b) { b.textContent = '✓ Finished'; b.classList.replace('theme', 'good'); } } }, { rootMargin: '0px 0px -10% 0px' });
      // Only auto-complete after the reader has actually scrolled
      setTimeout(() => { if (end && document.documentElement.scrollHeight > innerHeight * 1.3) readObserver.observe(end); }, 1500);
    }
    if (path === 'quiz' || (path === 'exam' && session && session.mode === 'exam' && location.hash === '#/exam/run')) {
      if ($('#qtext') && session && session.mode === 'practice') decorateTerms($('#qtext'), 3);
      startTimer();
    }
    if (path === 'glossary') {
      const inp = $('#g-search'); inp.addEventListener('input', () => { gQuery = inp.value; $('#g-list').innerHTML = glossaryCards(); });
    }
    if (!['quiz', 'exam'].includes(path) || !session || session.i === 0) window.scrollTo({ top: 0, behavior: 'instant' });
    if (path !== 'search') { view.focus({ preventScroll: true }); $('#search-input').value = ''; }
  }

  /* ---------- Answer handling ---------- */
  function submitAnswer(fromTimer) {
    const s = session; if (!s || s.done) return;
    if (!s.sel.size && !fromTimer) return;
    const q = s.qs[s.i]; const ok = isExact(q, s.sel);
    s.results.push({ q, ok, sel: [...s.sel] }); recordAnswer(q, ok);
    if (s.mode === 'exam') { s.i++; s.sel = new Set(); rerenderQuestion(); return; }
    s.done = true; rerenderQuestion();
    if (!ok) { const c = $('#qcard'); c && c.classList.add('shake'); }
  }
  function nextQuestion() { const s = session; s.i++; s.sel = new Set(); s.done = false; rerenderQuestion(); }
  function rerenderQuestion() {
    const html = session.mode === 'exam' ? (session.i >= session.qs.length ? examResults(session) : questionCard(session))
      : (session.i >= session.qs.length ? quizResults(session) : questionCard(session));
    view.innerHTML = html; renderChrome();
    if (session.i < session.qs.length) { if (session.mode === 'practice') decorateTerms($('#qtext'), 3); startTimer(); }
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- Events (delegated) ---------- */
  document.addEventListener('click', (e) => {
    const zoom = e.target.closest('img[data-zoom]');
    if (zoom) { const lb = $('#lightbox'); $('img', lb).src = zoom.src; $('p', lb).textContent = zoom.alt || ''; lb.hidden = false; return; }
    const el = e.target.closest('[data-action]'); if (!el) return;
    const a = el.dataset.action;
    if (a === 'toggle-menu') document.body.classList.toggle('menu-open');
    else if (a === 'toggle-theme') {
      const dark = S.theme ? S.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      S.theme = dark ? 'light' : 'dark'; save(); applyTheme();
    }
    else if (a === 'close-lightbox') $('#lightbox').hidden = true;
    else if (a === 'mark-read') { markRead(el.dataset.id); el.textContent = '✓ Finished'; el.classList.replace('theme', 'good'); }
    else if (a === 'pick') {
      if (!session || session.done) return;
      const o = +el.dataset.opt; session.sel.has(o) ? session.sel.delete(o) : session.sel.add(o);
      el.classList.toggle('sel'); const sb = $('[data-action="submit"]'); if (sb) sb.disabled = !session.sel.size;
    }
    else if (a === 'submit') submitAnswer();
    else if (a === 'next') nextQuestion();
    else if (a === 'retry') { session = null; render(); }
    else if (a === 'start-exam') startExam();
    else if (a === 'quit-exam') { e.preventDefault(); if (confirm('Quit this exam? Your answers so far will be lost.')) { session = null; location.hash = '#/exam'; } }
    else if (a === 'toggle-timer') { S.timer = el.checked; save(); }
    else if (a === 'off-pick') { const i = el.dataset.i; (offSel[i] ||= new Set()); offSel[i].has(el.dataset.l) ? offSel[i].delete(el.dataset.l) : offSel[i].add(el.dataset.l); rerenderOfficial(i); }
    else if (a === 'off-check') {
      const i = el.dataset.i; const sel = [...(offSel[i] || [])].sort().join(''); const ok = sel === OFFICIAL[i].a;
      offSel['shown' + i] = true; S.official[i] = ok; touchDay(); save(); rerenderOfficial(i); toast(ok ? '🎉 Correct!' : '❌ Not quite'); checkBadges();
    }
    else if (a === 'off-reset') { const i = el.dataset.i; offSel[i] = new Set(); offSel['shown' + i] = false; rerenderOfficial(i); }
    else if (a === 'g-filter') { gFilter = +el.dataset.t; render(); }
    else if (a === 'say') speak(el.dataset.text);
    else if (a === 'reset') { if (confirm('Reset ALL progress? This cannot be undone.')) { const t = S.theme; S = fresh(); S.theme = t; save(); render(); toast('Progress reset'); } }
  });
  function rerenderOfficial(i) {
    const y = scrollY; view.innerHTML = viewOfficial(); scrollTo(0, y);
  }
  $('.search').addEventListener('submit', (e) => { e.preventDefault(); const q = $('#search-input').value.trim(); if (q) location.hash = '#/search/' + encodeURIComponent(q); });
  let searchDebounce;
  $('#search-input').addEventListener('input', (e) => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => { const q = e.target.value.trim(); if (q.length >= 2) location.hash = '#/search/' + encodeURIComponent(q); }, 350);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { $('#lightbox').hidden = true; document.body.classList.remove('menu-open'); }
    if (!session || e.target.matches('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
    const onQuiz = $('#qcard'); if (!onQuiz) return;
    const k = e.key.toUpperCase();
    const idx = LETTERS.indexOf(k);
    if (idx >= 0 && k.length === 1) { const b = $$('.opt', onQuiz)[idx]; if (b && !b.disabled) b.click(); }
    if (e.key === 'Enter') { e.preventDefault(); const b = $('[data-action="next"]') || $('[data-action="submit"]'); if (b && !b.disabled) b.click(); }
  });
  // Reading progress bar
  addEventListener('scroll', () => {
    const bar = $('#reading-bar'); if (!bar) return;
    const h = document.documentElement; bar.style.width = (100 * h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) + '%';
  }, { passive: true });
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);
  addEventListener('hashchange', render);

  buildTerms(); applyTheme(); render(); checkBadges();
})();
