// BrainRush admin page: settings, point values, categories and questions.
// Question bank (D-31 amended): every question has a point value, a category may have
// several questions per value, and it is playable when every enabled point value has one.
// All API/user text is rendered with textContent / DOM APIs (never innerHTML).
'use strict';

(function () {
  const API_BASE = 'api/';
  const LABEL_MAX = 60; // question text length used in confirms and button labels
  const BANNER_MAX = 150; // banner_text limit in api/settings.php
  const BANNER_DEFAULT = 'New questions added - try them now!'; // same as the seed in sql/schema.sql
  // Picture questions: same rule as api/questions.php (a file under img/questions/).
  const IMAGE_PATTERN = /^img\/questions\/[a-z0-9][a-z0-9-]*\.(svg|jpg|jpeg|png|webp)$/;

  const state = {
    settings: null,    // { categories_per_game, timer_seconds, banner_enabled, banner_text }
    points: [],        // [{ id, points, enabled, question_count }] ascending
    categories: [],    // [{ id, name, question_count }] sorted by name
    questions: [],     // [{ id, category_id, category_name, points, question, answer, question_ar, answer_ar, image, image_credit }]
    renamingId: null,  // category currently being renamed inline
    renameDraft: '',
    editing: null,     // question being edited, or null when the form is in "add" mode
  };

  const byId = (id) => document.getElementById(id);
  const dom = {
    globalMsg: byId('global-msg'),
    authBanner: byId('auth-banner'),
    authText: byId('auth-text'),
    authRetry: byId('auth-retry'),
    settingsForm: byId('settings-form'),
    settingCategories: byId('setting-categories'),
    settingTimer: byId('setting-timer'),
    settingBannerEnabled: byId('setting-banner-enabled'),
    settingBannerText: byId('setting-banner-text'),
    settingStartHidden: byId('setting-start-hidden'),
    settingsMsg: byId('settings-msg'),
    pointsForm: byId('points-form'),
    pointNew: byId('point-new'),
    pointsMsg: byId('points-msg'),
    pointsList: byId('points-list'),
    categoryForm: byId('category-form'),
    categoryNew: byId('category-new'),
    categoriesMsg: byId('categories-msg'),
    categoriesSummary: byId('categories-summary'),
    categoriesBody: byId('categories-body'),
    qForm: byId('question-form'),
    qFormTitle: byId('question-form-title'),
    qCategory: byId('question-category'),
    qPoints: byId('question-points'),
    qText: byId('question-text'),
    qAnswer: byId('question-answer'),
    qTextAr: byId('question-text-ar'),
    qAnswerAr: byId('question-answer-ar'),
    qImage: byId('question-image'),
    qImagePreview: byId('question-image-preview'),
    qImageCredit: byId('question-image-credit'),
    qSave: byId('question-save'),
    qCancel: byId('question-cancel'),
    questionsMsg: byId('questions-msg'),
    qFilter: byId('question-filter'),
    questionsBody: byId('questions-body'),
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

  /** Shorten long text for confirms and labels (questions have no other short name). */
  function shortText(text) {
    return text.length > LABEL_MAX ? text.slice(0, LABEL_MAX - 3) + '...' : text;
  }

  class ApiError extends Error {
    constructor(message, status) {
      super(message);
      this.status = status;
    }
  }

  /** Readable text for an error response without a JSON `error` (e.g. a web-server error page). */
  function fallbackErrorText(status) {
    if (status === 401) return 'Login required to change content.';
    if (status === 403) return 'Access denied: changes are not allowed here.';
    return 'Request failed (HTTP ' + status + ').';
  }

  /** Call the JSON API. Resolves with the parsed body; rejects with ApiError carrying the API's `error` text. */
  async function api(path, method, body) {
    const init = { method: method || 'GET', headers: { Accept: 'application/json' } };
    if (body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
    let response;
    try {
      response = await fetch(API_BASE + path, init);
    } catch (err) {
      throw new ApiError('Could not reach the server. Check that it is running.', 0);
    }
    let data = null;
    try {
      data = await response.json();
    } catch (err) {
      data = null; // non-JSON body (e.g. PHP not running): never show it raw
    }
    if (!response.ok) {
      const message = data && typeof data.error === 'string' && data.error
        ? data.error
        : fallbackErrorText(response.status);
      throw new ApiError(message, response.status);
    }
    if (data === null) {
      throw new ApiError('The server sent an unexpected response.', response.status);
    }
    return data;
  }

  function showMessage(node, text, kind) {
    node.textContent = text;
    node.className = 'msg msg-' + kind;
    node.hidden = false;
  }

  function showError(node, text) {
    showMessage(node, text, 'error');
  }

  function showSuccess(node, text) {
    showMessage(node, text, 'success');
  }

  function clearMessage(node) {
    node.textContent = '';
    node.hidden = true;
  }

  function errorText(err) {
    return err && err.message ? err.message : 'Something went wrong.';
  }

  /**
   * Run an API action for a panel: clears the panel message, disables the given
   * buttons while busy and shows any error inline. On 404/409 the data is reloaded,
   * because the page was probably showing stale data. 401/403 also update the
   * login notice; a successful change proves the login works, so it is hidden.
   */
  async function runAction(msgNode, buttons, action) {
    clearMessage(msgNode);
    buttons.forEach((b) => { b.disabled = true; });
    try {
      await action();
      hideAuthProblem();
    } catch (err) {
      showError(msgNode, errorText(err));
      if (isAuthError(err)) {
        showAuthProblem(err);
      } else if (err instanceof ApiError && (err.status === 404 || err.status === 409)) {
        refreshData().catch(() => {});
      }
    } finally {
      buttons.forEach((b) => { b.disabled = false; });
    }
  }

  /** Read a whole number from a number input, using its min/max attributes as the allowed range. */
  function readIntField(input, label) {
    const raw = input.value.trim();
    const min = Number(input.min);
    const max = Number(input.max);
    const rangeError = label + ' must be a whole number between ' + min + ' and ' + max + '.';
    if (input.validity.badInput || !/^\d+$/.test(raw)) return { error: rangeError };
    const value = Number(raw);
    if (value < min || value > max) return { error: rangeError };
    return { value: value };
  }

  function ensureArray(data, what) {
    if (!Array.isArray(data)) throw new ApiError('The server sent an unexpected ' + what + ' list.', 200);
    return data;
  }

  // ---------- Admin login (US-29) ----------
  // The page loads its data only after the admin login (or this computer when no login
  // is configured). The browser shows its own login prompt on a 401 and then re-sends
  // the login with every later API request.

  function isAuthError(err) {
    return err instanceof ApiError && (err.status === 401 || err.status === 403);
  }

  /** Show the login notice for a failed check or change; the page stays usable read-only. */
  function showAuthProblem(err) {
    let text;
    if (isAuthError(err) && err.status === 401) {
      text = errorText(err) + ' Click "Log in" to enter the admin user name and password.';
      dom.authRetry.textContent = 'Log in';
    } else if (isAuthError(err)) {
      text = errorText(err);
      dom.authRetry.textContent = 'Check again';
    } else {
      text = 'Could not check the admin login: ' + errorText(err);
      dom.authRetry.textContent = 'Try again';
    }
    dom.authText.textContent = text;
    dom.authBanner.hidden = false;
  }

  function hideAuthProblem() {
    dom.authBanner.hidden = true;
    dom.authText.textContent = '';
  }

  /** Ask the API whether changes are allowed; a 401 makes the browser show its login prompt. */
  async function checkAuth() {
    dom.authRetry.disabled = true;
    try {
      await api('auth.php');
      hideAuthProblem();
      return true;
    } catch (err) {
      showAuthProblem(err);
      return false;
    } finally {
      dom.authRetry.disabled = false;
    }
  }

  /** Log in again from the banner; once it works, load the data that was held back. */
  async function onAuthRetry() {
    if (await checkAuth()) {
      loadSettings();
      await loadData();
    }
  }

  // ---------- Data loading ----------

  /** Reload point values, categories and questions, then re-render every data panel. */
  async function refreshData() {
    const results = await Promise.all([api('points.php'), api('categories.php'), api('questions.php')]);
    state.points = ensureArray(results[0], 'point value');
    state.categories = ensureArray(results[1], 'category');
    state.questions = ensureArray(results[2], 'question');
    syncEditingQuestion();
    if (state.renamingId !== null && !findCategory(state.renamingId)) state.renamingId = null;
    clearMessage(dom.globalMsg);
    renderAll();
  }

  function renderAll() {
    renderPoints();
    renderCategories();
    renderQuestionSelects();
    renderQuestions();
  }

  function findCategory(id) {
    return state.categories.find((c) => c.id === id) || null;
  }

  // ---------- Settings (US-18) ----------

  function fillSettings(settings) {
    state.settings = settings;
    dom.settingCategories.value = settings.categories_per_game === null ? '' : String(settings.categories_per_game);
    dom.settingTimer.value = settings.timer_seconds === null ? '' : String(settings.timer_seconds);
    dom.settingBannerEnabled.checked = settings.banner_enabled === 1;
    dom.settingStartHidden.checked = settings.start_game_hidden === 1;
    dom.settingBannerText.value = typeof settings.banner_text === 'string' ? settings.banner_text : BANNER_DEFAULT;
    renderCategorySummary();
  }

  async function loadSettings() {
    try {
      fillSettings(await api('settings.php'));
    } catch (err) {
      showError(dom.settingsMsg, 'Could not load settings: ' + errorText(err));
    }
  }

  function onSettingsSubmit(event) {
    event.preventDefault();
    clearMessage(dom.settingsMsg);
    const perGame = readIntField(dom.settingCategories, 'Max categories per game');
    const timer = readIntField(dom.settingTimer, 'Timer');
    const bannerText = dom.settingBannerText.value.trim();
    let bannerError = '';
    if (!bannerText) bannerError = 'Banner text is required.';
    // Array.from counts characters like the server does (an emoji is one, not two)
    else if (Array.from(bannerText).length > BANNER_MAX) bannerError = 'Banner text must be at most ' + BANNER_MAX + ' characters.';
    const errors = [perGame.error, timer.error, bannerError].filter(Boolean);
    if (errors.length) {
      showError(dom.settingsMsg, errors.join('\n'));
      return;
    }
    const submit = dom.settingsForm.querySelector('button[type="submit"]');
    runAction(dom.settingsMsg, [submit], async () => {
      const saved = await api('settings.php', 'PUT', {
        categories_per_game: perGame.value,
        timer_seconds: timer.value,
        banner_enabled: dom.settingBannerEnabled.checked ? 1 : 0,
        banner_text: bannerText,
        start_game_hidden: dom.settingStartHidden.checked ? 1 : 0,
      });
      fillSettings(saved);
      showSuccess(dom.settingsMsg, 'Settings saved.');
    });
  }

  // ---------- Point values (US-19) ----------

  function renderPoints() {
    clear(dom.pointsList);
    if (!state.points.length) {
      dom.pointsList.appendChild(h('li', { className: 'hint', text: 'No point values yet. Add one to build the board.' }));
      return;
    }
    state.points.forEach((p) => {
      const meta = plural(p.question_count, 'question') + (p.enabled ? '' : ' - disabled, not on the board');
      dom.pointsList.appendChild(h('li', { className: p.enabled ? '' : 'is-disabled' }, [
        h('span', { className: 'point-label', text: String(p.points) }),
        h('span', { className: 'item-meta', text: meta }),
        h('button', {
          type: 'button',
          className: 'btn btn-small',
          text: p.enabled ? 'Disable' : 'Enable',
          'aria-label': (p.enabled ? 'Disable' : 'Enable') + ' point value ' + p.points,
          onclick: () => togglePoint(p),
        }),
        h('button', {
          type: 'button',
          className: 'btn btn-small btn-danger',
          text: 'Delete',
          'aria-label': 'Delete point value ' + p.points,
          onclick: () => deletePoint(p),
        }),
      ]));
    });
  }

  function onPointSubmit(event) {
    event.preventDefault();
    clearMessage(dom.pointsMsg);
    const parsed = readIntField(dom.pointNew, 'Point value');
    if (parsed.error) {
      showError(dom.pointsMsg, parsed.error);
      return;
    }
    const submit = dom.pointsForm.querySelector('button[type="submit"]');
    runAction(dom.pointsMsg, [submit], async () => {
      await api('points.php', 'POST', { points: parsed.value });
      dom.pointNew.value = '';
      await refreshData();
      showSuccess(dom.pointsMsg, 'Point value ' + parsed.value + ' added. Categories need at least one ' +
        parsed.value + ' question to stay playable.');
    });
  }

  /** Show or hide a value on the board; its questions are kept either way. */
  function togglePoint(p) {
    const enable = !p.enabled;
    runAction(dom.pointsMsg, [], async () => {
      await api('points.php?id=' + encodeURIComponent(p.id), 'PUT', { enabled: enable });
      await refreshData();
      showSuccess(dom.pointsMsg, enable
        ? 'Point value ' + p.points + ' enabled. It is back on the board for the next game.'
        : 'Point value ' + p.points + ' disabled. The next game\'s board leaves it out; its questions are kept.');
    });
  }

  function deletePoint(p) {
    if (!window.confirm('Delete point value ' + p.points + '?')) return;
    runAction(dom.pointsMsg, [], async () => {
      await api('points.php?id=' + encodeURIComponent(p.id), 'DELETE');
      await refreshData();
      showSuccess(dom.pointsMsg, 'Point value ' + p.points + ' deleted.');
    });
  }

  // ---------- Categories (US-20) ----------

  /** Enabled point values: the board rows. Disabled values are not needed to play. */
  function enabledPoints() {
    return state.points.filter((p) => p.enabled);
  }

  /** Enabled point values (ascending) that have no question in the category yet. */
  function missingPoints(categoryId) {
    const used = {};
    state.questions.forEach((q) => {
      if (q.category_id === categoryId) used[q.points] = true;
    });
    return enabledPoints().map((p) => p.points).filter((p) => !used[p]);
  }

  function isPlayable(category) {
    return enabledPoints().length > 0 && missingPoints(category.id).length === 0;
  }

  function renderCategorySummary() {
    const total = state.categories.length;
    const playable = state.categories.filter(isPlayable).length;
    let text = playable + ' of ' + plural(total, 'category', 'categories') +
      (total === 1 ? ' is' : ' are') + ' playable (at least one question for every enabled point value).';
    if (state.settings && state.settings.categories_per_game !== null) {
      text += ' A game can use up to ' + state.settings.categories_per_game + '.';
    }
    dom.categoriesSummary.textContent = text;
  }

  /** Render the category table; returns the inline rename input if a rename is in progress. */
  function renderCategories() {
    renderCategorySummary();
    clear(dom.categoriesBody);
    if (!state.categories.length) {
      dom.categoriesBody.appendChild(h('tr', {}, [
        h('td', { className: 'empty-row', colSpan: 4, text: 'No categories yet.' }),
      ]));
      return null;
    }
    let renameInput = null;
    state.categories.forEach((c) => {
      if (c.id === state.renamingId) {
        const row = renameRow(c);
        renameInput = row.input;
        dom.categoriesBody.appendChild(row.tr);
      } else {
        dom.categoriesBody.appendChild(categoryRow(c));
      }
    });
    return renameInput;
  }

  /** Count cell "M questions" and a status badge: "Playable" or "Not playable: missing V1, V2". */
  function categoryCells(c) {
    const missing = missingPoints(c.id);
    let status;
    if (isPlayable(c)) {
      status = h('span', { className: 'badge badge-ok', text: 'Playable' });
    } else if (!enabledPoints().length) {
      status = h('span', { className: 'badge badge-missing', text: 'Not playable: no enabled point values' });
    } else {
      status = h('span', { className: 'badge badge-missing', text: 'Not playable: missing ' + missing.join(', ') });
    }
    return [
      h('td', { className: 'num', text: plural(c.question_count, 'question') }),
      h('td', {}, [status]),
    ];
  }

  function categoryRow(c) {
    return h('tr', {}, [
      h('td', { className: 'name-cell', text: c.name }),
    ].concat(categoryCells(c), [
      h('td', { className: 'row-actions' }, [
        h('button', {
          type: 'button',
          className: 'btn btn-small',
          text: 'Rename',
          'aria-label': 'Rename category ' + c.name,
          onclick: () => startRename(c),
        }),
        h('button', {
          type: 'button',
          className: 'btn btn-small btn-danger',
          text: 'Delete',
          'aria-label': 'Delete category ' + c.name,
          onclick: () => deleteCategory(c),
        }),
      ]),
    ]));
  }

  function renameRow(c) {
    const input = h('input', {
      type: 'text',
      className: 'rename-input',
      value: state.renameDraft,
      maxLength: 100,
      'aria-label': 'New name for category ' + c.name,
    });
    const save = h('button', { type: 'button', className: 'btn btn-small btn-primary', text: 'Save' });
    const cancel = h('button', { type: 'button', className: 'btn btn-small', text: 'Cancel', onclick: cancelRename });
    save.onclick = () => saveRename(c, input, save);
    input.addEventListener('input', () => { state.renameDraft = input.value; });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        saveRename(c, input, save);
      } else if (event.key === 'Escape') {
        cancelRename();
      }
    });
    const tr = h('tr', { className: 'is-editing' }, [
      h('td', { className: 'name-cell' }, [input]),
    ].concat(categoryCells(c), [
      h('td', { className: 'row-actions' }, [save, cancel]),
    ]));
    return { tr: tr, input: input };
  }

  function startRename(c) {
    clearMessage(dom.categoriesMsg);
    state.renamingId = c.id;
    state.renameDraft = c.name;
    const input = renderCategories();
    if (input) {
      input.focus();
      input.select();
    }
  }

  function cancelRename() {
    state.renamingId = null;
    clearMessage(dom.categoriesMsg);
    renderCategories();
  }

  function saveRename(c, input, saveButton) {
    const name = input.value.trim();
    if (!name) {
      showError(dom.categoriesMsg, 'Category name is required.');
      input.focus();
      return;
    }
    if (name === c.name) {
      cancelRename();
      return;
    }
    runAction(dom.categoriesMsg, [saveButton], async () => {
      await api('categories.php?id=' + encodeURIComponent(c.id), 'PUT', { name: name });
      state.renamingId = null;
      await refreshData();
      showSuccess(dom.categoriesMsg, 'Category renamed to "' + name + '".');
    });
  }

  function onCategorySubmit(event) {
    event.preventDefault();
    clearMessage(dom.categoriesMsg);
    const name = dom.categoryNew.value.trim();
    if (!name) {
      showError(dom.categoriesMsg, 'Category name is required.');
      return;
    }
    const submit = dom.categoryForm.querySelector('button[type="submit"]');
    runAction(dom.categoriesMsg, [submit], async () => {
      await api('categories.php', 'POST', { name: name });
      dom.categoryNew.value = '';
      await refreshData();
      showSuccess(dom.categoriesMsg, 'Category "' + name + '" added.');
    });
  }

  function deleteCategory(c) {
    const warning = c.question_count > 0
      ? 'Delete category "' + c.name + '"?\n\nIts ' + plural(c.question_count, 'question') +
        ' will also be deleted. This cannot be undone.'
      : 'Delete category "' + c.name + '"?';
    if (!window.confirm(warning)) return;
    runAction(dom.categoriesMsg, [], async () => {
      await api('categories.php?id=' + encodeURIComponent(c.id), 'DELETE');
      await refreshData();
      showSuccess(dom.categoriesMsg, 'Category "' + c.name + '" deleted.');
    });
  }

  // ---------- Questions (US-21) ----------

  /** Keep the edited question in sync after a reload; leave edit mode if it was deleted. */
  function syncEditingQuestion() {
    if (!state.editing) return;
    const fresh = state.questions.find((q) => q.id === state.editing.id);
    if (fresh) {
      state.editing = fresh;
    } else {
      resetQuestionForm();
    }
  }

  function fillCategoryOptions(select, firstLabel) {
    const previous = select.value;
    clear(select);
    select.appendChild(h('option', { value: '', text: firstLabel }));
    state.categories.forEach((c) => {
      select.appendChild(h('option', { value: String(c.id), text: c.name }));
    });
    select.value = findCategory(Number(previous)) ? previous : '';
  }

  /** All point values (no free-slot filtering: a value may hold several questions). */
  function fillPointOptions() {
    const previous = dom.qPoints.value;
    clear(dom.qPoints);
    const firstLabel = state.points.length ? 'Choose points' : 'Add a point value first';
    dom.qPoints.appendChild(h('option', { value: '', text: firstLabel }));
    state.points.forEach((p) => {
      // Disabled values still take questions; they are just not on the board.
      const text = String(p.points) + (p.enabled ? '' : ' (disabled)');
      dom.qPoints.appendChild(h('option', { value: String(p.points), text: text }));
    });
    dom.qPoints.value = state.points.some((p) => String(p.points) === previous) ? previous : '';
  }

  function renderQuestionSelects() {
    fillCategoryOptions(dom.qFilter, 'All categories');
    fillCategoryOptions(dom.qCategory, 'Choose a category');
    fillPointOptions();
  }

  function renderQuestions() {
    const filterId = Number(dom.qFilter.value);
    const rows = filterId ? state.questions.filter((q) => q.category_id === filterId) : state.questions;
    clear(dom.questionsBody);
    if (!rows.length) {
      dom.questionsBody.appendChild(h('tr', {}, [
        h('td', { className: 'empty-row', colSpan: 7, text: 'No questions yet.' }),
      ]));
      return;
    }
    rows.forEach((q) => {
      const isEditing = state.editing !== null && state.editing.id === q.id;
      const label = '"' + shortText(q.question) + '" (' + q.category_name + ' - ' + q.points + ')';
      dom.questionsBody.appendChild(h('tr', { className: isEditing ? 'is-editing' : '' }, [
        h('td', { className: 'name-cell', text: q.category_name }),
        h('td', { className: 'num', text: String(q.points) }),
        h('td', { className: 'text-cell', text: q.question }),
        h('td', { className: 'text-cell', text: q.answer }),
        h('td', { className: 'text-cell', text: q.question_ar ? 'Yes' : '-' }),
        h('td', { className: 'text-cell', text: q.image ? 'Yes' : '-' }),
        h('td', { className: 'row-actions' }, [
          h('button', {
            type: 'button',
            className: 'btn btn-small',
            text: 'Edit',
            'aria-label': 'Edit question ' + label,
            onclick: () => startEdit(q),
          }),
          h('button', {
            type: 'button',
            className: 'btn btn-small btn-danger',
            text: 'Delete',
            'aria-label': 'Delete question ' + label,
            onclick: () => deleteQuestion(q),
          }),
        ]),
      ]));
    });
  }

  function setFormMode() {
    const editing = state.editing !== null;
    dom.qFormTitle.textContent = editing
      ? 'Edit question (' + state.editing.category_name + ' - ' + state.editing.points + ')'
      : 'Add question';
    dom.qSave.textContent = editing ? 'Save changes' : 'Add question';
    dom.qCancel.hidden = !editing;
    dom.qForm.classList.toggle('editing', editing);
  }

  /** Back to "add" mode with empty text fields (category selection is kept). */
  function resetQuestionForm() {
    state.editing = null;
    dom.qText.value = '';
    dom.qAnswer.value = '';
    dom.qTextAr.value = '';
    dom.qAnswerAr.value = '';
    dom.qImage.value = '';
    dom.qImageCredit.value = '';
    updateImagePreview();
    setFormMode();
  }

  /** Thumbnail of the image path; hidden while the path is empty or invalid (or fails to load). */
  function updateImagePreview() {
    const path = dom.qImage.value.trim();
    if (path && IMAGE_PATTERN.test(path)) {
      dom.qImagePreview.src = path;
      dom.qImagePreview.hidden = false;
    } else {
      hideImagePreview();
    }
  }

  function hideImagePreview() {
    dom.qImagePreview.hidden = true;
    dom.qImagePreview.removeAttribute('src');
  }

  function focusQuestionForm() {
    dom.qForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    dom.qText.focus({ preventScroll: true });
  }

  function startEdit(q) {
    clearMessage(dom.questionsMsg);
    state.editing = q;
    dom.qCategory.value = String(q.category_id);
    dom.qPoints.value = String(q.points);
    dom.qText.value = q.question;
    dom.qAnswer.value = q.answer;
    dom.qTextAr.value = q.question_ar || '';
    dom.qAnswerAr.value = q.answer_ar || '';
    dom.qImage.value = q.image || '';
    dom.qImageCredit.value = q.image_credit || '';
    updateImagePreview();
    setFormMode();
    renderQuestions();
    focusQuestionForm();
  }

  function cancelEdit() {
    clearMessage(dom.questionsMsg);
    resetQuestionForm();
    renderQuestions();
  }

  function validateQuestionForm() {
    const errors = [];
    const categoryId = Number(dom.qCategory.value);
    const points = Number(dom.qPoints.value);
    if (!categoryId) errors.push('Choose a category.');
    if (!points) errors.push(state.points.length ? 'Choose a point value.' : 'Add a point value first.');
    if (!dom.qText.value.trim()) errors.push('Question is required.');
    if (!dom.qAnswer.value.trim()) errors.push('Answer is required.');
    if (!dom.qTextAr.value.trim() !== !dom.qAnswerAr.value.trim()) {
      errors.push('Fill in both the Arabic question and the Arabic answer, or leave both empty.');
    }
    const image = dom.qImage.value.trim();
    if (image && (image.length > 255 || !IMAGE_PATTERN.test(image))) {
      errors.push('Image path must look like img/questions/flag-japan.svg (lowercase letters, digits and hyphens; .svg, .jpg, .jpeg, .png or .webp), or be empty.');
    }
    const imageCredit = dom.qImageCredit.value.trim();
    if (imageCredit.length > 255) errors.push('Image credit must be at most 255 characters.');
    return {
      errors: errors,
      body: {
        category_id: categoryId,
        points: points,
        question: dom.qText.value.trim(),
        answer: dom.qAnswer.value.trim(),
        question_ar: dom.qTextAr.value.trim(),
        answer_ar: dom.qAnswerAr.value.trim(),
        image: image, // '' = no picture
        image_credit: imageCredit, // '' = no caption
      },
    };
  }

  function onQuestionSubmit(event) {
    event.preventDefault();
    clearMessage(dom.questionsMsg);
    const form = validateQuestionForm();
    if (form.errors.length) {
      showError(dom.questionsMsg, form.errors.join('\n'));
      return;
    }
    const editing = state.editing;
    const category = findCategory(form.body.category_id);
    const where = (category ? category.name : 'category') + ' - ' + form.body.points;
    runAction(dom.questionsMsg, [dom.qSave, dom.qCancel], async () => {
      if (editing) {
        await api('questions.php?id=' + encodeURIComponent(editing.id), 'PUT', form.body);
      } else {
        await api('questions.php', 'POST', form.body);
      }
      resetQuestionForm();
      await refreshData();
      showSuccess(dom.questionsMsg, (editing ? 'Question updated (' : 'Question added (') + where + ').');
    });
  }

  function deleteQuestion(q) {
    const prompt = 'Delete this ' + q.points + ' question from "' + q.category_name + '"?\n\n' + shortText(q.question);
    if (!window.confirm(prompt)) return;
    runAction(dom.questionsMsg, [], async () => {
      await api('questions.php?id=' + encodeURIComponent(q.id), 'DELETE');
      if (state.editing && state.editing.id === q.id) resetQuestionForm();
      await refreshData();
      showSuccess(dom.questionsMsg, 'Question deleted (' + q.category_name + ' - ' + q.points + ').');
    });
  }

  function onFilterChange() {
    renderQuestions();
    // In add mode, preselect the filtered category in the form for faster entry.
    if (!state.editing && dom.qFilter.value) {
      dom.qCategory.value = dom.qFilter.value;
    }
  }

  // ---------- Startup ----------

  function bindEvents() {
    dom.settingsForm.addEventListener('submit', onSettingsSubmit);
    dom.pointsForm.addEventListener('submit', onPointSubmit);
    dom.categoryForm.addEventListener('submit', onCategorySubmit);
    dom.qForm.addEventListener('submit', onQuestionSubmit);
    dom.qCancel.addEventListener('click', cancelEdit);
    dom.qImage.addEventListener('input', updateImagePreview);
    dom.qImagePreview.addEventListener('error', hideImagePreview);
    dom.qFilter.addEventListener('change', onFilterChange);
    dom.authRetry.addEventListener('click', onAuthRetry);
  }

  async function loadData() {
    try {
      await refreshData();
    } catch (err) {
      showError(dom.globalMsg, 'Could not load admin data: ' + errorText(err));
    }
  }

  async function init() {
    bindEvents();
    setFormMode();
    renderAll();
    // Log in first: nothing (questions and answers included) is loaded until it succeeds.
    if (await checkAuth()) {
      loadSettings();
      await loadData();
    }
  }

  init();
})();
