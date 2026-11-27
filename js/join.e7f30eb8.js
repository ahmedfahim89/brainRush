// Mokh Rush join page (US-52, D-80): a player's own phone joins the host's Phone buzzer game.
// Screens: the room code (when the link has none, or the game has ended), the name picker (the
// host's names as buttons, claimed ones greyed out) and the read-only live board with the scores.
// Only the host picks cells: nothing on the board can be tapped.
// The phone polls api/rooms.php about once a second (no WebSockets on shared hosting) and stops
// while the page is hidden. The device token from `join` is kept in localStorage with the room code,
// so a refreshed phone rejoins as the same name. The link holds only the room code, never a token.
// Every text comes from js/i18n.js; API and host text is rendered with textContent (never innerHTML).
// US-64: while the host has a question open, the phone shows it (category, points, text, countdown) with
// a text box and Send; the first answer sent is locked; when it closes the phone goes straight back to
// the board (US-64: within about 1 s), whose status line says the question is closed for a moment. The countdown follows the host's (server time plus this phone's clock offset).
'use strict';

(function () {
  const i18n = window.BrainRushI18n;
  const t = i18n.t;
  const iso = i18n.iso;
  const ltr = i18n.ltr;
  const API = 'api/rooms.php';
  // This phone's places, one per room (BUG-52-01): { "<CODE>": { token, at } }, at = Date.now() of the
  // last save. Forgetting one room never touches another; places older than PLACE_MAX_AGE_MS go.
  const STORE_KEY = 'brainrush.phone';
  const PLACE_MAX_AGE_MS = 12 * 60 * 60 * 1000; // rooms are deleted after 6 hours idle
  const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ROOM_CODE_ALPHABET in api/rooms.php
  const CODE_PATTERN = new RegExp('^[' + CODE_ALPHABET + ']{6}$');
  const TOKEN_PATTERN = /^[0-9a-f]{64}$/;
  const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
  const INK = '#0b1026'; // text on a contestant colour (the palette's ink in js/game.js)
  const BOARD_POLL_MS = 1000;
  const LOBBY_POLL_MS = 2000;
  const MAX_BACKOFF_MS = 8000;
  const MINUS = String.fromCharCode(0x2212);
  const TIMES = String.fromCharCode(0x00d7);
  const EN_DASH = String.fromCharCode(0x2013);
  const SCREENS = ['board', 'question', 'final', 'results'];
  const ANSWER_MAX = 200;        // ROOM_ANSWER_MAX in api/rooms.php
  const CLOSED_NOTE_MS = 3000;   // after a question closes, the board's status line says so this long
  const TICK_MS = 250;           // the countdown on the phone
  const CHOICE_LETTERS = ['A', 'B', 'C'];

  const byId = (id) => document.getElementById(id);
  const dom = {
    net: byId('join-net'),
    screens: { code: byId('join-code-screen'), pick: byId('join-pick-screen'), board: byId('join-board-screen') },
    ended: byId('join-ended'),
    codeForm: byId('join-code-form'),
    codeInput: byId('join-code'),
    codeError: byId('join-code-error'),
    pickTitle: byId('join-pick-title'),
    pickMsg: byId('join-pick-msg'),
    names: byId('join-names'),
    you: byId('join-you'),
    status: byId('join-status'),
    board: byId('join-board'),
    scores: byId('join-scores'),
    langBtns: Array.prototype.slice.call(document.querySelectorAll('[data-ui-lang]')),
    question: byId('join-question'),   // US-64
    qHead: byId('jq-head'),
    qPicture: byId('jq-picture'),
    qText: byId('jq-text'),
    qLang: byId('jq-lang'),
    qChoices: byId('jq-choices'),
    qTimerValue: byId('jq-timer-value'),
    qBar: byId('jq-bar'),
    qTimerNote: byId('jq-timer-note'),
    qForm: byId('jq-form'),
    qInput: byId('jq-input'),
    qSend: byId('jq-send'),
    qMsg: byId('jq-msg'),
  };

  // view: 'code' | 'pick' | 'board'. players = [{name, color, joined}] from the last poll; game = the
  // board state (api/rooms.php room_state) and you = this phone's index once joined.
  const app = {
    view: 'code',
    code: null,
    token: null,
    you: null,
    version: null,
    mode: 'players', // 'players' | 'teams': the name screen asks "Who are you?" or "Which team are you?"
    players: null,
    game: null,
    ended: false,
    pickMsg: null,   // string key of the message on the name screen
    joining: false,
    failures: 0,
    timer: null,
    run: 0,          // a poll answer from before the last view change is dropped
    question: null,  // US-64: the room's open (or last closed) question, from the state poll
    mine: null,      // this contestant's answer to it, from the server (a refreshed phone stays locked)
    offset: 0,       // server time minus this phone's clock (ms), for the countdown
    q: null,         // the question on screen: { seq, data, lang, sent, late, locked, sending, msg, wasOpen, closedUntil, choicesKey }
    ticker: null,
  };

  // ---------- Helpers ----------

  function h(tag, props, children) {
    const node = document.createElement(tag);
    Object.keys(props || {}).forEach((key) => {
      if (key === 'text') node.textContent = props[key];
      else if (key.indexOf('-') !== -1) node.setAttribute(key, props[key]);
      else node[key] = props[key];
    });
    (children || []).forEach((child) => { if (child) node.appendChild(child); });
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function formatScore(score) {
    return ltr(score < 0 ? MINUS + Math.abs(score) : String(score));
  }

  function localName(name, nameAr) {
    return i18n.isArabic() && typeof nameAr === 'string' && nameAr.trim() !== '' ? nameAr : name;
  }

  function safeColor(color) {
    return typeof color === 'string' && COLOR_PATTERN.test(color) ? color : null;
  }

  /** "abc 234" or "ABC-234" from a link or the input -> "ABC234". */
  function normalizeCode(text) {
    return String(text || '').toUpperCase().replace(/[\s-]+/g, '');
  }

  function showMsg(node, text, kind) {
    node.textContent = text;
    node.className = 'msg msg-' + kind;
    node.hidden = false;
  }

  // ---------- Saved place (this phone's device token) ----------

  /** Every saved place that is still recent: { code: { token, at } }. The first build's single { code, token } is read too. */
  function readPlaces() {
    let saved = null;
    try {
      saved = JSON.parse(window.localStorage.getItem(STORE_KEY));
    } catch (err) {
      saved = null; // storage disabled or corrupt: no places
    }
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
    if (typeof saved.code === 'string' && typeof saved.token === 'string') {
      saved = { [saved.code]: { token: saved.token, at: Date.now() } };
    }
    const places = {};
    Object.keys(saved).forEach((code) => {
      const p = saved[code];
      if (CODE_PATTERN.test(code) && p && TOKEN_PATTERN.test(p.token) && Number.isFinite(p.at) &&
          Date.now() - p.at < PLACE_MAX_AGE_MS) places[code] = { token: p.token, at: p.at };
    });
    return places;
  }

  function loadPlace(code) {
    const place = readPlaces()[code];
    return place ? place.token : null;
  }

  /** Keep (token) or forget (null) this room's place only; the other rooms' places stay. */
  function savePlace(code, token) {
    const places = readPlaces();
    if (token) places[code] = { token: token, at: Date.now() };
    else delete places[code];
    try {
      if (Object.keys(places).length) window.localStorage.setItem(STORE_KEY, JSON.stringify(places));
      else window.localStorage.removeItem(STORE_KEY);
    } catch (err) {
      // storage disabled: the phone stays joined until the page is closed
    }
  }

  // ---------- API ----------

  async function call(query, options) {
    let response;
    try {
      response = await fetch(API + '?' + query, Object.assign({ cache: 'no-store' }, options));
    } catch (err) {
      const error = new Error('network');
      error.status = 0;
      throw error;
    }
    let data = null;
    try {
      data = await response.json();
    } catch (err) {
      data = null;
    }
    if (!response.ok || data === null || typeof data !== 'object') {
      const error = new Error(data && typeof data.error === 'string' ? data.error : 'http');
      error.status = response.ok ? 0 : response.status;
      error.data = data; // US-64: { reason: 'duplicate' | 'late' } of a refused answer
      throw error;
    }
    return data;
  }

  function getLobby() {
    return call('action=lobby&code=' + app.code, { headers: { Accept: 'application/json' } });
  }

  function getState() {
    const since = app.version === null ? '' : '&since=' + app.version;
    return call('action=state&code=' + app.code + since, {
      headers: { Accept: 'application/json', 'X-Device-Token': app.token },
    });
  }

  function postJoin(index) {
    const body = { code: app.code, contestant: index };
    if (app.token) body.device_token = app.token;
    return call('action=join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
  }

  // ---------- Views and polling ----------

  function setView(view) {
    app.view = view;
    stopTicker();
    app.run += 1;
    Object.keys(dom.screens).forEach((key) => { dom.screens[key].hidden = key !== view; });
    render();
    schedule(0);
  }

  function schedule(ms) {
    window.clearTimeout(app.timer);
    app.timer = null;
    if (app.view === 'code' || document.hidden) return; // nothing to follow, or the phone is not looking
    app.timer = window.setTimeout(poll, ms);
  }

  async function poll() {
    const run = app.run;
    const board = app.view === 'board';
    try {
      const data = board ? await getState() : await getLobby();
      if (run !== app.run) return;
      app.failures = 0;
      dom.net.hidden = true;
      if (board) applyState(data);
      else applyLobby(data);
      schedule(board ? BOARD_POLL_MS : LOBBY_POLL_MS);
    } catch (err) {
      if (run !== app.run) return;
      onPollError(err, board);
    }
  }

  function onPollError(err, board) {
    if (err.status === 404) {
      gameEnded();
    } else if (board && (err.status === 401 || err.status === 403)) {
      // released by the host (or the name went to another phone): back to the names
      forgetToken();
      app.pickMsg = 'join.released';
      setView('pick');
    } else {
      app.failures += 1;
      dom.net.textContent = t('join.offline');
      dom.net.hidden = false;
      schedule(Math.min(MAX_BACKOFF_MS, (board ? BOARD_POLL_MS : LOBBY_POLL_MS) * (app.failures + 1)));
    }
  }

  function applyLobby(data) {
    if (!Array.isArray(data.players)) return;
    app.mode = data.mode === 'teams' ? 'teams' : 'players';
    app.players = data.players;
    renderPick();
  }

  function applyState(data) {
    if (Number.isFinite(data.now)) app.offset = data.now - Date.now();
    if (data.changed === false) return;
    if (!isValidState(data)) return; // an odd answer: keep what is on screen, ask again next time
    if (app.version === null) savePlace(app.code, app.token); // refreshes its age once per page load
    app.version = data.version;
    app.you = data.you;
    app.players = data.players;
    app.game = data.state;
    app.mode = data.state.mode === 'teams' ? 'teams' : 'players';
    app.question = isValidQuestion(data.question) ? data.question : null;
    app.mine = typeof data.mine === 'string' ? data.mine : null;
    renderBoard();
  }

  function isValidState(data) {
    const s = data.state;
    return Number.isInteger(data.version) && Number.isInteger(data.you) && Array.isArray(data.players) &&
      s && typeof s === 'object' && Array.isArray(s.contestants) && Array.isArray(s.points) &&
      Array.isArray(s.categories) && Array.isArray(s.cells) && s.cells.length === s.points.length &&
      s.cells.every((row) => Array.isArray(row) && row.length === s.categories.length) &&
      data.you >= 0 && data.you < s.contestants.length;
  }

  function forgetToken() {
    app.token = null;
    app.you = null;
    app.version = null;
    app.game = null;
    app.question = null;
    app.mine = null;
    app.q = null;
    savePlace(app.code, null);
  }

  function gameEnded() {
    forgetToken();
    app.ended = true;
    dom.net.hidden = true;
    setView('code');
  }

  // ---------- Joining ----------

  function openRoom(code) {
    app.code = code;
    app.ended = false;
    app.token = loadPlace(code);
    app.version = null;
    app.players = null;
    app.pickMsg = null;
    setView(app.token ? 'board' : 'pick');
  }

  function onCodeSubmit(event) {
    event.preventDefault();
    const code = normalizeCode(dom.codeInput.value);
    if (!CODE_PATTERN.test(code)) {
      dom.codeError.textContent = t('join.codeInvalid');
      dom.codeError.hidden = false;
      dom.codeInput.setAttribute('aria-invalid', 'true');
      dom.codeInput.focus();
      return;
    }
    dom.codeError.hidden = true;
    dom.codeInput.removeAttribute('aria-invalid');
    try {
      window.history.replaceState(null, '', '?room=' + code);
    } catch (err) {
      // the address stays as it was; the page works the same
    }
    openRoom(code);
  }

  async function pickName(index) {
    if (app.joining) return;
    app.joining = true;
    app.pickMsg = null;
    renderPick();
    const run = app.run;
    try {
      const data = await postJoin(index);
      if (run !== app.run) return;
      if (!TOKEN_PATTERN.test(data.device_token)) throw new Error('response');
      app.token = data.device_token;
      app.version = null;
      savePlace(app.code, app.token);
      app.joining = false;
      setView('board');
    } catch (err) {
      app.joining = false;
      if (run !== app.run) return;
      if (err.status === 404) {
        gameEnded();
        return;
      }
      app.pickMsg = err.status === 409 ? 'join.takenMsg' : 'join.offline';
      renderPick();
      schedule(0); // the names again now: the one just taken turns grey
    }
  }

  // ---------- Rendering ----------

  function render() {
    applyStaticTexts();
    if (app.view === 'code') renderCode();
    else if (app.view === 'pick') renderPick();
    else renderBoard();
  }

  function applyStaticTexts() {
    i18n.apply(document);
    document.title = t('join.pageTitle') + ' | ' + t('app.name');
    const lang = i18n.lang();
    dom.langBtns.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.getAttribute('data-ui-lang') === lang)));
  }

  function renderCode() {
    dom.ended.hidden = !app.ended;
    if (app.ended) dom.ended.textContent = t('join.ended');
    if (!dom.codeError.hidden) dom.codeError.textContent = t('join.codeInvalid');
  }

  function renderPick() {
    dom.pickTitle.textContent = t('join.pick.' + app.mode);
    if (app.joining) showMsg(dom.pickMsg, t('join.joining'), 'warning');
    else if (app.pickMsg) showMsg(dom.pickMsg, t(app.pickMsg), app.pickMsg === 'join.offline' ? 'warning' : 'error');
    else dom.pickMsg.hidden = true;
    clear(dom.names);
    (app.players || []).forEach((p, index) => {
      const color = safeColor(p.color);
      const name = String(p.name);
      const btn = h('button', {
        type: 'button',
        className: 'join-name' + (p.joined ? ' is-taken' : ''),
        disabled: !!p.joined || app.joining,
        onclick: () => pickName(index),
      }, [
        h('span', { className: 'join-name-dot', 'aria-hidden': 'true' }),
        h('span', { className: 'join-name-text', text: name, dir: 'auto' }),
        p.joined ? h('span', { className: 'join-name-tag', text: t('join.taken') }) : null,
      ]);
      if (p.joined) btn.setAttribute('aria-label', t('join.takenLabel', { name: iso(name) }));
      if (color) btn.firstChild.style.backgroundColor = color;
      dom.names.appendChild(h('li', {}, [btn]));
    });
  }

  function renderBoard() {
    const g = app.game;
    if (!g) {
      dom.you.textContent = t('common.loading');
      dom.status.textContent = '';
      clear(dom.board);
      clear(dom.scores);
      return;
    }
    const me = g.contestants[app.you];
    dom.you.textContent = t('join.you', { name: iso(me.name) });
    const asking = renderQuestionView();
    dom.status.textContent = asking ? '' : (closedNote() || boardStatus(g));
    renderGrid(g);
    renderScores(g);
  }

  // ---------- The open question (US-64) ----------

  function isValidQuestion(q) {
    const tm = q && q.timer;
    return !!q && typeof q === 'object' && Number.isInteger(q.seq) && typeof q.open === 'boolean' &&
      typeof q.text === 'string' && Number.isInteger(q.points) && !!tm && typeof tm === 'object' &&
      Number.isInteger(tm.totalMs) && tm.totalMs > 0 && Number.isInteger(tm.remainingMs) && Number.isFinite(tm.atMs) &&
      typeof tm.running === 'boolean' &&
      (q.choices === null || (Array.isArray(q.choices) && q.choices.length === 3 && q.choices.every((c) => c && typeof c.text === 'string')));
  }

  /**
   * The board's status line. BUG-64-01: while the host still shows a question that is closed (timer 0,
   * Show Answer, Skip), it says so ("Too late" when this phone's answer was refused), not "open".
   */
  function boardStatus(g) {
    const screen = SCREENS.indexOf(g.screen) === -1 ? 'board' : g.screen;
    const q = app.question;
    if (screen === 'question' && q && !q.open) {
      return t(app.q && app.q.seq === q.seq && app.q.late ? 'jq.late' : 'jq.closed');
    }
    return t('join.status.' + screen);
  }

  /** The question is on screen only while it is open. */
  function questionShown() {
    return !!app.question && app.question.open;
  }

  /** Just after a question closed: the board's status line ("closed", or "Too late" for a refused answer). */
  function closedNote() {
    if (!app.q || Date.now() >= app.q.closedUntil) return '';
    return t(app.q.late ? 'jq.late' : 'jq.closed');
  }

  /** Show the question or the board; returns true when the question is shown. */
  function renderQuestionView() {
    const q = app.question;
    if (q && !q.open && app.q && app.q.seq === q.seq && app.q.wasOpen) { // it has just closed
      app.q.wasOpen = false;
      app.q.closedUntil = Date.now() + CLOSED_NOTE_MS;
      window.setTimeout(() => { if (app.view === 'board') renderBoard(); }, CLOSED_NOTE_MS + 50);
    }
    const show = questionShown();
    dom.question.hidden = !show;
    dom.board.hidden = show;
    if (!show) {
      stopTicker();
      return false;
    }
    if (!app.q || app.q.seq !== q.seq) startQuestion(q);
    app.q.data = q;
    if (q.open) app.q.wasOpen = true;
    if (app.mine !== null && app.q.sent === null) app.q.sent = app.mine; // sent from this name before a refresh
    fillQuestion();
    renderAnswerState();
    renderTimer();
    if (app.ticker === null) app.ticker = window.setInterval(renderTimer, TICK_MS);
    return true;
  }

  /** A new question number (a new cell, or a Swap): an empty box; Arabic first when it has Arabic (US-49). */
  function startQuestion(q) {
    app.q = {
      seq: q.seq, data: q, lang: q.textAr ? 'ar' : 'en', sent: null, late: false, locked: false,
      sending: false, msg: null, wasOpen: q.open, closedUntil: 0, choicesKey: null,
    };
    dom.qInput.value = '';
  }

  function stopTicker() {
    if (app.ticker !== null) window.clearInterval(app.ticker);
    app.ticker = null;
  }

  function questionLangText(text, textAr) {
    return app.q.lang === 'ar' && typeof textAr === 'string' && textAr !== '' ? textAr : text;
  }

  /** Heading, picture note, text, language button and the 3 choices; the typed text is never touched. */
  function fillQuestion() {
    const q = app.q.data;
    const cat = q.mix
      ? t('cat.mixName') + (q.subName ? ': ' + localName(q.subName, q.subNameAr) : '')
      : localName(q.catName, q.catNameAr);
    clear(dom.qHead);
    dom.qHead.appendChild(document.createTextNode(iso(cat) + ' ' + EN_DASH + ' ' + q.points));
    if (q.x2) dom.qHead.appendChild(h('span', { className: 'jq-double', text: t('jq.double') }));
    dom.qPicture.hidden = !q.hasImage;
    const arabic = app.q.lang === 'ar' && !!q.textAr;
    dom.qText.textContent = arabic ? q.textAr : q.text;
    dom.qText.dir = arabic ? 'rtl' : 'ltr';
    dom.qText.lang = arabic ? 'ar' : 'en';
    dom.qLang.hidden = !q.textAr;
    dom.qLang.textContent = arabic ? 'English' : 'العربية';
    dom.qLang.setAttribute('aria-label', arabic ? t('lang.showEnglish') : t('lang.showArabic'));
    renderChoices(q, arabic);
  }

  /** The 3 choices (once the host used the helper), as buttons that fill the box; Send still sends. */
  function renderChoices(q, arabic) {
    const key = JSON.stringify([q.seq, q.choices, arabic]);
    dom.qChoices.hidden = !q.choices;
    if (key === app.q.choicesKey) return;
    app.q.choicesKey = key;
    clear(dom.qChoices);
    if (!q.choices) return;
    dom.qChoices.setAttribute('aria-label', t('jq.choices'));
    q.choices.forEach((c, i) => {
      const text = arabic && c.textAr ? c.textAr : c.text;
      const btn = h('button', { type: 'button', className: 'jq-choice', onclick: () => onChoice(btn, text) }, [
        h('span', { className: 'jq-choice-letter', text: CHOICE_LETTERS[i], 'aria-hidden': 'true' }),
        h('span', { className: 'jq-choice-text', text: text, dir: 'auto' }),
      ]);
      dom.qChoices.appendChild(h('li', {}, [btn]));
    });
  }

  function onChoice(btn, text) {
    if (!app.q || answerLocked()) return;
    dom.qInput.value = text;
    Array.prototype.forEach.call(dom.qChoices.querySelectorAll('.jq-choice'), (b) => b.classList.toggle('is-picked', b === btn));
    if (app.q.msg) app.q.msg = null;
    renderAnswerState();
    dom.qSend.focus(); // the player still taps Send (US-64)
  }

  function onQuestionLang() {
    if (!app.q || !app.q.data.textAr) return;
    app.q.lang = app.q.lang === 'ar' ? 'en' : 'ar';
    fillQuestion();
  }

  function answerLocked() {
    const a = app.q;
    return a.sent !== null || a.late || a.locked || a.sending || !a.data.open;
  }

  /** The box, Send, the choices and the message: sending, sent (locked), too late, closed or an error. */
  function renderAnswerState() {
    const a = app.q;
    const locked = answerLocked();
    dom.qInput.disabled = locked;
    dom.qSend.disabled = locked;
    Array.prototype.forEach.call(dom.qChoices.querySelectorAll('.jq-choice'), (b) => { b.disabled = locked; });
    if (a.sending) showMsg(dom.qMsg, t('jq.sending'), 'warning');
    else if (a.sent !== null) showMsg(dom.qMsg, t('jq.sent', { text: iso(a.sent) }), 'success');
    else if (a.late) showMsg(dom.qMsg, t('jq.late'), 'error');
    else if (!a.data.open) showMsg(dom.qMsg, t('jq.closed'), 'warning');
    else if (a.msg) showMsg(dom.qMsg, t(a.msg), 'error');
    else dom.qMsg.hidden = true;
  }

  /** The countdown from the host's last timer (server time, this phone's clock offset). */
  function renderTimer() {
    if (!app.q) return;
    const q = app.q.data;
    const tm = q.timer;
    const serverNow = Date.now() + app.offset;
    const left = tm.running && q.open ? Math.max(0, tm.remainingMs - (serverNow - tm.atMs)) : Math.max(0, tm.remainingMs);
    const low = left <= tm.totalMs / 3;
    dom.qTimerValue.textContent = ltr(String(Math.ceil(left / 1000)));
    dom.qTimerValue.classList.toggle('is-low', low);
    dom.qBar.style.width = (100 * left / tm.totalMs).toFixed(1) + '%';
    dom.qBar.classList.toggle('is-low', low);
    let note = '';
    if (q.open && !tm.running) note = t('jq.paused');
    else if (q.open && left === 0) note = t('jq.timeUp');
    dom.qTimerNote.textContent = note;
  }

  /** Send the answer once: locked after; "Too late" once the host closed the question. */
  async function onSend(event) {
    event.preventDefault();
    const a = app.q;
    if (!a || answerLocked()) return;
    const text = dom.qInput.value.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim();
    if (!text) a.msg = 'jq.empty';
    else if (Array.from(text).length > ANSWER_MAX) a.msg = 'jq.tooLong';
    if (a.msg) {
      renderAnswerState();
      dom.qInput.focus();
      return;
    }
    a.sending = true;
    renderAnswerState();
    const seq = a.seq;
    try {
      const data = await call('action=answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ code: app.code, device_token: app.token, seq: seq, text: text }),
      });
      if (app.q !== a) return;
      a.sent = typeof data.text === 'string' ? data.text : text;
    } catch (err) {
      if (app.q !== a) return;
      const reason = err.data && err.data.reason;
      if (err.status === 409 && reason === 'late') {
        a.late = true;
      } else if (err.status === 409) { // sent already (another tab or a lost reply): the server's copy shows next poll
        a.locked = true;
        app.version = null;
        schedule(0);
      } else if (err.status === 404) {
        a.sending = false;
        gameEnded();
        return;
      } else if (err.status === 401 || err.status === 403) {
        a.sending = false;
        onPollError(err, true);
        return;
      } else {
        a.msg = 'jq.failed';
      }
    } finally {
      a.sending = false;
    }
    renderAnswerState();
  }

  function columnName(c) {
    if (c.hidden) return '?';
    if (c.mix) return t('cat.mixName');
    return localName(c.name, c.nameAr);
  }

  function renderGrid(g) {
    clear(dom.board);
    dom.board.style.setProperty('--cols', String(g.categories.length));
    dom.board.style.setProperty('--digits', String(Math.max.apply(null, g.points.map((p) => String(p).length))));
    dom.board.setAttribute('role', 'group');
    dom.board.setAttribute('aria-label', t('join.board'));
    g.categories.forEach((c) => {
      dom.board.appendChild(h('div', { className: 'jb-cat' + (c.hidden ? ' is-mystery' : '') }, [
        h('span', { className: 'jb-cat-name', text: columnName(c), dir: 'auto' }),
      ]));
    });
    g.cells.forEach((row) => row.forEach((cell, col) => dom.board.appendChild(renderCell(g, g.categories[col], cell))));
  }

  /** One cell, never clickable: open (value or Kilo Meshakkal emoji), or used (owner colour, or grey). */
  function renderCell(g, category, cell) {
    const catLabel = c => (c.hidden ? t('board.surpriseCat') : iso(columnName(c)));
    if (!cell.used) {
      const mystery = cell.p === null;
      const node = h('div', {
        className: 'jb-cell' + (cell.open ? ' is-open' : '') + (mystery ? ' is-face' : ''),
        role: 'img', // read as its label (the visible text is aria-hidden)
        'aria-label': (mystery ? t('cell.mix', { name: iso(columnName(category)) })
          : t('cell.label', { cat: catLabel(category), points: cell.p })) + (cell.open ? t('join.openCell') : ''),
      }, [h('span', { className: 'jb-points', text: mystery ? String(cell.face || '?') : String(cell.p), 'aria-hidden': 'true' })]);
      if (cell.x2 && cell.open) node.appendChild(h('span', { className: 'jb-double', text: TIMES + '2', 'aria-hidden': 'true' }));
      return node;
    }
    const owner = Number.isInteger(cell.owner) ? g.contestants[cell.owner] : null;
    const swap = cell.swap;
    const swapName = swap ? localName(swap.name, swap.nameAr) + ' ' + EN_DASH + ' ' + swap.points : '';
    const node = h('div', {
      className: 'jb-cell is-used ' + (owner ? 'is-owned' : 'is-unanswered') + (cell.x2 ? ' is-double' : ''),
      role: 'img',
      'aria-label': t('cell.label', { cat: catLabel(category), points: cell.p }) + (cell.x2 ? t('cell.double') : '') +
        (owner ? t('cell.won', { name: iso(owner.name) }) : t('cell.none')),
    }, [
      cell.x2 ? h('span', { className: 'jb-double', text: TIMES + '2', 'aria-hidden': 'true' }) : null,
      h('span', { className: 'jb-points' + (swap ? ' is-struck' : ''), text: String(cell.p), 'aria-hidden': 'true' }),
      swap ? h('span', { className: 'jb-swap', text: swapName, dir: 'auto', 'aria-hidden': 'true' }) : null,
      owner ? h('span', { className: 'jb-owner', text: owner.name, dir: 'auto', 'aria-hidden': 'true' }) : null,
    ]);
    const color = owner ? safeColor(owner.color) : null;
    if (color) {
      node.style.backgroundColor = color;
      node.style.color = INK;
    }
    return node;
  }

  function renderScores(g) {
    clear(dom.scores);
    g.contestants.forEach((c, index) => {
      const mine = index === app.you;
      const card = h('li', { className: 'jb-score' + (mine ? ' is-me' : '') }, [
        h('span', { className: 'jb-score-name', text: c.name, dir: 'auto' }),
        mine ? h('span', { className: 'jb-score-tag', text: t('join.youTag') }) : null,
        h('span', { className: 'jb-score-value', text: formatScore(c.score) }),
      ]);
      const color = safeColor(c.color);
      if (color) {
        card.style.backgroundColor = color;
        card.style.color = INK;
      }
      dom.scores.appendChild(card);
    });
  }

  // ---------- Start ----------

  function onVisibility() {
    if (document.hidden) {
      window.clearTimeout(app.timer);
      app.timer = null;
    } else {
      schedule(0);
    }
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    try {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    } catch (err) {
      // not available here: the page works without it
    }
  }

  function init() {
    dom.codeForm.addEventListener('submit', onCodeSubmit);
    dom.qForm.addEventListener('submit', onSend);
    dom.qLang.addEventListener('click', onQuestionLang);
    dom.qInput.addEventListener('input', () => {
      if (app.q && app.q.msg) {
        app.q.msg = null;
        renderAnswerState();
      }
    });
    dom.codeInput.addEventListener('input', () => {
      dom.codeError.hidden = true;
      dom.codeInput.removeAttribute('aria-invalid');
    });
    dom.langBtns.forEach((btn) => btn.addEventListener('click', () => i18n.setLang(btn.getAttribute('data-ui-lang'))));
    i18n.onChange(render);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('load', registerServiceWorker);
    const fromLink = normalizeCode(new URLSearchParams(window.location.search).get('room'));
    if (CODE_PATTERN.test(fromLink)) {
      dom.codeInput.value = fromLink;
      openRoom(fromLink);
    } else {
      app.ended = fromLink !== ''; // a code in the link that cannot be right
      setView('code');
    }
  }

  init();
})();
