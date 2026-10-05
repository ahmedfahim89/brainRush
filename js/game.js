// BrainRush game page: setup, dynamic board and scoreboard.
// The question, timer, scoring and results screens are added in Sprint 4.
// The page only uses GET endpoints, so it works on the hosted site without the admin login.
// All API/user text is rendered with textContent / DOM APIs (never innerHTML).
'use strict';

(function () {
  const API_BASE = 'api/';
  const STORAGE_KEY = 'brainrush.game';
  const STORAGE_VERSION = 1;
  const NAME_MAX = 30;
  const MINUS = String.fromCharCode(0x2212); // typographic minus sign
  const TIMES = String.fromCharCode(0x00d7); // multiplication sign
  const DOT = String.fromCharCode(0x00b7);   // middle dot

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

  const SCREENS = ['setup', 'board', 'question', 'results'];

  // Central state. `setup` is the form being filled in (memory only);
  // `game` is the running game and is saved to localStorage on every change.
  const state = {
    screen: 'setup',
    setup: null,
    game: null,
  };

  let nextEntryKey = 1;

  const byId = (id) => document.getElementById(id);
  const dom = {
    screens: {
      setup: byId('screen-setup'),
      board: byId('screen-board'),
      question: byId('screen-question'),
      results: byId('screen-results'),
    },
    setupForm: byId('setup-form'),
    loadMsg: byId('setup-load-msg'),
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
    startBtn: byId('start-btn'),
    startMsg: byId('start-msg'),
    boardInfo: byId('board-info'),
    board: byId('board'),
    boardMsg: byId('board-msg'),
    scoreboard: byId('scoreboard'),
    quitBtn: byId('quit-btn'),
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
  async function apiGet(path) {
    let response;
    try {
      response = await fetch(API_BASE + path, { headers: { Accept: 'application/json' }, cache: 'no-store' });
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

  // ---------- Persistence (saveState / loadState) ----------
  // Only the running game is stored. Sprint 4 (US-17) extends restore to the
  // question and results screens; the stored shape is versioned for that.

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
      const saved = JSON.parse(raw);
      if (saved && saved.version === STORAGE_VERSION && SCREENS.indexOf(saved.screen) > 0 && isValidGame(saved.game)) {
        return { screen: saved.screen, game: saved.game };
      }
    } catch (err) {
      // invalid JSON: fall through and discard it
    }
    clearSavedState();
    return null;
  }

  function clearSavedState() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      // nothing to clear
    }
  }

  function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function isValidContestants(list, mode) {
    if (!Array.isArray(list) || list.length < 1 || list.length > mode.limit) return false;
    const ids = {};
    const colors = {};
    return list.every((c) => {
      const ok = isPlainObject(c) && Number.isInteger(c.id) && !ids[c.id] &&
        typeof c.name === 'string' && c.name.trim() !== '' &&
        PALETTE.some((p) => p.value === c.color) && !colors[c.color] &&
        Number.isInteger(c.score);
      if (ok) {
        ids[c.id] = true;
        colors[c.color] = true;
      }
      return ok;
    });
  }

  function isValidBoard(points, categories) {
    if (!Array.isArray(points) || !points.length) return false;
    const ascending = points.every((p, i) => Number.isInteger(p) && p > 0 && (i === 0 || p > points[i - 1]));
    if (!ascending || !Array.isArray(categories) || !categories.length) return false;
    return categories.every((c) => isPlainObject(c) && Number.isInteger(c.id) &&
      typeof c.name === 'string' && isPlainObject(c.questions) &&
      points.every((p) => {
        const q = hasOwn(c.questions, String(p)) ? c.questions[String(p)] : null;
        return isPlainObject(q) && typeof q.question === 'string' && typeof q.answer === 'string';
      }));
  }

  function isValidGame(g) {
    if (!isPlainObject(g) || typeof g.mode !== 'string' || !hasOwn(MODES, g.mode)) return false;
    const range = timerRange();
    return isValidContestants(g.contestants, MODES[g.mode]) &&
      Number.isInteger(g.timerSeconds) && g.timerSeconds >= range.min && g.timerSeconds <= range.max &&
      isValidBoard(g.points, g.categories);
  }

  // ---------- Screens ----------

  function showScreen(name) {
    state.screen = name;
    SCREENS.forEach((key) => { dom.screens[key].hidden = key !== name; });
    window.scrollTo(0, 0);
    saveState();
  }

  // ---------- Setup: contestants (US-01, US-02, US-03) ----------

  function newEntry() {
    return { key: nextEntryKey++, name: '', color: firstFreeColor(), error: '' };
  }

  function freshSetup() {
    return {
      mode: 'players',
      entries: [],
      perGame: null,      // categories_per_game from settings
      timerDefault: null, // timer_seconds from settings
      playable: [],       // [{id, name}] from categories.php?playable=1
      selected: [],       // category ids in the order they were ticked
      loading: true,
      loadError: '',
      starting: false,
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
    dom.catLegend.textContent = s.perGame ? 'Select ' + plural(s.perGame, 'category', 'categories') : 'Select categories';
    clear(dom.catList);
    clearMessage(dom.catWarning);
    if (s.loading || s.loadError === 'network') {
      dom.catCount.textContent = s.loading ? 'Loading categories...' : '';
      return;
    }
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
    if (s.perGame !== null && s.playable.length < s.perGame) renderNotEnough();
    renderCategorySelection();
  }

  /** D-11: fewer playable categories than a game needs -> message with Admin link, Start disabled. */
  function renderNotEnough() {
    const s = state.setup;
    clear(dom.catWarning);
    dom.catWarning.appendChild(document.createTextNode(
      'Not enough playable categories ' + String.fromCharCode(0x2014) + ' add questions in '));
    dom.catWarning.appendChild(h('a', { href: 'admin.html', text: 'Admin' }));
    dom.catWarning.appendChild(document.createTextNode(
      '. A game needs ' + s.perGame + '; ' + s.playable.length + ' ' +
      (s.playable.length === 1 ? 'is' : 'are') + ' playable (a question for every point value).'));
    dom.catWarning.hidden = false;
  }

  /** Update the "k of N selected" text and the selection-order badges (board column order). */
  function renderCategorySelection() {
    const s = state.setup;
    const count = s.selected.length;
    dom.catCount.textContent = s.perGame
      ? count + ' of ' + s.perGame + ' selected. Columns follow the order you tick them.'
      : count + ' selected.';
    Array.prototype.forEach.call(dom.catList.querySelectorAll('.cat-label'), (label) => {
      const order = s.selected.indexOf(Number(label.getAttribute('data-cat')));
      label.classList.toggle('is-selected', order !== -1);
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
    if (withAdminLink) dom.loadMsg.appendChild(h('a', { href: 'admin.html', text: 'Open Admin' }));
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
      s.playable = results[1].filter((c) => isPlainObject(c) && Number.isInteger(c.id) && typeof c.name === 'string')
        .map((c) => ({ id: c.id, name: c.name }));
      s.selected = s.selected.filter((id) => s.playable.some((c) => c.id === id));
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
  }

  // ---------- Setup: validation and Start Game (US-02, US-04, US-05, US-06) ----------

  /** Reason why Start is disabled, or '' when the host may try to start. */
  function startBlockReason() {
    const s = state.setup;
    if (!s) return 'no setup';
    if (s.loading) return 'loading';
    if (s.starting) return 'starting';
    if (s.loadError) return 'load error';
    if (s.perGame === null || s.playable.length < s.perGame) return 'not enough categories';
    if (s.entries.length > currentMode().limit) return 'too many entries';
    return '';
  }

  function updateStartButton() {
    dom.startBtn.disabled = startBlockReason() !== '';
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

  function validateCategoryCount() {
    const s = state.setup;
    if (s.selected.length === s.perGame) {
      clearMessage(dom.catError);
      return true;
    }
    showMessage(dom.catError, 'Select exactly ' + plural(s.perGame, 'category', 'categories') +
      ' (' + s.selected.length + ' selected).', 'error');
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
        points.forEach((p) => {
          const q = c.questions[String(p)];
          questions[String(p)] = { question: q.question, answer: q.answer };
        });
        return { id: c.id, name: c.name, questions: questions };
      }),
    };
  }

  async function onStart(event) {
    event.preventDefault();
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
    const ids = s.selected.slice();
    s.starting = true;
    dom.startBtn.textContent = 'Starting...';
    updateStartButton();
    try {
      const data = await apiGet('questions.php?board=1&categories=' + ids.join(','));
      beginGame(parseBoard(data, ids), timer);
    } catch (err) {
      // US-06: stay on setup with every input intact.
      showMessage(dom.startMsg, 'Could not start the game: ' + errorText(err), 'error');
    } finally {
      s.starting = false;
      dom.startBtn.textContent = 'Start Game';
      updateStartButton();
    }
  }

  /** D-12: the board loaded now is used for the whole game (stored in the game state). */
  function beginGame(board, timerSeconds) {
    const s = state.setup;
    state.game = {
      mode: s.mode,
      contestants: s.entries.map((e, i) => ({ id: i + 1, name: e.name.trim(), color: e.color, score: 0 })),
      timerSeconds: timerSeconds, // this game only; the admin setting is not changed
      points: board.points,
      categories: board.categories,
    };
    renderGame();
    showScreen('board'); // also saves the state
  }

  // ---------- Board and scoreboard (US-07, US-09) ----------

  /** D-05: manual corrections step by the smallest point value of this game's board. */
  function scoreStep() {
    return Math.min.apply(null, state.game.points);
  }

  function renderGame() {
    renderBoardInfo();
    renderBoard();
    renderScoreboard();
    clearMessage(dom.boardMsg);
  }

  function renderBoardInfo() {
    const g = state.game;
    const mode = MODES[g.mode];
    dom.boardInfo.textContent = [
      plural(g.contestants.length, mode.one, mode.many),
      g.categories.length + ' ' + TIMES + ' ' + g.points.length + ' board',
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
    dom.board.style.setProperty('--digits', String(digits));
    g.categories.forEach((c) => {
      dom.board.appendChild(h('div', { className: 'board-cat', title: c.name }, [
        h('span', { className: 'board-cat-name', text: c.name }),
      ]));
    });
    g.points.forEach((p) => {
      g.categories.forEach((c) => {
        dom.board.appendChild(h('button', {
          type: 'button',
          className: 'board-cell',
          'aria-label': c.name + ', ' + p + ' points',
          onclick: onCellClick,
        }, [h('span', { className: 'cell-points', text: String(p) })]));
      });
    });
  }

  function onCellClick() {
    // Opening a question is US-11 (Sprint 4).
    showMessage(dom.boardMsg, 'Opening questions is coming in the next sprint.', 'warning');
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
      ]);
      card.style.backgroundColor = color.value;
      card.style.color = color.ink;
      dom.scoreboard.appendChild(card);
    });
  }

  function quitGame() {
    if (!window.confirm('Quit this game and go back to setup? The board and scores will be lost.')) return;
    state.game = null;
    clearSavedState();
    startSetup();
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
    renderEntries();
    showScreen('setup');
    loadSetupData();
  }

  function bindEvents() {
    dom.setupForm.addEventListener('submit', onStart);
    dom.entryAdd.addEventListener('click', addEntry);
    dom.modeInputs.forEach((input) => input.addEventListener('change', onModeChange));
    dom.timerInput.addEventListener('input', () => setTimerError(''));
    dom.quitBtn.addEventListener('click', quitGame);
  }

  function init() {
    Object.keys(MODES).forEach((key) => {
      byId('mode-limit-' + key).textContent = '(max ' + MODES[key].limit + ')';
    });
    bindEvents();
    const saved = loadState();
    if (saved) {
      state.game = saved.game;
      renderGame();
      showScreen('board'); // Sprint 4 restores the question and results screens too (US-17)
      return;
    }
    startSetup();
  }

  init();
})();
