// BrainRush admin page: settings, point values, categories, questions and coverage grid.
// All API/user text is rendered with textContent / DOM APIs (never innerHTML).
'use strict';

(function () {
  const API_BASE = 'api/';
  const SLOT_FILLED = String.fromCharCode(0x2713); // check mark
  const SLOT_EMPTY = String.fromCharCode(0x2013);  // en dash

  const state = {
    settings: null,    // { categories_per_game, timer_seconds }
    points: [],        // [{ id, points, question_count }] ascending
    categories: [],    // [{ id, name, question_count }] sorted by name
    questions: [],     // [{ id, category_id, category_name, points, question, answer }]
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
    qSave: byId('question-save'),
    qCancel: byId('question-cancel'),
    questionsMsg: byId('questions-msg'),
    qFilter: byId('question-filter'),
    questionsBody: byId('questions-body'),
    coverage: byId('coverage-table'),
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
  // Reading is always allowed; changes need the admin login (or this computer when
  // no login is configured). The browser shows its own login prompt on a 401 and
  // then re-sends the login with every later API request.

  function isAuthError(err) {
    return err instanceof ApiError && (err.status === 401 || err.status === 403);
  }

  /** Show the login notice for a failed check or change; the page stays usable read-only. */
  function showAuthProblem(err) {
    let text;
    if (isAuthError(err) && err.status === 401) {
      text = errorText(err) + ' You can still browse the content. Click "Log in" (or save a change) to enter the admin user name and password.';
      dom.authRetry.textContent = 'Log in';
    } else if (isAuthError(err)) {
      text = errorText(err) + ' You can still browse the content.';
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
    } catch (err) {
      showAuthProblem(err);
    } finally {
      dom.authRetry.disabled = false;
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
    renderCoverage();
  }

  function findCategory(id) {
    return state.categories.find((c) => c.id === id) || null;
  }

  // ---------- Settings (US-18) ----------

  function fillSettings(settings) {
    state.settings = settings;
    dom.settingCategories.value = settings.categories_per_game === null ? '' : String(settings.categories_per_game);
    dom.settingTimer.value = settings.timer_seconds === null ? '' : String(settings.timer_seconds);
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
    const perGame = readIntField(dom.settingCategories, 'Categories per game');
    const timer = readIntField(dom.settingTimer, 'Timer');
    const errors = [perGame.error, timer.error].filter(Boolean);
    if (errors.length) {
      showError(dom.settingsMsg, errors.join('\n'));
      return;
    }
    const submit = dom.settingsForm.querySelector('button[type="submit"]');
    runAction(dom.settingsMsg, [submit], async () => {
      const saved = await api('settings.php', 'PUT', {
        categories_per_game: perGame.value,
        timer_seconds: timer.value,
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
      dom.pointsList.appendChild(h('li', {}, [
        h('span', { className: 'point-label', text: String(p.points) }),
        h('span', { className: 'item-meta', text: plural(p.question_count, 'question') }),
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
      showSuccess(dom.pointsMsg, 'Point value ' + parsed.value + ' added. Categories need a ' + parsed.value + ' question to stay playable.');
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

  function isPlayable(category) {
    return state.points.length > 0 && category.question_count >= state.points.length;
  }

  function renderCategorySummary() {
    const total = state.categories.length;
    const playable = state.categories.filter(isPlayable).length;
    let text = playable + ' of ' + plural(total, 'category', 'categories') +
      (total === 1 ? ' is' : ' are') + ' playable (a question for every point value).';
    if (state.settings && state.settings.categories_per_game !== null) {
      text += ' A game needs ' + state.settings.categories_per_game + '.';
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

  function categoryCells(c) {
    const total = state.points.length;
    const missing = Math.max(total - c.question_count, 0);
    const status = isPlayable(c)
      ? h('span', { className: 'badge badge-ok', text: 'Playable' })
      : h('span', { className: 'badge badge-missing', text: missing + ' missing' });
    return [
      h('td', { className: 'num', text: c.question_count + ' / ' + total }),
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

  function renderQuestionSelects() {
    fillCategoryOptions(dom.qFilter, 'All categories');
    fillCategoryOptions(dom.qCategory, 'Choose a category');
    renderPointOptions();
  }

  /** Point values of a category that have no question yet (the edited question's own slot counts as free). */
  function freeSlots(categoryId) {
    const taken = {};
    state.questions.forEach((q) => {
      if (q.category_id === categoryId) taken[q.points] = true;
    });
    if (state.editing && state.editing.category_id === categoryId) delete taken[state.editing.points];
    return state.points.map((p) => p.points).filter((p) => !taken[p]);
  }

  /** Rebuild the points dropdown for the selected category; keeps `preferred` (or the current value) if still free. */
  function renderPointOptions(preferred) {
    const categoryId = Number(dom.qCategory.value);
    const wanted = Number(preferred !== undefined ? preferred : dom.qPoints.value);
    clear(dom.qPoints);
    if (!categoryId) {
      dom.qPoints.appendChild(h('option', { value: '', text: 'Choose a category first' }));
      dom.qPoints.disabled = true;
      return;
    }
    const free = freeSlots(categoryId);
    if (!free.length) {
      dom.qPoints.appendChild(h('option', { value: '', text: 'No free slots - category is full' }));
      dom.qPoints.disabled = true;
      return;
    }
    dom.qPoints.disabled = false;
    free.forEach((p) => {
      dom.qPoints.appendChild(h('option', { value: String(p), text: String(p) }));
    });
    dom.qPoints.value = String(free.indexOf(wanted) !== -1 ? wanted : free[0]);
  }

  function renderQuestions() {
    const filterId = Number(dom.qFilter.value);
    const rows = filterId ? state.questions.filter((q) => q.category_id === filterId) : state.questions;
    clear(dom.questionsBody);
    if (!rows.length) {
      dom.questionsBody.appendChild(h('tr', {}, [
        h('td', { className: 'empty-row', colSpan: 5, text: 'No questions yet.' }),
      ]));
      return;
    }
    rows.forEach((q) => {
      const isEditing = state.editing !== null && state.editing.id === q.id;
      const label = q.category_name + ' ' + q.points;
      dom.questionsBody.appendChild(h('tr', { className: isEditing ? 'is-editing' : '' }, [
        h('td', { className: 'name-cell', text: q.category_name }),
        h('td', { className: 'num', text: String(q.points) }),
        h('td', { className: 'text-cell', text: q.question }),
        h('td', { className: 'text-cell', text: q.answer }),
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
    setFormMode();
  }

  function focusQuestionForm() {
    dom.qForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    dom.qText.focus({ preventScroll: true });
  }

  function startEdit(q) {
    clearMessage(dom.questionsMsg);
    state.editing = q;
    dom.qCategory.value = String(q.category_id);
    renderPointOptions(q.points);
    dom.qText.value = q.question;
    dom.qAnswer.value = q.answer;
    setFormMode();
    renderQuestions();
    focusQuestionForm();
  }

  /** Prefill the add form for an empty coverage slot. */
  function startAddFor(categoryId, points) {
    clearMessage(dom.questionsMsg);
    if (state.editing) resetQuestionForm();
    dom.qCategory.value = String(categoryId);
    renderPointOptions(points);
    renderQuestions();
    focusQuestionForm();
  }

  function cancelEdit() {
    clearMessage(dom.questionsMsg);
    resetQuestionForm();
    renderPointOptions();
    renderQuestions();
  }

  function validateQuestionForm() {
    const errors = [];
    const categoryId = Number(dom.qCategory.value);
    const points = Number(dom.qPoints.value);
    if (!categoryId) {
      errors.push('Choose a category.');
    } else if (!points) {
      errors.push('This category has no free point slot. Add a point value or edit an existing question.');
    }
    if (!dom.qText.value.trim()) errors.push('Question is required.');
    if (!dom.qAnswer.value.trim()) errors.push('Answer is required.');
    return {
      errors: errors,
      body: {
        category_id: categoryId,
        points: points,
        question: dom.qText.value.trim(),
        answer: dom.qAnswer.value.trim(),
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
    if (!window.confirm('Delete the ' + q.points + ' question of "' + q.category_name + '"?')) return;
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
      renderPointOptions();
    }
  }

  // ---------- Coverage grid (US-22) ----------

  function renderCoverage() {
    const table = dom.coverage;
    clear(table);
    if (!state.categories.length || !state.points.length) {
      table.appendChild(h('caption', { className: 'hint', text: 'Add categories and point values to see coverage.' }));
      return;
    }
    const filled = {};
    state.questions.forEach((q) => { filled[q.category_id + ':' + q.points] = q; });

    const head = h('tr', {}, [h('th', { scope: 'col', className: 'cat-name', text: 'Category' })]);
    state.points.forEach((p) => {
      head.appendChild(h('th', { scope: 'col', className: 'point-head', text: String(p.points) }));
    });
    head.appendChild(h('th', { scope: 'col', text: 'Filled' }));
    table.appendChild(h('thead', {}, [head]));

    const body = h('tbody');
    state.categories.forEach((c) => {
      const row = h('tr', {}, [h('th', { scope: 'row', className: 'cat-name', text: c.name, title: c.name })]);
      let count = 0;
      state.points.forEach((p) => {
        const q = filled[c.id + ':' + p.points] || null;
        if (q) count += 1;
        const label = c.name + ' - ' + p.points + ': ' + (q ? 'filled (click to edit)' : 'empty (click to add)');
        row.appendChild(h('td', {}, [h('button', {
          type: 'button',
          className: 'slot ' + (q ? 'slot-filled' : 'slot-empty'),
          text: q ? SLOT_FILLED : SLOT_EMPTY,
          title: label,
          'aria-label': label,
          onclick: () => (q ? startEdit(q) : startAddFor(c.id, p.points)),
        })]));
      });
      row.appendChild(h('td', { className: 'total', text: count + ' / ' + state.points.length }));
      body.appendChild(row);
    });
    table.appendChild(body);
  }

  // ---------- Startup ----------

  function bindEvents() {
    dom.settingsForm.addEventListener('submit', onSettingsSubmit);
    dom.pointsForm.addEventListener('submit', onPointSubmit);
    dom.categoryForm.addEventListener('submit', onCategorySubmit);
    dom.qForm.addEventListener('submit', onQuestionSubmit);
    dom.qCancel.addEventListener('click', cancelEdit);
    dom.qCategory.addEventListener('change', () => renderPointOptions());
    dom.qFilter.addEventListener('change', onFilterChange);
    dom.authRetry.addEventListener('click', checkAuth);
  }

  async function init() {
    bindEvents();
    setFormMode();
    renderAll();
    checkAuth(); // up front, so a protected site asks for the login before any edit
    loadSettings();
    try {
      await refreshData();
    } catch (err) {
      showError(dom.globalMsg, 'Could not load admin data: ' + errorText(err));
    }
  }

  init();
})();
