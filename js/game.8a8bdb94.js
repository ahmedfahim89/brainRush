// BrainRush game page: setup, dynamic board, question + timer, scoring, results
// and localStorage persistence (survives a page refresh).
// The page only uses public endpoints (GETs, the board POST and the game log), so it works
// on the hosted site without the admin login.
// All API/user text is rendered with textContent / DOM APIs (never innerHTML).
'use strict';

(function () {
  const API_BASE = 'api/';
  const STORAGE_KEY = 'brainrush.game';
  // v3 adds the helpers (US-32); v2 (used cells + open question) and v1 (Sprint 3) saves are migrated
  const STORAGE_VERSION = 3;
  // Ids of the questions opened in this browser, oldest first; new boards avoid them.
  const SEEN_KEY = 'brainrush.seenQuestions';
  const SEEN_MAX = 5000; // BOARD_MAX_SEEN in api/questions.php
  const NAME_MAX = 30;
  const SURPRISE = 0;       // "Surprise me!" tile in the selected list (real category ids are positive)
  const SURPRISE_ALONE = 3; // random categories when "Surprise me!" is the only tick
  const TIMER_TICK_MS = 100;
  const QUESTION_FULL_SIZE_CHARS = 150; // FU-04: longer questions get a smaller font
  const QUESTION_MIN_SCALE = 0.5;
  // Picture questions: same rule as the API (a file under img/questions/, no URLs or "..").
  const IMAGE_PATTERN = /^img\/questions\/[a-z0-9][a-z0-9-]*\.(svg|jpg|jpeg|png|webp)$/;
  const MINUS = String.fromCharCode(0x2212);   // typographic minus sign
  const TIMES = String.fromCharCode(0x00d7);   // multiplication sign
  const DOT = String.fromCharCode(0x00b7);     // middle dot
  const EN_DASH = String.fromCharCode(0x2013); // "Category – 300"
  const CHECK = String.fromCharCode(0x2713);   // check mark
  const CROSS = String.fromCharCode(0x2717);   // ballot x
  const ELLIPSIS = String.fromCharCode(0x2026);
  const DOUBLE_FACTOR = 2; // D-40: a Correct on the hidden double-score cell earns this many times its points

  // Helpers (US-32, D-36): each contestant may use each one once per game. `chip` is the
  // icon-sized text on the scoring row and the scoreboard; `name` is used in confirms and tooltips.
  const HELPER_KEYS = ['choices', 'swap', 'skip'];
  const HELPERS = {
    choices: { chip: 'ABC', name: '3 choices' },
    swap: { chip: String.fromCharCode(0x21c4), name: 'Swap' },          // left-right arrows
    skip: { chip: String.fromCharCode(0x00bd), name: 'Skip' },          // one half
  };
  const CHOICE_LETTERS = ['A', 'B', 'C'];
  const CHOICES_SHORT_CHARS = 24; // text question: 3 choices this short sit side by side
  const WRONG_FIELDS = ['wrong_1', 'wrong_2', 'wrong_1_ar', 'wrong_2_ar'];

  // Streak Challenge (US-33, US-34, D-37): saved under its own key, so the board game's saved
  // state and its validation stay as they are.
  const STREAK_KEY = 'brainrush.streak';
  const STREAK_VERSION = 1;
  const STREAK_REFILL_AT = 5;   // ask for the next batch once fewer questions are queued
  const STREAK_MAX_QUEUE = 100; // a saved queue is never longer (batches are 20)
  const STREAK_TIME_UP = -1;    // `picked` when the time ran out
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const MODES = {
    players: { limit: 6, title: 'Players', label: 'Player', one: 'player', many: 'players' },
    teams: { limit: 4, title: 'Teams', label: 'Team', one: 'team', many: 'teams' },
  };

  // Six distinct contestant colors; `ink` is the readable text color on that background.
  // Grey (unanswered cell) and gold (UI accent) are deliberately not in the palette.
  const PALETTE = [
    { value: '#e5484d', name: 'Red', ink: '#ffffff' },
    { value: '#3e7bfa', name: 'Blue', ink: '#ffffff' },
    { value: '#2fb36d', name: 'Green', ink: '#0b1026' },
    { value: '#f08c2e', name: 'Orange', ink: '#0b1026' },
    { value: '#9b5de5', name: 'Purple', ink: '#ffffff' },
    { value: '#22b8cf', name: 'Cyan', ink: '#0b1026' },
  ];

  const SCREENS = ['setup', 'board', 'question', 'results']; // a saved board game may be on these
  const ALL_SCREENS = SCREENS.concat(['leaderboard']);

  // Central state. `setup` is the form being filled in (memory only);
  // `game` is the running game and is saved to localStorage on every change:
  //   { mode, contestants: [{id, name, color, score, helpers: {choices, swap, skip}}], timerSeconds, points,
  //     categories: [{id, name, questions, hidden}] (hidden = unopened "Surprise me!" pick, shown as "?"),
  //     used: { "<categoryId>:<points>": { owner: contestantId | null } },
  //     double?: "<categoryId>:<points>" (D-40: the hidden double-score cell, picked at Start),
  //     current: null | { catId, points, marks: { "<contestantId>": "correct" | "wrong" }, answerShown,
  //                       lang, by?, choiceOrder?, swap? } }
  // helpers: true = still available (US-32). On the open question: by = id of the contestant who
  // used a helper on it (only they can be scored then); choiceOrder = order of the 3 choices on
  // screen, a permutation of [0, 1, 2] where 0 is the answer; swap = { catId, catName, points,
  // question }, the question that replaced the cell's one. The cell still closes on Back to Board.
  const state = {
    screen: 'setup',
    setup: null,
    game: null,
  };

  // Countdown of the open question (memory only; restarts at full length after a refresh, D-04).
  // onExpire runs when it reaches 0 (the Streak Challenge ends the run then; the board game has none).
  const timer = { totalMs: 0, remainingMs: 0, endAt: 0, running: false, handle: null, onExpire: null };
  let scoringRows = []; // DOM references of the question screen's scoring rows
  let swapping = null; // id of the contestant whose Swap request is running (memory only)

  // Streak Challenge run (US-33), saved under STREAK_KEY on every change; null when none:
  //   { version, name, color, timerSeconds, count, queue: [question], usedIds: [id],
  //     current: null | { q, lang, deadline, picked, leftMs? }, over }
  // A question is the API's { id, category_name, points, question, question_ar, image,
  // image_credit, choices: [{text, text_ar}] x3, correct } (choices already cut by the server).
  // deadline = Date.now() ms when time is up, so a refresh keeps the remaining time; picked =
  // null (open), the tapped choice or STREAK_TIME_UP; leftMs = time left when it was answered.
  // count = right answers; over = the run ended (wrong answer, time's up or End run).
  let streak = null;
  let streakRequest = null;      // { run, promise } of the batch request in flight (memory only)
  let finishing = false;         // the finished run is being saved
  let lastStreakProfile = null;  // name, color and timer of the last run, for Play again
  let leaderboardResult = null;  // the run shown on the leaderboard screen (null = opened from setup)
  let leaderboardLoads = 0;      // drops leaderboard responses that arrive after a newer request

  let nextEntryKey = 1;

  const byId = (id) => document.getElementById(id);
  const dom = {
    screens: {
      setup: byId('screen-setup'),
      board: byId('screen-board'),
      question: byId('screen-question'),
      results: byId('screen-results'),
      leaderboard: byId('screen-leaderboard'),
    },
    setupForm: byId('setup-form'),
    playersBlock: byId('players-block'),
    catBlock: byId('cat-block'),
    streakBlock: byId('streak-block'),
    streakNameInput: byId('streak-name'),
    streakNameError: byId('streak-name-error'),
    streakCancel: byId('streak-cancel'),
    streakOpenBtn: byId('streak-open-btn'),
    streakBtn: byId('streak-btn'),
    streakBoardBtn: byId('streak-board-btn'),
    loadMsg: byId('setup-load-msg'),
    newBanner: byId('new-banner'),
    modeInputs: Array.prototype.slice.call(document.querySelectorAll('input[name="mode"]')),
    entryList: byId('entry-list'),
    entryLimitMsg: byId('entry-limit-msg'),
    entryAdd: byId('entry-add'),
    catLegend: byId('cat-legend'),
    catCount: byId('cat-count'),
    catWarning: byId('cat-warning'),
    catList: byId('cat-list'),
    catError: byId('cat-error'),
    timerInput: byId('timer-input'),
    timerError: byId('timer-error'),
    playedTrack: byId('played-track'),
    playedBar: byId('played-bar'),
    playedCount: byId('played-count'),
    playedReset: byId('played-reset'),
    startBtn: byId('start-btn'),
    maintenanceOverlay: byId('maintenance-overlay'),
    adSlots: { leaderboard: byId('ad-leaderboard') }, // D-41: screen name -> ad slot
    main: document.querySelector('.game-main'),
    doubleOverlay: byId('double-overlay'),
    doubleText: byId('double-text'),
    doubleOk: byId('double-ok'),
    startMsg: byId('start-msg'),
    boardInfo: byId('board-info'),
    board: byId('board'),
    boardDone: byId('board-done'),
    boardDoneText: byId('board-done-text'),
    boardDoneBtn: byId('board-done-btn'),
    endBtn: byId('end-btn'),
    scoreboard: byId('scoreboard'),
    qHeading: byId('question-title'),
    qImage: byId('question-image'),
    qCredit: byId('question-credit'),
    qText: byId('question-text'),
    qChoices: byId('question-choices'),
    timerBox: byId('timer'),
    timerValue: byId('timer-value'),
    timerBar: byId('timer-bar'),
    timerPause: byId('timer-pause'),
    timerReset: byId('timer-reset'),
    timerStatus: byId('timer-status'),
    langBtn: byId('lang-btn'),
    answerBtn: byId('answer-btn'),
    answerText: byId('answer-text'),
    answerValue: byId('answer-value'),
    helperMsg: byId('helper-msg'),
    scoreRows: byId('score-rows'),
    backBtn: byId('back-btn'),
    streakPanel: byId('streak-panel'),
    streakName: byId('streak-run-name'), // the run's name on the question screen (#streak-name is the setup input)
    streakCount: byId('streak-count'),
    streakChoices: byId('streak-choices'),
    streakFeedback: byId('streak-feedback'),
    streakNext: byId('streak-next'),
    streakEnd: byId('streak-end'),
    resultsWinner: byId('results-winner'),
    resultsList: byId('results-list'),
    newGameBtn: byId('new-game-btn'),
    lbTitle: byId('leaderboard-title'),
    lbHeadline: byId('lb-headline'),
    lbRank: byId('lb-rank'),
    lbMsg: byId('lb-msg'),
    lbList: byId('lb-list'),
    lbAgain: byId('lb-again'),
    lbNew: byId('lb-new'),
    lbBack: byId('lb-back'),
  };

  // ---------- Generic helpers ----------

  /** Create an element. props: text -> textContent, "a-b" keys -> attributes, others -> properties. */
  function h(tag, props, children) {
    const node = document.createElement(tag);
    Object.keys(props || {}).forEach((key) => {
      const value = props[key];
      if (key === 'text') {
        node.textContent = value;
      } else if (key.indexOf('-') !== -1) {
        node.setAttribute(key, value);
      } else {
        node[key] = value;
      }
    });
    (children || []).forEach((child) => {
      if (child) node.appendChild(child);
    });
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function plural(count, word, pluralWord) {
    return count + ' ' + (count === 1 ? word : (pluralWord || word + 's'));
  }

  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  function formatScore(score) {
    return score < 0 ? MINUS + Math.abs(score) : String(score);
  }

  function showMessage(node, text, kind) {
    node.textContent = text;
    node.className = 'msg msg-' + kind;
    node.hidden = false;
  }

  function clearMessage(node) {
    node.textContent = '';
    node.hidden = true;
  }

  function errorText(err) {
    return err && err.message ? err.message : 'Something went wrong.';
  }

  /** Read-only JSON API call (GET). Rejects with the API's `error` text, never raw output. */
  function apiGet(path) {
    return apiCall(path, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  }

  /** JSON POST to a public endpoint (the board with the seen list); same errors as apiGet. */
  function apiPost(path, body) {
    return apiCall(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      cache: 'no-store',
      body: JSON.stringify(body),
    });
  }

  async function apiCall(path, options) {
    let response;
    try {
      response = await fetch(API_BASE + path, options);
    } catch (err) {
      throw new Error('Could not reach the server. Check that it is running.');
    }
    let data = null;
    try {
      data = await response.json();
    } catch (err) {
      data = null; // non-JSON body (e.g. PHP not running): never show it raw
    }
    if (!response.ok) {
      throw new Error(data && typeof data.error === 'string' && data.error
        ? data.error
        : 'Request failed (HTTP ' + response.status + ').');
    }
    if (data === null) throw new Error('The server sent an unexpected response.');
    return data;
  }

  function paletteEntry(color) {
    return PALETTE.find((p) => p.value === color) || PALETTE[0];
  }

  function currentMode() {
    return MODES[state.setup.mode];
  }

  /** Allowed timer range, read from the timer input's min/max attributes (single source). */
  function timerRange() {
    return { min: Number(dom.timerInput.min), max: Number(dom.timerInput.max) };
  }

  // ---------- Game helpers ----------

  function cellKey(categoryId, points) {
    return categoryId + ':' + points;
  }

  function findCategory(g, id) {
    return g.categories.find((c) => c.id === id) || null;
  }

  function findContestant(g, id) {
    return g.contestants.find((c) => c.id === id) || null;
  }

  function totalCells(g) {
    return g.categories.length * g.points.length;
  }

  function usedCount(g) {
    return Object.keys(g.used).length;
  }

  /** D-01: the board is done when all N x P cells are used, whatever its size. */
  function allCellsUsed(g) {
    return usedCount(g) >= totalCells(g);
  }

  /** Id (number) of the contestant marked Correct on the open question, or null. */
  function correctContestantId(current) {
    const key = Object.keys(current.marks).find((k) => current.marks[k] === 'correct');
    return key === undefined ? null : Number(key);
  }

  /** Every helper still available (a new game, or a save from before the helpers). */
  function allHelpers() {
    return { choices: true, swap: true, skip: true };
  }

  /**
   * The question being played: the Swap question if there is one (US-32), otherwise the cell's.
   * Returns { question, points, catName }; Correct / Wrong / Skip use these points.
   */
  function activeQuestion(g) {
    const cur = g.current;
    if (cur.swap) return { question: cur.swap.question, points: cur.swap.points, catName: cur.swap.catName };
    const category = findCategory(g, cur.catId);
    return { question: category.questions[String(cur.points)], points: cur.points, catName: category.name };
  }

  /** D-40: the open question is on the game's hidden double-score cell (also after a Swap). */
  function isDoubleCurrent(g) {
    return g.current !== null && g.double === cellKey(g.current.catId, g.current.points);
  }

  /** Points a Correct earns on the open question: doubled on the double-score cell (D-40). */
  function correctPoints(g) {
    const points = activeQuestion(g).points;
    return isDoubleCurrent(g) ? points * DOUBLE_FACTOR : points;
  }

  // ---------- Persistence (saveState / loadState, US-17) ----------
  // Only a started game is stored (D-24), together with the screen it is on.

  function saveState() {
    try {
      if (!state.game) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
      }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: STORAGE_VERSION,
        screen: state.screen,
        game: state.game,
      }));
    } catch (err) {
      // Storage full or disabled (e.g. private mode): the game still works, it just won't survive a refresh.
    }
  }

  /** Returns { screen, game } from localStorage, or null when nothing valid is saved (corrupt data is removed). */
  function loadState() {
    let raw = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      return null;
    }
    if (raw === null) return null;
    try {
      const saved = migrateSaved(JSON.parse(raw));
      if (saved && SCREENS.indexOf(saved.screen) > 0 && isValidGame(saved.game) &&
          isValidScreenFor(saved.screen, saved.game)) {
        return { screen: saved.screen, game: saved.game };
      }
    } catch (err) {
      // invalid JSON (or any unexpected shape): fall through and discard it
    }
    clearSavedState();
    return null;
  }

  /** Bring an older saved shape up to the current version, one step at a time; null when unknown. */
  function migrateSaved(saved) {
    if (!isPlainObject(saved)) return null;
    let upgraded = saved;
    // Sprint 3 (v1) only saved games on the board, without used cells.
    if (upgraded.version === 1 && upgraded.screen === 'board' && isPlainObject(upgraded.game) &&
        !hasOwn(upgraded.game, 'used') && !hasOwn(upgraded.game, 'current')) {
      upgraded = {
        version: 2,
        screen: 'board',
        game: Object.assign({}, upgraded.game, { used: {}, current: null }),
      };
    }
    // v2 had no helpers (US-32): every contestant gets all of them.
    if (upgraded.version === 2 && isPlainObject(upgraded.game) && Array.isArray(upgraded.game.contestants)) {
      const contestants = upgraded.game.contestants.map((c) =>
        (isPlainObject(c) ? Object.assign({}, c, { helpers: allHelpers() }) : c));
      upgraded = {
        version: 3,
        screen: upgraded.screen,
        game: Object.assign({}, upgraded.game, { contestants: contestants }),
      };
    }
    return upgraded.version === STORAGE_VERSION ? upgraded : null;
  }

  function clearSavedState() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      // nothing to clear
    }
  }

  // ---------- Played questions (no repeats across games) ----------

  /** Seen question ids, oldest first; [] when nothing (valid) is stored. */
  function loadSeen() {
    try {
      const seen = JSON.parse(window.localStorage.getItem(SEEN_KEY));
      if (Array.isArray(seen)) return seen.filter((id) => Number.isInteger(id) && id > 0).slice(-SEEN_MAX);
    } catch (err) {
      // storage disabled or corrupt: start from an empty list
    }
    return [];
  }

  /** Remember an opened question; opening it again moves it to the end (most recent). */
  function markSeen(id) {
    if (!Number.isInteger(id) || id < 1) return; // games saved before ids were sent
    const seen = loadSeen().filter((s) => s !== id);
    seen.push(id);
    try {
      window.localStorage.setItem(SEEN_KEY, JSON.stringify(seen.slice(-SEEN_MAX)));
    } catch (err) {
      // storage full or disabled: questions may repeat, the game still works
    }
  }

  function clearSeen() {
    try {
      window.localStorage.removeItem(SEEN_KEY);
    } catch (err) {
      // nothing to clear
    }
  }

  function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /** Contestants: 1..limit, unique ids/colors/names, names 1-30 chars after trimming (D-22), integer scores, helpers. */
  function isValidContestants(list, mode) {
    if (!Array.isArray(list) || list.length < 1 || list.length > mode.limit) return false;
    const ids = {};
    const colors = {};
    const names = {};
    return list.every((c) => {
      const name = isPlainObject(c) && typeof c.name === 'string' ? c.name.trim() : '';
      const nameKey = 'n:' + name.toLowerCase();
      const ok = name !== '' && name.length <= NAME_MAX && !names[nameKey] &&
        Number.isInteger(c.id) && !ids[c.id] &&
        PALETTE.some((p) => p.value === c.color) && !colors[c.color] &&
        Number.isInteger(c.score) && isValidHelpers(c.helpers);
      if (ok) {
        ids[c.id] = true;
        colors[c.color] = true;
        names[nameKey] = true;
      }
      return ok;
    });
  }

  /** Helpers left: exactly { choices, swap, skip }, each true (available) or false (used). */
  function isValidHelpers(helpers) {
    return isPlainObject(helpers) && Object.keys(helpers).length === HELPER_KEYS.length &&
      HELPER_KEYS.every((key) => typeof helpers[key] === 'boolean');
  }

  function isValidBoard(points, categories) {
    if (!Array.isArray(points) || !points.length) return false;
    const ascending = points.every((p, i) => Number.isInteger(p) && p > 0 && (i === 0 || p > points[i - 1]));
    if (!ascending || !Array.isArray(categories) || !categories.length) return false;
    const ids = {};
    return categories.every((c) => {
      const ok = isPlainObject(c) && Number.isInteger(c.id) && !ids[c.id] &&
        typeof c.name === 'string' && isPlainObject(c.questions) &&
        (c.hidden === undefined || typeof c.hidden === 'boolean') &&
        points.every((p) => isValidQuestion(hasOwn(c.questions, String(p)) ? c.questions[String(p)] : null));
      if (ok) ids[c.id] = true;
      return ok;
    });
  }

  /** One question (board cell or Swap question); the picture, credit and wrong options are optional. */
  function isValidQuestion(q) {
    return isPlainObject(q) && typeof q.question === 'string' && typeof q.answer === 'string' &&
      isValidImage(q.image) && isOptionalText(q.image_credit) &&
      WRONG_FIELDS.every((field) => isOptionalText(q[field]));
  }

  /** Picture path is optional: missing/null (text question, also older saves) or a valid path. */
  function isValidImage(image) {
    return image === undefined || image === null || (typeof image === 'string' && IMAGE_PATTERN.test(image));
  }

  /** Optional text such as the photo credit: missing/null (also older saves) or a string. */
  function isOptionalText(value) {
    return value === undefined || value === null || typeof value === 'string';
  }

  /** "<categoryId>:<points>" naming a real cell of this board, in canonical form. */
  function isBoardCellKey(key, g) {
    const match = /^(\d+):(\d+)$/.exec(key);
    if (!match) return false;
    const category = findCategory(g, Number(match[1]));
    const points = Number(match[2]);
    return category !== null && g.points.indexOf(points) !== -1 && cellKey(category.id, points) === key;
  }

  /** Used cells: each key is a board cell; owner is null (grey) or a contestant id. */
  function isValidUsed(used, g) {
    return isPlainObject(used) && Object.keys(used).every((key) => {
      const cell = used[key];
      return isBoardCellKey(key, g) && isPlainObject(cell) &&
        (cell.owner === null || (Number.isInteger(cell.owner) && findContestant(g, cell.owner) !== null)) &&
        (cell.swap === undefined || isValidUsedSwap(cell.swap));
    });
  }

  /** A cell closed after a Swap: the category and points of the question that replaced it (shown on the board). */
  function isValidUsedSwap(swap) {
    return isPlainObject(swap) && typeof swap.catName === 'string' && swap.catName !== '' &&
      Number.isInteger(swap.points) && swap.points > 0;
  }

  /** Open question: an unused cell, marks only for real contestants, at most one Correct (US-14), valid helper use. */
  function isValidCurrent(current, g) {
    if (current === null) return true;
    if (!isPlainObject(current) || !Number.isInteger(current.catId) || !Number.isInteger(current.points) ||
        typeof current.answerShown !== 'boolean' || !isPlainObject(current.marks)) return false;
    const key = cellKey(current.catId, current.points);
    if (!isBoardCellKey(key, g) || hasOwn(g.used, key)) return false;
    let correct = 0;
    const marksOk = Object.keys(current.marks).every((id) => {
      const value = current.marks[id];
      if (value === 'correct') correct += 1;
      return /^\d+$/.test(id) && findContestant(g, Number(id)) !== null && String(Number(id)) === id &&
        (value === 'correct' || value === 'wrong');
    });
    return marksOk && correct <= 1 && isValidHelperUse(current, g);
  }

  /**
   * Helper fields of the open question (US-32): `by` is a real contestant, and a shown choice
   * order or Swap question was paid for with that contestant's helper. With a helper used, only
   * `by` can have been scored.
   */
  function isValidHelperUse(current, g) {
    const hasChoices = current.choiceOrder !== undefined;
    const hasSwap = current.swap !== undefined;
    if (current.by === undefined) return !hasChoices && !hasSwap;
    if (!hasChoices && !hasSwap) return false; // Skip closes the question, so it is never saved open
    const user = Number.isInteger(current.by) ? findContestant(g, current.by) : null;
    if (user === null) return false;
    if (Object.keys(current.marks).some((id) => Number(id) !== user.id)) return false;
    if (hasChoices && (user.helpers.choices || !isValidChoiceOrder(current.choiceOrder))) return false;
    if (hasSwap && (user.helpers.swap || !isValidSwap(current.swap))) return false;
    return true;
  }

  /** A permutation of [0, 1, 2]. */
  function isValidChoiceOrder(order) {
    return Array.isArray(order) && order.length === CHOICE_LETTERS.length &&
      order.slice().sort().every((value, i) => value === i);
  }

  function isValidSwap(swap) {
    return isPlainObject(swap) && Number.isInteger(swap.catId) && typeof swap.catName === 'string' &&
      Number.isInteger(swap.points) && swap.points > 0 && isValidQuestion(swap.question);
  }

  function isValidGame(g) {
    if (!isPlainObject(g) || typeof g.mode !== 'string' || !hasOwn(MODES, g.mode)) return false;
    const range = timerRange();
    return isValidContestants(g.contestants, MODES[g.mode]) &&
      Number.isInteger(g.timerSeconds) && g.timerSeconds >= range.min && g.timerSeconds <= range.max &&
      (g.helpersOff === undefined || typeof g.helpersOff === 'boolean') && // games saved before the setting
      isValidBoard(g.points, g.categories) &&
      (g.double === undefined || (typeof g.double === 'string' && isBoardCellKey(g.double, g))) && // games saved before D-40
      isValidUsed(g.used, g) && isValidCurrent(g.current, g);
  }

  /** The question screen needs an open question; board and results must not have one. */
  function isValidScreenFor(screen, g) {
    return screen === 'question' ? g.current !== null : g.current === null;
  }

  // ---------- Screens ----------

  function showScreen(name) {
    state.screen = name;
    if (name !== 'question') stopTimer();
    ALL_SCREENS.forEach((key) => { dom.screens[key].hidden = key !== name; });
    document.body.setAttribute('data-screen', name); // CSS: one-screen board layout (FU-03)
    window.scrollTo(0, 0);
    saveState();
    showAd(name);
    syncBack();
  }

  // ---------- Ads (D-41) ----------
  // Google AdSense banner on the Streak leaderboard screen only: never during play, and not on Results,
  // so the consent message never covers the winner. Off unless the admin turned it on and entered both
  // IDs; the script (and Google's consent message) loads when the leaderboard first opens.

  const AD_SCRIPT = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  const ads = {
    config: undefined, // { client, slot } when ads are on, null when off, undefined until settings are known
    loading: null,     // pending settings.php request
    script: false,     // adsbygoogle.js tag added
    failed: false,     // the script could not load (ad blocker, offline)
  };

  /** This computer: AdSense runs in test mode (placeholder ads, nothing counted). */
  function isLocalHost() {
    return ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
  }

  /** Remember the ad settings from settings.php (every settings load calls this). */
  function setAdConfig(settings) {
    const on = settings.ads_enabled === 1 && settings.start_game_hidden !== 1
      && typeof settings.ads_client === 'string' && /^ca-pub-\d{10,20}$/.test(settings.ads_client)
      && typeof settings.ads_slot === 'string' && /^\d{1,20}$/.test(settings.ads_slot);
    ads.config = on ? { client: settings.ads_client, slot: settings.ads_slot } : null;
  }

  /** The ad settings; loaded once here when a restored game skipped the setup screen. */
  async function loadAdConfig() {
    if (ads.config !== undefined) return ads.config;
    if (!ads.loading) {
      ads.loading = apiGet('settings.php')
        .then((settings) => {
          if (isPlainObject(settings)) setAdConfig(settings);
          else ads.config = null;
        })
        .catch(() => { ads.config = null; })
        .then(() => { ads.loading = null; });
    }
    await ads.loading;
    return ads.config;
  }

  /**
   * Add adsbygoogle.js once. It also defines the H5 Games Ads helpers (adBreak/adConfig) so
   * interstitial or rewarded placements can be added later; none are used yet.
   */
  function loadAdScript(config) {
    if (ads.script) return;
    ads.script = true;
    window.adsbygoogle = window.adsbygoogle || [];
    window.adConfig = window.adConfig || function (o) { window.adsbygoogle.push(o); };
    window.adBreak = window.adBreak || window.adConfig;
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    if (isLocalHost()) script.setAttribute('data-adbreak-test', 'on');
    script.src = AD_SCRIPT + '?client=' + encodeURIComponent(config.client);
    script.addEventListener('error', () => {
      ads.failed = true;
      Object.keys(dom.adSlots).forEach((key) => { dom.adSlots[key].hidden = true; });
    });
    document.head.appendChild(script);
  }

  /** Show the banner when an ad screen (the Leaderboard) opens; the screen must be visible first. */
  async function showAd(name) {
    if (isApp) return; // no ads in the Android app (D-43): the script is never loaded there
    const slot = dom.adSlots[name];
    if (!slot) return;
    const config = await loadAdConfig();
    if (!config || ads.failed || state.screen !== name) return;
    loadAdScript(config);
    slot.hidden = false;
    if (slot.querySelector('ins')) return; // filled once: AdSense does not allow refreshing a unit
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', config.client);
    ins.setAttribute('data-ad-slot', config.slot);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    if (isLocalHost()) ins.setAttribute('data-adtest', 'on');
    slot.appendChild(ins);
    try {
      window.adsbygoogle.push({});
    } catch (err) {
      slot.hidden = true;
    }
  }

  // ---------- Android app (US-40, D-43) ----------
  // js/app.js (loaded first) tells whether this tab is the Android app and already removed the
  // header's Admin link and kept the site's links in the app window. Here: no ads, no Admin link in
  // the setup messages, and the Android Back button closes the open popup or goes back one screen.
  // The website is unchanged.

  const isApp = window.brainrushApp === true;

  // Android Back. Away from the root (the setup screen without the Streak setup open), one extra
  // history entry of ours sits on top. Back pops it: popstate runs the screen's own way back, with
  // its confirm, then history.forward() returns to our entry if the app is still not at the root.
  // At the root there is no entry, so Back leaves the app. The entry is added only once the page
  // has had a tap: Chrome's Back skips entries a page adds without one. Known limitation: a game
  // restored at app start has no entry until the first tap, so Back before any tap leaves the app
  // (the game stays saved).
  const BACK_STATE = 'brainrushBack';
  const back = { armed: false, handling: false, leaving: false };

  function atBackRoot() {
    return state.screen === 'setup' && !(state.setup && state.setup.streak);
  }

  /** After a screen change: add our history entry, or drop it at the root. */
  function syncBack() {
    if (!isApp || back.handling) return;
    const away = !atBackRoot();
    if (away && !back.armed) {
      if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; // on the first tap
      window.history.pushState({ [BACK_STATE]: true }, '');
      back.armed = true;
    } else if (!away && back.armed) {
      back.armed = false;
      back.leaving = true;
      window.history.back();
    }
  }

  /** What Back does: the same as the screen's own way back, confirms included. */
  function goBack() {
    if (!dom.doubleOverlay.hidden) {
      closeDoublePopup();
    } else if (state.screen === 'question') {
      if (!streakOnScreen()) confirmBackToBoard();  // "Back to Board", after a confirm
      else if (streak.over) onStreakNext();          // lost run: on to the leaderboard, as Next
      else onStreakEnd();                            // "End the run now?" confirm
    } else if (state.screen === 'board') {
      endGame();                                     // D-09 confirm while questions are left
    } else if (state.screen === 'results') {
      newGame();
    } else if (state.screen === 'leaderboard') {
      if (leaderboardResult) onLeaderboardNewGame(); // asks first if the streak was not saved
      else onLeaderboardBack();
    } else if (state.setup && state.setup.streak) {
      onStreakCancel();
    }
  }

  /**
   * Back on a board question: a Back press is easily made by mistake and an opened question can
   * never be reopened (D-06), so ask first. Cancel keeps the question open; its timer runs on.
   */
  function confirmBackToBoard() {
    const cur = state.game && state.game.current;
    if (!cur) return;
    const text = Object.keys(cur.marks).length
      ? 'Leave this question? It will be closed and cannot be opened again.'
      : 'Leave this question? It will be closed without points and cannot be opened again.';
    if (!window.confirm(text)) return;
    if (state.game && state.game.current === cur) backToBoard();
  }

  function onPopState(event) {
    if (event.state && event.state[BACK_STATE]) return; // our history.forward()
    if (back.leaving) { // our history.back() at the root
      back.leaving = false;
      return;
    }
    if (!back.armed) return;
    back.armed = false;
    back.handling = true;
    try {
      goBack();
    } finally {
      back.handling = false;
    }
    if (!atBackRoot()) { // a confirm was cancelled, or one screen back is not the root yet
      back.armed = true;
      window.history.forward();
    }
  }

  function initApp() {
    if (!isApp) return;
    if (window.history.state && window.history.state[BACK_STATE]) back.armed = true; // reloaded on our entry
    window.addEventListener('popstate', onPopState);
    document.addEventListener('click', syncBack); // a restored game screen gets its entry on the first tap
  }

  /** Offline page (US-40, D-43): sw.js shows offline.html when a page cannot load. Errors are ignored. */
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
      try {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      } catch (err) {
        // not available here (e.g. a private window): the site works without it
      }
    });
  }

  // ---------- Setup: contestants (US-01, US-02, US-03) ----------

  function newEntry() {
    return { key: nextEntryKey++, name: '', color: firstFreeColor(), error: '' };
  }

  function freshSetup() {
    return {
      mode: 'players',
      entries: [],
      maintenance: false, // start_game_hidden from settings (maintenance mode)
      helpersOn: true,    // helpers_enabled from settings; a new game keeps it
      perGame: null,      // categories_per_game from settings
      timerDefault: null, // timer_seconds from settings
      playable: [],       // [{id, name}] from categories.php?playable=1
      played: null,       // { played, total } from questions.php?played=1, null until loaded
      selected: [],       // category ids in the order they were ticked
      loading: true,
      loadError: '',
      starting: false,
      streak: false,      // Streak Challenge chosen (US-33): its name field replaces the player row
    };
  }

  function colorsInUse(exceptEntry) {
    return state.setup.entries.filter((e) => e !== exceptEntry).map((e) => e.color);
  }

  function firstFreeColor() {
    const used = colorsInUse(null);
    const free = PALETTE.find((p) => used.indexOf(p.value) === -1);
    return free ? free.value : PALETTE[0].value;
  }

  function renderMode() {
    const mode = currentMode();
    dom.modeInputs.forEach((input) => { input.checked = input.value === state.setup.mode; });
    dom.entryAdd.textContent = 'Add ' + mode.one;
    dom.entryAdd.disabled = state.setup.entries.length >= mode.limit;
    const extra = state.setup.entries.length - mode.limit;
    if (extra > 0) {
      // D-07: entries are kept; Start stays blocked until the host removes the extras.
      showMessage(dom.entryLimitMsg, mode.title + ' mode allows at most ' + mode.limit + ' ' + mode.many +
        '. Remove ' + extra + ' to continue.', 'error');
    } else {
      clearMessage(dom.entryLimitMsg);
    }
  }

  function renderEntries() {
    const mode = currentMode();
    const entries = state.setup.entries;
    clear(dom.entryList);
    entries.forEach((entry, index) => {
      const label = mode.label + ' ' + (index + 1);
      const inputId = 'entry-name-' + entry.key;
      const errorId = 'entry-error-' + entry.key;
      const color = paletteEntry(entry.color);

      const swatch = h('button', {
        type: 'button',
        className: 'swatch',
        title: color.name + ' - click for the next free color',
        'aria-label': label + ' color ' + color.name + '. Click for the next free color.',
        'data-swatch': String(entry.key),
        onclick: () => cycleColor(entry),
      });
      swatch.style.backgroundColor = color.value;

      const input = h('input', {
        type: 'text',
        id: inputId,
        className: 'entry-input',
        value: entry.name,
        maxLength: NAME_MAX,
        placeholder: label + ' name',
        autocomplete: 'off',
        'aria-describedby': errorId,
      });
      if (entry.error) input.setAttribute('aria-invalid', 'true');
      input.addEventListener('input', () => {
        entry.name = input.value;
        if (entry.error) setEntryError(entry, '');
      });

      dom.entryList.appendChild(h('li', { className: 'entry-row' }, [
        h('label', { className: 'entry-label', htmlFor: inputId, text: label }),
        swatch,
        input,
        h('button', {
          type: 'button',
          className: 'btn btn-small btn-danger',
          text: 'Remove',
          disabled: entries.length <= 1,
          'aria-label': 'Remove ' + label,
          onclick: () => removeEntry(entry),
        }),
        h('p', { id: errorId, className: 'field-error', text: entry.error, hidden: !entry.error }),
      ]));
    });
    renderMode();
    updateStartButton();
  }

  function setEntryError(entry, message) {
    entry.error = message;
    const input = byId('entry-name-' + entry.key);
    const errorNode = byId('entry-error-' + entry.key);
    if (input) {
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
    if (errorNode) {
      errorNode.textContent = message;
      errorNode.hidden = !message;
    }
  }

  function addEntry() {
    if (state.setup.entries.length >= currentMode().limit) return;
    const entry = newEntry();
    state.setup.entries.push(entry);
    renderEntries();
    byId('entry-name-' + entry.key).focus();
  }

  function removeEntry(entry) {
    const entries = state.setup.entries;
    if (entries.length <= 1) return;
    const index = entries.indexOf(entry);
    entries.splice(index, 1);
    renderEntries(); // the removed entry's color is free again
    const next = entries[Math.min(index, entries.length - 1)];
    byId('entry-name-' + next.key).focus();
  }

  /** Move to the next palette color not used by another entry (no change if all are taken). */
  function cycleColor(entry) {
    const used = colorsInUse(entry);
    const start = PALETTE.findIndex((p) => p.value === entry.color);
    for (let step = 1; step < PALETTE.length; step += 1) {
      const candidate = PALETTE[(start + step) % PALETTE.length];
      if (used.indexOf(candidate.value) === -1) {
        entry.color = candidate.value;
        break;
      }
    }
    renderEntries();
    const swatch = dom.entryList.querySelector('[data-swatch="' + entry.key + '"]');
    if (swatch) swatch.focus();
  }

  function onModeChange(event) {
    if (!hasOwn(MODES, event.target.value)) return;
    state.setup.mode = event.target.value;
    renderEntries();
  }

  // ---------- Setup: categories and timer (US-04, US-05) ----------

  function renderCategories() {
    const s = state.setup;
    dom.catLegend.textContent = s.perGame ? 'Select up to ' + plural(s.perGame, 'category', 'categories') : 'Select categories';
    clear(dom.catList);
    clearMessage(dom.catWarning);
    if (s.loading || s.loadError === 'network') {
      dom.catCount.textContent = s.loading ? 'Loading categories...' : '';
      return;
    }
    if (s.playable.length) renderSurpriseTile();
    s.playable.forEach((c) => {
      const box = h('input', { type: 'checkbox', id: 'cat-' + c.id, checked: s.selected.indexOf(c.id) !== -1 });
      box.addEventListener('change', () => toggleCategory(c.id, box.checked));
      dom.catList.appendChild(h('li', {}, [
        h('label', { className: 'cat-label', htmlFor: 'cat-' + c.id, 'data-cat': String(c.id) }, [
          box,
          h('span', { className: 'cat-name-text', text: c.name }),
          h('span', { className: 'cat-order', 'aria-hidden': 'true' }),
        ]),
      ]));
    });
    if (!s.playable.length) {
      dom.catList.appendChild(h('li', { className: 'hint', text: 'No playable categories yet.' }));
    }
    if (s.perGame !== null && !s.playable.length) renderNotEnough();
    renderCategorySelection();
  }

  /** "Surprise me!": alone = SURPRISE_ALONE random categories, with picks = 1 random category in its slot. */
  function renderSurpriseTile() {
    const s = state.setup;
    const box = h('input', { type: 'checkbox', id: 'cat-surprise', checked: s.selected.indexOf(SURPRISE) !== -1 });
    box.addEventListener('change', () => toggleCategory(SURPRISE, box.checked));
    dom.catList.appendChild(h('li', { className: 'cat-surprise-item' }, [
      h('label', { className: 'cat-label cat-surprise', htmlFor: 'cat-surprise', 'data-cat': String(SURPRISE) }, [
        box,
        h('span', { className: 'cat-name-text' }, [
          document.createTextNode('Surprise me!'),
          h('span', {
            className: 'cat-surprise-hint',
            text: 'Tick alone for ' + SURPRISE_ALONE + ' random categories, or add it to your picks for 1 mystery category.',
          }),
        ]),
        h('span', { className: 'cat-order', 'aria-hidden': 'true' }),
      ]),
    ]));
  }

  /** D-11 (amended by D-32): no playable category at all -> message with Admin link, Start disabled. */
  function renderNotEnough() {
    clear(dom.catWarning);
    dom.catWarning.appendChild(document.createTextNode(
      'No playable categories ' + String.fromCharCode(0x2014) + ' add questions in '));
    // No link to the admin page in the Android app (US-40); the word stays so the sentence reads on
    dom.catWarning.appendChild(isApp ? document.createTextNode('Admin') : h('a', { href: 'admin.html', text: 'Admin' }));
    dom.catWarning.appendChild(document.createTextNode(
      '. A category is playable when it has a question for every enabled point value.'));
    dom.catWarning.hidden = false;
  }

  /** Update the "k of up to N selected" text, the selection-order badges (board column order)
   *  and lock the unticked boxes once N are ticked (D-32). */
  function renderCategorySelection() {
    const s = state.setup;
    const count = s.selected.length;
    const full = s.perGame !== null && count >= s.perGame;
    dom.catCount.textContent = s.perGame
      ? count + ' of up to ' + s.perGame + ' selected. Columns follow the order you tick them.'
      : count + ' selected.';
    Array.prototype.forEach.call(dom.catList.querySelectorAll('.cat-label'), (label) => {
      const order = s.selected.indexOf(Number(label.getAttribute('data-cat')));
      label.classList.toggle('is-selected', order !== -1);
      label.classList.toggle('is-locked', full && order === -1);
      label.querySelector('input').disabled = full && order === -1;
      label.querySelector('.cat-order').textContent = order === -1 ? '' : String(order + 1);
    });
  }

  function toggleCategory(id, checked) {
    const s = state.setup;
    const at = s.selected.indexOf(id);
    if (checked && at === -1) s.selected.push(id);
    if (!checked && at !== -1) s.selected.splice(at, 1);
    clearMessage(dom.catError);
    renderCategorySelection();
  }

  function setTimerError(message) {
    dom.timerError.textContent = message;
    dom.timerError.hidden = !message;
    if (message) dom.timerInput.setAttribute('aria-invalid', 'true');
    else dom.timerInput.removeAttribute('aria-invalid');
  }

  function showLoadError(text, withRetry, withAdminLink) {
    clear(dom.loadMsg);
    dom.loadMsg.className = 'msg msg-error';
    dom.loadMsg.appendChild(h('span', { text: text + ' ' }));
    // No link to the admin page in the Android app (US-40)
    if (withAdminLink && !isApp) dom.loadMsg.appendChild(h('a', { href: 'admin.html', text: 'Open Admin' }));
    if (withRetry) {
      dom.loadMsg.appendChild(h('button', {
        type: 'button',
        className: 'btn btn-small',
        text: 'Try again',
        onclick: loadSetupData,
      }));
    }
    dom.loadMsg.hidden = false;
  }

  function hideLoadError() {
    clear(dom.loadMsg);
    dom.loadMsg.hidden = true;
  }

  /** "New questions" banner on the setup screen: shown when the admin turned it on and gave a text. */
  function renderBanner(settings) {
    const text = typeof settings.banner_text === 'string' ? settings.banner_text.trim() : '';
    dom.newBanner.textContent = text;
    dom.newBanner.hidden = !(settings.banner_enabled === 1 && text);
  }

  /** Load settings and playable categories from the API (GET only). */
  async function loadSetupData() {
    const s = state.setup;
    s.loading = true;
    s.loadError = '';
    hideLoadError();
    renderCategories();
    updateStartButton();
    try {
      const results = await Promise.all([apiGet('settings.php'), apiGet('categories.php?playable=1')]);
      if (state.setup !== s) return; // setup was restarted meanwhile
      const settings = results[0];
      if (!isPlainObject(settings) || !Array.isArray(results[1])) {
        throw new Error('The server sent an unexpected response.');
      }
      s.perGame = Number.isInteger(settings.categories_per_game) && settings.categories_per_game > 0
        ? settings.categories_per_game : null;
      s.timerDefault = Number.isInteger(settings.timer_seconds) ? settings.timer_seconds : null;
      renderBanner(settings);
      setAdConfig(settings);
      s.maintenance = settings.start_game_hidden === 1;
      s.helpersOn = settings.helpers_enabled !== 0; // a missing row means on
      s.playable = results[1].filter((c) => isPlainObject(c) && Number.isInteger(c.id) && typeof c.name === 'string')
        .map((c) => ({ id: c.id, name: c.name }));
      s.selected = s.selected.filter((id) => id === SURPRISE || s.playable.some((c) => c.id === id));
      if (dom.timerInput.value === '' && s.timerDefault !== null) dom.timerInput.value = String(s.timerDefault);
      if (s.perGame === null) {
        s.loadError = 'settings';
        showLoadError('The game settings are incomplete (categories per game is missing).', false, true);
      }
    } catch (err) {
      if (state.setup !== s) return;
      s.loadError = 'network';
      showLoadError('Could not load the game setup: ' + errorText(err), true, false);
    }
    s.loading = false;
    renderCategories();
    updateStartButton();
    loadPlayed();
  }

  /**
   * Ask the server how many of the seen questions a board can still draw, and out of how many.
   * Only the server knows which questions were deleted or sit at a disabled point value.
   */
  async function loadPlayed() {
    const s = state.setup;
    s.played = null;
    renderPlayed();
    if (!s.playable.length) return;
    try {
      const data = await apiPost('questions.php?played=1', {
        categories: s.playable.map((c) => c.id).join(','),
        seen: loadSeen(),
      });
      if (state.setup !== s) return; // setup was restarted meanwhile
      if (isPlainObject(data) && Number.isInteger(data.played) && Number.isInteger(data.total)) {
        s.played = { played: data.played, total: data.total };
      }
    } catch (err) {
      // the bar is only a hint: fall back to the plain count
    }
    renderPlayed();
  }

  /** Progress bar + "26% of the questions played" + the Forget button (hidden while nothing is played). */
  function renderPlayed() {
    const s = state.setup;
    const seen = loadSeen().length;
    const counts = s && s.played && s.played.total > 0 ? s.played : null;
    dom.playedReset.hidden = seen === 0;
    dom.playedTrack.hidden = counts === null;
    if (counts === null) { // not loaded (yet): no total to compare with
      dom.playedCount.textContent = 'Played ' + plural(seen, 'question', 'questions') + ' on this device.';
      return;
    }
    const fraction = Math.min(counts.played, counts.total) / counts.total;
    // Rounded down, so 100% only shows once every question was played; "less than 1%" beats a misleading 0%.
    const percent = Math.floor(fraction * 100);
    const label = counts.played > 0 && percent === 0 ? 'Less than 1%' : percent + '%';
    dom.playedBar.style.transform = 'scaleX(' + fraction + ')';
    dom.playedTrack.setAttribute('aria-valuenow', String(percent));
    dom.playedCount.textContent = label + ' of the questions played on this device.';
  }

  /** Forget the played questions so every question can come up again. */
  function forgetPlayed() {
    if (!window.confirm('Forget the played questions? Questions you have already seen can come up again.')) return;
    clearSeen();
    if (state.setup.played) state.setup.played.played = 0;
    renderPlayed();
  }

  // ---------- Setup: validation and Start Game (US-02, US-04, US-05, US-06) ----------

  /** Reason why Start is disabled, or '' when the host may try to start. */
  function startBlockReason() {
    const s = state.setup;
    if (!s) return 'no setup';
    if (s.maintenance) return 'maintenance';
    if (s.loading) return 'loading';
    if (s.starting) return 'starting';
    if (s.loadError) return 'load error';
    if (s.perGame === null || !s.playable.length) return 'not enough categories';
    if (s.entries.length > currentMode().limit) return 'too many entries';
    return '';
  }

  function updateStartButton() {
    dom.startBtn.disabled = startBlockReason() !== '';
    const down = !!state.setup && state.setup.maintenance;
    dom.startBtn.hidden = down || (!!state.setup && state.setup.streak);
    dom.maintenanceOverlay.hidden = !down;
    updateStreakButtons(down);
  }

  /**
   * Streak Challenge buttons (US-33). "Streak Challenge (solo)" sits next to the mode toggle, only
   * in Players mode with exactly 1 player; "Start Streak Challenge" takes Start Game's place while
   * the streak setup (which holds the leaderboard button) is open. The streak needs no playable
   * category pick, so only maintenance, loading, a failed load or a running start block it.
   */
  function updateStreakButtons(down) {
    const s = state.setup;
    dom.streakOpenBtn.hidden = !s || down || s.streak || s.mode !== 'players' || s.entries.length !== 1;
    dom.streakBtn.hidden = !s || down || !s.streak;
    dom.streakBtn.disabled = !s || s.loading || s.starting || s.loadError === 'network';
  }

  /** D-02: required, unique after trimming, case-insensitive. Marks each bad entry inline. */
  function validateNames() {
    const entries = state.setup.entries;
    const keyOf = (e) => e.name.trim().toLowerCase();
    const counts = {};
    entries.forEach((e) => {
      const key = keyOf(e);
      if (key) counts[key] = (counts[key] || 0) + 1;
    });
    let ok = true;
    entries.forEach((e) => {
      const key = keyOf(e);
      let message = '';
      if (!key) message = 'Name is required';
      else if (counts[key] > 1) message = 'Names must be unique';
      setEntryError(e, message);
      if (message) ok = false;
    });
    return ok;
  }

  /** D-32: at least 1 and at most N categories. */
  function validateCategoryCount() {
    const s = state.setup;
    const count = s.selected.length;
    if (count >= 1 && count <= s.perGame) {
      clearMessage(dom.catError);
      return true;
    }
    showMessage(dom.catError, count < 1
      ? 'Select at least 1 category.'
      : 'Select up to ' + plural(s.perGame, 'category', 'categories') + ' (' + count + ' selected).', 'error');
    return false;
  }

  /** Whole number within the input's min/max. Returns the value or null (error shown inline). */
  function validateTimer() {
    const raw = dom.timerInput.value.trim();
    const range = timerRange();
    const value = Number(raw);
    if (dom.timerInput.validity.badInput || !/^\d+$/.test(raw) || value < range.min || value > range.max) {
      setTimerError('Timer must be a whole number of seconds between ' + range.min + ' and ' + range.max + '.');
      return null;
    }
    setTimerError('');
    return value;
  }

  function focusFirstProblem() {
    const target = dom.setupForm.querySelector('[aria-invalid="true"]') ||
      (!dom.catError.hidden ? dom.catList.querySelector('input') : null);
    if (target) target.focus();
  }

  /** Check the board payload matches the request; returns { points, categories } or throws. */
  function parseBoard(data, ids) {
    const points = isPlainObject(data) && Array.isArray(data.points) ? data.points.slice().sort((a, b) => a - b) : null;
    const categories = isPlainObject(data) && Array.isArray(data.categories) ? data.categories : null;
    const matches = categories && categories.length === ids.length &&
      categories.every((c, i) => isPlainObject(c) && c.id === ids[i]);
    if (!points || !matches || !isValidBoard(points, categories)) {
      throw new Error('The server sent an unexpected board.');
    }
    return {
      points: points,
      categories: categories.map((c) => {
        const questions = {};
        points.forEach((p) => { questions[String(p)] = parseQuestion(c.questions[String(p)]); });
        return { id: c.id, name: c.name, questions: questions };
      }),
    };
  }

  function isFilled(value) {
    return typeof value === 'string' && value.trim() !== '';
  }

  /** The fields the game keeps of a question checked by isValidQuestion (board cell or Swap question). */
  function parseQuestion(q) {
    // The Arabic version only counts when both halves are present; so do the wrong options
    // of each language (US-32), and the Arabic ones only with an Arabic question.
    const arabic = isFilled(q.question_ar) && isFilled(q.answer_ar);
    const wrong = isFilled(q.wrong_1) && isFilled(q.wrong_2);
    const wrongAr = arabic && isFilled(q.wrong_1_ar) && isFilled(q.wrong_2_ar);
    return {
      id: Number.isInteger(q.id) ? q.id : null,
      question: q.question,
      answer: q.answer,
      question_ar: arabic ? q.question_ar : null,
      answer_ar: arabic ? q.answer_ar : null,
      image: typeof q.image === 'string' ? q.image : null,
      image_credit: typeof q.image_credit === 'string' ? q.image_credit : null,
      wrong_1: wrong ? q.wrong_1 : null,
      wrong_2: wrong ? q.wrong_2 : null,
      wrong_1_ar: wrongAr ? q.wrong_1_ar : null,
      wrong_2_ar: wrongAr ? q.wrong_2_ar : null,
    };
  }

  /** Copy of the list in random order (Fisher-Yates). */
  function shuffled(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  /** Turn the ticked list into board category ids. "Surprise me!" alone picks SURPRISE_ALONE random
   *  categories; with other picks it becomes 1 random category not already picked, in its own slot.
   *  Returns { ids, hidden } where hidden holds the randomly picked ids (shown as "?" on the board). */
  function resolveSelection(s) {
    const picked = s.selected.filter((id) => id !== SURPRISE);
    if (picked.length === s.selected.length) return { ids: picked, hidden: [] };
    const free = shuffled(s.playable.map((c) => c.id).filter((id) => picked.indexOf(id) === -1));
    if (!picked.length) {
      const ids = free.slice(0, Math.min(SURPRISE_ALONE, s.perGame));
      return { ids: ids, hidden: ids };
    }
    if (!free.length) {
      throw new Error('Every playable category is already picked ' + String.fromCharCode(0x2014) +
        ' untick one, or untick Surprise me!');
    }
    return { ids: s.selected.map((id) => (id === SURPRISE ? free[0] : id)), hidden: [free[0]] };
  }

  async function onStart(event) {
    event.preventDefault();
    if (state.setup && state.setup.streak) { // Enter in the challenger name field
      onStreakStart();
      return;
    }
    if (startBlockReason()) return;
    clearMessage(dom.startMsg);
    const namesOk = validateNames();
    const categoriesOk = validateCategoryCount();
    const timer = validateTimer();
    if (!namesOk || !categoriesOk || timer === null) {
      showMessage(dom.startMsg, 'The game cannot start yet. Please fix the errors above.', 'error');
      focusFirstProblem();
      return;
    }

    const s = state.setup;
    s.starting = true;
    dom.startBtn.textContent = 'Starting...';
    updateStartButton();
    try {
      const selection = resolveSelection(s);
      const ids = selection.ids;
      const data = await apiPost('questions.php?board=1', { categories: ids.join(','), seen: loadSeen() });
      const board = parseBoard(data, ids);
      board.categories.forEach((c) => { c.hidden = selection.hidden.indexOf(c.id) !== -1; });
      preloadImages(board.categories);
      beginGame(board, timer);
    } catch (err) {
      // US-06: stay on setup with every input intact.
      showMessage(dom.startMsg, 'Could not start the game: ' + errorText(err), 'error');
    } finally {
      s.starting = false;
      dom.startBtn.textContent = 'Start Game';
      updateStartButton();
    }
  }

  /** Fetch every picture of the board up front so a picture question opens without a delay. */
  function preloadImages(categories) {
    categories.forEach((c) => {
      Object.keys(c.questions).forEach((p) => {
        const image = c.questions[p].image;
        if (image) new Image().src = image;
      });
    });
  }

  /** D-12: the board loaded now is used for the whole game (stored in the game state). */
  function beginGame(board, timerSeconds) {
    const s = state.setup;
    state.game = {
      mode: s.mode,
      contestants: s.entries.map((e, i) => ({
        id: i + 1, name: e.name.trim(), color: e.color, score: 0, helpers: allHelpers(),
      })),
      timerSeconds: timerSeconds, // this game only; the admin setting is not changed
      helpersOff: !s.helpersOn,   // admin setting when the game starts (helpers_enabled)
      points: board.points,
      categories: board.categories,
      used: {},
      double: pickDoubleCell(board.categories, board.points), // D-40: secret until it is opened
      current: null,
    };
    renderGame();
    showScreen('board'); // also saves the state
    logGameStart(state.game);
  }

  /** D-40: one random cell of the board is worth double; nothing shows it until it is opened. */
  function pickDoubleCell(categories, points) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    return cellKey(category.id, points[Math.floor(Math.random() * points.length)]);
  }

  /** Record the started game in the server's game log. Fire-and-forget: a failure never blocks play. */
  function logGameStart(game) {
    postGameLog({
      mode: game.mode,
      players: game.contestants.map((c) => c.name),
      categories: game.categories.map((c) => c.id),
    });
  }

  function postGameLog(body) {
    fetch(API_BASE + 'game-log.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {});
  }

  // ---------- Board and scoreboard (US-07, US-08, US-09, US-10) ----------

  /** D-05: manual corrections step by the smallest point value of this game's board. */
  function scoreStep() {
    return Math.min.apply(null, state.game.points);
  }

  function renderGame() {
    renderBoardInfo();
    renderBoard();
    renderBoardDone();
    renderScoreboard();
  }

  function renderBoardInfo() {
    const g = state.game;
    const mode = MODES[g.mode];
    dom.boardInfo.textContent = [
      plural(g.contestants.length, mode.one, mode.many),
      g.categories.length + ' ' + TIMES + ' ' + g.points.length + ' board',
      'Played ' + usedCount(g) + ' of ' + totalCells(g),
      'Timer ' + g.timerSeconds + ' s',
      'Corrections ' + String.fromCharCode(0x00b1) + scoreStep(),
    ].join('  ' + DOT + '  ');
  }

  function renderBoard() {
    const g = state.game;
    const digits = Math.max.apply(null, g.points.map((p) => String(p).length));
    clear(dom.board);
    // Grid columns = number of categories; label size derives from column width and digit count.
    dom.board.style.setProperty('--cols', String(g.categories.length));
    dom.board.style.setProperty('--rows', String(g.points.length));
    dom.board.style.setProperty('--digits', String(digits));
    g.categories.forEach((c) => {
      dom.board.appendChild(h('div', { className: 'board-cat' + (c.hidden ? ' is-mystery' : ''), title: categoryLabel(c) }, [
        h('span', { className: 'board-cat-name', text: c.hidden ? '?' : c.name }),
      ]));
    });
    g.points.forEach((p) => {
      g.categories.forEach((c) => dom.board.appendChild(renderCell(c, p)));
    });
  }

  /** Board name of a category: a "Surprise me!" pick stays a mystery until one of its questions is opened. */
  function categoryLabel(category) {
    return category.hidden ? 'Surprise category' : category.name;
  }

  /** One board cell: open (clickable) or used (disabled; owner color + name, or grey, US-08). */
  function renderCell(category, points) {
    const g = state.game;
    const key = cellKey(category.id, points);
    const label = h('span', { className: 'cell-points', text: String(points) });
    if (!hasOwn(g.used, key)) {
      return h('button', {
        type: 'button',
        className: 'board-cell',
        'aria-label': categoryLabel(category) + ', ' + points + ' points',
        onclick: () => openQuestion(category.id, points),
      }, [label]);
    }
    const used = g.used[key];
    const owner = used.owner === null ? null : findContestant(g, used.owner);
    const swap = used.swap;
    const double = key === g.double; // D-40: shown once played, with a small "×2" in the corner
    // After a Swap the old value is struck through and the question that replaced it is shown small.
    if (swap) label.classList.add('is-struck');
    const cell = h('button', {
      type: 'button',
      className: 'board-cell is-used ' + (owner ? 'is-owned' : 'is-unanswered') + (double ? ' is-double' : ''),
      disabled: true, // disabled buttons ignore clicks
      'aria-label': categoryLabel(category) + ', ' + points + ' points' + (double ? ', double score' : '') +
        (swap ? ', swapped to ' + swap.catName + ' ' + EN_DASH + ' ' + swap.points : '') + ', ' +
        (owner ? 'won by ' + owner.name : 'no correct answer'),
    }, [
      double ? h('span', { className: 'cell-double', text: TIMES + DOUBLE_FACTOR, 'aria-hidden': 'true' }) : null,
      label,
      swap ? h('span', { className: 'cell-swap', text: swap.catName + ' ' + EN_DASH + ' ' + swap.points }) : null,
      owner ? h('span', { className: 'cell-owner', text: owner.name }) : null,
    ]);
    if (owner) {
      const color = paletteEntry(owner.color);
      cell.style.backgroundColor = color.value;
      cell.style.color = color.ink;
    }
    return cell;
  }

  /** US-10 / D-01: prominent End Game offer once every cell is used. */
  function renderBoardDone() {
    const g = state.game;
    const done = allCellsUsed(g);
    dom.boardDone.hidden = !done;
    dom.boardDoneText.textContent = done ? 'All ' + totalCells(g) + ' questions have been played.' : '';
  }

  /** End Game: confirm first while cells are still open (D-09); unused cells are ignored. */
  function endGame() {
    const g = state.game;
    if (!g || state.screen !== 'board') return;
    if (!allCellsUsed(g)) {
      const left = totalCells(g) - usedCount(g);
      const text = 'End the game now? ' + plural(left, 'question has', 'questions have') +
        ' not been played and will be ignored.';
      if (!window.confirm(text)) return;
    }
    renderResults();
    showScreen('results');
    dom.newGameBtn.focus();
  }

  function renderScoreboard() {
    const step = scoreStep();
    clear(dom.scoreboard);
    state.game.contestants.forEach((c) => {
      const color = paletteEntry(c.color);
      const value = h('span', { className: 'score-value', text: formatScore(c.score), 'aria-live': 'polite' });
      const adjust = (delta) => {
        c.score += delta; // never touches cell ownership (D-05)
        value.textContent = formatScore(c.score);
        saveState();
      };
      const card = h('li', { className: 'score-card' }, [
        h('span', { className: 'score-name', text: c.name }),
        h('button', {
          type: 'button',
          className: 'score-btn score-minus',
          text: MINUS,
          title: MINUS + step,
          'aria-label': 'Subtract ' + step + ' points from ' + c.name,
          onclick: () => adjust(-step),
        }),
        value,
        h('button', {
          type: 'button',
          className: 'score-btn score-plus',
          text: '+',
          title: '+' + step,
          'aria-label': 'Add ' + step + ' points to ' + c.name,
          onclick: () => adjust(step),
        }),
        renderHelpersLeft(c),
      ]);
      card.style.backgroundColor = color.value;
      card.style.color = color.ink;
      dom.scoreboard.appendChild(card);
    });
  }

  /** Scoreboard card line with the helpers a contestant has left; used ones are dimmed (US-32). */
  function renderHelpersLeft(contestant) {
    const left = HELPER_KEYS.filter((key) => contestant.helpers[key]).map((key) => HELPERS[key].name);
    const text = left.length ? 'Helpers left: ' + left.join(', ') : 'No helpers left';
    return h('span', { className: 'score-helpers', title: text, hidden: state.game.helpersOff === true }, [
      h('span', { className: 'visually-hidden', text: text }),
    ].concat(HELPER_KEYS.map((key) => h('span', {
      className: 'score-helper' + (contestant.helpers[key] ? '' : ' is-used'),
      text: HELPERS[key].chip,
      'aria-hidden': 'true',
    }))));
  }

  // ---------- Question screen (US-11, US-13, US-14) ----------

  /** US-11: open an unused cell. Used cells are disabled, and this guard ignores them anyway. */
  function openQuestion(categoryId, points) {
    const g = state.game;
    if (!g || state.screen !== 'board' || g.current || hasOwn(g.used, cellKey(categoryId, points))) return;
    g.current = { catId: categoryId, points: points, marks: {}, answerShown: false };
    const category = findCategory(g, categoryId);
    category.hidden = false; // a "Surprise me!" column shows its name from its first question on
    // Opened = played: later boards in this browser avoid it.
    markSeen(category.questions[String(points)].id);
    showQuestion();
    if (isDoubleCurrent(g)) showDoublePopup();
  }

  /** D-40: announce the double-score question; its timer waits until the popup is closed. */
  function showDoublePopup() {
    const points = activeQuestion(state.game).points;
    dom.doubleText.textContent = 'A correct answer earns +' + points * DOUBLE_FACTOR + ' instead of +' + points +
      '. A wrong answer costs the normal ' + MINUS + points + '.';
    pauseTimer();
    dom.doubleOverlay.hidden = false;
    dom.main.inert = true; // keyboard focus stays on the popup
    dom.doubleOk.focus();
  }

  function closeDoublePopup() {
    if (dom.doubleOverlay.hidden) return;
    dom.doubleOverlay.hidden = true;
    dom.main.inert = false;
    resumeTimer();
    dom.qHeading.focus();
  }

  /** Render the open question and (re)start its timer at full length (also used on restore, D-04, and after a Swap). */
  function showQuestion() {
    const g = state.game;
    const cur = g.current;
    const active = activeQuestion(g);
    const q = active.question;
    setStreakLayout(false);
    renderQuestionHeading(active);
    // Arabic first when the question has an Arabic version; a restored choice is kept.
    if (!hasArabic(q)) cur.lang = 'en';
    else if (cur.lang !== 'en' && cur.lang !== 'ar') cur.lang = 'ar';
    clearMessage(dom.helperMsg);
    renderQuestionImage(q);
    renderQuestionLang(q);
    renderAnswerState();
    renderScoringRows();
    showScreen('question'); // also saves the state
    startTimer(g.timerSeconds);
    dom.qHeading.focus();
  }

  /**
   * "Category – 300"; a "×2 Double score" badge on the double-score cell (D-40); after a Swap the
   * new question's, with a small "Swapped from History – 300" note.
   */
  function renderQuestionHeading(active) {
    const g = state.game;
    const cur = g.current;
    clear(dom.qHeading);
    dom.qHeading.appendChild(document.createTextNode(active.catName + ' ' + EN_DASH + ' ' + active.points));
    if (isDoubleCurrent(g)) {
      dom.qHeading.appendChild(h('span', { className: 'question-double', text: TIMES + DOUBLE_FACTOR + ' Double score' }));
    }
    if (cur.swap) {
      const original = findCategory(g, cur.catId);
      dom.qHeading.appendChild(h('span', {
        className: 'question-swap-note',
        text: 'Swapped from ' + original.name + ' ' + EN_DASH + ' ' + cur.points,
      }));
    }
  }

  function hasArabic(q) {
    return typeof q.question_ar === 'string' && q.question_ar !== '' &&
      typeof q.answer_ar === 'string' && q.answer_ar !== '';
  }

  /** Picture question: show its picture above the text (same in both languages); else hide it. */
  function renderQuestionImage(q) {
    const image = dom.qImage;
    if (q.image) {
      image.src = q.image;
      image.hidden = false;
    } else {
      image.hidden = true;
      image.removeAttribute('src');
    }
    // A photo (not an SVG flag) gets the compact question layout and a bigger picture (D-35).
    image.parentElement.classList.toggle('has-photo', Boolean(q.image) && !/\.svg$/i.test(q.image));
    renderImageCredit(q);
  }

  /** Photo credit caption under the picture; only for a picture with a non-empty credit. */
  function renderImageCredit(q) {
    const credit = q.image && typeof q.image_credit === 'string' ? q.image_credit.trim() : '';
    const caption = dom.qCredit;
    caption.textContent = credit ? 'Photo: ' + credit : '';
    caption.title = caption.textContent; // full text when the one-line caption is cut off
    caption.hidden = !credit;
    // The caption takes the picture's bottom margin, so the page height stays the same.
    dom.qImage.classList.toggle('has-credit', Boolean(credit));
  }

  /** Show the question and its answer in the open question's language (cur.lang). */
  function renderQuestionLang(q) {
    const arabic = state.game.current.lang === 'ar';
    renderQuestionText(arabic ? q.question_ar : q.question, arabic);
    dom.answerValue.textContent = arabic ? q.answer_ar : q.answer;
    dom.answerValue.dir = arabic ? 'rtl' : 'ltr';
    dom.answerValue.lang = arabic ? 'ar' : 'en';
    dom.answerText.classList.toggle('is-rtl', arabic);
    renderLangButton(hasArabic(q), arabic);
    renderChoices(q, arabic);
  }

  /** The question text in its language (board game and Streak Challenge). */
  function renderQuestionText(text, arabic) {
    dom.qText.textContent = text;
    dom.qText.dir = arabic ? 'rtl' : 'ltr';
    dom.qText.lang = arabic ? 'ar' : 'en';
    dom.qText.style.setProperty('--q-scale', String(questionScale(text)));
  }

  /** The language button, shown when the question has Arabic; it offers the other language. */
  function renderLangButton(available, arabic) {
    dom.langBtn.hidden = !available;
    dom.langBtn.textContent = arabic ? 'English' : 'العربية';
    dom.langBtn.lang = arabic ? 'en' : 'ar';
    dom.langBtn.setAttribute('aria-label', arabic ? 'Show question in English' : 'Show question in Arabic');
  }

  /** Wrong options are there for the "3 choices" helper (parseQuestion keeps only complete pairs). */
  function hasChoices(q) {
    return isFilled(q.wrong_1) && isFilled(q.wrong_2);
  }

  /**
   * A text as a choice: cut at its first bracket, English at " (" and Arabic at "(" with or
   * without a space (choice_text() in api/questions.php). Answers often end in an explanation
   * or an "(accept X)" note for the host, e.g. "Three (triplets)"; the full answer still shows
   * under Show Answer. The wrong options are cut the same way (some Arabic ones carry an English
   * gloss, like their answers), so no option gives itself away by its brackets.
   */
  function choiceText(text, arabic) {
    const at = text.indexOf(arabic ? '(' : ' (');
    return (at === -1 ? text : text.slice(0, at)).trim() || text.trim();
  }

  /** The 3 options (index 0 = the answer) in the shown language; English when Arabic ones are missing. */
  function choiceTexts(q, arabic) {
    const ar = arabic && isFilled(q.wrong_1_ar) && isFilled(q.wrong_2_ar);
    const texts = ar ? [q.answer_ar, q.wrong_1_ar, q.wrong_2_ar] : [q.answer, q.wrong_1, q.wrong_2];
    return { arabic: ar, options: texts.map((text) => choiceText(text, ar)) };
  }

  /** "3 choices" list (US-32): shown once the helper was used, in the saved order, labelled A/B/C. */
  function renderChoices(q, arabic) {
    const cur = state.game.current;
    const list = dom.qChoices;
    const shown = cur.choiceOrder !== undefined && hasChoices(q);
    clear(list);
    list.hidden = !shown;
    // With a picture, the picture gives up the room the choices take (CSS, D-30).
    dom.qImage.parentElement.classList.toggle('has-choices', shown);
    if (!shown) return;
    const texts = choiceTexts(q, arabic);
    list.dir = texts.arabic ? 'rtl' : 'ltr';
    list.lang = texts.arabic ? 'ar' : 'en';
    list.classList.toggle('is-short', texts.options.every((text) => text.length <= CHOICES_SHORT_CHARS));
    cur.choiceOrder.forEach((index, position) => {
      list.appendChild(h('li', { className: 'choice' + (index === 0 ? ' is-answer' : '') }, [
        h('span', { className: 'choice-letter', text: CHOICE_LETTERS[position] }),
        h('span', { className: 'choice-text', text: texts.options[index] }),
      ]));
    });
  }

  function toggleLang() {
    if (streakOnScreen()) {
      toggleStreakLang();
      return;
    }
    const cur = state.game && state.game.current;
    if (!cur) return;
    const q = activeQuestion(state.game).question;
    if (!hasArabic(q)) return;
    cur.lang = cur.lang === 'ar' ? 'en' : 'ar';
    renderQuestionLang(q);
    saveState();
  }

  /**
   * FU-04: font scale for the question text. Text area grows with length x font size squared,
   * so past the threshold the size follows 1 / sqrt(length); short questions keep full size.
   */
  function questionScale(text) {
    const length = text.trim().length;
    if (length <= QUESTION_FULL_SIZE_CHARS) return 1;
    return Math.max(QUESTION_MIN_SCALE, Math.sqrt(QUESTION_FULL_SIZE_CHARS / length));
  }

  function renderAnswerState() {
    const shown = state.game.current.answerShown;
    dom.answerBtn.hidden = shown;
    dom.answerText.hidden = !shown;
    dom.qChoices.classList.toggle('is-revealed', shown); // the right choice turns green
  }

  function showAnswer() {
    const cur = state.game && state.game.current;
    if (!cur) return;
    cur.answerShown = true;
    renderAnswerState();
    updateScoringRows(); // no helpers once the answer is shown
    saveState();
    dom.answerText.focus();
  }

  /** One row per contestant in their color with the helper chips and Correct (+p, +2p on the double, D-40) / Wrong (-p). */
  function renderScoringRows() {
    const g = state.game;
    const p = activeQuestion(g).points;
    const win = correctPoints(g);
    clear(dom.scoreRows);
    scoringRows = g.contestants.map((c) => {
      const color = paletteEntry(c.color);
      const name = h('span', { className: 'srow-name', text: c.name });
      name.style.backgroundColor = color.value;
      name.style.color = color.ink;
      const helperBtns = {};
      HELPER_KEYS.forEach((key) => {
        helperBtns[key] = h('button', {
          type: 'button',
          className: 'helper-chip',
          text: HELPERS[key].chip,
          onclick: () => useHelper(c, key),
        });
      });
      const ref = {
        contestant: c,
        helpers: helperBtns,
        score: h('span', { className: 'srow-score', text: formatScore(c.score) }),
        status: h('span', { className: 'visually-hidden', 'aria-live': 'polite' }),
        correct: h('button', {
          type: 'button',
          className: 'btn btn-correct' + (win !== p ? ' is-double' : ''), // gold on the double (D-40)
          text: CHECK + ' Correct (+' + win + ')',
          'aria-label': 'Correct for ' + c.name + ', plus ' + win + ' points' + (win !== p ? ' (double score)' : ''),
          onclick: () => markContestant(c, 'correct'),
        }),
        wrong: h('button', {
          type: 'button',
          className: 'btn btn-wrong',
          text: CROSS + ' Wrong (' + MINUS + p + ')',
          'aria-label': 'Wrong for ' + c.name + ', minus ' + p + ' points',
          onclick: () => markContestant(c, 'wrong'),
        }),
      };
      const chips = h('span', { className: 'srow-helpers', hidden: g.helpersOff === true },
        HELPER_KEYS.map((key) => helperBtns[key]));
      ref.row = h('li', { className: 'srow' }, [name, chips, ref.score, ref.status, ref.correct, ref.wrong]);
      ref.row.style.borderLeftColor = color.value;
      dom.scoreRows.appendChild(ref.row);
      return ref;
    });
    updateScoringRows();
  }

  /**
   * US-14 / D-08: once per contestant; a single Correct; Wrong stays open for unscored contestants.
   * US-32: after a helper only its user can be scored; nobody can be scored while a Swap loads.
   */
  function updateScoringRows() {
    const cur = state.game.current;
    const someoneCorrect = correctContestantId(cur) !== null;
    scoringRows.forEach((ref) => {
      const key = String(ref.contestant.id);
      const mark = hasOwn(cur.marks, key) ? cur.marks[key] : null;
      const out = cur.by !== undefined && cur.by !== ref.contestant.id;
      ref.correct.disabled = mark !== null || someoneCorrect || out || swapping !== null;
      ref.wrong.disabled = mark !== null || out || swapping !== null;
      ref.correct.classList.toggle('is-chosen', mark === 'correct');
      ref.wrong.classList.toggle('is-chosen', mark === 'wrong');
      ref.row.classList.toggle('is-scored', mark !== null);
      ref.row.classList.toggle('is-out', out);
      ref.score.textContent = formatScore(ref.contestant.score);
      ref.status.textContent = mark === 'correct' ? ref.contestant.name + ' marked correct'
        : mark === 'wrong' ? ref.contestant.name + ' marked wrong' : '';
      HELPER_KEYS.forEach((helper) => updateHelperChip(ref, helper));
    });
  }

  /** Enable a helper chip only when its contestant may use it now; the tooltip says why not. */
  function updateHelperChip(ref, key) {
    const chip = ref.helpers[key];
    const name = HELPERS[key].name;
    const reason = helperBlockReason(ref.contestant, key);
    const busy = swapping === ref.contestant.id && key === 'swap';
    chip.disabled = reason !== '';
    chip.classList.toggle('is-used', !ref.contestant.helpers[key] && !busy);
    chip.classList.toggle('is-busy', busy);
    chip.textContent = busy ? ELLIPSIS : HELPERS[key].chip;
    chip.title = name + (reason ? ': ' + reason : '');
    chip.setAttribute('aria-label', name + ' for ' + ref.contestant.name + (reason ? ' (' + reason + ')' : ''));
  }

  /** Why `contestant` cannot use helper `key` on the open question now, or '' when they can (D-36). */
  function helperBlockReason(contestant, key) {
    const g = state.game;
    const cur = g.current;
    if (g.helpersOff) return 'helpers are turned off';
    if (swapping !== null) {
      return swapping === contestant.id && key === 'swap' ? 'loading a new question' : 'wait for the swap';
    }
    if (!contestant.helpers[key]) return 'already used in this game';
    if (cur.answerShown) return 'not after the answer is shown';
    if (Object.keys(cur.marks).length) return 'not after someone was scored';
    if (cur.by !== undefined && cur.by !== contestant.id) {
      return 'only ' + findContestant(g, cur.by).name + ' can use helpers on this question';
    }
    if (key === 'choices' && !hasChoices(activeQuestion(g).question)) return 'this question has no choices yet';
    return '';
  }

  /** Apply a Correct / Wrong mark. No undo inside a question (D-06): use the board's +/- buttons. */
  function markContestant(contestant, result) {
    const cur = state.game && state.game.current;
    if (!cur || swapping !== null) return;
    const key = String(contestant.id);
    if (hasOwn(cur.marks, key)) return;
    if (result === 'correct' && correctContestantId(cur) !== null) return;
    if (cur.by !== undefined && cur.by !== contestant.id) return; // the helper made it their question
    // D-40: only a Correct is doubled on the double-score cell; a Wrong costs the normal points.
    const points = activeQuestion(state.game).points;
    cur.marks[key] = result;
    contestant.score += result === 'correct' ? correctPoints(state.game) : -points;
    updateScoringRows();
    saveState();
    focusNextScoringButton();
  }

  // ---------- Helpers: 3 choices, Swap, Skip (US-32, D-36) ----------

  /** A helper click: check it is allowed, confirm it (no undo, D-06), then apply it. */
  function useHelper(contestant, key) {
    const g = state.game;
    if (!g || !g.current || helperBlockReason(contestant, key)) return;
    if (!window.confirm(helperConfirmText(contestant, key))) return;
    clearMessage(dom.helperMsg);
    if (key === 'choices') useChoices(contestant);
    else if (key === 'swap') useSwap(contestant);
    else useSkip(contestant);
  }

  function helperConfirmText(contestant, key) {
    const who = contestant.name;
    const points = activeQuestion(state.game).points;
    const ask = 'Use ' + HELPERS[key].name + ' for ' + who + '? ';
    if (key === 'skip') {
      return ask + who + ' loses ' + Math.round(points / 2) + ' points (half of ' + points +
        ') and the question closes for everyone.';
    }
    const what = key === 'swap'
      ? 'A random question from any category replaces this one, with a new timer.'
      : 'The answer is shown among 3 choices.';
    return ask + what + ' Only ' + who + ' can answer this question then.';
  }

  /** 3 choices: shuffle once and save the order, so a refresh shows the same A/B/C. */
  function useChoices(contestant) {
    const g = state.game;
    const cur = g.current;
    contestant.helpers.choices = false;
    cur.by = contestant.id;
    cur.choiceOrder = shuffled([0, 1, 2]);
    renderQuestionLang(activeQuestion(g).question);
    updateScoringRows();
    saveState();
  }

  /** Skip: lose half the points (of the Swap question after a Swap); the cell closes grey. */
  function useSkip(contestant) {
    const cur = state.game.current;
    contestant.helpers.skip = false;
    cur.by = contestant.id;
    contestant.score -= Math.round(activeQuestion(state.game).points / 2);
    backToBoard(); // nobody is marked Correct, so the cell turns grey
  }

  /**
   * Swap: a random question from the whole bank, not on this board, unseen first. It replaces
   * the open one (new heading, points and timer); the cell still closes with its result.
   * On an error the helper is kept.
   */
  async function useSwap(contestant) {
    const g = state.game;
    const cur = g.current;
    swapping = contestant.id; // busy chip; scoring and the other helpers wait
    updateScoringRows();
    let swap = null;
    let failure = '';
    try {
      swap = parseSwap(await apiPost('questions.php?random=1', { exclude: boardQuestionIds(g), seen: loadSeen() }));
    } catch (err) {
      const reason = errorText(err).trim();
      failure = 'Could not swap the question: ' + reason + (/[.!?]$/.test(reason) ? '' : '.') +
        ' The helper was not used.';
    }
    swapping = null;
    if (state.game !== g || g.current !== cur) { // the question was closed meanwhile: drop the result
      if (state.game && state.game.current) updateScoringRows();
      return;
    }
    if (!failure && cur.answerShown) failure = 'The answer was shown meanwhile, so the Swap was not used.';
    if (failure) {
      showMessage(dom.helperMsg, failure, 'error');
      updateScoringRows();
      return;
    }
    contestant.helpers.swap = false;
    cur.by = contestant.id;
    cur.swap = swap;
    // 3 choices used before the Swap carry over: a fresh order for the new question.
    if (cur.choiceOrder !== undefined) cur.choiceOrder = shuffled([0, 1, 2]);
    delete cur.lang; // the new question starts in its default language
    markSeen(swap.question.id);
    showQuestion(); // new heading, picture and points, timer from the start; also saves
  }

  /** Ids of every question on this board, so the Swap never brings one of them. */
  function boardQuestionIds(g) {
    const ids = [];
    g.categories.forEach((c) => {
      Object.keys(c.questions).forEach((p) => {
        const id = c.questions[p].id;
        if (Number.isInteger(id) && id > 0) ids.push(id);
      });
    });
    return ids;
  }

  /** Check the random-question payload; returns the saved `swap` shape or throws. */
  function parseSwap(data) {
    const ok = isPlainObject(data) && isPlainObject(data.category) && Number.isInteger(data.category.id) &&
      typeof data.category.name === 'string' && Number.isInteger(data.points) && data.points > 0 &&
      isValidQuestion(data.question) && Number.isInteger(data.question.id);
    if (!ok) throw new Error('The server sent an unexpected question.');
    return {
      catId: data.category.id,
      catName: data.category.name,
      points: data.points,
      question: parseQuestion(data.question),
    };
  }

  /** Keep keyboard focus on the scoring panel after the clicked button disables. */
  function focusNextScoringButton() {
    const next = dom.scoreRows.querySelector('button:not(:disabled)');
    (next || dom.backBtn).focus();
  }

  /** US-13: stop the timer, mark the cell used (owner = the Correct contestant, else grey). */
  function backToBoard() {
    const g = state.game;
    const cur = g && g.current;
    if (!cur) return;
    stopTimer();
    const cell = { owner: correctContestantId(cur) };
    // A Swap replaced the question: the board shows the old value struck through and the new one small.
    if (cur.swap) cell.swap = { catName: cur.swap.catName, points: cur.swap.points };
    g.used[cellKey(cur.catId, cur.points)] = cell;
    g.current = null;
    renderGame();
    showScreen('board'); // also saves the state
    if (allCellsUsed(g)) dom.boardDoneBtn.focus();
  }

  // ---------- Timer (US-12) ----------

  function now() {
    return window.performance && performance.now ? performance.now() : Date.now();
  }

  /**
   * Start the countdown at full length. The Streak Challenge passes the time left until its saved
   * deadline (so a refresh keeps it) and onExpire, which ends the run at 0.
   */
  function startTimer(seconds, remainingMs, onExpire) {
    stopTimer();
    timer.totalMs = seconds * 1000;
    timer.remainingMs = remainingMs === undefined ? timer.totalMs : Math.max(0, Math.min(remainingMs, timer.totalMs));
    timer.onExpire = onExpire || null;
    dom.timerStatus.textContent = '';
    resumeTimer();
  }

  /** A stopped countdown showing `remainingMs` (a streak question that was already answered). */
  function showTimerAt(seconds, remainingMs) {
    stopTimer();
    timer.totalMs = seconds * 1000;
    timer.remainingMs = Math.max(0, Math.min(remainingMs, timer.totalMs));
    timer.onExpire = null;
    renderTimer();
  }

  function resumeTimer() {
    if (timer.running || timer.remainingMs <= 0) return;
    timer.endAt = now() + timer.remainingMs;
    timer.running = true;
    timer.handle = window.setInterval(tickTimer, TIMER_TICK_MS);
    renderTimer();
  }

  function pauseTimer() {
    if (!timer.running) return;
    timer.remainingMs = Math.max(0, timer.endAt - now());
    stopTimer();
    renderTimer();
  }

  function stopTimer() {
    if (timer.handle !== null) window.clearInterval(timer.handle);
    timer.handle = null;
    timer.running = false;
  }

  /** Remaining time comes from the end timestamp, so throttled intervals never drift. */
  function tickTimer() {
    timer.remainingMs = Math.max(0, timer.endAt - now());
    const expired = timer.remainingMs === 0;
    if (expired) {
      stopTimer(); // D-03: stop at 0 (silently), nothing is auto-scored or closed
      dom.timerStatus.textContent = "Time's up!";
    }
    renderTimer();
    if (expired && timer.onExpire) timer.onExpire(); // Streak Challenge: time's up ends the run
  }

  function renderTimer() {
    const fraction = timer.totalMs > 0 ? timer.remainingMs / timer.totalMs : 0;
    dom.timerValue.textContent = String(Math.ceil(timer.remainingMs / 1000));
    dom.timerBar.style.transform = 'scaleX(' + fraction + ')';
    dom.timerBox.classList.toggle('is-low', timer.remainingMs <= timer.totalMs / 3); // red in the last third
    dom.timerPause.textContent = timer.running || timer.remainingMs <= 0 ? 'Pause' : 'Resume';
    dom.timerPause.disabled = timer.remainingMs <= 0;
  }

  function onPauseClick() {
    if (!state.game) return; // no Pause in the Streak Challenge
    if (timer.running) pauseTimer();
    else resumeTimer();
  }

  function onResetClick() {
    if (state.game && state.game.current) startTimer(state.game.timerSeconds);
  }

  // ---------- Results (US-15, US-16) ----------

  /** Score descending; equal scores keep the setup order. */
  function rankedContestants(g) {
    return g.contestants
      .map((c, index) => ({ c: c, index: index }))
      .sort((a, b) => (b.c.score - a.c.score) || (a.index - b.index))
      .map((item) => item.c);
  }

  /** "X and Y" / "X, Y and Z" (D-10). */
  function joinNames(names) {
    if (names.length <= 1) return names.join('');
    return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  }

  function renderResults() {
    const ranked = rankedContestants(state.game);
    const top = ranked[0].score;
    const winners = ranked.filter((c) => c.score === top); // D-10: everyone on the top score
    dom.resultsWinner.textContent = winners.length === 1
      ? winners[0].name + ' wins!'
      : "It's a tie between " + joinNames(winners.map((c) => c.name));
    clear(dom.resultsList);
    ranked.forEach((c) => {
      const isWinner = c.score === top;
      // Shared scores share a rank (1, 1, 3).
      const rank = ranked.findIndex((other) => other.score === c.score) + 1;
      const swatch = h('span', { className: 'result-swatch', 'aria-hidden': 'true' });
      swatch.style.backgroundColor = paletteEntry(c.color).value;
      const row = h('li', { className: 'result-row' + (isWinner ? ' is-winner' : '') }, [
        h('span', { className: 'result-rank', text: rank + '.' }),
        swatch,
        h('span', { className: 'result-name', text: c.name }),
        isWinner ? h('span', { className: 'result-badge', text: 'Winner' }) : null,
        h('span', { className: 'result-score', text: formatScore(c.score) }),
      ]);
      row.style.borderLeftColor = paletteEntry(c.color).value;
      dom.resultsList.appendChild(row);
    });
  }

  /** US-16 / D-15: clear the saved game and show an empty Setup with settings reloaded. */
  function newGame() {
    stopTimer();
    state.game = null;
    clearSavedState();
    streak = null;
    saveStreak();
    startSetup();
  }

  // ---------- Streak Challenge: setup (US-33) ----------

  /** Normal game or Streak Challenge: the challenger name field replaces the player row and the categories. */
  function renderSetupMode() {
    const s = state.setup;
    dom.playersBlock.hidden = s.streak;
    dom.catBlock.hidden = s.streak;
    dom.streakBlock.hidden = !s.streak;
    updateStartButton();
    syncBack(); // Android Back closes the Streak setup (US-40)
  }

  /** "Streak Challenge (solo)": open the challenger name field (prefilled from the player's name). */
  function onStreakOpen() {
    const s = state.setup;
    if (!s || s.streak) return;
    s.streak = true;
    if (!dom.streakNameInput.value.trim()) {
      dom.streakNameInput.value = cleanName(s.entries[0].name).slice(0, NAME_MAX);
    }
    setFieldError(dom.streakNameInput, dom.streakNameError, '');
    clearMessage(dom.startMsg);
    renderSetupMode();
    dom.streakNameInput.focus();
  }

  function onStreakCancel() {
    state.setup.streak = false;
    clearMessage(dom.startMsg);
    renderSetupMode();
    dom.streakOpenBtn.focus();
  }

  function setFieldError(input, errorNode, message) {
    errorNode.textContent = message;
    errorNode.hidden = !message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  /** A name as it is saved: trimmed, inner spaces collapsed. */
  function cleanName(text) {
    return text.trim().replace(/\s+/g, ' ');
  }

  /** Challenger name: required, at most NAME_MAX characters (D-22). Marks the field inline when bad. */
  function validateStreakName() {
    const name = cleanName(dom.streakNameInput.value);
    const message = !name ? 'Challenger name is required'
      : name.length > NAME_MAX ? 'Challenger name must be at most ' + NAME_MAX + ' characters' : '';
    setFieldError(dom.streakNameInput, dom.streakNameError, message);
    return message === '';
  }

  /** Start a run from the setup screen: name and timer checked like the board game's (no categories). */
  async function onStreakStart() {
    const s = state.setup;
    if (!s || !s.streak || dom.streakBtn.disabled) return;
    clearMessage(dom.startMsg);
    const nameOk = validateStreakName();
    const timerSeconds = validateTimer();
    if (!nameOk || timerSeconds === null) {
      showMessage(dom.startMsg, 'The Streak Challenge cannot start yet. Please fix the errors above.', 'error');
      const target = [dom.streakNameInput, dom.timerInput]
        .find((input) => input.getAttribute('aria-invalid') === 'true');
      if (target) target.focus();
      return;
    }
    s.starting = true;
    dom.streakBtn.textContent = 'Starting...';
    updateStartButton();
    try {
      await startStreakRun({
        name: cleanName(dom.streakNameInput.value),
        color: s.entries[0].color,
        timerSeconds: timerSeconds,
      });
    } catch (err) {
      // Stay on setup with every input intact (as US-06).
      showMessage(dom.startMsg, 'Could not start the Streak Challenge: ' + errorText(err), 'error');
    } finally {
      s.starting = false;
      dom.streakBtn.textContent = 'Start Streak Challenge';
      updateStartButton();
    }
  }

  // ---------- Streak Challenge: the run (US-33, D-37) ----------

  function saveStreak() {
    try {
      if (streak) window.localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
      else window.localStorage.removeItem(STREAK_KEY);
    } catch (err) {
      // Storage full or disabled: the run still works, it just won't survive a refresh.
    }
  }

  /** The saved run, or null when nothing valid is saved (corrupt data is removed). */
  function loadStreak() {
    let raw = null;
    try {
      raw = window.localStorage.getItem(STREAK_KEY);
    } catch (err) {
      return null;
    }
    if (raw === null) return null;
    try {
      const saved = JSON.parse(raw);
      if (isValidStreak(saved)) return saved;
    } catch (err) {
      // invalid JSON: discard it
    }
    try {
      window.localStorage.removeItem(STREAK_KEY);
    } catch (err) {
      // nothing to clear
    }
    return null;
  }

  function isValidStreakName(name) {
    return typeof name === 'string' && name.trim() !== '' && name.trim().length <= NAME_MAX;
  }

  /** A streak question: 3 non-empty choices, a valid `correct`, and Arabic choices when it has an Arabic question. */
  function isValidStreakQuestion(q) {
    if (!isPlainObject(q) || !Number.isInteger(q.id) || q.id < 1 || typeof q.category_name !== 'string' ||
        !Number.isInteger(q.points) || q.points < 1 || typeof q.question !== 'string' ||
        !isOptionalText(q.question_ar) || !isValidImage(q.image) || !isOptionalText(q.image_credit) ||
        !Array.isArray(q.choices) || q.choices.length !== CHOICE_LETTERS.length ||
        !Number.isInteger(q.correct) || q.correct < 0 || q.correct >= CHOICE_LETTERS.length) return false;
    const arabic = isFilled(q.question_ar);
    return q.choices.every((c) => isPlainObject(c) && isFilled(c.text) &&
      (arabic ? isFilled(c.text_ar) : isOptionalText(c.text_ar)));
  }

  function isValidStreak(run) {
    const range = timerRange();
    return isPlainObject(run) && run.version === STREAK_VERSION &&
      isValidStreakName(run.name) &&
      PALETTE.some((p) => p.value === run.color) &&
      Number.isInteger(run.timerSeconds) && run.timerSeconds >= range.min && run.timerSeconds <= range.max &&
      typeof run.over === 'boolean' &&
      Array.isArray(run.queue) && run.queue.length <= STREAK_MAX_QUEUE && run.queue.every(isValidStreakQuestion) &&
      Array.isArray(run.usedIds) && run.usedIds.length <= SEEN_MAX &&
      run.usedIds.every((id) => Number.isInteger(id) && id > 0) &&
      Number.isInteger(run.count) && run.count >= 0 && run.count <= run.usedIds.length &&
      isValidStreakCurrent(run.current, run);
  }

  /** The open question: one of the run's, a known language and pick, and a wrong pick only in an ended run. */
  function isValidStreakCurrent(cur, run) {
    if (cur === null) return true;
    if (!isPlainObject(cur) || !isValidStreakQuestion(cur.q) || run.usedIds.indexOf(cur.q.id) === -1) return false;
    const langOk = cur.lang === 'en' || (cur.lang === 'ar' && isFilled(cur.q.question_ar));
    const pickedOk = cur.picked === null || cur.picked === STREAK_TIME_UP ||
      (Number.isInteger(cur.picked) && cur.picked >= 0 && cur.picked < CHOICE_LETTERS.length);
    const lost = cur.picked !== null && cur.picked !== cur.q.correct;
    return langOk && pickedOk && Number.isFinite(cur.deadline) && (!lost || run.over) &&
      (cur.leftMs === undefined || (Number.isFinite(cur.leftMs) && cur.leftMs >= 0));
  }

  /** The fields the game keeps of a streak question checked by isValidStreakQuestion. */
  function parseStreakQuestion(q) {
    const arabic = isFilled(q.question_ar);
    return {
      id: q.id,
      category_name: q.category_name,
      points: q.points,
      question: q.question,
      question_ar: arabic ? q.question_ar : null,
      image: typeof q.image === 'string' ? q.image : null,
      image_credit: typeof q.image_credit === 'string' ? q.image_credit : null,
      choices: q.choices.map((c) => ({ text: c.text, text_ar: arabic ? c.text_ar : null })),
      correct: q.correct,
    };
  }

  function streakProfile(run) {
    return { name: run.name, color: run.color, timerSeconds: run.timerSeconds };
  }

  /** The streak question screen is showing (state.game is null during a run). */
  function streakOnScreen() {
    return state.screen === 'question' && !state.game && !!streak && !!streak.current;
  }

  /** Up to 20 questions from every category, none of `exclude`, unseen first. Throws on errors. */
  async function fetchStreakBatch(exclude) {
    const data = await apiPost('questions.php?streak=1', { exclude: exclude, seen: loadSeen() });
    if (!isPlainObject(data) || !Array.isArray(data.questions) ||
        !data.questions.every((q) => isValidStreakQuestion(q))) {
      throw new Error('The server sent unexpected questions.');
    }
    return data.questions.map(parseStreakQuestion);
  }

  /** Ids this run must not get again: the questions played and the ones queued. */
  function streakTakenIds(run) {
    return run.usedIds.concat(run.queue.map((q) => q.id));
  }

  /** Queue new questions (never one the run already has) and fetch their pictures up front. */
  function addToQueue(run, questions) {
    const taken = streakTakenIds(run);
    questions.forEach((q) => {
      if (taken.indexOf(q.id) !== -1 || run.queue.length >= STREAK_MAX_QUEUE) return;
      taken.push(q.id);
      run.queue.push(q);
      if (q.image) new Image().src = q.image;
    });
    if (streak === run) saveStreak();
  }

  /** The next batch for this run (one request at a time). Resolves with the number of questions received. */
  function requestStreakBatch(run) {
    if (streakRequest && streakRequest.run === run) return streakRequest.promise;
    const request = { run: run, promise: null };
    request.promise = fetchStreakBatch(streakTakenIds(run)).then((questions) => {
      if (streak === run) addToQueue(run, questions);
      return questions.length;
    }).finally(() => {
      if (streakRequest === request) streakRequest = null;
    });
    streakRequest = request;
    return request.promise;
  }

  /** Top up the queue in the background; a failure is retried after the next answer. */
  function refillStreak(run) {
    if (!run.over && run.queue.length < STREAK_REFILL_AT) requestStreakBatch(run).catch(() => {});
  }

  /** Start a new run with this name and timer. Throws (nothing changes) when no question can be loaded. */
  async function startStreakRun(profile) {
    const questions = await fetchStreakBatch([]);
    if (!questions.length) throw new Error('There are no questions to play yet.');
    stopTimer();
    state.game = null;
    clearSavedState();
    streak = {
      version: STREAK_VERSION,
      name: profile.name,
      color: profile.color,
      timerSeconds: profile.timerSeconds,
      count: 0,
      queue: [],
      usedIds: [],
      current: null,
      over: false,
    };
    lastStreakProfile = profile;
    addToQueue(streak, questions);
    postGameLog({ mode: 'streak', players: [streak.name] });
    nextStreakQuestion();
  }

  /** Open the next question (waiting for the next batch when the queue is empty). */
  async function nextStreakQuestion() {
    const run = streak;
    if (!run || run.over) return;
    if (!run.queue.length) {
      setStreakLoading(true);
      let failure = '';
      try {
        await requestStreakBatch(run);
      } catch (err) {
        failure = errorText(err);
      }
      if (streak !== run || run.over) return; // ended (End run) while loading
      setStreakLoading(false);
      if (!run.queue.length) {
        if (failure) {
          showStreakFeedback('Could not load the next question: ' + failure + ' Try Next again.', 'is-bad');
          return;
        }
        run.over = true; // every question was played in this run: it ends with the full streak
        finishStreak();
        return;
      }
    }
    const q = run.queue.shift();
    run.usedIds.push(q.id);
    run.current = {
      q: q,
      lang: isFilled(q.question_ar) ? 'ar' : 'en', // Arabic first, as on the board
      deadline: Date.now() + run.timerSeconds * 1000,
      picked: null,
    };
    markSeen(q.id); // later boards and runs avoid it too
    saveStreak();
    showStreakQuestion();
    refillStreak(run);
  }

  /** The streak layout of the question screen: the streak panel replaces scoring, answer and Pause/Reset (CSS). */
  function setStreakLayout(on) {
    dom.screens.question.classList.toggle('streak', on);
    dom.streakPanel.hidden = !on;
    if (on) { // the 3 choices helper list of the board game is not used
      clear(dom.qChoices);
      dom.qChoices.hidden = true;
      dom.qImage.parentElement.classList.remove('has-choices');
    }
  }

  /** Render the run's open question; its timer counts to the saved deadline (also after a refresh). */
  function showStreakQuestion() {
    const run = streak;
    const cur = run.current;
    const q = cur.q;
    setStreakLayout(true);
    dom.qHeading.textContent = q.category_name + ' ' + EN_DASH + ' ' + q.points;
    renderQuestionImage(q);
    renderStreakLang();
    renderStreakPanel();
    showScreen('question');
    if (cur.picked !== null) {
      showTimerAt(run.timerSeconds, cur.leftMs || 0);
      dom.timerStatus.textContent = cur.picked === STREAK_TIME_UP ? "Time's up!" : '';
      dom.streakNext.focus();
      return;
    }
    // Never more than one full timer: a deadline moved forward in storage is pulled back.
    cur.deadline = Math.min(cur.deadline, Date.now() + run.timerSeconds * 1000);
    saveStreak();
    const left = cur.deadline - Date.now();
    if (left <= 0) { // the time ran out while the page was closed
      showTimerAt(run.timerSeconds, 0);
      streakAnswer(null);
      return;
    }
    startTimer(run.timerSeconds, left, () => streakAnswer(null));
    dom.qHeading.focus();
  }

  /** Question text, language button and choices in the open question's language. */
  function renderStreakLang() {
    const cur = streak.current;
    const arabic = cur.lang === 'ar';
    renderQuestionText(arabic ? cur.q.question_ar : cur.q.question, arabic);
    renderLangButton(isFilled(cur.q.question_ar), arabic);
    renderStreakChoices();
  }

  function toggleStreakLang() {
    const cur = streak.current;
    if (!isFilled(cur.q.question_ar)) return;
    cur.lang = cur.lang === 'ar' ? 'en' : 'ar';
    renderStreakLang();
    renderStreakPanel(); // the feedback names the right answer in the shown language
    saveStreak();
  }

  /** 3 choice buttons, A/B/C in the server's order. Once answered: the right one green, a wrong pick red. */
  function renderStreakChoices() {
    const cur = streak.current;
    const arabic = cur.lang === 'ar';
    const answered = cur.picked !== null;
    const list = dom.streakChoices;
    clear(list);
    list.dir = arabic ? 'rtl' : 'ltr';
    list.lang = arabic ? 'ar' : 'en';
    cur.q.choices.forEach((choice, index) => {
      const isRight = answered && index === cur.q.correct;
      const isWrong = answered && index === cur.picked && !isRight;
      const text = arabic ? choice.text_ar : choice.text;
      const note = isRight ? ', the right answer' : isWrong ? ', your answer' : '';
      list.appendChild(h('li', {}, [
        h('button', {
          type: 'button',
          className: 'choice streak-choice' + (isRight ? ' is-right' : '') + (isWrong ? ' is-wrong' : ''),
          disabled: answered,
          'aria-label': CHOICE_LETTERS[index] + ': ' + text + note,
          onclick: () => streakAnswer(index),
        }, [
          h('span', { className: 'choice-letter', text: CHOICE_LETTERS[index], 'aria-hidden': 'true' }),
          h('span', { className: 'choice-text', text: text }),
        ]),
      ]));
    });
  }

  /** Name, streak count, feedback and the Next / See results and End run buttons. */
  function renderStreakPanel() {
    const run = streak;
    const cur = run.current;
    const lost = cur.picked !== null && cur.picked !== cur.q.correct;
    dom.streakName.textContent = run.name;
    dom.streakName.style.borderLeftColor = paletteEntry(run.color).value;
    dom.streakCount.textContent = String(run.count);
    if (cur.picked === null) {
      showStreakFeedback('', '');
    } else if (!lost) {
      showStreakFeedback('Correct! Your streak is ' + run.count + '.', 'is-good');
    } else {
      const right = cur.q.choices[cur.q.correct];
      const arabic = cur.lang === 'ar';
      showStreakFeedback((cur.picked === STREAK_TIME_UP ? "Time's up!" : 'Wrong!') +
        ' The right answer was ' + CHOICE_LETTERS[cur.q.correct] + ', ', 'is-bad',
        { text: arabic ? right.text_ar : right.text, arabic: arabic });
    }
    dom.streakNext.hidden = cur.picked === null;
    dom.streakNext.textContent = lost ? 'See results' : 'Next question';
    dom.streakNext.disabled = finishing;
    dom.streakEnd.hidden = lost;
    dom.streakEnd.disabled = finishing;
  }

  /**
   * The feedback line; `answer` ({text, arabic}) is appended in its own <bdi> with its direction,
   * so an Arabic answer never pulls the sentence's closing full stop to its left edge.
   */
  function showStreakFeedback(text, kind, answer) {
    clear(dom.streakFeedback);
    dom.streakFeedback.appendChild(document.createTextNode(text));
    if (answer) {
      dom.streakFeedback.appendChild(h('bdi', {
        text: answer.text,
        dir: answer.arabic ? 'rtl' : 'ltr',
        lang: answer.arabic ? 'ar' : 'en',
      }));
      dom.streakFeedback.appendChild(document.createTextNode('.'));
    }
    dom.streakFeedback.className = 'streak-feedback' + (kind ? ' ' + kind : '');
  }

  function setStreakLoading(loading) {
    dom.streakNext.disabled = loading;
    dom.streakNext.textContent = loading ? 'Loading...' : 'Next question';
  }

  /** A tapped choice, or null when the time ran out. Right: +1 and Next; wrong or too late: the run is over. */
  function streakAnswer(index) {
    const run = streak;
    const cur = run && run.current;
    if (!cur || cur.picked !== null || run.over || !streakOnScreen()) return;
    const leftMs = cur.deadline - Date.now();
    stopTimer();
    cur.leftMs = Math.max(0, leftMs);
    cur.picked = index === null || leftMs <= 0 ? STREAK_TIME_UP : index;
    if (cur.picked === cur.q.correct) run.count += 1;
    else run.over = true;
    saveStreak();
    showTimerAt(run.timerSeconds, cur.leftMs);
    if (cur.picked === STREAK_TIME_UP) dom.timerStatus.textContent = "Time's up!";
    renderStreakChoices();
    renderStreakPanel();
    dom.streakNext.focus(); // Enter goes on
    refillStreak(run);
  }

  function onStreakNext() {
    const run = streak;
    if (!run || !run.current || run.current.picked === null || dom.streakNext.disabled) return;
    if (run.over) finishStreak();
    else nextStreakQuestion();
  }

  /** Enter anywhere on the answered question means Next (buttons and links handle Enter themselves). */
  function onKeyDown(event) {
    if (event.key === 'Escape' && !dom.doubleOverlay.hidden) {
      closeDoublePopup();
      return;
    }
    if (event.key !== 'Enter' || !streakOnScreen() || dom.streakNext.hidden || dom.streakNext.disabled) return;
    const target = event.target;
    if (target && target.closest && target.closest('button, a, input, select, textarea')) return;
    event.preventDefault();
    onStreakNext();
  }

  /** End run: stop now and save the streak so far (confirm first). */
  function onStreakEnd() {
    const run = streak;
    if (!run || run.over || !streakOnScreen()) return;
    const text = run.count > 0
      ? 'End the run now? Your streak of ' + run.count + ' is saved to the leaderboard.'
      : 'End the run now? You have no streak yet, so nothing is saved.';
    if (!window.confirm(text)) return;
    if (streak !== run || run.over) return; // the time ran out while the confirm was open
    run.over = true;
    finishStreak();
  }

  /** The run is over: save it when the streak is 1 or more (D-37), then show the leaderboard. */
  async function finishStreak() {
    const run = streak;
    if (!run || finishing) return;
    finishing = true;
    run.over = true;
    stopTimer();
    saveStreak();
    lastStreakProfile = streakProfile(run);
    const result = {
      name: run.name,
      count: run.count,
      saving: run.count >= 1,
      saved: null,      // { rank, best } from the server
      saveError: '',
    };
    openLeaderboard(result);
    if (result.saving) {
      try {
        const saved = await apiPost('streaks.php', { name: run.name, streak: run.count });
        if (!isPlainObject(saved) || !Number.isInteger(saved.rank) || !Number.isInteger(saved.best)) {
          throw new Error('The server sent an unexpected response.');
        }
        result.saved = saved;
      } catch (err) {
        result.saveError = errorText(err);
      }
      result.saving = false;
    }
    finishing = false;
    // A saved run is done; an unsaved one stays (and is saved again after a refresh) until Try again works.
    if (streak === run && !result.saveError) {
      streak = null;
      saveStreak();
    }
    if (leaderboardResult !== result || state.screen !== 'leaderboard') return;
    renderLeaderboardHead(result);
    loadLeaderboardRows();
  }

  /** US-17 for the streak: reopen the saved run. An open question keeps its deadline. */
  function restoreStreak(run) {
    streak = run;
    lastStreakProfile = streakProfile(run);
    const cur = run.current;
    const lost = cur !== null && cur.picked !== null && cur.picked !== cur.q.correct;
    if (run.over && !lost) { // ended with End run or the last question: save it now
      finishStreak();
      return;
    }
    if (cur !== null) {
      showStreakQuestion();
      return;
    }
    if (!run.queue.length) throw new Error('The saved run has no question.');
    nextStreakQuestion();
  }

  // ---------- Streak leaderboard (US-34) ----------

  /** "2026-10-18" -> "18 Oct 2026" (the server date of the run, not "5 days ago"). */
  function formatRunDate(date) {
    const parts = date.split('-');
    return Number(parts[2]) + ' ' + MONTHS[Number(parts[1]) - 1] + ' ' + parts[0];
  }

  /** The leaderboard screen: after a run (`result`) with headline, rank, Play again and New Game; from setup (null) with Back. */
  function openLeaderboard(result) {
    leaderboardResult = result;
    clearMessage(dom.lbMsg);
    renderLeaderboardHead(result);
    clear(dom.lbList);
    dom.lbList.appendChild(h('li', { className: 'lb-empty', text: 'Loading the leaderboard...' }));
    dom.lbAgain.hidden = !result;
    dom.lbNew.hidden = !result;
    dom.lbBack.hidden = !!result;
    showScreen('leaderboard');
    dom.lbTitle.focus();
    if (!result || !result.saving) loadLeaderboardRows();
  }

  /** Headline ("Ahmed Fahim: 13 in a row!") and the rank line, or the save error with Try again. */
  function renderLeaderboardHead(result) {
    dom.lbHeadline.hidden = !result;
    dom.lbRank.hidden = !result;
    dom.lbAgain.disabled = !!result && result.saving;
    dom.lbNew.disabled = !!result && result.saving;
    if (!result) return;
    dom.lbHeadline.textContent = result.count > 0
      ? result.name + ': ' + result.count + ' in a row!'
      : 'No streak this time';
    if (result.saving) {
      dom.lbRank.textContent = 'Saving your streak...';
    } else if (result.saved) {
      const best = result.saved.best > result.count ? 'Your best is still ' + result.saved.best + '. ' : '';
      dom.lbRank.textContent = best + 'You are #' + result.saved.rank + ' on the leaderboard.';
    } else if (result.saveError) {
      dom.lbRank.hidden = true;
      clear(dom.lbMsg);
      dom.lbMsg.className = 'msg msg-error';
      dom.lbMsg.appendChild(h('span', { text: 'Your streak could not be saved: ' + result.saveError + ' ' }));
      dom.lbMsg.appendChild(h('button', { type: 'button', className: 'btn btn-small', text: 'Try again', onclick: finishStreak }));
      dom.lbMsg.hidden = false;
    } else {
      dom.lbRank.textContent = 'Only streaks of 1 or more go on the leaderboard.';
    }
  }

  /** Fetch and show the top 10; this person's rows are highlighted. */
  async function loadLeaderboardRows() {
    const load = ++leaderboardLoads;
    const result = leaderboardResult;
    let rows = null;
    let failure = '';
    try {
      const data = await apiGet('streaks.php');
      if (!Array.isArray(data)) throw new Error('The server sent an unexpected leaderboard.');
      rows = data.filter((r) => isPlainObject(r) && typeof r.name === 'string' &&
        Number.isInteger(r.streak) &&
        typeof r.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.date));
    } catch (err) {
      failure = errorText(err);
    }
    if (load !== leaderboardLoads || state.screen !== 'leaderboard') return;
    renderLeaderboardRows(rows, result, failure);
  }

  /**
   * Rows reading "1. Ahmed Fahim · 13 questions · 18 Oct 2026" (rendered with textContent only).
   * The name sits left and "· 13 questions · 18 Oct 2026" right; the space text nodes between the
   * flex items are not drawn but keep the row's text (and what screen readers read) in that format.
   */
  function renderLeaderboardRows(rows, result, failure) {
    clear(dom.lbList);
    if (failure || !rows.length) {
      dom.lbList.appendChild(h('li', {
        className: 'lb-empty',
        text: failure ? 'Could not load the leaderboard: ' + failure : 'No streaks yet. Be the first!',
      }));
      return;
    }
    const me = result ? result.name.toLowerCase() : null;
    rows.forEach((r, index) => {
      const name = r.name;
      const isMe = me !== null && name.toLowerCase() === me;
      dom.lbList.appendChild(h('li', { className: 'result-row' + (isMe ? ' is-me' : '') }, [
        h('span', { className: 'result-rank', text: (index + 1) + '.' }),
        document.createTextNode(' '),
        h('span', { className: 'result-name', text: name }),
        document.createTextNode(' '),
        h('span', {
          className: 'lb-meta',
          text: DOT + ' ' + plural(r.streak, 'question') + ' ' + DOT + ' ' + formatRunDate(r.date),
        }),
      ]));
    });
  }

  /** Leaving a run whose save failed loses it: ask first. */
  function confirmDropUnsaved() {
    if (!streak) return true;
    if (!window.confirm('Your streak of ' + streak.count + ' was not saved. Leave it unsaved?')) return false;
    streak = null;
    saveStreak();
    return true;
  }

  /** Play again: a new run with the same name and timer. */
  async function onPlayAgain() {
    const profile = lastStreakProfile;
    if (!profile || dom.lbAgain.disabled || !confirmDropUnsaved()) return;
    clearMessage(dom.lbMsg);
    dom.lbAgain.disabled = true;
    dom.lbAgain.textContent = 'Starting...';
    try {
      await startStreakRun(profile);
    } catch (err) {
      showMessage(dom.lbMsg, 'Could not start a new run: ' + errorText(err), 'error');
    } finally {
      dom.lbAgain.disabled = false;
      dom.lbAgain.textContent = 'Play again';
    }
  }

  function onLeaderboardNewGame() {
    if (dom.lbNew.disabled || !confirmDropUnsaved()) return;
    newGame();
  }

  /** "Streak leaderboard" in the streak setup; Back returns to the setup as it was. */
  function onLeaderboardOpen() {
    openLeaderboard(null);
  }

  function onLeaderboardBack() {
    showScreen('setup');
    dom.streakBoardBtn.focus();
  }

  // ---------- Startup ----------

  /** Fresh, empty setup with current settings (one empty entry, Players mode). */
  function startSetup() {
    state.setup = freshSetup();
    state.setup.entries.push(newEntry());
    dom.timerInput.value = '';
    setTimerError('');
    clearMessage(dom.catError);
    clearMessage(dom.startMsg);
    dom.startBtn.textContent = 'Start Game';
    dom.streakBtn.textContent = 'Start Streak Challenge';
    dom.streakNameInput.value = '';
    setFieldError(dom.streakNameInput, dom.streakNameError, '');
    renderEntries();
    renderSetupMode();
    showScreen('setup');
    loadSetupData();
  }

  function bindStreakEvents() {
    dom.streakOpenBtn.addEventListener('click', onStreakOpen);
    dom.streakBtn.addEventListener('click', onStreakStart);
    dom.streakCancel.addEventListener('click', onStreakCancel);
    dom.streakBoardBtn.addEventListener('click', onLeaderboardOpen);
    dom.streakNameInput.addEventListener('input', () => setFieldError(dom.streakNameInput, dom.streakNameError, ''));
    dom.streakNext.addEventListener('click', onStreakNext);
    dom.streakEnd.addEventListener('click', onStreakEnd);
    dom.lbAgain.addEventListener('click', onPlayAgain);
    dom.lbNew.addEventListener('click', onLeaderboardNewGame);
    dom.lbBack.addEventListener('click', onLeaderboardBack);
    document.addEventListener('keydown', onKeyDown);
  }

  function bindEvents() {
    dom.setupForm.addEventListener('submit', onStart);
    dom.entryAdd.addEventListener('click', addEntry);
    dom.modeInputs.forEach((input) => input.addEventListener('change', onModeChange));
    dom.timerInput.addEventListener('input', () => setTimerError(''));
    dom.playedReset.addEventListener('click', forgetPlayed);
    dom.endBtn.addEventListener('click', endGame);
    dom.boardDoneBtn.addEventListener('click', endGame);
    dom.answerBtn.addEventListener('click', showAnswer);
    dom.langBtn.addEventListener('click', toggleLang);
    dom.timerPause.addEventListener('click', onPauseClick);
    dom.timerReset.addEventListener('click', onResetClick);
    dom.backBtn.addEventListener('click', backToBoard);
    dom.doubleOk.addEventListener('click', closeDoublePopup);
    dom.newGameBtn.addEventListener('click', newGame);
    bindStreakEvents();
  }

  /** US-17: reopen the saved screen. An open question restarts its timer at full length (D-04). */
  function restoreGame(saved) {
    state.game = saved.game;
    if (saved.screen === 'results') {
      renderResults();
      showScreen('results');
      return;
    }
    renderGame();
    preloadImages(state.game.categories);
    if (saved.screen === 'question') showQuestion();
    else showScreen('board');
  }

  function init() {
    Object.keys(MODES).forEach((key) => {
      byId('mode-limit-' + key).textContent = '(max ' + MODES[key].limit + ')';
    });
    bindEvents();
    initApp();
    registerServiceWorker();
    const saved = loadState();
    if (saved) {
      try {
        restoreGame(saved);
        return;
      } catch (err) {
        // Validated data should never fail here; if it does, fall back to a clean Setup.
        stopTimer();
        state.game = null;
        clearSavedState();
      }
    }
    const savedStreak = loadStreak();
    if (savedStreak) {
      try {
        restoreStreak(savedStreak);
        return;
      } catch (err) {
        stopTimer();
        streak = null;
        saveStreak();
      }
    }
    startSetup();
  }

  init();
})();
