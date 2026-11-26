// Mokh Rush game page: setup, dynamic board, question + timer, scoring, results
// and localStorage persistence (survives a page refresh).
// The page only uses public endpoints (GETs, the board POST, the game log, reports and question
// stats), so it works on the hosted site without the admin login.
// All API/user text is rendered with textContent / DOM APIs (never innerHTML).
// Interface language (US-49): every text comes from js/i18n.js (loaded first): t(key, params) and
// tn(key, count) give the English or Arabic text; iso() and ltr() keep names and signed numbers in
// their own direction inside Arabic text (both return the text unchanged in English).
'use strict';

(function () {
  const i18n = window.BrainRushI18n;
  const t = i18n.t;
  const tn = i18n.n;
  const iso = i18n.iso;
  const ltr = i18n.ltr;
  const PAGE_TITLE = document.title; // the page's own English tab title (D-64: Arabic shows app.name)
  const API_BASE = 'api/';
  const STORAGE_KEY = 'brainrush.game';
  // v5 adds the game control (US-52: control 'host' | 'phone', with the phone room); v4 (final round,
  // US-44), v3 (helpers, US-32), v2 (used cells + open question) and v1 (Sprint 3) saves are migrated
  const STORAGE_VERSION = 5;
  // Ids of the questions opened in this browser, oldest first; new boards avoid them.
  const SEEN_KEY = 'brainrush.seenQuestions';
  const SEEN_MAX = 5000; // BOARD_MAX_SEEN in api/questions.php
  const NAME_MAX = 30;
  const SURPRISE = 0;       // "Surprise me!" tile in the selected list (real category ids are positive)
  const SURPRISE_ALONE = 3; // random categories when "Surprise me!" is the only tick
  // Kilo Meshakkal (US-53 / D-53): a built-in category with no DB row. MIX and MIX_NAME must match
  // MIX_ID and MIX_NAME in api/db.php (the server's single copy; the game cannot share a PHP constant).
  // Each box of its column holds a question from any category; open boxes show an emoji instead of
  // their value, and the values run in a random order down the column.
  const MIX = -1;
  const MIX_NAME = 'Kilo Meshakkal';
  const MIX_FACES = [
    0x1f3b2, 0x1f525, 0x1f440, 0x1f92f, 0x1f37f, 0x1f480, // die, fire, eyes, exploding head, popcorn, skull
    0x1f62d, 0x2728, 0x1f349, 0x1f9c3, 0x1f3af, 0x1f381,  // crying, sparkles, melon, juice box, target, gift
  ].map((code) => String.fromCodePoint(code));
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
  // icon-sized text on the scoring row and the scoreboard; the name (t('helper.<key>')) is used in
  // confirms and tooltips. The chips and the A/B/C letters are symbols and stay the same in Arabic.
  const HELPER_KEYS = ['choices', 'swap', 'skip'];
  const HELPERS = {
    choices: { chip: 'ABC' },
    swap: { chip: String.fromCharCode(0x21c4) },          // left-right arrows
    skip: { chip: String.fromCharCode(0x00bd) },          // one half
  };
  const helperName = (key) => t('helper.' + key);
  const CHOICE_LETTERS = ['A', 'B', 'C'];
  const CHOICES_SHORT_CHARS = 24; // text question: 3 choices this short sit side by side
  const WRONG_FIELDS = ['wrong_1', 'wrong_2', 'wrong_1_ar', 'wrong_2_ar'];

  // Integration Quiz (integration-quiz.html, <body data-quiz="integration">): the Streak Challenge
  // with its own questions and leaderboard (api/integration-quiz.php). Its run has its own saved key;
  // its question ids are not the public bank's, so it skips the played list, the question stats and
  // Report; it never reads or clears the board game's saved state. The page has only the run's markup.
  const INTEGRATION = document.body.dataset.quiz === 'integration';

  // Streak Challenge (US-33, US-34, D-37): saved under its own key, so the board game's saved
  // state and its validation stay as they are.
  const STREAK_KEY = INTEGRATION ? 'brainrush.integrationQuiz' : 'brainrush.streak';
  const STREAK_API = INTEGRATION ? 'integration-quiz.php' : 'streaks.php'; // the leaderboard
  const STREAK_START = INTEGRATION ? 'iq.start' : 'streak.start';         // the start button's text
  const STREAK_VERSION = 1;
  const STREAK_REFILL_AT = 5;   // ask for the next batch once fewer questions are queued
  const STREAK_MAX_QUEUE = 100; // a saved queue is never longer (batches are 20)
  const STREAK_TIME_UP = -1;    // `picked` when the time ran out
  // Earned second chances (US-57, D-69): a run starts with none; 5 correct answers earn the 1st, then
  // 10 more the 2nd. Using one restarts the counter at 0. Streak Challenge only.
  const CHANCE_FIRST_AT = 5;    // correct answers for the 1st chance
  const CHANCE_NEXT_AFTER = 10; // correct answers for the 2nd, counted from the 1st (or from its use)
  const CHANCE_MAX = 2;         // chances earned per run at most
  const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/; // "YYYY-MM-DD" from the API
  const LB_PERIODS = ['week', 'all']; // leaderboard tabs (US-45): GET streaks.php?period=
  // The leaderboards the leaderboard screen shows (US-34, US-60): the API and the texts of each.
  // title null = the page's own heading (the Streak's, or the Integration Quiz's).
  const LB_BOARDS = {
    streak: {
      title: null, headline: 'lb.headline', none: 'lb.noStreak', saving: 'lb.saving', saveFailed: 'lb.saveFailed',
      onlyOne: 'lb.onlyOne', empty: 'lb.empty', emptyWeek: 'lb.emptyWeek', topAll: 'lb.topAll', topWeek: 'lb.topWeek',
      count: 'lb.questions',
    },
    speed: {
      title: 'speed.leaderboard', headline: 'speed.lbHeadline', none: 'speed.noScore', saving: 'speed.lbSaving',
      saveFailed: 'speed.lbSaveFailed', onlyOne: 'speed.lbOnlyOne', empty: 'speed.lbEmpty', emptyWeek: 'speed.lbEmptyWeek',
      topAll: 'speed.lbTopAll', topWeek: 'speed.lbTopWeek', count: 'speed.correctCount',
    },
  };
  const REPORT_NOTE_MAX = 200; // REPORT_NOTE_MAX in api/reports.php (US-42, D-45)
  // Question difficulty stats (US-47, D-55): what a closed board question or an answered Streak
  // question sends to api/question-stats.php (STAT_OUTCOMES there), once per question per game.
  const STAT = { correct: 'correct', wrong: 'wrong', nobody: 'nobody', timeout: 'timeout' };

  // Daily Challenge (US-43, D-46): the server sets the day (midnight UTC), the number of questions
  // and #N; the browser only plays them. The run and today's result are saved under their own key,
  // so the board game's saved state (D-28) and the Streak run stay as they are.
  const DAILY_KEY = 'brainrush.daily';
  const DAILY_VERSION = 1;
  const DAILY_MAX_QUESTIONS = 20;    // a set from the server or the browser is never longer
  const DAY_MS = 24 * 60 * 60 * 1000; // the countdown to the next challenge is never longer
  const SQUARE_RIGHT = String.fromCodePoint(0x1f7e9); // green square, in the shared result
  const SQUARE_WRONG = String.fromCodePoint(0x1f7e5); // red square

  // Daily Crossword (US-58, D-72): the server builds the day's grid; progress and the finished lock
  // are saved under their own key on this device only.
  const CROSSWORD_KEY = 'brainrush.crossword';
  const CROSSWORD_VERSION = 1;
  const CW_MAX_SIZE = 13;   // CROSSWORD_MAX_SIZE in api/crossword.php
  const CW_MAX_WORDS = 20;  // a grid is never longer (the server's maximum is CROSSWORD_MAX_WORDS, 10)
  const CW_FREE_HINTS = 3; // D-72 w: Reveal letter can be used 3 times per crossword, then the button hides
  const CW_WORD_PATTERN = /^[A-Z]{3,10}$/; // CROSSWORD_WORD_PATTERN in api/crossword.php: keep the two the same (BUG-58-02)
  const CW_TICK_MS = 250;   // the running time and the countdown

  // Speed Round (US-59, D-73): one clock for the whole run; fast right answers add time, a wrong one
  // takes some off; the score is the number of right answers. The run and this device's personal best
  // are saved under SPEED_KEY (no server table). All the rules' numbers are here.
  // PLAYTEST AND TUNE: the owner may adjust these after the local test (only answers of about 3 s or
  // less gain more time than they use, so first runs may be short).
  const SPEED_START_S = 45;        // the clock at the start of a run
  const SPEED_CAP_S = 60;          // the clock never holds more
  const SPEED_TIERS = [            // a right answer within maxS seconds adds addS seconds (first match)
    { maxS: 2, addS: 5, label: 'speed.lightning' },
    { maxS: 4, addS: 3, label: 'speed.quick' },
    { maxS: 6, addS: 2, label: 'speed.nice' },
    { maxS: Infinity, addS: 1, label: 'speed.correct' },
  ];
  const SPEED_WRONG_S = 3;         // a wrong answer takes this off the clock
  const SPEED_LOW_S = 10;          // the clock turns red below this
  const SPEED_FEEDBACK_MS = 800;   // the clock is frozen while the answer's feedback shows
  const SPEED_COUNTDOWN_S = 3;     // "3, 2, 1" before a run
  // Race-start beeps on the countdown (owner request 2026-11-25): a short low beep on 3, 2 and 1,
  // then a long high one as the run starts. Made with Web Audio, no sound file.
  const SPEED_BEEP_HZ = 440;
  const SPEED_BEEP_S = 0.18;
  const SPEED_GO_HZ = 880;
  const SPEED_GO_S = 0.6;
  const SPEED_BEEP_GAIN = 0.15;    // quiet: the page has no volume control
  const SPEED_SAVE_MS = 1000;      // the time left is saved this often while the clock runs (BUG-59-03)
  const SPEED_IMAGE_WAIT_MS = 5000; // a picture that has not loaded by then: the question starts anyway
  const SPEED_KEY = 'brainrush.speed';
  const SPEED_VERSION = 2;         // 2 (US-60): the run and its result carry the challenger name
  const SPEED_MAX_TIMES = 5000;    // a saved run never holds more answer times
  const SPEED_API = 'speed-scores.php'; // the shared Speed leaderboard (US-60, D-76)
  // The result's leaderboard save (US-60): 'none' (score 0, or a result from before US-60), 'pending'
  // (not saved yet: sent now, and again after a reload), 'saved', or 'dropped' (left unsaved after a confirm).
  const SPEED_SAVES = ['none', 'pending', 'saved', 'dropped'];
  // The name last used in a Streak or Speed run on this device: the Speed name step is prefilled with it (US-60).
  const CHALLENGER_KEY = 'brainrush.challengerName';
  // The solo run started last on this device ({mode, at}): with a Streak, Daily and Speed run all saved,
  // a reload brings back only that one (the others stay saved).
  const LAST_SOLO_KEY = 'brainrush.lastSolo';

  // Final round (US-44, D-48): offer -> wagers (one contestant at a time) -> question -> done (Results).
  const FINAL_STAGES = ['offer', 'wager', 'question', 'done'];
  const WAGER_PATTERN = /^\d{1,9}$/; // a whole number typed by a contestant
  // D-50 (amended): players see the round as "Golden Goal ⚽" and the wager as their "bet" (code keeps
  // "final"/"wager"); its name is t('final.name'). The ball is decorative: shown in an aria-hidden
  // span, never in labels.
  const GOAL_BALL = String.fromCodePoint(0x26bd); // soccer ball

  // Read aloud (US-48): the "Read questions automatically" choice of this device ('1' = on).
  const READ_ALOUD_KEY = 'brainrush.readAloud';
  const SPEAKER = String.fromCodePoint(0x1f50a); // speaker with sound waves
  const STOP_SIGN = String.fromCharCode(0x25a0); // black square: stop reading

  // Players or teams: the limit, and the mode's key in the string tables ('entry.add.players', ...).
  const MODES = {
    players: { limit: 6, key: 'players' },
    teams: { limit: 4, key: 'teams' },
    tournament: { limit: 8, key: 'tournament' }, // US-61: entries of a knockout tournament (min TOURNAMENT_MIN)
  };

  // Six distinct contestant colors; `ink` is the readable text color on that background (dark navy on
  // all six, so every card meets WCAG AA 4.5:1, FU-75); `name` is the key of the color's name
  // (t('color.red')).
  // Grey (unanswered cell) and gold (UI accent) are deliberately not in the palette.
  const PALETTE = [
    { value: '#e5484d', name: 'color.red', ink: '#0b1026' },
    { value: '#3e7bfa', name: 'color.blue', ink: '#0b1026' },
    { value: '#2fb36d', name: 'color.green', ink: '#0b1026' },
    { value: '#f08c2e', name: 'color.orange', ink: '#0b1026' },
    { value: '#9b5de5', name: 'color.purple', ink: '#0b1026' },
    { value: '#22b8cf', name: 'color.cyan', ink: '#0b1026' },
  ];
  // US-61 (D-77 j): 2 more colours, offered in Tournament mode only (8 entries). Not grey or gold, clearly
  // different from the six; the #0b1026 ink is 6.7:1 on pink and 10.5:1 on lime (WCAG AA).
  const TOURNAMENT_COLORS = [
    { value: '#f06bb5', name: 'color.pink', ink: '#0b1026' },
    { value: '#a3d13c', name: 'color.lime', ink: '#0b1026' },
  ];
  const FULL_PALETTE = PALETTE.concat(TOURNAMENT_COLORS);

  const SCREENS = ['setup', 'board', 'question', 'results', 'final']; // a saved board game may be on these
  // US-61: the tournament's own screens (bracket, match result, tournament results)
  const TOURNAMENT_VIEWS = ['bracket', 'match', 'tresults'];
  const ALL_SCREENS = SCREENS.concat(['leaderboard', 'daily', 'crossword', 'speed'], TOURNAMENT_VIEWS);

  // Tournament (US-61, D-77). The running tournament is saved under TOURNAMENT_KEY together with the
  // screen and the match being played (its board game), in one write: so finishing a match moves the
  // bracket on and drops the match board at once, and a reload can neither replay nor lose a match.
  const TOURNAMENT_KEY = 'brainrush.tournament';
  const TOURNAMENT_VERSION = 1;
  const TOURNAMENT_MIN = 3;
  const TOURNAMENT_ROWS = 3; // D-77 e/aa: with no Admin tournament values, a match board keeps the lowest 3 enabled
  const TOURNAMENT_PICK_MAX = 3; // D-77 ab: each match board has 1 to 3 categories, chosen at Start match
  // Saved screens of a running tournament: the bracket, the match on the board / question / Golden Goal
  // screens, the match result and the tournament results.
  const TOURNAMENT_SCREENS = ['bracket', 'board', 'question', 'final', 'match', 'tresults'];
  // D-77 g: the first-round matches (0-based) that hold the byes, in this order, per bracket size.
  const BYE_ORDER = { 4: [0], 8: [0, 3, 1] };
  const MATCH_WAYS = ['score', 'goal', 'coin', 'bye']; // how a match was decided
  // Mokh Bot (US-62, D-78): one bot fills one of the byes; its match is turn-based.
  // US-63 (D-79): its accuracy is the Admin's bot_accuracy, right tickets out of 10 (a missing row = 3).
  const BOT_TICKETS = 10;           // the faces of the bot's dice
  const BOT_TICKETS_DEFAULT = 3;    // no setting (or an older save): 3 right tickets, 30%
  const BOT_PICK_MS = 1200;         // the bot's turn on the board: it picks a cell after this
  const BOT_HIGHLIGHT_MS = 700;     // its picked cell is highlighted this long before it opens
  const BOT_THINK_MS = [3000, 6000]; // it answers after a random time in this range (before the timer ends)
  const BOT_MARK_MS = 1500;         // and is scored this long after its answer shows
  const COIN_SPIN_MS = 1600;        // the coin flip at the start of a bot match
  const COIN_HOLD_MS = 1400;        // the result stays this long, then the overlay fades out
  const ROBOT = String.fromCodePoint(0x1f916); // robot face, on the bot's side of the coin

  // Phone buzzer (US-52, D-80): Players and Teams games may be played with phones. The host's game
  // stays the source of truth; api/rooms.php keeps only what the phones may see (phonePayload()).
  const CONTROLS = ['host', 'phone'];
  const ROOMS_API = 'rooms.php';
  const ROOM_CODE_PATTERN = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/; // ROOM_CODE_ALPHABET in api/rooms.php
  const ROOM_TOKEN_PATTERN = /^[0-9a-f]{64}$/;
  const ROOM_PUSH_MS = 250;   // changes made close together go to the phones in one push
  const ROOM_LOBBY_MS = 2000; // the host's poll of who has joined
  const ROOM_RETRY_MS = 5000; // a failed push is tried again after this
  const PHONE_SCREENS = ['board', 'question', 'final', 'results'];
  // BUG-52-02: this page load's host session. Only the room's current session may change it, so two
  // tabs of one game never overwrite each other; the newest tab that loaded (or "Use this tab") wins.
  const HOST_SESSION = Array.from(window.crypto.getRandomValues(new Uint8Array(16)),
    (b) => b.toString(16).padStart(2, '0')).join('');

  // Central state. `setup` is the form being filled in (memory only);
  // `game` is the running game and is saved to localStorage on every change:
  //   { mode, contestants: [{id, name, color, score, helpers: {choices, swap, skip}}], timerSeconds, points,
  //     categories: [{id, name, nameAr, questions, hidden}] (hidden = unopened "Surprise me!" pick, shown as "?";
  //       nameAr = the Arabic name or null, missing in older saves; see localName());
  //       the Kilo Meshakkal column (id MIX, US-53) also has order (its values top to bottom, a shuffled
  //       copy of points) and faces (one emoji per box, same length); its questions have catName
  //       and catNameAr (the source category),
  //     used: { "<categoryId>:<points>": { owner: contestantId | null } },
  //     double?: "<categoryId>:<points>" (D-40: the hidden double-score cell, picked at Start),
  //     finalRound?: boolean (US-44: final_round_enabled when the game started; missing = off),
  //     final?: null | { stage, category?, question?, wagers?, marks?, answerShown?, lang? } (see below),
  //     statsSent?: [questionId] (US-47: questions whose outcome was sent; missing = a save from before
  //       US-47, which sends none),
  //     control?: 'host' | 'phone' (US-52: missing in tournament matches; saves before v5 become 'host'),
  //     room?: { code, hostToken } (Phone buzzer only: the room made at Start; the host token never
  //       leaves this browser except to api/rooms.php),
  //     current: null | { catId, points, marks: { "<contestantId>": "correct" | "wrong" }, answerShown,
  //                       lang, by?, choiceOrder?, swap?, timedOut? } }
  // timedOut (US-47, D-55 e): the open question's timer reached 0 at least once (a Reset or a
  // refresh doesn't undo it; a Swap clears it, the new question has its own timer).
  // final (US-44): stage 'offer' (End Game offered the round) has no other field. From 'wager' on:
  // category = { id, name, nameAr } and question (isValidQuestion) from questions.php?random=1; wagers =
  // { "<contestantId>": points } entered so far, in setup order; marks as on a board question but
  // any number may be Correct; answerShown and lang as on a board question. 'question' = the
  // question is open on the question screen; 'done' = scored, Results shown.
  // helpers: true = still available (US-32). On the open question: by = id of the contestant who
  // used a helper on it (only they can be scored then); choiceOrder = order of the 3 choices on
  // screen, a permutation of [0, 1, 2] where 0 is the answer; swap = { catId, catName, catNameAr,
  // points, question }, the question that replaced the cell's one. The cell still closes on Back to Board.
  const state = {
    screen: 'setup',
    setup: null,
    game: null,
  };

  // Countdown of the open question (memory only; restarts at full length after a refresh, D-04).
  // onExpire runs when it reaches 0 (the Streak Challenge ends the run then; a board question notes
  // it for its stats outcome, US-47).
  // lowMs: the clock turns red at or below it (null = the last third; the Speed Round passes 10 s).
  const timer = { totalMs: 0, remainingMs: 0, endAt: 0, running: false, handle: null, onExpire: null, lowMs: null };
  let scoringRows = []; // DOM references of the question screen's scoring rows
  let swapping = null; // id of the contestant whose Swap request is running (memory only)

  // Streak Challenge run (US-33), saved under STREAK_KEY on every change; null when none:
  //   { version, name, color, timerSeconds, count, queue: [question], usedIds: [id],
  //     current: null | { q, lang, deadline, picked, leftMs? }, over, statsSent? }
  // statsSent (US-47): ids whose outcome was sent, as in the board game (missing = sends none).
  // A question is the API's { id, category_name, category_name_ar, points, question, question_ar, image,
  // image_credit, choices: [{text, text_ar}] x3, correct } (choices already cut by the server).
  // deadline = Date.now() ms when time is up, so a refresh keeps the remaining time; picked =
  // null (open), the tapped choice or STREAK_TIME_UP; leftMs = time left when it was answered.
  // count = right answers; over = the run ended (wrong answer, time's up or End run).
  let streak = null;
  let streakRequest = null;      // { run, promise } of the batch request in flight (memory only)
  let finishing = false;         // the finished run is being saved
  // CR hearts (US-57): the heart animation of the live event just played ({kind: 'gain'|'lose', left}),
  // read once by the next renderChanceCounter, so a refresh or a re-render never plays it
  let chanceFx = null;
  let lastStreakProfile = null;  // name, color and timer of the last run, for Play again
  let leaderboardResult = null;  // the run shown on the leaderboard screen (null = opened from setup)
  let leaderboardLoads = 0;      // drops leaderboard responses that arrive after a newer request
  let lbPeriod = 'all';          // the leaderboard tab shown (US-45), memory only
  let lastLeaderboard = null;    // the rows on screen, drawn again after a language switch (US-49)
  let lbBoard = 'streak';        // the leaderboard on the screen: a key of LB_BOARDS (US-60), memory only

  // Daily Challenge (US-43), saved under DAILY_KEY on every change; null when none:
  //   { version, date, number, timerSeconds, nextAt, questions: [question], results: [boolean],
  //     current: null | { index, lang, deadline, picked, leftMs? }, done, onResult }
  // date = the challenge's day (UTC, from the server) and number = its #N. nextAt = Date.now() ms
  // when the next challenge starts (from the server's seconds_to_next). questions have the Streak
  // shape (choices already cut and ordered by the server). results = right (true) or wrong (false)
  // per answered question. current is the open question, as in the Streak run. done = finished:
  // the device keeps today's result and shows it again instead of a new run (device-only, as
  // D-37 g). onResult = the result screen is open, so a refresh shows it again.
  let daily = null;
  let dailyTicker = null;        // interval of the countdown on the result screen

  // Daily Crossword (US-58), saved under CROSSWORD_KEY on every change; null when none:
  //   { version, date, number, nextAt, width, height, words: [{n, row, col, dir, length, answer, question,
  //     question_ar, category_name, category_name_ar}], cells: {"row,col": letter}, revealed: ["row,col"],
  //     wrong: ["row,col"], hints, startedAt, solvedMs, done, logged, onScreen, cur: {row, col, dir} }
  // cells = the letters typed or revealed; revealed = locked cells (one hint each); wrong = cells marked
  // by Check word until they change. startedAt = Date.now() ms of the first letter (null before), the
  // timer is wall-clock from it (D-72 k); solvedMs = the time when done. logged = the game log line was
  // sent (once per day). onScreen = the crossword screen is open, so a reload shows it again.
  let crossword = null;
  let cwCells = {};      // crosswordCells(crossword), memory only
  let cwLang = {};       // word index -> 'en' | 'ar': the clue toggles, memory only (D-72 g)
  let cwTicker = null;   // interval of the running time or the countdown
  let cwTyping = false;  // the hidden field has the focus (the player types in the grid)

  // Speed Round (US-59), saved under SPEED_KEY on every change; null until first used:
  //   { version, best, bestAt, run, last, onResult }
  // best = this device's highest score (0 = none yet), bestAt = Date.now() ms when it was set (or null).
  // run = null | { name, score, answered, times: [ms], queue: [question], usedIds: [id], statsSent: [id],
  //   lang, leftMs, deadline, started, current: null | { q, lang, picked, elapsedMs } }
  // name = the challenger name of the leaderboard (US-60), null until the name step's Start.
  // score = right answers; times = how long each right answer took (ms, the time the question was
  // visible, pauses left out). leftMs = the clock while it is stopped; deadline = Date.now() ms when the
  // clock reaches 0 while it runs, else null (kept as a record; a reload uses leftMs, saved every second
  // while it runs, BUG-59-03). lang = the language the player last chose ('en' | 'ar' | null = Arabic first). started = the
  // countdown is over. picked = null (open), the tapped choice or STREAK_TIME_UP; elapsedMs = the time
  // the question has been visible so far. last = the result on show ({ score, prevBest, newBest,
  // name, save, saved }: save is one of SPEED_SAVES, saved = the server's { rank, best, week_rank,
  // week_best } once saved, else null); onResult = the result screen is open, so a reload shows it again.
  let speed = null;
  let speedSaving = false;       // the result's leaderboard POST is in flight (memory only)
  let speedSaveError = null;     // why the last POST failed, shown with Try again (memory only: a reload sends again)
  // While the clock runs, leftMs and the open question's elapsedMs are saved every SPEED_SAVE_MS, so a
  // page that closes with no pagehide (a crash) comes back with at most that much more time than it had.
  // Memory only: 'idle' | 'intro' | 'countdown' | 'loading' | 'wait' (the question waits to be visible)
  // | 'live' (the clock runs) | 'hold' (End run confirm) | 'feedback' | 'paused' | 'over'.
  // The clock only runs in 'live'.
  let speedPhase = 'idle';
  let speedShownAt = 0;          // now() when the open question became visible (or was resumed)
  let speedTicker = null;        // timeout of the countdown, the feedback or the time's-up pause
  let speedToken = 0;            // a picture load that belongs to an earlier question is ignored
  let speedPauseWanted = false;  // the tab was hidden during feedback or loading: pause at the next question
  let speedRequest = null;       // { run, promise } of the batch request in flight
  let speedSaver = null;         // interval that saves the time left while the clock runs (BUG-59-03)

  // Report form (US-42), memory only: { questionId, sending } while it is open, else null. It never
  // touches the saved game or run, the timer or the scores.
  let report = null;

  // Final round (US-44): the random question request in flight (memory only).
  let finalLoading = false;

  // Tournament (US-61, D-77): the running tournament, null when none. Saved with the screen and the
  // match board under TOURNAMENT_KEY on every change (saveState):
  //   { startedAt (Date.now() ms), entries: [{id, name, color}] (setup
  //     order), timerSeconds, helpersOff, rounds: [[match]] (first round first, each round half the one before),
  //     started (the first match has started: no more Shuffle), playing: null | [round, index] (the
  //     match on the board), last: null | [round, index] (the match result on show), finishedAt: null | ms }
  //   An entry with bot: true is Mokh Bot (US-62, D-78): at most one, id = humans + 1, in the second slot
  //   of one bye match (that match is then played, bye false). Its name is t('tournament.botName'),
  //   rewritten on a language switch (relabelBot). A match board with the bot has turn (the id of the
  //   contestant on turn), coinShown (the start flip was played) and optionally botTickets (US-63, D-79:
  //   the bot's right tickets out of 10, read when the match starts; missing = 3); its open question (or Golden Goal)
  //   has botRoll = { right, optionIndex, said? (its answer was shown) } when the bot answers it (optionIndex 1 or 2 = a stored wrong
  //   option, null = "I don't know").
  //   match: { a, b: entry id or null (not known yet), bye: true in a first-round match whose second
  //     slot is a bye (a goes through), winner: entry id or null, sa, sb: the scores of a played match
  //     (else null), way: null or one of MATCH_WAYS }
  let tourney = null;
  let matchLoading = false; // the match board request in flight (memory only)
  // D-77 ab: the categories popup of Start match, null when closed: { ref, selected: [id] (in the
  // order ticked; SURPRISE and MIX as on setup), playable: null (loading) | [{id, name, nameAr}] }.
  // lastPicks keeps the last match's ticks (memory only), so the next popup starts from them.
  let picker = null;
  let lastPicks = [];
  // Mokh Bot (US-62, D-78), memory only: the one pending bot action (cleared on every screen change),
  // the coin flip's timer, and the open question (board `current` or Golden Goal `final`) whose answer
  // the bot has already said.
  let botTimer = null;
  let coinTimer = null;
  let botSaid = null;
  let botThinking = null; // the open question the bot has started thinking about (BUG-62-03)

  // Phone buzzer (US-52), memory only: the push to the phones (one at a time; lastSent is the last
  // payload sent, so a change the phones cannot see sends nothing), the lobby poll and its answer
  // ({ version, mode, players: [{name, color, joined}] }), the panel's message (a function giving the
  // text, or null), a room renewal in flight and the code the QR picture was drawn for.
  const phone = {
    pushTimer: null, pushing: false, again: false, lastSent: null,
    lobbyTimer: null, lobby: null, shownJoined: null, message: null, renewing: null, qrCode: null,
    gen: 0, // bumped by stopPhone(): answers that belong to an earlier game are dropped
    ready: null,    // the claim of a restored room: pushes wait for it
    claiming: false, // that claim is in flight (the lobby's other_tab is not trusted yet)
    blocked: false, // BUG-52-02: another tab has taken over this game; this tab no longer saves or pushes
  };

  // Read aloud (US-48), memory only apart from the on-device choice: the browser's speech module
  // (null without speech synthesis), whether the open question is being read, and the choice.
  const speech = window.BrainRushSpeech && window.BrainRushSpeech.supported() ? window.BrainRushSpeech : null;
  let reading = false;
  let readAloud = false;

  let nextEntryKey = 1;

  const byId = (id) => document.getElementById(id);
  const dom = {
    screens: {
      setup: byId('screen-setup'),
      board: byId('screen-board'),
      question: byId('screen-question'),
      results: byId('screen-results'),
      leaderboard: byId('screen-leaderboard'),
      daily: byId('screen-daily'),
      crossword: byId('screen-crossword'),
      speed: byId('screen-speed'),
      final: byId('screen-final'),
      bracket: byId('screen-bracket'),   // US-61: tournament screens (stand-ins in the Integration Quiz)
      match: byId('screen-match'),
      tresults: byId('screen-tresults'),
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
    dailyOpenBtn: byId('daily-open-btn'),
    dailyOpenLabel: byId('daily-open-label'),
    crosswordOpenBtn: byId('crossword-open-btn'),
    crosswordOpenLabel: byId('crossword-open-label'),
    speedOpenBtn: byId('speed-open-btn'),     // US-59: only in index.html (stand-ins in the Integration Quiz)
    speedOpenLabel: byId('speed-open-label'),
    speedPair: byId('speed-pair'),            // the Speed Round button and its trophy, kept on one line
    speedOverlay: byId('speed-overlay'),
    speedIntro: byId('speed-intro'),          // US-60: the name step (a form), with the rules on the first run
    speedRules: byId('speed-rules'),
    speedRule2: byId('speed-rule2'),
    speedNameInput: byId('speed-name'),
    speedNameError: byId('speed-name-error'),
    speedCancel: byId('speed-cancel'),
    speedGo: byId('speed-go'),
    speedCount: byId('speed-count'),
    speedPaused: byId('speed-paused'),
    speedResume: byId('speed-resume'),
    speedDelta: byId('speed-delta'),
    speedTitle: byId('speed-title'),
    speedScore: byId('speed-score'),
    speedScoreLabel: byId('speed-score-label'),
    speedBest: byId('speed-best'),
    speedRank: byId('speed-rank'),            // US-60: "You are #2 this week and #7 of all time."
    speedSaveMsg: byId('speed-save-msg'),     // US-60: the save failure with Try again
    speedBoard: byId('speed-board'),
    speedAgain: byId('speed-again'),
    speedShare: byId('speed-share'),
    speedNewGame: byId('speed-new-game'),
    speedShareStatus: byId('speed-share-status'),
    speedMsg: byId('speed-msg'),
    loadMsg: byId('setup-load-msg'),
    newBanner: byId('new-banner'),
    modeInputs: Array.prototype.slice.call(document.querySelectorAll('input[name="mode"]')),
    entryList: byId('entry-list'),
    entryLimitMsg: byId('entry-limit-msg'),
    entryAdd: byId('entry-add'),
    entryMinError: byId('entry-min-error'), // US-61: "A tournament needs at least 3 contestants"
    bracketInfo: byId('bracket-info'),
    bracketRounds: byId('bracket-rounds'),
    bracketMsg: byId('bracket-msg'),
    bracketNext: byId('bracket-next'),
    bracketStart: byId('bracket-start'),
    bracketShuffle: byId('bracket-shuffle'),
    bracketEnd: byId('bracket-end'),
    bracketTitle: byId('bracket-title'),
    matchRound: byId('match-round'),
    matchTitle: byId('match-title'),
    matchNote: byId('match-note'),
    matchContinue: byId('match-continue'),
    trTitle: byId('tr-title'),
    trWinner: byId('tr-winner'),
    trStandings: byId('tr-standings'),
    trMatches: byId('tr-matches'),
    trNew: byId('tr-new'),
    trShare: byId('tr-share'),
    trShareStatus: byId('tr-share-status'),
    catLegend: byId('cat-legend'),
    catCount: byId('cat-count'),
    catWarning: byId('cat-warning'),
    catList: byId('cat-list'),
    catError: byId('cat-error'),
    catBlock: byId('cat-block'),
    catTourneyNote: byId('cat-tourney-note'),
    pickOverlay: byId('pick-overlay'),
    pickAbout: byId('pick-about'),
    pickForm: byId('pick-form'),
    pickCount: byId('pick-count'),
    pickList: byId('pick-list'),
    pickError: byId('pick-error'),
    pickStart: byId('pick-start'),
    pickCancel: byId('pick-cancel'),
    timerInput: byId('timer-input'),
    timerError: byId('timer-error'),
    readAloudField: byId('read-aloud-field'),
    readAloudInput: byId('read-aloud'),
    playedTrack: byId('played-track'),
    playedBar: byId('played-bar'),
    playedCount: byId('played-count'),
    playedReset: byId('played-reset'),
    startBtn: byId('start-btn'),
    maintenanceOverlay: byId('maintenance-overlay'),
    adSlots: { leaderboard: byId('ad-leaderboard') }, // D-41: screen name -> ad slot
    main: document.querySelector('.game-main'),
    // The page behind a popup (header, game, footer): made inert together while a popup is open.
    pageBehind: [document.querySelector('.page-header'), document.querySelector('.game-main'), document.querySelector('.site-footer')]
      .filter(Boolean),
    doubleOverlay: byId('double-overlay'),
    doubleText: byId('double-text'),
    doubleOk: byId('double-ok'),
    startMsg: byId('start-msg'),
    roomTaken: byId('room-taken-overlay'),   // BUG-52-02: "This game is open in another tab"
    roomTakenUse: byId('room-taken-use'),
    controlBlock: byId('control-block'),     // US-52: Game control (Players and Teams only)
    controlInputs: Array.prototype.slice.call(document.querySelectorAll('input[name="control"]')),
    roomBtn: byId('room-btn'),               // US-52: "Phones 2/4" on the board bar opens the share panel
    roomOverlay: byId('room-overlay'),
    roomHow: byId('room-how'),
    roomQr: byId('room-qr'),
    roomCode: byId('room-code'),
    roomLink: byId('room-link'),
    roomCopy: byId('room-copy'),
    roomCopyStatus: byId('room-copy-status'),
    roomMsg: byId('room-msg'),
    roomPlayers: byId('room-players'),
    roomClose: byId('room-close'),
    boardInfo: byId('board-info'),
    turnBanner: byId('turn-banner'),     // US-62: "Sara's turn" in a bot match
    coinOverlay: byId('coin-overlay'),   // US-62: the coin flip at the start of a bot match
    coin: byId('coin'),
    coinResult: byId('coin-result'),
    board: byId('board'),
    boardDone: byId('board-done'),
    boardDoneText: byId('board-done-text'),
    boardDoneBtn: byId('board-done-btn'),
    endBtn: byId('end-btn'),
    scoreboard: byId('scoreboard'),
    questionMain: byId('question-main'),
    qHeading: byId('question-title'),
    speakBtn: byId('speak-btn'),
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
    scoringTitle: byId('scoring-title'),
    scoringHint: byId('scoring-hint'),
    scoreRows: byId('score-rows'),
    backBtn: byId('back-btn'),
    streakPanel: byId('streak-panel'),
    streakPanelTitle: byId('streak-panel-title'),
    streakName: byId('streak-run-name'), // the run's name on the question screen (#streak-name is the setup input)
    streakCountLabel: byId('streak-count-label'),
    streakCount: byId('streak-count'),
    streakHint: byId('streak-hint'),
    streakChances: byId('streak-chances'), // US-57: only in index.html (a stand-in in the Integration Quiz)
    streakChoices: byId('streak-choices'),
    streakFeedback: byId('streak-feedback'),
    streakNext: byId('streak-next'),
    streakEnd: byId('streak-end'),
    // US-54 second-chance popup: only in index.html (null in the Integration Quiz, which never offers it)
    chanceOverlay: byId('chance-overlay'),
    chanceFeedback: byId('chance-feedback'),
    chanceText: byId('chance-text'),
    chanceUse: byId('chance-use'),
    chanceEnd: byId('chance-end'),
    resultsWinner: byId('results-winner'),
    resultsList: byId('results-list'),
    newGameBtn: byId('new-game-btn'),
    resultsShare: byId('results-share'),
    resultsShareStatus: byId('results-share-status'),
    lbTitle: byId('leaderboard-title'),
    lbTabs: Array.prototype.slice.call(document.querySelectorAll('.lb-tab')),
    lbHeadline: byId('lb-headline'),
    lbRank: byId('lb-rank'),
    lbMsg: byId('lb-msg'),
    lbList: byId('lb-list'),
    lbAgain: byId('lb-again'),
    lbNew: byId('lb-new'),
    lbBack: byId('lb-back'),
    dailyTitle: byId('daily-title'),
    dailyScore: byId('daily-score'),
    dailySquares: byId('daily-squares'),
    dailyNote: byId('daily-note'),
    dailyShare: byId('daily-share'),
    dailyShareStatus: byId('daily-share-status'),
    dailyNew: byId('daily-new'),
    dailyNext: byId('daily-next'),
    dailyMsg: byId('daily-msg'),
    dailyPlay: byId('daily-play'),
    cwTitle: byId('cw-title'),
    cwTimer: byId('cw-timer'),
    cwHints: byId('cw-hints'),
    cwBack: byId('cw-back'),
    cwResult: byId('cw-result'),
    cwSolved: byId('cw-solved'),
    cwHintsLine: byId('cw-hints-line'),
    cwShare: byId('cw-share'),
    cwShareStatus: byId('cw-share-status'),
    cwNext: byId('cw-next'),
    cwResultMsg: byId('cw-result-msg'),
    cwPlay: byId('cw-play'),
    cwBarLabel: byId('cw-bar-label'),
    cwBarText: byId('cw-bar-text'),
    cwBarLang: byId('cw-bar-lang'),
    cwBoard: byId('cw-board'),
    cwGrid: byId('cw-grid'),
    cwInput: byId('cw-input'),
    cwCheck: byId('cw-check'),
    cwReveal: byId('cw-reveal'),
    cwMsg: byId('cw-msg'),
    cwClues: byId('cw-clues'),
    cwAcross: byId('cw-across'),
    cwDown: byId('cw-down'),
    finalTitle: byId('final-title'),
    finalOffer: byId('final-offer'),
    finalLead: byId('final-lead'),
    finalRule: byId('final-rule'),
    finalMsg: byId('final-msg'),
    finalPlay: byId('final-play'),
    finalSkip: byId('final-skip'),
    finalWagers: byId('final-wagers'),
    finalCategory: byId('final-category-name'),
    finalWagerList: byId('final-wager-list'),
    finalWagerForm: byId('final-wager-form'),
    finalWagerLabel: byId('final-wager-label'),
    finalWagerHint: byId('final-wager-hint'),
    finalWagerInput: byId('final-wager-input'),
    finalWagerShow: byId('final-wager-show'),
    finalWagerError: byId('final-wager-error'),
    finalReady: byId('final-ready'),
    finalOpen: byId('final-open'),
    reportBtn: byId('report-btn'),
    reportOverlay: byId('report-overlay'),
    reportAbout: byId('report-about'),
    reportForm: byId('report-form'),
    reportReasons: Array.prototype.slice.call(document.querySelectorAll('input[name="report-reason"]')),
    reportNote: byId('report-note'),
    reportCount: byId('report-note-count'),
    reportError: byId('report-error'),
    reportSend: byId('report-send'),
    reportCancel: byId('report-cancel'),
    reportDone: byId('report-done'),
    reportClose: byId('report-close'),
    uiLangBtns: Array.prototype.slice.call(document.querySelectorAll('[data-ui-lang]')), // US-49
  };
  if (INTEGRATION) addStandIns(dom);
  // The leaderboard heading's own text key: the Speed leaderboard swaps it and puts it back (US-60).
  const LB_TITLE_KEY = dom.lbTitle.getAttribute('data-i18n');

  /**
   * Integration Quiz: the board game's elements the page leaves out become detached, hidden stand-ins,
   * so the shared code (bindings, showScreen, setup buttons) runs unchanged. Hidden matters: closed
   * popups and messages read as closed.
   */
  function addStandIns(group) {
    Object.keys(group).forEach((key) => {
      const node = group[key];
      if (node === null) {
        group[key] = document.createElement('div');
        group[key].hidden = true;
      } else if (Object.getPrototypeOf(node) === Object.prototype) {
        addStandIns(node); // dom.screens, dom.adSlots
      }
    });
  }

  // The streak panel's texts; the Daily Challenge sets its own and puts these back.
  function streakPanelText() {
    return { title: t(INTEGRATION ? 'iq.title' : 'streak.legend'), label: t('streak.count'),
      hint: t(INTEGRATION ? 'streak.hint' : 'streak.hintChance') };
  }
  // The scoring panel's texts and the Back to Board label; the final round sets its own (US-44).
  function scoringPanelText() {
    return { title: t('scoring.title'), hint: t('scoring.hint'), back: t('scoring.back') };
  }

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

  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  /** A score as shown: a typographic minus for negatives; kept left to right inside Arabic text. */
  function formatScore(score) {
    return ltr(score < 0 ? MINUS + Math.abs(score) : String(score));
  }

  /** "+400" / "−200" (points won or lost), kept left to right inside Arabic text. */
  function signed(sign, value) {
    return ltr(sign + value);
  }

  // Texts on screen that are made by a function are remembered with it, so a language switch
  // (US-49) can make them again in the new language (refreshTexts).
  const liveTexts = new Map();

  /** Set `node`'s text from `text` (a string, or a function giving it now and after a language switch). */
  function setText(node, text) {
    if (typeof text === 'function') liveTexts.set(node, text);
    else liveTexts.delete(node);
    node.textContent = typeof text === 'function' ? text() : text;
  }

  function refreshTexts() {
    liveTexts.forEach((make, node) => {
      if (node.isConnected) node.textContent = make();
      else liveTexts.delete(node);
    });
  }

  /** text: a string, or a function giving it (see setText). */
  function showMessage(node, text, kind) {
    setText(node, text);
    node.className = 'msg msg-' + kind;
    node.hidden = false;
  }

  function clearMessage(node) {
    setText(node, '');
    node.hidden = true;
  }

  /** An error whose message is a string table text, so it can be shown again in another language. */
  function textError(key, params) {
    const error = new Error(t(key, params));
    error.key = key;
    error.params = params;
    return error;
  }

  function errorText(err) {
    if (err && err.key) return t(err.key, err.params);
    return err && err.message ? err.message : t('err.generic');
  }

  /** An error reason inside a longer message: trimmed, with a full stop when it has none. */
  function sentence(text) {
    const reason = text.trim();
    return /[.!?؟]$/.test(reason) ? reason : reason + '.';
  }

  /** "X and Y" / "X, Y and Z" (D-10); each name keeps its own direction in Arabic. */
  function joinNames(names) {
    const list = names.map(iso);
    if (list.length <= 1) return list.join('');
    return list.slice(0, -1).join(t('list.sep')) + t('list.and') + list[list.length - 1];
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
      throw textError('err.network');
    }
    let data = null;
    try {
      data = await response.json();
    } catch (err) {
      data = null; // non-JSON body (e.g. PHP not running): never show it raw
    }
    if (!response.ok) {
      // The server's own error text is shown as it was sent (English); a missing one is ours.
      const error = data && typeof data.error === 'string' && data.error
        ? new Error(data.error)
        : textError('err.http', { status: response.status });
      error.status = response.status; // e.g. 409 = no question left to draw (Golden Goal, D-51)
      throw error;
    }
    if (data === null) throw textError('err.response');
    return data;
  }

  function paletteEntry(color) {
    return FULL_PALETTE.find((p) => p.value === color) || PALETTE[0];
  }

  /** The colours a mode offers: 8 in Tournament mode (US-61, D-77 j), the 6 of US-03 otherwise. */
  function paletteFor(modeKey) {
    return modeKey === 'tournament' ? FULL_PALETTE : PALETTE;
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
   * Returns { question, points, catName }; Correct / Wrong / Skip use these points. catName is the
   * label shown, in the interface language.
   */
  function activeQuestion(g) {
    const cur = g.current;
    if (cur.swap) {
      return { question: cur.swap.question, points: cur.swap.points, catName: localName(cur.swap.catName, cur.swap.catNameAr) };
    }
    const category = findCategory(g, cur.catId);
    const q = category.questions[String(cur.points)];
    // US-53: a Kilo Meshakkal box names its source category, "Kilo Meshakkal: Football".
    const catName = category.id === MIX && q.catName
      ? columnName(category) + ': ' + localName(q.catName, q.catNameAr) : columnName(category);
    return { question: q, points: cur.points, catName: catName };
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
    if (INTEGRATION) return; // the quiz has no board game: a saved one (index.html's) stays as it is
    if (tourney) { // US-61: the match board is saved inside the tournament, in the same write
      saveTournament();
      return;
    }
    if (phone.blocked) return; // BUG-52-02: another tab plays this Phone buzzer game; never overwrite its save
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
    if (phoneOn()) schedulePush(); // US-52: every saved change may be one the phones must see
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
      // A tournament match (US-61) is only ever saved inside its tournament (TOURNAMENT_KEY).
      if (saved && SCREENS.indexOf(saved.screen) > 0 && isValidGame(saved.game) && saved.game.mode !== 'tournament' &&
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
    // v3 had no final round (US-44): the game goes on without one, as it was started.
    if (upgraded.version === 3 && isPlainObject(upgraded.game)) {
      upgraded = {
        version: 4,
        screen: upgraded.screen,
        game: Object.assign({}, upgraded.game, { finalRound: false, final: null }),
      };
    }
    // Version 4 was never released: a save made before the round counter (D-51) is round 1.
    const fin = upgraded.version === 4 && isPlainObject(upgraded.game) ? upgraded.game.final : null;
    if (isPlainObject(fin) && fin.round === undefined && fin.usedIds === undefined) {
      const ids = isPlainObject(fin.question) && Number.isInteger(fin.question.id) ? [fin.question.id] : [];
      upgraded.game.final = Object.assign({}, fin, { round: 1, usedIds: ids });
    }
    // v4 had no game control (US-52): a saved game is a Host control game.
    if (upgraded.version === 4 && isPlainObject(upgraded.game)) {
      upgraded = {
        version: 5,
        screen: upgraded.screen,
        game: Object.assign({}, upgraded.game, { control: 'host' }),
      };
    }
    return upgraded.version === STORAGE_VERSION ? upgraded : null;
  }

  function clearSavedState() {
    if (INTEGRATION) return; // as saveState()
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
        paletteFor(mode.key).some((p) => p.value === c.color) && !colors[c.color] &&
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
        typeof c.name === 'string' && isOptionalText(c.nameAr) && isPlainObject(c.questions) &&
        (c.hidden === undefined || typeof c.hidden === 'boolean') &&
        (c.id === MIX || (c.order === undefined && c.faces === undefined)) && // US-53: mix column only
        points.every((p) => isValidQuestion(hasOwn(c.questions, String(p)) ? c.questions[String(p)] : null));
      if (ok) ids[c.id] = true;
      return ok;
    });
  }

  /**
   * US-53: a started game's Kilo Meshakkal column has its box order, each board value once, and one
   * non-empty emoji per box (set at Start, so the server's board is checked without them).
   */
  function isValidMixColumns(g) {
    return g.categories.every((c) => c.id !== MIX || (
      Array.isArray(c.order) && c.order.length === g.points.length &&
      c.order.slice().sort((a, b) => a - b).every((p, i) => p === g.points[i]) &&
      Array.isArray(c.faces) && c.faces.length === g.points.length &&
      c.faces.every((face) => typeof face === 'string' && face !== '')));
  }

  /** One question (board cell or Swap question); the picture, credit, wrong options and source category are optional. */
  function isValidQuestion(q) {
    return isPlainObject(q) && typeof q.question === 'string' && typeof q.answer === 'string' &&
      isValidImage(q.image) && isOptionalText(q.image_credit) && isOptionalText(q.catName) && isOptionalText(q.catNameAr) &&
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

  /** "<categoryId>:<points>" naming a real cell of this board, in canonical form ("-1:300" for Kilo Meshakkal, US-53). */
  function isBoardCellKey(key, g) {
    const match = /^(-?\d+):(\d+)$/.exec(key);
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

  /**
   * A cell closed after a Swap: the category and points of the question that replaced it (shown on the
   * board) and its id (FU-35; missing in saves from before it).
   */
  function isValidUsedSwap(swap) {
    return isPlainObject(swap) && typeof swap.catName === 'string' && swap.catName !== '' &&
      isOptionalText(swap.catNameAr) && Number.isInteger(swap.points) && swap.points > 0 &&
      (swap.id === undefined || (Number.isInteger(swap.id) && swap.id > 0));
  }

  /** Open question: an unused cell, marks only for real contestants, at most one Correct (US-14), valid helper use. */
  function isValidCurrent(current, g) {
    if (current === null) return true;
    if (!isPlainObject(current) || !Number.isInteger(current.catId) || !Number.isInteger(current.points) ||
        typeof current.answerShown !== 'boolean' || !isPlainObject(current.marks) ||
        !(current.timedOut === undefined || typeof current.timedOut === 'boolean') || // US-47
        !isValidBotRoll(current.botRoll)) return false; // US-62
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

  /** US-63 (D-79): the bot's right tickets out of 10, a whole number 0..10. */
  function isValidBotTickets(n) {
    return Number.isInteger(n) && n >= 0 && n <= BOT_TICKETS;
  }

  /** US-62: the bot's saved result on an open question: missing, or { right, optionIndex: 1 | 2 | null, said? }. */
  function isValidBotRoll(roll) {
    return roll === undefined || (isPlainObject(roll) && typeof roll.right === 'boolean' &&
      (roll.optionIndex === null || roll.optionIndex === 1 || roll.optionIndex === 2) &&
      (roll.said === undefined || typeof roll.said === 'boolean')); // said: its answer was shown (OBS-2)
  }

  /** A permutation of [0, 1, 2]. */
  function isValidChoiceOrder(order) {
    return Array.isArray(order) && order.length === CHOICE_LETTERS.length &&
      order.slice().sort().every((value, i) => value === i);
  }

  function isValidSwap(swap) {
    return isPlainObject(swap) && Number.isInteger(swap.catId) && typeof swap.catName === 'string' &&
      isOptionalText(swap.catNameAr) && Number.isInteger(swap.points) && swap.points > 0 && isValidQuestion(swap.question);
  }

  function isValidGame(g) {
    if (!isPlainObject(g) || typeof g.mode !== 'string' || !hasOwn(MODES, g.mode)) return false;
    const range = timerRange();
    return isValidContestants(g.contestants, MODES[g.mode]) &&
      Number.isInteger(g.timerSeconds) && g.timerSeconds >= range.min && g.timerSeconds <= range.max &&
      (g.helpersOff === undefined || typeof g.helpersOff === 'boolean') && // games saved before the setting
      isValidBoard(g.points, g.categories) && isValidMixColumns(g) &&
      (g.double === undefined || (typeof g.double === 'string' && isBoardCellKey(g.double, g))) && // games saved before D-40
      typeof g.finalRound === 'boolean' && isValidFinal(g.final, g) &&
      isValidStatsSent(g.statsSent) && // US-47
      (g.turn === undefined || (Number.isInteger(g.turn) && findContestant(g, g.turn) !== null)) && // US-62
      (g.coinShown === undefined || typeof g.coinShown === 'boolean') &&
      (g.botTickets === undefined || isValidBotTickets(g.botTickets)) && // US-63
      isValidControl(g) && // US-52
      isValidUsed(g.used, g) && isValidCurrent(g.current, g);
  }

  /**
   * US-52: the game control. Missing (a tournament match, D-80 b) or 'host': no room. 'phone': Players or
   * Teams only, with the room made at Start.
   */
  function isValidControl(g) {
    if (g.control === undefined || g.control === 'host') return g.room === undefined;
    return g.control === 'phone' && (g.mode === 'players' || g.mode === 'teams') && isPlainObject(g.room) &&
      Object.keys(g.room).length === 2 && typeof g.room.code === 'string' && ROOM_CODE_PATTERN.test(g.room.code) &&
      typeof g.room.hostToken === 'string' && ROOM_TOKEN_PATTERN.test(g.room.hostToken);
  }

  /** US-47: the ids whose outcome was sent; missing in a save from before US-47 (then none are sent). */
  function isValidStatsSent(list) {
    return list === undefined || (Array.isArray(list) && list.length <= SEEN_MAX && isValidIdList(list));
  }

  /**
   * Final round / Golden Goal (US-44, D-51): a known stage, round and drawn ids; from the wagers on, a real question and category, wagers
   * of real contestants within the D-48 limit, and marks only once every wager is in.
   */
  function isValidFinal(f, g) {
    if (f === null) return true;
    if (!isPlainObject(f) || FINAL_STAGES.indexOf(f.stage) === -1 || g.finalRound !== true) return false;
    // D-51: round counter and the questions drawn so far (one per round; never one of the board's).
    if (!Number.isInteger(f.round) || f.round < 1 || !isValidIdList(f.usedIds)) return false;
    const offer = f.stage === 'offer';
    if (f.usedIds.length !== f.round - (offer ? 1 : 0)) return false;
    if (offer) return Object.keys(f).length === 3 && isTiedAtTop(g); // only a tie for first is offered
    if (!isPlainObject(f.category) || !Number.isInteger(f.category.id) || typeof f.category.name !== 'string' ||
        !isOptionalText(f.category.nameAr) || !isValidQuestion(f.question) || typeof f.answerShown !== 'boolean' ||
        !(f.lang === undefined || f.lang === 'en' || (f.lang === 'ar' && hasArabic(f.question))) ||
        !isPlainObject(f.wagers) || !isPlainObject(f.marks) || f.usedIds.indexOf(f.question.id) === -1 ||
        !isValidBotRoll(f.botRoll)) return false; // US-62: the bot's answer to a Golden Goal question
    const ids = g.contestants.map((c) => String(c.id));
    const wagerIds = Object.keys(f.wagers);
    const markIds = Object.keys(f.marks);
    if (wagerIds.some((id) => ids.indexOf(id) === -1) || markIds.some((id) => ids.indexOf(id) === -1)) return false;
    if (markIds.some((id) => f.marks[id] !== 'correct' && f.marks[id] !== 'wrong')) return false;
    // Wagers are entered in setup order: the ones in are the first contestants.
    if (wagerIds.length > ids.length || !ids.slice(0, wagerIds.length).every((id) => hasOwn(f.wagers, id))) return false;
    const allIn = wagerIds.length === ids.length;
    if (f.stage !== 'wager' && !allIn) return false;
    if (f.stage === 'wager' && (markIds.length || f.answerShown)) return false;
    return g.contestants.every((c) => !hasOwn(f.wagers, String(c.id)) || isValidWager(f, g, c));
  }

  /** Distinct positive integer ids. */
  function isValidIdList(list) {
    return Array.isArray(list) && list.every((id, i) => Number.isInteger(id) && id > 0 && list.indexOf(id) === i);
  }

  /** A wager is a whole number from 0 to the D-48 limit at the time it was entered. */
  function isValidWager(f, g, c) {
    const wager = f.wagers[String(c.id)];
    return Number.isInteger(wager) && wager >= 0 && wager <= wagerLimit(g, scoreBeforeFinal(f, c));
  }

  /** The question screen needs an open question (a board one, or the final round's); the others none. */
  function isValidScreenFor(screen, g) {
    const stage = g.final ? g.final.stage : null;
    if (g.current !== null) return screen === 'question' && stage === null;
    if (screen === 'question') return stage === 'question';
    if (screen === 'final') return stage === 'offer' || stage === 'wager';
    if (screen === 'board') return stage === null;
    return stage === null || stage === 'done'; // results
  }

  // ---------- Screens ----------

  function showScreen(name) {
    state.screen = name;
    stopBot(); // US-62: a pending bot action never fires on another screen (the caller arms it again)
    if (name !== 'question') {
      stopTimer();
      closeReport(); // US-42: the report form belongs to the question screen
      stopReading(); // US-48: closing the question stops the reading
    }
    if (name !== 'daily') stopDailyCountdown();
    if (name !== 'crossword') stopCrosswordTicker();
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
    if (isApp || INTEGRATION) return; // no ads in the Android app (D-43) or the Integration Quiz
    const slot = dom.adSlots[name];
    if (!slot) return;
    if (name === 'leaderboard' && lbBoard !== 'streak') { // US-60: the Speed leaderboard has no ad
      slot.hidden = true;
      return;
    }
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
    return state.screen === 'setup' && (INTEGRATION || !(state.setup && state.setup.streak));
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
    if (isRoomTakenOpen()) {
      return;                                        // BUG-52-02: only "Use this tab" leaves it
    } else if (!dom.coinOverlay.hidden) {
      finishCoin();                                  // US-62: the coin flip, skipped to its end
    } else if (isRoomPanelOpen()) {
      closeRoomPanel();                              // US-52: the share panel, as Close
    } else if (!dom.doubleOverlay.hidden) {
      closeDoublePopup();
    } else if (isReportOpen()) {
      closeReport();                                 // US-42: the report form, as Cancel
    } else if (isPickOpen()) {
      closePicker();                                 // US-61: the match categories popup, as Cancel
    } else if (isSpeedOverlayOpen()) {
      onSpeedOverlayBack();                          // US-59: rules or countdown -> no run; Paused -> "End the run now?"
    } else if (speedOnScreen()) {
      onSpeedEnd();                                  // US-59: "End the run now?" confirm
    } else if (state.screen === 'speed') {
      onSpeedNewGame();                              // US-59: the result -> setup, as New Game
    } else if (state.screen === 'bracket') {
      onEndTournament();                             // US-61: "End the tournament?" confirm
    } else if (state.screen === 'match') {
      onMatchContinue();                             // US-61: the match result, as Continue
    } else if (state.screen === 'tresults') {
      onTourneyNewGame();                            // US-61: setup, as New game
    } else if (state.screen === 'final') {
      onFinalBack();                                 // final round (US-44): offer -> board, wagers -> ask
    } else if (state.screen === 'question') {
      if (finalOnScreen()) {                         // final round question (US-44)
        onFinalLeave();                              // "Stop the final round?" confirm
      } else if (dailyOnScreen()) {                  // Daily Challenge (US-43)
        if (daily.current.picked !== null) onDailyNext(); // answered: on, as Next
        else onDailyLeave();                         // "Leave today's Daily Challenge?" confirm
      } else if (!streakOnScreen()) confirmBackToBoard(); // "Back to Board", after a confirm
      else if (isStreakPending(streak)) onChanceEnd();  // US-54: Back in the second-chance popup is See results
      else if (streak.over) onStreakNext();          // lost run: on to the leaderboard, as Next
      else onStreakEnd();                            // "End the run now?" confirm
    } else if (state.screen === 'daily') {
      onDailyNewGame();                              // the Daily result: back to setup, as New Game
    } else if (state.screen === 'crossword') {
      onCrosswordBack();                             // US-58: back to setup, progress kept, no confirm
    } else if (state.screen === 'board') {
      endGame();                                     // D-09 confirm while questions are left
    } else if (state.screen === 'results') {
      newGame();
    } else if (state.screen === 'leaderboard') {
      if (leaderboardResult && lbBoard === 'streak') onLeaderboardNewGame(); // asks first if the streak was not saved
      else onLeaderboardBack();                      // US-60: the Speed board goes back to its result or setup
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
    if (!cur || botAnswerPending(state.game)) return; // US-62: the bot's question closes once it is scored
    const text = Object.keys(cur.marks).length ? t('question.leaveMarked') : t('question.leaveUnmarked');
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
      finalRoundOn: false, // final_round_enabled from settings (US-44); a new game keeps it
      dailyOn: true,      // daily_enabled from settings (D-74): the Daily Challenge button
      speedOn: false,     // speed_enabled from settings (US-59): the Speed Round button
      perGame: null,     // categories_per_game from settings
      timerDefault: null, // timer_seconds from settings
      playable: [],       // [{id, name}] from categories.php?playable=1
      played: null,       // { played, total } from questions.php?played=1, null until loaded
      selected: [],       // category ids in the order they were ticked
      loading: true,
      loadError: '',
      loadErrorShown: null, // the load error on screen, shown again after a language switch (US-49)
      starting: false,
      streak: false,      // Streak Challenge chosen (US-33): its name field replaces the player row
      control: 'host',    // US-52: Game control, Host control by default (Players and Teams only)
    };
  }

  function colorsInUse(exceptEntry) {
    return state.setup.entries.filter((e) => e !== exceptEntry).map((e) => e.color);
  }

  function firstFreeColor() {
    const used = colorsInUse(null);
    const palette = paletteFor(state.setup.mode);
    const free = palette.find((p) => used.indexOf(p.value) === -1);
    return free ? free.value : palette[0].value;
  }

  /**
   * US-61: every entry keeps a colour of the mode's palette, each once. Leaving Tournament mode gives
   * an entry on one of its 2 extra colours (or a repeat) the first free colour of the 6; with more
   * entries than colours the rest keep theirs (Start is blocked then, D-07, until some are removed).
   */
  function normalizeColors() {
    const palette = paletteFor(state.setup.mode);
    const taken = {};
    const bad = [];
    state.setup.entries.forEach((e) => {
      if (palette.some((p) => p.value === e.color) && !taken[e.color]) taken[e.color] = true;
      else bad.push(e);
    });
    bad.forEach((e) => {
      const free = palette.find((p) => !taken[p.value]);
      if (!free) return;
      e.color = free.value;
      taken[free.value] = true;
    });
  }

  function renderMode() {
    const mode = currentMode();
    dom.modeInputs.forEach((input) => { input.checked = input.value === state.setup.mode; });
    dom.entryAdd.textContent = t('entry.add.' + mode.key);
    dom.entryAdd.disabled = state.setup.entries.length >= mode.limit;
    const extra = state.setup.entries.length - mode.limit;
    if (extra > 0) {
      // D-07: entries are kept; Start stays blocked until the host removes the extras.
      showMessage(dom.entryLimitMsg, t('entry.tooMany.' + mode.key, { limit: mode.limit, extra: extra }), 'error');
    } else {
      clearMessage(dom.entryLimitMsg);
    }
  }

  /** US-61 (D-23): message '' (none) or a function giving the "at least 3 contestants" error. */
  function setEntryMinError(message) {
    setText(dom.entryMinError, message);
    dom.entryMinError.hidden = !message;
  }

  /** A tournament needs at least TOURNAMENT_MIN entries; checked at the click on Start (a field error). */
  function validateTournamentSize() {
    const s = state.setup;
    const ok = s.mode !== 'tournament' || s.entries.length >= TOURNAMENT_MIN;
    setEntryMinError(ok ? '' : () => t('tournament.needMin', { n: TOURNAMENT_MIN }));
    return ok;
  }

  function renderEntries() {
    const mode = currentMode();
    const entries = state.setup.entries;
    normalizeColors(); // US-61: only Tournament mode offers the 2 extra colours
    if (!dom.entryMinError.hidden && (state.setup.mode !== 'tournament' || entries.length >= TOURNAMENT_MIN)) setEntryMinError('');
    clear(dom.entryList);
    entries.forEach((entry, index) => {
      const label = t('entry.label.' + mode.key, { n: index + 1 });
      const inputId = 'entry-name-' + entry.key;
      const errorId = 'entry-error-' + entry.key;
      const color = paletteEntry(entry.color);
      const colorName = t(color.name);

      const swatch = h('button', {
        type: 'button',
        className: 'swatch',
        title: t('entry.colorTitle', { color: colorName }),
        'aria-label': t('entry.colorLabel', { label: label, color: colorName }),
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
        placeholder: t('entry.placeholder', { label: label }),
        autocomplete: 'off',
        'aria-describedby': errorId,
      });
      if (i18n.isArabic()) input.dir = 'auto'; // a Latin name is typed left to right in Arabic too
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
          text: t('entry.remove'),
          disabled: entries.length <= 1,
          'aria-label': t('entry.removeLabel', { label: label }),
          onclick: () => removeEntry(entry),
        }),
        h('p', { id: errorId, className: 'field-error', text: entry.error ? t(entry.error) : '', hidden: !entry.error }),
      ]));
    });
    renderMode();
    updateStartButton();
  }

  /** errorKey: the string key of the name's error ('entry.required' / 'entry.unique'), or '' for none. */
  function setEntryError(entry, errorKey) {
    entry.error = errorKey;
    const input = byId('entry-name-' + entry.key);
    const errorNode = byId('entry-error-' + entry.key);
    if (input) {
      if (errorKey) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
    if (errorNode) {
      errorNode.textContent = errorKey ? t(errorKey) : '';
      errorNode.hidden = !errorKey;
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
    const palette = paletteFor(state.setup.mode);
    const start = palette.findIndex((p) => p.value === entry.color);
    for (let step = 1; step < palette.length; step += 1) {
      const candidate = palette[(start + step) % palette.length];
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
    renderCatBlockMode();
  }

  /**
   * US-61 (D-77 ab): in Tournament mode the setup categories are switched off (the ticks are kept for
   * Players and Teams) and a note says they are chosen before each match.
   */
  function renderCatBlockMode() {
    const off = !!state.setup && state.setup.mode === 'tournament';
    dom.catBlock.disabled = off;
    dom.catBlock.classList.toggle('is-off', off);
    dom.catTourneyNote.hidden = !off;
    if (off) clearMessage(dom.catError);
    renderControlBlock();
  }

  /** US-52 (D-80 b): the Game control choice under the categories, in Players and Teams modes only. */
  function renderControlBlock() {
    const s = state.setup;
    dom.controlBlock.hidden = !s || s.streak || s.mode === 'tournament';
    dom.controlInputs.forEach((input) => { input.checked = !!s && input.value === s.control; });
  }

  function onControlChange(event) {
    if (state.setup && CONTROLS.indexOf(event.target.value) !== -1) state.setup.control = event.target.value;
  }

  // ---------- Setup: categories and timer (US-04, US-05) ----------

  function renderCategories() {
    const s = state.setup;
    dom.catLegend.textContent = s.perGame ? tn('cat.legendMax', s.perGame) : t('cat.legend');
    clear(dom.catList);
    clearMessage(dom.catWarning);
    if (s.loading || s.loadError === 'network') {
      dom.catCount.textContent = s.loading ? t('cat.loading') : '';
      return;
    }
    if (s.playable.length) renderSurpriseTile();
    setupTiles(s).forEach((c) => {
      const inputId = c.id === MIX ? 'cat-mix' : 'cat-' + c.id;
      const box = h('input', { type: 'checkbox', id: inputId, checked: s.selected.indexOf(c.id) !== -1 });
      box.addEventListener('change', () => toggleCategory(c.id, box.checked));
      dom.catList.appendChild(h('li', {}, [
        h('label', { className: 'cat-label', htmlFor: inputId, 'data-cat': String(c.id) }, [
          box,
          h('span', { className: 'cat-name-text', text: iso(columnName(c)) }),
          h('span', { className: 'cat-order', 'aria-hidden': 'true' }),
        ]),
      ]));
    });
    if (!s.playable.length) {
      dom.catList.appendChild(h('li', { className: 'hint', text: t('cat.none') }));
    }
    if (s.perGame !== null && !s.playable.length) renderNotEnough();
    renderCategorySelection();
    renderCatBlockMode();
  }

  /**
   * US-53 / D-53: the category tiles, with Kilo Meshakkal sorted by name among the playable ones
   * (the server sends those sorted by name). Only shown when a real category is playable, since its
   * boxes draw from them. s.playable itself stays the real categories: the played count and the
   * "Surprise me!" draw use it, so neither ever includes Kilo Meshakkal.
   */
  function setupTiles(s) {
    if (!s.playable.length) return [];
    const tiles = s.playable.slice();
    const after = tiles.findIndex((c) => c.name.localeCompare(MIX_NAME, 'en', { sensitivity: 'base' }) > 0);
    tiles.splice(after === -1 ? tiles.length : after, 0, { id: MIX, name: MIX_NAME });
    return tiles;
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
          document.createTextNode(t('cat.surprise')),
          h('span', { className: 'cat-surprise-hint', text: t('cat.surpriseHint', { n: SURPRISE_ALONE }) }),
        ]),
        h('span', { className: 'cat-order', 'aria-hidden': 'true' }),
      ]),
    ]));
  }

  /** D-11 (amended by D-32): no playable category at all -> message with Admin link, Start disabled. */
  function renderNotEnough() {
    clear(dom.catWarning);
    dom.catWarning.appendChild(document.createTextNode(t('cat.notEnoughStart')));
    // No link to the admin page in the Android app (US-40); the word stays so the sentence reads on
    const admin = t('nav.admin');
    dom.catWarning.appendChild(isApp ? document.createTextNode(admin) : h('a', { href: 'admin.html', text: admin }));
    dom.catWarning.appendChild(document.createTextNode(t('cat.notEnoughEnd')));
    dom.catWarning.hidden = false;
  }

  /** Update the "k of up to N selected" text, the selection-order badges (board column order)
   *  and lock the unticked boxes once N are ticked (D-32). */
  function renderCategorySelection() {
    const s = state.setup;
    const count = s.selected.length;
    const full = s.perGame !== null && count >= s.perGame;
    dom.catCount.textContent = s.perGame
      ? t('cat.count', { k: count, n: s.perGame })
      : t('cat.countNoMax', { k: count });
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

  /** message: '' (none), a string, or a function giving it (see setText). */
  function setTimerError(message) {
    setText(dom.timerError, message);
    dom.timerError.hidden = !message;
    if (message) dom.timerInput.setAttribute('aria-invalid', 'true');
    else dom.timerInput.removeAttribute('aria-invalid');
  }

  /** text: a function giving the message, so a language switch can show it again (refreshSetup). */
  function showLoadError(text, withRetry, withAdminLink) {
    state.setup.loadErrorShown = { text: text, withRetry: withRetry, withAdminLink: withAdminLink };
    clear(dom.loadMsg);
    dom.loadMsg.className = 'msg msg-error';
    dom.loadMsg.appendChild(h('span', { text: text() + ' ' }));
    // No link to the admin page in the Android app (US-40)
    if (withAdminLink && !isApp) dom.loadMsg.appendChild(h('a', { href: 'admin.html', text: t('load.openAdmin') }));
    if (withRetry) {
      dom.loadMsg.appendChild(h('button', {
        type: 'button',
        className: 'btn btn-small',
        text: t('common.tryAgain'),
        onclick: loadSetupData,
      }));
    }
    dom.loadMsg.hidden = false;
  }

  function hideLoadError() {
    if (state.setup) state.setup.loadErrorShown = null;
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
    if (INTEGRATION) return loadQuizSetup();
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
        throw textError('err.response');
      }
      s.perGame = Number.isInteger(settings.categories_per_game) && settings.categories_per_game > 0
        ? settings.categories_per_game : null;
      s.timerDefault = Number.isInteger(settings.timer_seconds) ? settings.timer_seconds : null;
      renderBanner(settings);
      setAdConfig(settings);
      s.maintenance = settings.start_game_hidden === 1;
      s.helpersOn = settings.helpers_enabled !== 0; // a missing row means on
      s.finalRoundOn = settings.final_round_enabled === 1; // US-44: a missing row means off
      s.dailyOn = settings.daily_enabled !== 0; // D-74: a missing row means on
      s.crosswordOn = settings.crossword_enabled === 1; // US-58: a missing row means off
      s.speedOn = settings.speed_enabled === 1; // US-59: a missing row means off
      s.playable = results[1].filter((c) => isPlainObject(c) && Number.isInteger(c.id) && typeof c.name === 'string')
        .map((c) => ({ id: c.id, name: c.name, nameAr: isFilled(c.name_ar) ? c.name_ar : null }));
      // Kilo Meshakkal (US-53) stays ticked like Surprise, as long as its tile is shown.
      s.selected = s.selected.filter((id) => id === SURPRISE || (id === MIX && s.playable.length > 0) ||
        s.playable.some((c) => c.id === id));
      if (dom.timerInput.value === '' && s.timerDefault !== null) dom.timerInput.value = String(s.timerDefault);
      if (s.perGame === null) {
        s.loadError = 'settings';
        showLoadError(() => t('load.incomplete'), false, true);
      }
    } catch (err) {
      if (state.setup !== s) return;
      s.loadError = 'network';
      showLoadError(() => t('load.failed', { reason: errorText(err) }), true, false);
    }
    s.loading = false;
    renderCategories();
    updateStartButton();
    loadPlayed();
  }

  /**
   * Integration Quiz setup: only the default timer comes from the settings. No categories, played
   * bar, banner, ads or maintenance screen (the page has none of them).
   */
  async function loadQuizSetup() {
    const s = state.setup;
    s.loading = true;
    s.loadError = '';
    hideLoadError();
    updateStartButton();
    try {
      const settings = await apiGet('settings.php');
      if (state.setup !== s) return; // setup was restarted meanwhile
      if (!isPlainObject(settings)) throw textError('err.response');
      s.timerDefault = Number.isInteger(settings.timer_seconds) ? settings.timer_seconds : null;
      if (dom.timerInput.value === '' && s.timerDefault !== null) dom.timerInput.value = String(s.timerDefault);
    } catch (err) {
      if (state.setup !== s) return;
      s.loadError = 'network';
      showLoadError(() => t('load.failed', { reason: errorText(err) }), true, false);
    }
    s.loading = false;
    updateStartButton();
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
      dom.playedCount.textContent = tn('played.count', seen);
      return;
    }
    const fraction = Math.min(counts.played, counts.total) / counts.total;
    // Rounded down, so 100% only shows once every question was played; "less than 1%" beats a misleading 0%.
    const percent = Math.floor(fraction * 100);
    const label = counts.played > 0 && percent === 0 ? t('played.lessThan1') : percent + '%';
    dom.playedBar.style.transform = 'scaleX(' + fraction + ')';
    dom.playedTrack.setAttribute('aria-valuenow', String(percent));
    dom.playedCount.textContent = t('played.percent', { label: label });
  }

  /** Forget the played questions so every question can come up again. */
  function forgetPlayed() {
    if (!window.confirm(t('played.confirm'))) return;
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
    // Daily Challenge (US-43): any mode and number of players; it needs no category pick either.
    // Hidden when the admin turned it off (daily_enabled, D-74).
    dom.dailyOpenBtn.hidden = !s || down || s.streak || !s.dailyOn;
    dom.dailyOpenBtn.disabled = !s || s.loading || s.starting || s.loadError === 'network';
    // Daily Crossword (US-58): the same rules, and only when the admin turned it on (crossword_enabled).
    dom.crosswordOpenBtn.hidden = !s || down || s.streak || !s.crosswordOn;
    dom.crosswordOpenBtn.disabled = dom.dailyOpenBtn.disabled;
    // Speed Round (US-59): the same rules, only when the admin turned it on (speed_enabled).
    dom.speedOpenBtn.hidden = !s || down || s.streak || !s.speedOn;
    dom.speedOpenBtn.disabled = dom.dailyOpenBtn.disabled;
    dom.speedPair.hidden = dom.speedOpenBtn.hidden;
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
      if (!key) message = 'entry.required';
      else if (counts[key] > 1) message = 'entry.unique';
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
    const perGame = s.perGame;
    showMessage(dom.catError, count < 1 ? () => t('cat.atLeast') : () => tn('cat.tooMany', perGame, { k: count }), 'error');
    return false;
  }

  /** Whole number within the input's min/max. Returns the value or null (error shown inline). */
  function validateTimer() {
    const raw = dom.timerInput.value.trim();
    const range = timerRange();
    const value = Number(raw);
    if (dom.timerInput.validity.badInput || !/^\d+$/.test(raw) || value < range.min || value > range.max) {
      setTimerError(() => t('timer.invalid', { min: range.min, max: range.max }));
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
      throw textError('err.board');
    }
    return {
      points: points,
      categories: categories.map((c) => {
        const questions = {};
        points.forEach((p) => { questions[String(p)] = parseQuestion(c.questions[String(p)]); });
        return { id: c.id, name: c.name, nameAr: isFilled(c.name_ar) ? c.name_ar : null, questions: questions };
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
      catName: isFilled(q.category_name) ? q.category_name : null, // US-53: a Kilo Meshakkal box's source category
      catNameAr: isFilled(q.category_name_ar) ? q.category_name_ar : null, // and its Arabic name
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
   *  Returns { ids, hidden } where hidden holds the randomly picked ids (shown as "?" on the board).
   *  Kilo Meshakkal (MIX, US-53) passes through as a pick; it is not in s.playable, so the random
   *  draw never takes it. */
  function resolveSelection(s) {
    const picked = s.selected.filter((id) => id !== SURPRISE);
    if (picked.length === s.selected.length) return { ids: picked, hidden: [] };
    const free = shuffled(s.playable.map((c) => c.id).filter((id) => picked.indexOf(id) === -1));
    if (!picked.length) {
      const ids = free.slice(0, Math.min(SURPRISE_ALONE, s.perGame));
      return { ids: ids, hidden: ids };
    }
    if (!free.length) throw textError('cat.allPicked');
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
    const sizeOk = validateTournamentSize(); // US-61: at least 3 contestants
    const categoriesOk = state.setup.mode === 'tournament' || validateCategoryCount(); // D-77 ab: chosen per match
    const timer = validateTimer();
    if (!namesOk || !sizeOk || !categoriesOk || timer === null) {
      showMessage(dom.startMsg, () => t('start.fix'), 'error');
      if (namesOk && !sizeOk) dom.entryAdd.focus();
      else focusFirstProblem();
      return;
    }

    const s = state.setup;
    s.starting = true;
    dom.startBtn.textContent = t('setup.starting');
    updateStartButton();
    try {
      if (s.mode === 'tournament') { // US-61: the bracket first; each match has its own categories and board
        await refreshStartSettings(s);
        beginTournament(timer);
        return;
      }
      const selection = resolveSelection(s);
      const ids = selection.ids;
      // BUG-9-01: the game settings are read again with the board, so a change in Admin while Setup
      // was open counts ("taken at Start"); the settings request never fails the start.
      const answers = await Promise.all([
        apiPost('questions.php?board=1', { categories: ids.join(','), seen: loadSeen() }),
        refreshStartSettings(s),
      ]);
      const board = parseBoard(answers[0], ids);
      board.categories.forEach((c) => { c.hidden = selection.hidden.indexOf(c.id) !== -1; });
      const game = newBoardGame(board, timer);
      if (game.control === 'phone') {
        try {
          game.room = await createRoom(game); // US-52: the phones' room first, so the share panel has its code
        } catch (err) {
          // US-06: stay on setup with every input intact; Host control still plays without a room.
          showMessage(dom.startMsg, () => t('start.roomFailed', { reason: sentence(errorText(err)) }), 'error');
          return;
        }
      }
      preloadImages(board.categories);
      beginGame(game);
    } catch (err) {
      // US-06: stay on setup with every input intact.
      showMessage(dom.startMsg, () => t('start.failed', { reason: localCategoryNames(errorText(err)) }), 'error');
    } finally {
      s.starting = false;
      dom.startBtn.textContent = t('setup.start');
      updateStartButton();
    }
  }

  /**
   * The settings a new game takes at Start (helpers_enabled, final_round_enabled), read fresh at the
   * click on Start Game. If the request fails or answers oddly, the values Setup loaded are kept.
   * Never rejects.
   */
  async function refreshStartSettings(s) {
    try {
      const settings = await apiGet('settings.php');
      if (!isPlainObject(settings)) return;
      s.helpersOn = settings.helpers_enabled !== 0;         // a missing row means on
      s.finalRoundOn = settings.final_round_enabled === 1;  // US-44: a missing row means off
    } catch (err) {
      // keep the values loaded with Setup
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
  function newBoardGame(board, timerSeconds) {
    const s = state.setup;
    board.categories.forEach((c) => { if (c.id === MIX) dealMixColumn(c, board.points); });
    return {
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
      finalRound: s.finalRoundOn, // US-44: admin setting when the game starts (final_round_enabled)
      final: null,
      statsSent: [], // US-47: questions whose outcome was sent (at most once per question per game)
      control: s.mode !== 'tournament' && s.control === 'phone' ? 'phone' : 'host', // US-52 (D-80 b)
      current: null,
    };
  }

  function beginGame(game) {
    clearTournament(); // never left over here; a new game must not come back as a tournament
    stopPhone();
    state.game = game;
    renderGame();
    showScreen('board'); // also saves the state (and, in Phone buzzer, sends the board to the phones)
    logGameStart(state.game);
    if (game.control === 'phone') {
      startPhone();
      openRoomPanel(); // the host shares the code before the first question
    }
  }

  /**
   * US-53 / D-53: the Kilo Meshakkal column's values in a random order down the board (each value
   * once, so the column's total stays fair; never the plain ascending order) and one emoji per box
   * (row i shows faces[i]), without repeats while MIX_FACES lasts.
   */
  function dealMixColumn(column, points) {
    const faces = shuffled(MIX_FACES);
    let order = shuffled(points);
    while (points.length > 1 && order.every((p, i) => p === points[i])) order = shuffled(points);
    column.order = order;
    column.faces = points.map((p, i) => faces[i % faces.length]);
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

  /**
   * US-47 / D-55: send one question's outcome (a STAT value) for the Admin difficulty stats, at most
   * once per question per game. `holder` is the board game or the Streak run: its statsSent list
   * (saved with it, the caller saves) remembers the ids already sent, and a save from before US-47
   * has no list, so it sends nothing. Fire-and-forget: a failed send never interrupts play.
   */
  function sendQuestionStat(holder, questionId, outcome) {
    if (!holder || !Array.isArray(holder.statsSent) || !Number.isInteger(questionId) || questionId < 1 ||
        holder.statsSent.indexOf(questionId) !== -1) return;
    holder.statsSent.push(questionId);
    try {
      fetch(API_BASE + 'question-stats.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ question_id: questionId, outcome: outcome }),
        keepalive: true, // still sent when the page is closed right after the question
      }).catch(() => {});
    } catch (err) {
      // fetch unavailable or the request refused at once: the game goes on without this count
    }
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
    renderTurnBanner(); // US-62
    renderRoomButton(); // US-52
  }

  function renderBoardInfo() {
    const g = state.game;
    const mode = MODES[g.mode];
    const match = isMatch(g) && tourney && tourney.playing ? [matchName(tourney, tourney.playing)] : []; // US-61
    dom.boardInfo.textContent = match.concat([
      tn('board.contestants.' + mode.key, g.contestants.length),
      t('board.size', { cols: g.categories.length, rows: g.points.length }),
      t('board.played', { used: usedCount(g), total: totalCells(g) }),
      t('board.timer', { s: g.timerSeconds }),
      t('board.corrections', { step: String.fromCharCode(0x00b1) + scoreStep() }),
    ]).join('  ' + DOT + '  ');
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
        h('span', { className: 'board-cat-name', text: c.hidden ? '?' : iso(columnName(c)) }),
      ]));
    });
    // US-53: row i of the Kilo Meshakkal column is the box of value order[i] (its emoji is faces[i]).
    g.points.forEach((p, i) => {
      g.categories.forEach((c) => dom.board.appendChild(c.id === MIX ? renderCell(c, c.order[i], c.faces[i]) : renderCell(c, p)));
    });
  }

  /** Board name of a category: a "Surprise me!" pick stays a mystery until one of its questions is opened. */
  function categoryLabel(category) {
    return category.hidden ? t('board.surpriseCat') : iso(columnName(category));
  }

  /**
   * A category name in the interface language: its Arabic name (the API's name_ar, kept as nameAr /
   * catNameAr / category_name_ar) when Arabic is on and it has one, else the English name. Only the
   * label changes: ids, ticks and saved games never depend on it.
   */
  function localName(name, nameAr) {
    return i18n.isArabic() && isFilled(nameAr) ? nameAr : name;
  }

  /**
   * FU-56: the server's board errors name a category in quotes ('Category "Flags" is missing
   * questions for: 300'). The text stays English (D-59 a); in Arabic only a quoted name of a Setup
   * category (or Kilo Meshakkal) becomes its Arabic name, isolated so the English sentence keeps its order.
   */
  function localCategoryNames(text) {
    if (!i18n.isArabic()) return text;
    const playable = state.setup ? state.setup.playable : []; // none after a reload in a tournament (US-61)
    return playable.concat([{ id: MIX, name: MIX_NAME }]).reduce((out, c) => {
      const local = columnName(c);
      return local === c.name ? out : out.split('"' + c.name + '"').join('"' + iso(local) + '"');
    }, text);
  }

  /** A board column's or Setup tile's name; Kilo Meshakkal (US-53) has no DB row, so its names are in the string tables. */
  function columnName(category) {
    return category.id === MIX ? t('cat.mixName') : localName(category.name, category.nameAr);
  }

  /**
   * One board cell: open (clickable) or used (disabled; owner color + name, or grey, US-08). face: the
   * emoji an open Kilo Meshakkal box shows instead of its value (US-53); its label never says the value.
   */
  function renderCell(category, points, face) {
    const g = state.game;
    const key = cellKey(category.id, points);
    const label = h('span', { className: 'cell-points', text: String(points) });
    const cellLabel = t('cell.label', { cat: categoryLabel(category), points: points });
    if (!hasOwn(g.used, key)) {
      const props = {
        type: 'button',
        className: 'board-cell',
        'aria-label': cellLabel,
        'data-cell': key, // US-62: the bot finds the cell it picked
        onclick: (e) => {
          if (isBotTurn(state.game)) return; // US-62: the bot picks on its turn; the board is locked
          openCellWithFx(e.currentTarget, category.id, points);
        },
      };
      if (isBotTurn(g)) props['aria-disabled'] = 'true';
      if (!face) return h('button', props, [label]);
      props['aria-label'] = t('cell.mix', { name: iso(columnName(category)) });
      props.title = props['aria-label'];
      return h('button', props, [h('span', { className: 'cell-points cell-face', text: face, 'aria-hidden': 'true' })]);
    }
    const used = g.used[key];
    const owner = used.owner === null ? null : findContestant(g, used.owner);
    const swap = used.swap;
    const swapName = swap ? localName(swap.catName, swap.catNameAr) : '';
    const double = key === g.double; // D-40: shown once played, with a small "×2" in the corner
    // After a Swap the old value is struck through and the question that replaced it is shown small.
    if (swap) label.classList.add('is-struck');
    const cell = h('button', {
      type: 'button',
      className: 'board-cell is-used ' + (owner ? 'is-owned' : 'is-unanswered') + (double ? ' is-double' : ''),
      disabled: true, // disabled buttons ignore clicks
      'aria-label': cellLabel + (double ? t('cell.double') : '') +
        (swap ? t('cell.swapped', { swap: iso(swapName) + ' ' + EN_DASH + ' ' + swap.points }) : '') +
        (owner ? t('cell.won', { name: iso(owner.name) }) : t('cell.none')),
    }, [
      double ? h('span', { className: 'cell-double', text: TIMES + DOUBLE_FACTOR, 'aria-hidden': 'true' }) : null,
      label,
      swap ? ownDirection(h('span', { className: 'cell-swap', text: swapName + ' ' + EN_DASH + ' ' + swap.points })) : null,
      owner ? ownDirection(h('span', { className: 'cell-owner', text: owner.name })) : null,
    ]);
    if (owner) {
      const color = paletteEntry(owner.color);
      cell.style.backgroundColor = color.value;
      cell.style.color = color.ink;
    }
    return cell;
  }

  /**
   * A one-line label cut with "…" (cell owner, swapped-to category): in Arabic it takes the direction
   * of its own text, so a long Latin name loses its end, not its start (US-49). English: unchanged.
   */
  function ownDirection(node) {
    if (i18n.isArabic()) node.dir = 'auto';
    return node;
  }

  /** US-10 / D-01: prominent End Game offer once every cell is used. */
  function renderBoardDone() {
    const g = state.game;
    const done = allCellsUsed(g);
    dom.boardDone.hidden = !done;
    dom.boardDoneText.textContent = done ? t('board.allPlayed', { n: totalCells(g) }) : '';
  }

  /**
   * End Game: confirm first while cells are still open (D-09); unused cells are ignored. With the
   * final round on (US-44) and a tie for first (D-51), Golden Goal is offered before the results
   * (both End Game buttons, D-26).
   */
  function endGame() {
    const g = state.game;
    if (!g || state.screen !== 'board') return;
    if (!allCellsUsed(g)) {
      const left = totalCells(g) - usedCount(g);
      if (!window.confirm(tn('board.endConfirm', left))) return;
    }
    if (g.finalRound === true && isTiedAtTop(g)) { // D-51: Golden Goal only breaks a tie for first
      openFinalOffer(1, []);  // US-61: always on in a tournament match (D-77 f)
      return;
    }
    if (isMatch(g)) {
      finishMatch('score');   // US-61: the higher score goes through
      return;
    }
    showResults();
  }

  function showResults() {
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
        h('span', { className: 'score-name', text: iso(c.name) }),
        h('button', {
          type: 'button',
          className: 'score-btn score-minus',
          text: MINUS,
          title: signed(MINUS, step),
          'aria-label': t('score.minus', { step: step, name: iso(c.name) }),
          onclick: () => adjust(-step),
        }),
        value,
        h('button', {
          type: 'button',
          className: 'score-btn score-plus',
          text: '+',
          title: signed('+', step),
          'aria-label': t('score.plus', { step: step, name: iso(c.name) }),
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
    const left = HELPER_KEYS.filter((key) => contestant.helpers[key]).map(helperName);
    const text = left.length ? t('helpers.left', { list: left.join(t('list.sep')) }) : t('helpers.none');
    return h('span', { className: 'score-helpers', title: text, hidden: state.game.helpersOff === true || isBot(contestant) }, [ // US-62
      h('span', { className: 'visually-hidden', text: text }),
    ].concat(HELPER_KEYS.map((key) => h('span', {
      className: 'score-helper' + (contestant.helpers[key] ? '' : ' is-used'),
      text: HELPERS[key].chip,
      'aria-hidden': 'true',
    }))));
  }

  // ---------- Question screen (US-11, US-13, US-14) ----------

  let cellOpening = false;

  /** A short pop + flash on the clicked cell (~0.4 s), then the question opens. Instant under reduced motion. */
  function openCellWithFx(cell, categoryId, points) {
    if (cellOpening) return;
    if (!cell || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      openQuestion(categoryId, points);
      return;
    }
    cellOpening = true;
    cell.classList.add('is-opening');
    setTimeout(() => {
      cellOpening = false;
      cell.classList.remove('is-opening');
      openQuestion(categoryId, points);
    }, 400);
  }

  /** US-11: open an unused cell. Used cells are disabled, and this guard ignores them anyway. */
  function openQuestion(categoryId, points) {
    const g = state.game;
    if (!g || state.screen !== 'board' || g.current || hasOwn(g.used, cellKey(categoryId, points))) return;
    g.current = { catId: categoryId, points: points, marks: {}, answerShown: false };
    if (isBotTurn(g)) g.current.botRoll = rollBot(g, categoryId, points); // US-62: rolled once, saved
    const category = findCategory(g, categoryId);
    category.hidden = false; // a "Surprise me!" column shows its name from its first question on
    // Opened = played: later boards in this browser avoid it.
    markSeen(category.questions[String(points)].id);
    const double = isDoubleCurrent(g);
    showQuestion(double); // the double-score popup comes first; reading waits for it (US-48)
    if (double) showDoublePopup();
  }

  /**
   * While a popup (double score, report form) is open, everything behind it is inert: the header
   * links, the game and the footer can't take focus or clicks, so Tab stays in the popup.
   */
  function setPageInert(on) {
    dom.pageBehind.forEach((node) => { node.inert = on; });
  }

  /** D-40: announce the double-score question; its timer waits until the popup is closed. */
  function showDoublePopup() {
    const points = activeQuestion(state.game).points;
    dom.doubleText.textContent = t('double.text', {
      win: signed('+', points * DOUBLE_FACTOR), normal: signed('+', points), loss: signed(MINUS, points),
    });
    pauseTimer();
    stopReading(); // US-48: automatic reading starts once the popup is closed
    dom.doubleOverlay.hidden = false;
    setPageInert(true); // keyboard focus stays on the popup
    dom.doubleOk.focus();
  }

  function closeDoublePopup() {
    if (dom.doubleOverlay.hidden) return;
    dom.doubleOverlay.hidden = true;
    setPageInert(false);
    resumeTimer();
    dom.qHeading.focus();
    autoRead();
    armBotAnswer(); // US-62: on the bot's double-score question it starts thinking now
  }

  /**
   * Render the open question and (re)start its timer at full length (also used on restore, D-04, and
   * after a Swap). holdReading: no automatic reading yet (the double-score popup opens first, US-48).
   */
  function showQuestion(holdReading) {
    const g = state.game;
    const cur = g.current;
    const active = activeQuestion(g);
    const q = active.question;
    setStreakLayout(false);
    setScoringPanelTexts(scoringPanelText());
    renderQuestionHeading(active);
    // Arabic first when the question has an Arabic version; a restored choice is kept.
    if (!hasArabic(q)) cur.lang = 'en';
    else if (cur.lang !== 'en' && cur.lang !== 'ar') cur.lang = 'ar';
    clearMessage(dom.helperMsg);
    renderQuestionImage(q);
    renderQuestionLang(q);
    renderAnswerState(cur.answerShown);
    renderScoringRows();
    showScreen('question'); // also saves the state
    updateReportButton(); // US-42 (needs the question screen): also for a Swap question, the one shown is reported
    startTimer(g.timerSeconds, undefined, onBoardTimeUp);
    dom.qHeading.focus();
    onQuestionShown(holdReading === true); // US-48
    if (holdReading !== true) armBotAnswer(); // US-62 (the double-score popup arms it once closed)
  }

  /** US-47 / D-55 e: the board question's timer reached 0; kept for its outcome (saved, a refresh keeps it). */
  function onBoardTimeUp() {
    const cur = state.game && state.game.current;
    if (!cur || cur.timedOut) return;
    cur.timedOut = true;
    saveState();
  }

  /**
   * US-47 / D-55 e: a board question's outcome, decided once when it closes, from its marks at that
   * moment: anyone Correct, else anyone Wrong, else the timer reached 0, else nobody (also a Skip).
   */
  function boardOutcome(cur) {
    if (correctContestantId(cur) !== null) return STAT.correct;
    if (Object.keys(cur.marks).some((id) => cur.marks[id] === 'wrong')) return STAT.wrong;
    return cur.timedOut === true ? STAT.timeout : STAT.nobody;
  }

  /** The scoring panel's title, hint and Back button: the board's, or the final round's (US-44). */
  function setScoringPanelTexts(texts) {
    dom.scoringTitle.textContent = texts.title;
    dom.scoringHint.textContent = texts.hint;
    dom.backBtn.textContent = texts.back;
    dom.backBtn.disabled = false;
  }

  /**
   * "Category – 300"; a "×2 Double score" badge on the double-score cell (D-40); after a Swap the
   * new question's, with a small "Swapped from History – 300" note.
   */
  function renderQuestionHeading(active) {
    const g = state.game;
    const cur = g.current;
    clear(dom.qHeading);
    dom.qHeading.appendChild(document.createTextNode(iso(active.catName) + ' ' + EN_DASH + ' ' + active.points));
    if (isDoubleCurrent(g)) {
      dom.qHeading.appendChild(h('span', { className: 'question-double', text: t('question.double', { factor: DOUBLE_FACTOR }) }));
    }
    if (cur.swap) {
      const original = findCategory(g, cur.catId);
      dom.qHeading.appendChild(h('span', {
        className: 'question-swap-note',
        text: t('question.swappedFrom', { cat: iso(columnName(original)) + ' ' + EN_DASH + ' ' + cur.points }),
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
    renderTextAndAnswer(q, arabic);
    renderChoices(q, arabic);
    updateSpeakButton(); // US-48: the voice depends on the language shown
  }

  /** Question text, answer and language button of a board or final round question (US-44). */
  function renderTextAndAnswer(q, arabic) {
    renderQuestionText(arabic ? q.question_ar : q.question, arabic);
    dom.answerValue.textContent = arabic ? q.answer_ar : q.answer;
    dom.answerValue.dir = arabic ? 'rtl' : 'ltr';
    dom.answerValue.lang = arabic ? 'ar' : 'en';
    dom.answerValue.translate = !arabic;
    dom.answerText.classList.toggle('is-rtl', arabic);
    renderLangButton(hasArabic(q), arabic);
  }

  /**
   * The question text in its language (board game and Streak Challenge). Arabic text is marked
   * translate="no" (US-40): otherwise Chrome offers "Translate page?" over the question, and in
   * the Android app that sheet also takes the first Back press. The same goes for every Arabic
   * answer, choice and label below.
   */
  function renderQuestionText(text, arabic) {
    dom.qText.textContent = text;
    dom.qText.dir = arabic ? 'rtl' : 'ltr';
    dom.qText.lang = arabic ? 'ar' : 'en';
    dom.qText.translate = !arabic;
    dom.qText.style.setProperty('--q-scale', String(questionScale(text)));
  }

  /**
   * The language button, shown when the question has Arabic; it offers the other language. Its
   * label names the language in that language; the aria-label is in the interface language (US-49),
   * so the button's lang follows the aria-label in the Arabic interface.
   */
  function renderLangButton(available, arabic) {
    dom.langBtn.hidden = !available;
    dom.langBtn.textContent = arabic ? 'English' : 'العربية';
    dom.langBtn.lang = i18n.isArabic() ? 'ar' : (arabic ? 'en' : 'ar');
    dom.langBtn.translate = arabic;
    dom.langBtn.setAttribute('aria-label', arabic ? t('lang.showEnglish') : t('lang.showArabic'));
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
    list.translate = !texts.arabic;
    list.classList.toggle('is-short', texts.options.every((text) => text.length <= CHOICES_SHORT_CHARS));
    cur.choiceOrder.forEach((index, position) => {
      list.appendChild(h('li', { className: 'choice' + (index === 0 ? ' is-answer' : '') }, [
        h('span', { className: 'choice-letter', text: CHOICE_LETTERS[position] }),
        h('span', { className: 'choice-text', text: texts.options[index] }),
      ]));
    });
  }

  function toggleLang() {
    stopReading(); // US-48: the text changes; the speaker reads the new language on the next click
    if (speedOnScreen()) {
      toggleSpeedLang();
      return;
    }
    if (finalOnScreen()) {
      toggleFinalLang();
      return;
    }
    if (dailyOnScreen()) {
      toggleDailyLang();
      return;
    }
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
    refreshBotRows(); // US-62: the bot's answer in the shown language
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

  function renderAnswerState(shown) {
    dom.answerBtn.hidden = shown;
    dom.answerText.hidden = !shown;
    dom.qChoices.classList.toggle('is-revealed', shown); // the right choice turns green
  }

  function showAnswer() {
    if (finalOnScreen()) {
      showFinalAnswer();
      return;
    }
    const cur = state.game && state.game.current;
    if (!cur) return;
    cur.answerShown = true;
    renderAnswerState(true);
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
      const name = h('span', { className: 'srow-name', text: iso(c.name) });
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
          text: t('score.correctBtn', { amount: signed('+', win) }),
          'aria-label': t('score.correctLabel', { name: iso(c.name), n: win }) + (win !== p ? t('score.doubleNote') : ''),
          onclick: () => markContestant(c, 'correct'),
        }),
        wrong: h('button', {
          type: 'button',
          className: 'btn btn-wrong',
          text: t('score.wrongBtn', { amount: signed(MINUS, p) }),
          'aria-label': t('score.wrongLabel', { name: iso(c.name), n: p }),
          onclick: () => markContestant(c, 'wrong'),
        }),
      };
      const bot = isBot(c);
      const chips = h('span', { className: 'srow-helpers', hidden: g.helpersOff === true || bot }, // US-62: no helpers for the bot
        HELPER_KEYS.map((key) => helperBtns[key]));
      ref.note = h('span', { className: 'srow-note', 'aria-live': 'polite' }); // US-62: bot match only
      ref.row = h('li', { className: 'srow' + (bot ? ' is-bot' : '') }, [name, chips, ref.score, ref.status, ref.correct, ref.wrong, ref.note]);
      ref.row.style.borderInlineStartColor = color.value; // the left edge; the right one in Arabic
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
      const who = { name: iso(ref.contestant.name) };
      ref.status.textContent = mark === 'correct' ? t('score.markedCorrect', who)
        : mark === 'wrong' ? t('score.markedWrong', who) : '';
      HELPER_KEYS.forEach((helper) => updateHelperChip(ref, helper));
      updateBotRow(ref, mark, cur);
    });
    dom.backBtn.disabled = botAnswerPending(state.game); // US-62: the bot's question closes once it is scored
  }

  /** Enable a helper chip only when its contestant may use it now; the tooltip says why not. */
  function updateHelperChip(ref, key) {
    const chip = ref.helpers[key];
    const name = helperName(key);
    const reason = helperBlockReason(ref.contestant, key);
    const busy = swapping === ref.contestant.id && key === 'swap';
    chip.disabled = reason !== '';
    chip.classList.toggle('is-used', !ref.contestant.helpers[key] && !busy);
    chip.classList.toggle('is-busy', busy);
    chip.textContent = busy ? ELLIPSIS : HELPERS[key].chip;
    chip.title = name + (reason ? ': ' + reason : '');
    const who = { helper: name, name: iso(ref.contestant.name), reason: reason };
    chip.setAttribute('aria-label', reason ? t('helper.chipLabelReason', who) : t('helper.chipLabel', who));
  }

  /** Why `contestant` cannot use helper `key` on the open question now, or '' when they can (D-36). */
  function helperBlockReason(contestant, key) {
    const g = state.game;
    const cur = g.current;
    if (g.helpersOff) return t('helper.off');
    if (isBot(contestant)) return t('helper.notBot'); // US-62: the bot never uses helpers
    if (g.turn !== undefined && g.turn !== contestant.id) {
      return t('score.botQuestion', { name: iso(findContestant(g, g.turn).name) });
    }
    if (swapping !== null) {
      return swapping === contestant.id && key === 'swap' ? t('helper.loading') : t('helper.waitSwap');
    }
    if (!contestant.helpers[key]) return t('helper.used');
    if (cur.answerShown) return t('helper.afterAnswer');
    if (Object.keys(cur.marks).length) return t('helper.afterScore');
    if (cur.by !== undefined && cur.by !== contestant.id) {
      return t('helper.onlyBy', { name: iso(findContestant(g, cur.by).name) });
    }
    if (key === 'choices' && !hasChoices(activeQuestion(g).question)) return t('helper.noChoices');
    return '';
  }

  /** Apply a Correct / Wrong mark. No undo inside a question (D-06): use the board's +/- buttons. */
  function markContestant(contestant, result, byBot) {
    const cur = state.game && state.game.current;
    if (!cur || swapping !== null) return;
    // US-62: in a bot match only the contestant on turn is scored, and the bot only by itself
    if (state.game.turn !== undefined && state.game.turn !== contestant.id) return;
    if (isBot(contestant) && byBot !== true) return;
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
    const ref = scoringRows.find((r) => r.contestant === contestant);
    if (ref) playResultFx(result === 'correct' ? ref.correct : ref.wrong, result);
    if (byBot !== true) focusNextScoringButton(); // the bot's own mark never moves the host's focus
  }

  /** Short sparks (correct) / boom (wrong) around the clicked button; purely visual, never saved. */
  function playResultFx(btn, result) {
    const cls = result === 'correct' ? 'fx-spark' : 'fx-boom';
    btn.classList.remove('fx-spark', 'fx-boom');
    void btn.offsetWidth; // restart the animation if it is already running
    btn.classList.add(cls);
    setTimeout(() => btn.classList.remove(cls), 1300);
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
    const who = iso(contestant.name);
    const points = activeQuestion(state.game).points;
    const ask = t('helper.ask', { helper: helperName(key), name: who });
    if (key === 'skip') {
      return ask + t('helper.askSkip', { name: who, half: Math.round(points / 2), points: points });
    }
    const what = key === 'swap' ? t('helper.askSwap') : t('helper.askChoices');
    return ask + what + t('helper.askOnly', { name: who });
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
    let failure = null; // a function giving the message (shown again after a language switch)
    try {
      swap = parseSwap(await apiPost('questions.php?random=1', { exclude: boardQuestionIds(g), seen: loadSeen() }));
    } catch (err) {
      failure = () => t('swap.failed', { reason: sentence(errorText(err)) });
    }
    swapping = null;
    if (state.game !== g || g.current !== cur) { // the question was closed meanwhile: drop the result
      if (state.game && state.game.current) updateScoringRows();
      return;
    }
    if (!failure && cur.answerShown) failure = () => t('swap.answerShown');
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
    delete cur.timedOut; // US-47: the swapped-away question is not counted; the new one has its own timer
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

  /**
   * Ids of the questions the Swap helper brought into this game (FU-35), from the closed cells and
   * the open question. Cells closed in a save from before FU-35 have no id and add nothing.
   */
  function swapQuestionIds(g) {
    const ids = [];
    Object.keys(g.used).forEach((key) => {
      const swap = g.used[key].swap;
      if (swap && Number.isInteger(swap.id)) ids.push(swap.id);
    });
    if (g.current && g.current.swap) ids.push(g.current.swap.question.id);
    return ids;
  }

  /** Check the random-question payload; returns the saved `swap` shape or throws. */
  function parseSwap(data) {
    const ok = isPlainObject(data) && isPlainObject(data.category) && Number.isInteger(data.category.id) &&
      typeof data.category.name === 'string' && Number.isInteger(data.points) && data.points > 0 &&
      isValidQuestion(data.question) && Number.isInteger(data.question.id);
    if (!ok) throw textError('err.question');
    return {
      catId: data.category.id,
      catName: data.category.name,
      catNameAr: isFilled(data.category.name_ar) ? data.category.name_ar : null,
      points: data.points,
      question: parseQuestion(data.question),
    };
  }

  /** Keep keyboard focus on the scoring panel after the clicked button disables. */
  function focusNextScoringButton() {
    const next = dom.scoreRows.querySelector('button:not(:disabled)');
    (next || dom.backBtn).focus();
  }

  /**
   * US-13: stop the timer, mark the cell used (owner = the Correct contestant, else grey). US-47: the
   * question on screen (the Swap one after a Swap) sends its outcome; later +/- corrections don't.
   */
  function backToBoard() {
    const g = state.game;
    const cur = g && g.current;
    if (!cur || botAnswerPending(g)) return; // US-62: the bot's question closes once it is scored
    stopTimer();
    // US-62 (D-78 dev choice): the bot's own questions are not counted, its answers are dice rolls
    if (!isBotTurn(g)) sendQuestionStat(g, activeQuestion(g).question.id, boardOutcome(cur)); // saved below with the cell
    const cell = { owner: correctContestantId(cur) };
    // A Swap replaced the question: the board shows the old value struck through and the new one small.
    // The id lets Golden Goal skip it too (FU-35).
    if (cur.swap) {
      cell.swap = { catName: cur.swap.catName, catNameAr: cur.swap.catNameAr, points: cur.swap.points, id: cur.swap.question.id };
    }
    g.used[cellKey(cur.catId, cur.points)] = cell;
    g.current = null;
    if (g.turn !== undefined) g.turn = otherContestant(g, g.turn).id; // US-62: the turn passes after every question
    renderGame();
    showScreen('board'); // also saves the state
    if (allCellsUsed(g)) dom.boardDoneBtn.focus();
    armBotTurn(); // US-62
  }

  // ---------- Timer (US-12) ----------

  function now() {
    return window.performance && performance.now ? performance.now() : Date.now();
  }

  /**
   * Start the countdown at full length. The Streak Challenge passes the time left until its saved
   * deadline (so a refresh keeps it) and onExpire, which ends the run at 0. lowMs: see `timer`.
   */
  function startTimer(seconds, remainingMs, onExpire, lowMs) {
    stopTimer();
    timer.totalMs = seconds * 1000;
    timer.remainingMs = remainingMs === undefined ? timer.totalMs : Math.max(0, Math.min(remainingMs, timer.totalMs));
    timer.onExpire = onExpire || null;
    timer.lowMs = lowMs === undefined ? null : lowMs;
    setTimeUp(false);
    resumeTimer();
  }

  /** A stopped countdown showing `remainingMs` (a streak question that was already answered). */
  function showTimerAt(seconds, remainingMs, lowMs) {
    stopTimer();
    timer.totalMs = seconds * 1000;
    timer.remainingMs = Math.max(0, Math.min(remainingMs, timer.totalMs));
    timer.onExpire = null;
    timer.lowMs = lowMs === undefined ? null : lowMs;
    renderTimer();
  }

  /**
   * Move the end of the countdown by `ms` (Speed Round, US-59: plus for a fast right answer, minus for
   * a wrong one), running or stopped, kept between 0 and the full length.
   */
  function extendDeadline(ms) {
    const left = timer.running ? timer.endAt - now() : timer.remainingMs;
    timer.remainingMs = Math.max(0, Math.min(left + ms, timer.totalMs));
    if (timer.running) timer.endAt = now() + timer.remainingMs;
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
      setTimeUp(true);
    }
    renderTimer();
    if (expired && timer.onExpire) timer.onExpire(); // Streak Challenge: time's up ends the run
  }

  function renderTimer() {
    const fraction = timer.totalMs > 0 ? timer.remainingMs / timer.totalMs : 0;
    dom.timerValue.textContent = String(Math.ceil(timer.remainingMs / 1000));
    dom.timerBar.style.transform = 'scaleX(' + fraction + ')';
    // red in the last third, or under lowMs (Speed Round)
    dom.timerBox.classList.toggle('is-low', timer.lowMs !== null ? timer.remainingMs < timer.lowMs
      : timer.remainingMs <= timer.totalMs / 3);
    dom.timerPause.textContent = timer.running || timer.remainingMs <= 0 ? t('timer.pause') : t('timer.resume');
    dom.timerPause.disabled = timer.remainingMs <= 0;
  }

  /** The "Time's up!" line under the timer, shown or cleared. */
  function setTimeUp(on) {
    setText(dom.timerStatus, on ? () => t('timer.up') : '');
  }

  function onPauseClick() {
    if (!state.game) return; // no Pause in the Streak Challenge
    if (timer.running) pauseTimer();
    else resumeTimer();
  }

  function onResetClick() {
    if (!state.game) return;
    if (state.game.current) startTimer(state.game.timerSeconds, undefined, onBoardTimeUp); // US-47
    else if (finalOnScreen()) startTimer(state.game.timerSeconds);
  }

  // ---------- Results (US-15, US-16) ----------

  /** Score descending; equal scores keep the setup order. */
  function rankedContestants(g) {
    return g.contestants
      .map((c, index) => ({ c: c, index: index }))
      .sort((a, b) => (b.c.score - a.c.score) || (a.index - b.index))
      .map((item) => item.c);
  }

  /** D-10: everyone on the top score (several = a tie), in setup order. Results, Share and Golden Goal use it. */
  function topContestants(g) {
    const ranked = rankedContestants(g);
    return ranked.filter((c) => c.score === ranked[0].score);
  }

  function renderResults() {
    const ranked = rankedContestants(state.game);
    const top = ranked[0].score;
    const winners = topContestants(state.game);
    dom.resultsWinner.textContent = winners.length === 1
      ? t('results.wins', { name: iso(winners[0].name) })
      : t('results.tie', { names: joinNames(winners.map((c) => c.name)) });
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
        h('span', { className: 'result-name', text: iso(c.name) }),
        isWinner ? h('span', { className: 'result-badge', text: t('results.winner') }) : null,
        h('span', { className: 'result-score', text: formatScore(c.score) }),
      ]);
      row.style.borderInlineStartColor = paletteEntry(c.color).value; // the left edge; the right one in Arabic
      dom.resultsList.appendChild(row);
    });
    dom.resultsShareStatus.textContent = '';
  }

  // ---------- Share (US-43, US-46) ----------

  /**
   * Share `text` plus the site link through js/share.js: the phone's share sheet, or the clipboard
   * with "Copied" in `status`. Without the module (it failed to load) the status says so.
   */
  function shareText(text, status) {
    const sharer = window.BrainRushShare;
    if (!sharer || typeof sharer.share !== 'function') {
      status.textContent = t('share.unavailable');
      return;
    }
    sharer.share(text, status).catch(() => { status.textContent = t('share.failed'); });
  }

  /**
   * US-46: "Team Red won Mokh Rush with 2300! Team Blue 1800, Team Green 900." A tie uses the D-10
   * wording: "It's a tie between Team Red and Team Blue in Mokh Rush with 2300 each!" and the rest.
   * Scores use the same minus sign as the screen. In Arabic the text is Arabic too (US-49).
   */
  function resultsShareText(g) {
    const ranked = rankedContestants(g);
    const top = ranked[0].score;
    const winners = topContestants(g);
    const others = ranked.filter((c) => c.score !== top).map((c) => iso(c.name) + ' ' + formatScore(c.score));
    const head = winners.length === 1
      ? t('share.won', { name: iso(winners[0].name), score: formatScore(top) })
      : t('share.tie', { names: joinNames(winners.map((c) => c.name)), score: formatScore(top) });
    return others.length ? head + ' ' + others.join(t('list.sep')) + '.' : head;
  }

  function onResultsShare() {
    if (!state.game || state.screen !== 'results') return;
    shareText(resultsShareText(state.game), dom.resultsShareStatus);
  }

  /** US-16 / D-15: clear the saved game and show an empty Setup with settings reloaded. */
  function newGame() {
    stopTimer();
    stopPhone(); // US-52: the room is left to expire (6 h)
    state.game = null;
    clearSavedState();
    tourney = null; // US-61: End tournament / New game
    clearTournament();
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
    renderControlBlock(); // US-52
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
    if (INTEGRATION) return; // no normal game to go back to
    state.setup.streak = false;
    clearMessage(dom.startMsg);
    renderSetupMode();
    dom.streakOpenBtn.focus();
  }

  /** message: '' (none), a string, or a function giving it (see setText). */
  function setFieldError(input, errorNode, message) {
    setText(errorNode, message);
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
    return validateNameField(dom.streakNameInput, dom.streakNameError);
  }

  /** A challenger name field (Streak setup, Speed name step): the same rules and inline error. */
  function validateNameField(input, errorNode) {
    const name = cleanName(input.value);
    const message = !name ? () => t('streak.nameRequired')
      : name.length > NAME_MAX ? () => t('streak.nameTooLong', { max: NAME_MAX }) : '';
    setFieldError(input, errorNode, message);
    return message === '';
  }

  /** The name last used in a Streak or Speed run on this device (US-60), or ''. */
  function loadChallengerName() {
    try {
      const name = window.localStorage.getItem(CHALLENGER_KEY);
      return isValidStreakName(name) ? cleanName(name) : '';
    } catch (err) {
      return '';
    }
  }

  function saveChallengerName(name) {
    try {
      window.localStorage.setItem(CHALLENGER_KEY, name);
    } catch (err) {
      // storage full or disabled: the next name step is prefilled from the players instead
    }
  }

  /** Start a run from the setup screen: name and timer checked like the board game's (no categories). */
  async function onStreakStart() {
    const s = state.setup;
    if (!s || !s.streak || dom.streakBtn.disabled) return;
    clearMessage(dom.startMsg);
    const nameOk = validateStreakName();
    const timerSeconds = validateTimer();
    if (!nameOk || timerSeconds === null) {
      showMessage(dom.startMsg, () => t(INTEGRATION ? 'iq.fix' : 'streak.fix'), 'error');
      const target = [dom.streakNameInput, dom.timerInput]
        .find((input) => input.getAttribute('aria-invalid') === 'true');
      if (target) target.focus();
      return;
    }
    s.starting = true;
    dom.streakBtn.textContent = t('setup.starting');
    updateStartButton();
    try {
      await startStreakRun({
        name: cleanName(dom.streakNameInput.value),
        color: s.entries[0].color,
        timerSeconds: timerSeconds,
      });
    } catch (err) {
      // Stay on setup with every input intact (as US-06).
      showMessage(dom.startMsg, () => t(INTEGRATION ? 'iq.failed' : 'streak.failed', { reason: errorText(err) }), 'error');
    } finally {
      s.starting = false;
      dom.streakBtn.textContent = t(STREAK_START);
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
      if (isValidStreak(saved)) {
        if (saved.chances === undefined) upgradeChances(saved);
        return saved;
      }
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
        !isOptionalText(q.category_name_ar) || !Number.isInteger(q.points) || q.points < 1 || typeof q.question !== 'string' ||
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
      isValidStatsSent(run.statsSent) && // US-47
      (run.secondChanceUsed === undefined || typeof run.secondChanceUsed === 'boolean') && // US-54 (older saves lack it)
      (run.chances === undefined || isValidChances(run.chances, run.count)) && // US-57 (older saves lack it)
      isValidStreakCurrent(run.current, run);
  }

  // ---------- Earned second chances (US-57, D-69) ----------

  /**
   * The run's chances {earned, used, progress, earnedAt}: `earnedAt` is the streak when the last chance
   * was earned (0 = none, or a US-54 save). A US-54 save (`secondChanceUsed`) had its free chance: it
   * counts as earned (used or not) with the counter at 0; a save older than US-54 has none.
   */
  function runChances(run) {
    if (isPlainObject(run.chances)) return run.chances;
    if (typeof run.secondChanceUsed === 'boolean') {
      return { earned: 1, used: run.secondChanceUsed ? 1 : 0, progress: 0, earnedAt: 0 };
    }
    return { earned: 0, used: 0, progress: 0, earnedAt: 0 };
  }

  /** This right answer earned a chance ("+1 second chance!"): derived, so a refresh shows it too. */
  function justEarnedChance(run) {
    const cur = run.current;
    const chances = runChances(run);
    return !INTEGRATION && !!cur && cur.picked === cur.q.correct && chances.earned > 0 && chances.earnedAt === run.count;
  }

  /** An older save gets its chances and is saved again in the new shape. */
  function upgradeChances(run) {
    run.chances = runChances(run);
    delete run.secondChanceUsed;
    try {
      window.localStorage.setItem(STREAK_KEY, JSON.stringify(run));
    } catch (err) {
      // storage full or disabled: it is saved with the next change
    }
  }

  /** Correct answers needed for the next chance: 5, then 10; null once both are earned. */
  function chanceGoal(chances) {
    if (chances.earned >= CHANCE_MAX) return null;
    return chances.earned === 0 ? CHANCE_FIRST_AT : CHANCE_NEXT_AFTER;
  }

  /** Second chances the player still holds. */
  function chancesLeft(run) {
    const chances = runChances(run);
    return chances.earned - chances.used;
  }

  /**
   * Whole numbers, 0 <= used <= earned <= 2, 0 <= progress < goal (0 once both are earned), and the
   * counter never holds more right answers than the streak has since the last chance was earned.
   */
  function isValidChances(c, count) {
    const whole = (v) => Number.isInteger(v) && v >= 0;
    if (!isPlainObject(c) || !whole(c.earned) || !whole(c.used) || !whole(c.progress) || !whole(c.earnedAt) ||
        c.used > c.earned || c.earned > CHANCE_MAX || c.earnedAt > count) return false;
    if (c.earned === 0 ? c.earnedAt !== 0 : (c.earnedAt !== 0 && c.earnedAt < CHANCE_FIRST_AT)) return false;
    if (c.progress > count - c.earnedAt) return false;
    const goal = chanceGoal(c);
    return goal === null ? c.progress === 0 : c.progress < goal;
  }

  /** A correct answer moves the counter on; reaching the goal earns a chance. Returns true when it does. */
  function countTowardChance(run) {
    if (INTEGRATION) return false;
    const chances = run.chances;
    const goal = chanceGoal(chances);
    if (goal === null) return false;
    chances.progress += 1;
    if (chances.progress < goal) return false;
    chances.earned += 1;
    chances.progress = 0;
    chances.earnedAt = run.count;
    return true;
  }

  /** The open question: one of the run's, a known language and pick, and a wrong pick only in an ended run. */
  function isValidStreakCurrent(cur, run) {
    if (cur === null) return true;
    if (!isPlainObject(cur) || !isValidStreakQuestion(cur.q) || run.usedIds.indexOf(cur.q.id) === -1) return false;
    const langOk = cur.lang === 'en' || (cur.lang === 'ar' && isFilled(cur.q.question_ar));
    const pickedOk = cur.picked === null || cur.picked === STREAK_TIME_UP ||
      (Number.isInteger(cur.picked) && cur.picked >= 0 && cur.picked < CHOICE_LETTERS.length);
    const lost = cur.picked !== null && cur.picked !== cur.q.correct;
    return langOk && pickedOk && Number.isFinite(cur.deadline) &&
      (!lost || run.over || (!INTEGRATION && chancesLeft(run) > 0)) && // US-54: a miss may wait for the choice
      (cur.leftMs === undefined || (Number.isFinite(cur.leftMs) && cur.leftMs >= 0));
  }

  /** The fields the game keeps of a streak question checked by isValidStreakQuestion. */
  function parseStreakQuestion(q) {
    const arabic = isFilled(q.question_ar);
    return {
      id: q.id,
      category_name: q.category_name,
      category_name_ar: isFilled(q.category_name_ar) ? q.category_name_ar : null,
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
    return state.screen === 'question' && !state.game && !!streak && !!streak.current && !speedOnScreen();
  }

  /**
   * Up to 20 questions from every category, none of `exclude`, unseen first (the Integration Quiz:
   * its own questions in random order; the played list holds public ids only). Throws on errors.
   */
  /**
   * A batch from the Streak pool. useSeen = false (Speed Round, D-73 ac) sends no played-questions
   * list, so the server picks at random from everything except `exclude` (this run's questions).
   */
  async function fetchStreakBatch(exclude, useSeen = true) {
    const data = INTEGRATION
      ? await apiPost('integration-quiz.php?batch=1', { exclude: exclude })
      : await apiPost('questions.php?streak=1', useSeen ? { exclude: exclude, seen: loadSeen() } : { exclude: exclude });
    if (!isPlainObject(data) || !Array.isArray(data.questions) ||
        !data.questions.every((q) => isValidStreakQuestion(q))) {
      throw textError('err.questions');
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
    if (!questions.length) throw textError('err.noQuestions');
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
      statsSent: [], // US-47
      chances: { earned: 0, used: 0, progress: 0, earnedAt: 0 }, // US-57: none at the start, earned by right answers
    };
    lastStreakProfile = profile;
    if (!INTEGRATION) {
      markSoloRun('streak'); // US-59: the newest solo run is the one a reload brings back
      saveChallengerName(profile.name); // US-60: the Speed name step offers it next
    }
    addToQueue(streak, questions);
    postGameLog({ mode: INTEGRATION ? 'integration' : 'streak', players: [streak.name] });
    nextStreakQuestion();
  }

  /**
   * Open the next question (waiting for the next batch when the queue is empty).
   * `useChance` (US-54): this question replaces a missed one; the chance counts as used only once it opens.
   */
  async function nextStreakQuestion(useChance) {
    const run = streak;
    if (!run || run.over) return;
    if (!run.queue.length) {
      setStreakLoading(true, useChance);
      let failure = null;
      try {
        await requestStreakBatch(run);
      } catch (err) {
        failure = err;
      }
      if (streak !== run || run.over) return; // ended (End run) while loading
      setStreakLoading(false);
      if (!run.queue.length) {
        if (failure) {
          showStreakFeedback(t(useChance ? 'streak.nextFailedChance' : 'streak.nextFailed', { reason: sentence(errorText(failure)) }), 'is-bad');
          if (isChancePopupOpen()) fillChancePopup(); // the popup shows the failure too
          return;
        }
        run.over = true; // every question was played in this run: it ends with the full streak
        finishStreak();
        return;
      }
    }
    const q = run.queue.shift();
    run.usedIds.push(q.id);
    if (useChance) { // US-57: the chance is spent and the counter starts again
      run.chances.used += 1;
      run.chances.progress = 0;
      chanceFx = { kind: 'lose', left: chancesLeft(run) }; // the emptied heart breaks
    }
    run.current = {
      q: q,
      lang: isFilled(q.question_ar) ? 'ar' : 'en', // Arabic first, as on the board
      deadline: Date.now() + run.timerSeconds * 1000,
      picked: null,
    };
    // D-75: a Streak question is not added to the played list (it still skips the ones played on the board)
    saveStreak();
    showStreakQuestion();
    refillStreak(run);
  }

  /** The streak layout of the question screen: the streak panel replaces scoring, answer and Pause/Reset (CSS). */
  function setStreakLayout(on) {
    dom.screens.question.classList.toggle('streak', on);
    dom.screens.question.classList.remove('speed', 'is-waiting'); // the Speed Round sets them after (US-59)
    dom.speedDelta.hidden = true;
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
    closeChancePopup(); // US-54: the new question after a second chance replaces the popup
    setStreakLayout(true);
    renderRunHeading(q);
    renderQuestionImage(q);
    renderStreakLang();
    renderStreakPanel();
    showScreen('question');
    updateReportButton(); // US-42 (needs the question screen): only once the question is answered
    onQuestionShown(cur.picked !== null); // US-48: an answered question (after a refresh) is not read again
    if (cur.picked !== null) {
      showTimerAt(run.timerSeconds, cur.leftMs || 0);
      setTimeUp(cur.picked === STREAK_TIME_UP);
      focusStreakAction();
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

  /** "Category – 300" above a Streak or Daily Challenge question (also the Report form's label). */
  function runHeading(q) {
    return iso(localName(q.category_name, q.category_name_ar)) + ' ' + EN_DASH + ' ' + q.points;
  }

  /** The question's heading; the Integration Quiz has no categories or points: "Question 4". */
  function renderRunHeading(q) {
    dom.qHeading.textContent = INTEGRATION
      ? t('iq.question', { n: streak.usedIds.indexOf(q.id) + 1 })
      : runHeading(q);
  }

  /** Question text, language button and choices in the open question's language. */
  function renderStreakLang() {
    renderRunLang(streak.current.q, streak.current, streakAnswer);
  }

  /**
   * A solo run's question (Streak or Daily Challenge): text, language button and choice buttons in
   * cur.lang. `q` has the Streak question shape; onPick(index) answers it.
   */
  function renderRunLang(q, cur, onPick) {
    const arabic = cur.lang === 'ar';
    renderQuestionText(arabic ? q.question_ar : q.question, arabic);
    renderLangButton(isFilled(q.question_ar), arabic);
    renderRunChoices(q, cur, onPick);
    updateSpeakButton(); // US-48: the voice depends on the language shown
  }

  function toggleStreakLang() {
    const cur = streak.current;
    if (!isFilled(cur.q.question_ar)) return;
    cur.lang = cur.lang === 'ar' ? 'en' : 'ar';
    renderStreakLang();
    renderStreakPanel(); // the feedback names the right answer in the shown language
    saveStreak();
  }

  function renderStreakChoices() {
    renderRunChoices(streak.current.q, streak.current, streakAnswer);
  }

  /** 3 choice buttons, A/B/C in the server's order. Once answered: the right one green, a wrong pick red. */
  function renderRunChoices(q, cur, onPick) {
    const arabic = cur.lang === 'ar';
    const answered = cur.picked !== null;
    const list = dom.streakChoices;
    clear(list);
    list.dir = arabic ? 'rtl' : 'ltr';
    list.lang = arabic ? 'ar' : 'en';
    list.translate = !arabic;
    q.choices.forEach((choice, index) => {
      const isRight = answered && index === q.correct;
      const isWrong = answered && index === cur.picked && !isRight;
      const text = arabic ? choice.text_ar : choice.text;
      const note = isRight ? t('choice.right') : isWrong ? t('choice.yours') : '';
      list.appendChild(h('li', {}, [
        h('button', {
          type: 'button',
          className: 'choice streak-choice' + (isRight ? ' is-right' : '') + (isWrong ? ' is-wrong' : ''),
          disabled: answered,
          'aria-label': CHOICE_LETTERS[index] + ': ' + text + note,
          onclick: () => onPick(index),
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
    const texts = streakPanelText();
    setRunPanelTexts(texts.title, texts.label, texts.hint);
    dom.streakName.textContent = iso(run.name);
    dom.streakName.style.borderInlineStartColor = paletteEntry(run.color).value; // the right edge in Arabic
    dom.streakCount.textContent = String(run.count);
    renderChanceCounter(run);
    if (cur.picked === null) {
      showStreakFeedback('', '');
    } else if (!lost) {
      showStreakFeedback(t(justEarnedChance(run) ? 'streak.correctChance' : 'streak.correct', { n: run.count }), 'is-good');
    } else {
      showWrongFeedback(cur.q, cur);
    }
    renderStreakButtons();
  }

  /**
   * US-57 (CR hearts): "Next chance: 3/5" and CHANCE_MAX hearts under the streak count, red for each chance
   * held and gray for the rest (not earned yet, or used). The counter is gone once both chances are
   * earned. Not in the Integration Quiz. The line is only rebuilt when it changes, so the live region
   * announces a change once; an earn or a use (chanceFx) animates the heart that changed.
   */
  function renderChanceCounter(run) {
    const line = dom.streakChances;
    line.hidden = INTEGRATION;
    if (INTEGRATION) return;
    const chances = runChances(run);
    const goal = chanceGoal(chances);
    const left = chancesLeft(run);
    const label = t('chance.hearts', { n: left, max: CHANCE_MAX });
    const next = goal === null ? '' : t('chance.next', { count: ltr(chances.progress + '/' + goal) });
    // reduced motion plays no animation, so no class is added (no animationend would ever remove it)
    const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fx = chanceFx && chanceFx.left === left && !still ? chanceFx.kind : null;
    chanceFx = null;
    const key = left + '|' + label + '|' + next;
    if (!fx && line.getAttribute('data-shown') === key) return;
    line.setAttribute('data-shown', key);
    clear(line);
    if (next) line.appendChild(h('span', { className: 'streak-chances-next', text: next }));
    line.appendChild(chanceHearts(left, label, fx));
  }

  /** The hearts (role img, one label); red ones first, so they fill from the start side (the right in Arabic). */
  function chanceHearts(left, label, fx) {
    const group = h('span', { className: 'chance-hearts', 'aria-label': label });
    group.setAttribute('role', 'img');
    for (let i = 0; i < CHANCE_MAX; i += 1) {
      const heart = heartIcon();
      const fxClass = fx === 'gain' && i === left - 1 ? ' fx-gain' : fx === 'lose' && i === left ? ' fx-lose' : '';
      heart.setAttribute('class', 'chance-heart' + (i < left ? ' is-on' : '') + fxClass);
      // played once: dropping the class keeps it from playing again when the line is shown again
      if (fxClass) {
        heart.addEventListener('animationend', (event) => {
          if (event.target === heart) heart.classList.remove('fx-gain', 'fx-lose'); // not a child's end
        });
      }
      group.appendChild(heart);
    }
    return group;
  }

  /** One heart: the shape, a shine (red hearts only) and a crack (only while it breaks), all coloured by CSS. */
  function heartIcon() {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    [['heart-shape', 'M12 21s-7.6-4.6-9.7-9.4C.8 8.2 3 4.4 6.7 4.4c2.1 0 3.7 1.1 4.6 2.7.9-1.6 2.5-2.7 4.6-2.7 3.7 0 5.9 3.8 4.4 7.2C19.6 16.4 12 21 12 21z'],
      ['heart-shine', 'M6.4 7.2c-1.4.3-2.2 1.6-2 3 .1.5.8.6 1 .1.3-.9.9-1.6 1.7-1.9.6-.2.4-1.3-.7-1.2z'],
      ['heart-crack', 'M12.3 7.6l-1.9 3.6 2.8 2-2.1 3.9']].forEach((part) => {
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('class', part[0]);
      path.setAttribute('d', part[1]);
      svg.appendChild(path);
    });
    return svg;
  }

  /** US-54: a miss in a run that still holds a second chance (US-57) waits for the player's choice. */
  function isStreakPending(run) {
    const cur = run && run.current;
    return !INTEGRATION && !!cur && !run.over && chancesLeft(run) > 0 &&
      cur.picked !== null && cur.picked !== cur.q.correct;
  }

  /** Next / See results and End run. A pending miss (a chance held) shows neither: the second-chance popup holds the choice. */
  function renderStreakButtons() {
    const run = streak;
    const cur = run.current;
    const lost = cur.picked !== null && cur.picked !== cur.q.correct;
    dom.streakNext.hidden = cur.picked === null || isStreakPending(run);
    dom.streakNext.textContent = lost ? t('run.seeResults') : t('run.next');
    dom.streakNext.disabled = finishing;
    dom.streakEnd.hidden = lost;
    dom.streakEnd.disabled = finishing;
    if (isChancePopupOpen()) fillChancePopup(); // a language change or a failed load updates the open popup
  }

  // ---------- Second chance popup (US-54), built like the double-score popup ----------

  function isChancePopupOpen() {
    return !!dom.chanceOverlay && !dom.chanceOverlay.hidden;
  }

  /** The missed question's feedback (right answer included), the streak that stays and the two choices. */
  function fillChancePopup() {
    clear(dom.chanceFeedback);
    Array.from(dom.streakFeedback.childNodes).forEach((node) => dom.chanceFeedback.appendChild(node.cloneNode(true)));
    const left = chancesLeft(streak); // US-57: 1 or 2
    dom.chanceText.textContent = streak.count > 0
      ? tn('chance.text', left, { streak: streak.count }) : tn('chance.textNone', left);
    dom.chanceUse.textContent = t('streak.secondChance');
    dom.chanceEnd.textContent = t('run.seeResults');
    dom.chanceUse.disabled = finishing;
    dom.chanceEnd.disabled = finishing;
  }

  /** After a miss with a chance held: the player must choose; everything behind the popup is inert. */
  function openChancePopup() {
    if (!dom.chanceOverlay || isChancePopupOpen() || !isStreakPending(streak)) return;
    fillChancePopup();
    stopReading();
    dom.chanceOverlay.hidden = false;
    setPageInert(true); // keyboard focus stays on the popup
    dom.chanceUse.focus();
  }

  function closeChancePopup() {
    if (!isChancePopupOpen()) return;
    dom.chanceOverlay.hidden = true;
    setPageInert(false);
  }

  /** Focus the main action of the answered question: the popup after a pending miss, else Next (Enter goes on). */
  function focusStreakAction() {
    if (isStreakPending(streak)) openChancePopup();
    else dom.streakNext.focus();
  }

  /** The panel's hidden heading, the count's label and the hint (Streak or Daily Challenge). */
  function setRunPanelTexts(title, label, hint) {
    dom.streakPanelTitle.textContent = title;
    dom.streakCountLabel.textContent = label;
    dom.streakHint.textContent = hint;
  }

  /** "Wrong! The right answer was B, Ottawa." (or "Time's up! …") in the question's shown language. */
  function showWrongFeedback(q, cur) {
    const right = q.choices[q.correct];
    const arabic = cur.lang === 'ar';
    showStreakFeedback((cur.picked === STREAK_TIME_UP ? t('timer.up') : t('run.wrong')) +
      t('run.rightWas', { letter: CHOICE_LETTERS[q.correct] }), 'is-bad',
      { text: arabic ? right.text_ar : right.text, arabic: arabic });
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
        translate: !answer.arabic,
      }));
      dom.streakFeedback.appendChild(document.createTextNode('.'));
    }
    dom.streakFeedback.className = 'streak-feedback' + (kind ? ' ' + kind : '');
  }

  function setStreakLoading(loading, useChance) {
    if (!loading) {
      renderStreakButtons();
      return;
    }
    dom.streakNext.disabled = true;
    if (useChance) { // the popup stays open until the new question is shown
      dom.chanceUse.disabled = true;
      dom.chanceEnd.disabled = true;
      dom.chanceUse.textContent = t('common.loading');
    } else dom.streakNext.textContent = t('common.loading');
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
    if (cur.picked === cur.q.correct) {
      run.count += 1;
      // US-57: may earn a chance ("+1 second chance!"); the new red heart pops
      if (countTowardChance(run)) chanceFx = { kind: 'gain', left: chancesLeft(run) };
    } else if (INTEGRATION || chancesLeft(run) === 0) run.over = true;
    // else US-54: a miss with a chance held waits for "Use second chance" or "See results" (run.over stays false)
    // US-47 / D-55 f: right -> correct, wrong -> wrong, time's up -> timeout (End run sends nothing).
    if (!INTEGRATION) {
      sendQuestionStat(run, cur.q.id, cur.picked === cur.q.correct ? STAT.correct
        : cur.picked === STREAK_TIME_UP ? STAT.timeout : STAT.wrong);
    }
    saveStreak();
    showTimerAt(run.timerSeconds, cur.leftMs);
    if (cur.picked === STREAK_TIME_UP) setTimeUp(true);
    renderStreakChoices();
    renderStreakPanel();
    updateReportButton(); // US-42: Report appears now that it is answered
    focusStreakAction(); // Enter goes on
    refillStreak(run);
  }

  function onStreakNext() {
    const run = streak;
    if (!run || !run.current || run.current.picked === null || dom.streakNext.disabled) return;
    if (run.over || isStreakPending(run)) finishStreak(); // pending: "See results" gives up the second chance
    else nextStreakQuestion();
  }

  /** US-54: continue after a miss with a new question (one chance is used); the streak count is kept. */
  function onStreakSecondChance() {
    const run = streak;
    if (!isStreakPending(run) || !streakOnScreen() || finishing || dom.chanceUse.disabled) return;
    nextStreakQuestion(true); // the popup closes when the new question opens
  }

  /** "See results" in the popup: give up the second chance and end the run (the streak is saved). */
  function onChanceEnd() {
    if (!isStreakPending(streak) || finishing || dom.chanceEnd.disabled) return;
    closeChancePopup();
    finishStreak();
  }

  /** Enter anywhere on the answered question means Next (buttons and links handle Enter themselves). */
  function onKeyDown(event) {
    if (crosswordPlaying()) { // US-58: the grid takes letters, Backspace and the arrows
      onCrosswordKey(event);
      return;
    }
    if (event.key === 'Escape' && !dom.doubleOverlay.hidden) {
      closeDoublePopup();
      return;
    }
    if (isReportOpen()) { // the report form handles its own keys; Escape closes it
      if (event.key === 'Escape') closeReport();
      return;
    }
    if (isPickOpen()) { // US-61: the match categories popup; Escape is Cancel
      if (event.key === 'Escape') closePicker();
      return;
    }
    if (isRoomTakenOpen()) return; // BUG-52-02: the page waits for "Use this tab"
    if (isRoomPanelOpen()) { // US-52: the share panel; Escape is Close
      if (event.key === 'Escape') closeRoomPanel();
      return;
    }
    const solo = streakOnScreen() || dailyOnScreen();
    if (event.key !== 'Enter' || !solo || dom.streakNext.hidden || dom.streakNext.disabled) return;
    const target = event.target;
    if (target && target.closest && target.closest('button, a, input, select, textarea')) return;
    event.preventDefault();
    onRunNext();
  }

  /** End run: stop now and save the streak so far (confirm first). */
  function onStreakEnd() {
    const run = streak;
    if (!run || run.over || !streakOnScreen()) return;
    const text = run.count > 0 ? t('streak.endConfirm', { n: run.count }) : t('streak.endConfirmNone');
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
        const saved = await apiPost(STREAK_API, { name: run.name, streak: run.count });
        if (!isValidRankReply(saved)) throw textError('err.response');
        result.saved = saved;
      } catch (err) {
        result.saveError = err; // shown with errorText(), in the language on screen
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

  // ---------- Leaderboards: Streak (US-34) and Speed Round (US-60) ----------
  // One screen for both: lbBoard picks the API and the texts (LB_BOARDS). The Streak board after a run
  // has Play again and New Game; the Speed board (from its result or from setup) and a board opened
  // from setup have Back.

  /** "2026-10-18" -> "18 Oct 2026" (the server date of the run, not "5 days ago"); Arabic month names in Arabic. */
  function formatRunDate(date) {
    const parts = date.split('-');
    const months = t('date.months').split(',');
    return t('date.format', { d: Number(parts[2]), m: months[Number(parts[1]) - 1], y: parts[0] });
  }

  /**
   * The leaderboard screen of `board` ('streak' when left out): after a run (`result`) with headline and
   * rank; from setup (null) without them. Play again and New Game only after a Streak run, else Back.
   */
  function openLeaderboard(result, board) {
    lbBoard = board || 'streak';
    leaderboardLoads += 1; // rows still on their way for the other board are dropped
    leaderboardResult = result;
    lastLeaderboard = null;
    clearMessage(dom.lbMsg);
    renderLeaderboardTitle();
    renderLeaderboardHead(result);
    showLeaderboardLoading();
    const afterStreak = !!result && lbBoard === 'streak';
    dom.lbAgain.hidden = !afterStreak;
    dom.lbNew.hidden = !afterStreak;
    dom.lbBack.hidden = afterStreak;
    renderLeaderboardTabs();
    showScreen('leaderboard');
    dom.lbTitle.focus();
    if (!result || !result.saving) loadLeaderboardRows();
  }

  /** The heading: "Streak leaderboard" (the page's own) or "Speed leaderboard"; kept through a language switch. */
  function renderLeaderboardTitle() {
    const key = LB_BOARDS[lbBoard].title || LB_TITLE_KEY;
    dom.lbTitle.setAttribute('data-i18n', key);
    dom.lbTitle.textContent = t(key);
  }

  /** Headline ("Ahmed Fahim: 13 in a row!", "Ahmed Fahim: 18 correct!") and the rank line, or the save error with Try again. */
  function renderLeaderboardHead(result) {
    const board = LB_BOARDS[lbBoard];
    if (result && typeof result.name !== 'string') result = null; // BUG-60-01: no name, no headline or rank
    dom.lbHeadline.hidden = !result;
    dom.lbRank.hidden = !result;
    dom.lbAgain.disabled = !!result && result.saving;
    dom.lbNew.disabled = !!result && result.saving;
    if (!result) return;
    dom.lbHeadline.textContent = result.count > 0
      ? t(board.headline, { name: iso(result.name), n: result.count, count: tn(board.count, result.count) })
      : t(board.none);
    if (result.saving) {
      dom.lbRank.textContent = t(board.saving);
    } else if (result.saved) {
      dom.lbRank.textContent = rankText(result.saved, result.count);
    } else if (result.saveError) {
      dom.lbRank.hidden = true;
      showSaveFailure(dom.lbMsg, t(board.saveFailed, { reason: errorText(result.saveError) }),
        lbBoard === 'speed' ? saveSpeedScore : finishStreak);
    } else {
      dom.lbRank.textContent = t(board.onlyOne);
    }
  }

  /** US-45: "Your best is still 15. You are #2 this week and #7 of all time." from the server's reply. */
  function rankText(saved, count) {
    const best = saved.best > count ? t('lb.best', { best: saved.best }) : '';
    return best + (Number.isInteger(saved.week_rank)
      ? t('lb.rankWeek', { week: saved.week_rank, rank: saved.rank })
      : t('lb.rank', { rank: saved.rank }));
  }

  /** A leaderboard POST reply: { rank, best, week_rank, week_best } (week values null or absent outside the week). */
  function isValidRankReply(saved) {
    return isPlainObject(saved) && Number.isInteger(saved.rank) && Number.isInteger(saved.best) &&
      (saved.week_rank === undefined || saved.week_rank === null || Number.isInteger(saved.week_rank));
  }

  /** "Your score could not be saved: ..." and a Try again button that calls `retry`. */
  function showSaveFailure(node, text, retry) {
    clear(node);
    node.className = 'msg msg-error';
    node.appendChild(h('span', { text: text }));
    node.appendChild(h('button', { type: 'button', className: 'btn btn-small', text: t('common.tryAgain'), onclick: retry }));
    node.hidden = false;
  }

  function showLeaderboardLoading() {
    clear(dom.lbList);
    dom.lbList.appendChild(h('li', { className: 'lb-empty', text: t('lb.loading') }));
  }

  /** The "This week" / "All time" tabs (US-45): the shown one is pressed; the list's name follows it. */
  function renderLeaderboardTabs() {
    dom.lbTabs.forEach((tab) => tab.setAttribute('aria-pressed', String(tab.getAttribute('data-period') === lbPeriod)));
    const board = LB_BOARDS[lbBoard];
    dom.lbList.setAttribute('aria-label', lbPeriod === 'week' ? t(board.topWeek) : t(board.topAll));
  }

  function onLeaderboardTab(event) {
    const period = event.currentTarget.getAttribute('data-period');
    if (LB_PERIODS.indexOf(period) === -1 || period === lbPeriod) return;
    lbPeriod = period;
    lastLeaderboard = null;
    renderLeaderboardTabs();
    showLeaderboardLoading();
    const result = leaderboardResult;
    if (!result || !result.saving) loadLeaderboardRows(); // a run being saved loads the rows once saved
  }

  /** Fetch and show the top 10 of the shown tab; this person's rows are highlighted. */
  async function loadLeaderboardRows() {
    const load = ++leaderboardLoads;
    const result = leaderboardResult;
    const period = lbPeriod;
    const api = lbBoard === 'speed' ? SPEED_API : STREAK_API;
    let rows = null;
    let failure = null;
    try {
      const data = await apiGet(api + '?period=' + encodeURIComponent(period));
      if (!Array.isArray(data)) throw textError('err.leaderboard');
      rows = data.filter((r) => isPlainObject(r) && typeof r.name === 'string' &&
        Number.isInteger(r.streak) &&
        typeof r.date === 'string' && DATE_PATTERN.test(r.date));
    } catch (err) {
      failure = err;
    }
    if (load !== leaderboardLoads || state.screen !== 'leaderboard') return;
    lastLeaderboard = { rows: rows, result: result, failure: failure, period: period };
    renderLeaderboardRows(rows, result, failure, period);
  }

  /**
   * Rows reading "1. Ahmed Fahim · 13 questions · 18 Oct 2026" (Speed: "· 18 correct ·"; rendered with textContent only).
   * The name sits left and "· 13 questions · 18 Oct 2026" right; the space text nodes between the
   * flex items are not drawn but keep the row's text (and what screen readers read) in that format.
   */
  function renderLeaderboardRows(rows, result, failure, period) {
    const board = LB_BOARDS[lbBoard];
    clear(dom.lbList);
    if (failure || !rows.length) {
      const empty = period === 'week' ? t(board.emptyWeek) : t(board.empty);
      dom.lbList.appendChild(h('li', {
        className: 'lb-empty',
        text: failure ? t('lb.failed', { reason: errorText(failure) }) : empty,
      }));
      return;
    }
    const me = result && typeof result.name === 'string' ? result.name.toLowerCase() : null; // BUG-60-01
    rows.forEach((r, index) => {
      const name = r.name;
      const isMe = me !== null && name.toLowerCase() === me;
      dom.lbList.appendChild(h('li', { className: 'result-row' + (isMe ? ' is-me' : '') }, [
        h('span', { className: 'result-rank', text: (index + 1) + '.' }),
        document.createTextNode(' '),
        h('span', { className: 'result-name', text: iso(name) }),
        document.createTextNode(' '),
        h('span', {
          className: 'lb-meta',
          text: DOT + ' ' + tn(board.count, r.streak) + ' ' + DOT + ' ' + formatRunDate(r.date),
        }),
      ]));
    });
  }

  /** Leaving a run whose save failed loses it: ask first. */
  function confirmDropUnsaved() {
    if (!streak) return true;
    if (!window.confirm(t('lb.unsaved', { n: streak.count }))) return false;
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
    dom.lbAgain.textContent = t('setup.starting');
    try {
      await startStreakRun(profile);
    } catch (err) {
      showMessage(dom.lbMsg, () => t('lb.againFailed', { reason: errorText(err) }), 'error');
    } finally {
      dom.lbAgain.disabled = false;
      dom.lbAgain.textContent = t('lb.again');
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
    if (lbBoard === 'speed') {
      onSpeedBoardBack();
      return;
    }
    showScreen('setup');
    dom.streakBoardBtn.focus();
  }

  // ---------- Daily Challenge (US-43, D-46) ----------
  // The same questions for everyone on a day (UTC). api/daily.php makes the set on the day's first
  // request; the run is played like a Streak question (3 choices, the setup timer, no Pause, Reset
  // or helpers), but a wrong answer or time's up only scores 0 and the run moves on. The result
  // ("Mokh Rush Daily #N: 2/3" and a row of squares) stays on this device: opening the Daily
  // Challenge again the same day shows it with a countdown to the next one.

  function saveDaily() {
    try {
      if (daily) window.localStorage.setItem(DAILY_KEY, JSON.stringify(daily));
      else window.localStorage.removeItem(DAILY_KEY);
    } catch (err) {
      // Storage full or disabled: the run still works, it just won't survive a refresh.
    }
  }

  /** The saved Daily Challenge, or null when nothing valid is saved (corrupt data is removed). */
  function loadDaily() {
    let raw = null;
    try {
      raw = window.localStorage.getItem(DAILY_KEY);
    } catch (err) {
      return null;
    }
    if (raw === null) return null;
    try {
      const saved = JSON.parse(raw);
      if (isValidDaily(saved)) return saved;
    } catch (err) {
      // invalid JSON: discard it
    }
    try {
      window.localStorage.removeItem(DAILY_KEY);
    } catch (err) {
      // nothing to clear
    }
    return null;
  }

  function isValidDaily(run) {
    const range = timerRange();
    if (!isPlainObject(run) || run.version !== DAILY_VERSION ||
        typeof run.date !== 'string' || !DATE_PATTERN.test(run.date) ||
        !Number.isInteger(run.number) || run.number < 1 ||
        !Number.isInteger(run.timerSeconds) || run.timerSeconds < range.min || run.timerSeconds > range.max ||
        !Number.isFinite(run.nextAt) || typeof run.done !== 'boolean' || typeof run.onResult !== 'boolean' ||
        !Array.isArray(run.questions) || run.questions.length < 1 || run.questions.length > DAILY_MAX_QUESTIONS ||
        !run.questions.every(isValidStreakQuestion) ||
        !Array.isArray(run.results) || run.results.length > run.questions.length ||
        !run.results.every((r) => typeof r === 'boolean')) return false;
    if (run.done) return run.current === null && run.results.length === run.questions.length;
    return isValidDailyCurrent(run.current, run);
  }

  /** The open question: the next unanswered one, or the last answered one with its result recorded. */
  function isValidDailyCurrent(cur, run) {
    if (cur === null) return true;
    if (!isPlainObject(cur) || !Number.isInteger(cur.index) || cur.index < 0 || cur.index >= run.questions.length) {
      return false;
    }
    const q = run.questions[cur.index];
    const answered = cur.picked !== null;
    const langOk = cur.lang === 'en' || (cur.lang === 'ar' && isFilled(q.question_ar));
    const pickedOk = cur.picked === null || cur.picked === STREAK_TIME_UP ||
      (Number.isInteger(cur.picked) && cur.picked >= 0 && cur.picked < CHOICE_LETTERS.length);
    const countOk = run.results.length === cur.index + (answered ? 1 : 0);
    const resultOk = !answered || run.results[cur.index] === (cur.picked === q.correct);
    return langOk && pickedOk && countOk && resultOk && Number.isFinite(cur.deadline) &&
      (cur.leftMs === undefined || (Number.isFinite(cur.leftMs) && cur.leftMs >= 0));
  }

  /** Today's challenge from api/daily.php: { date, number, nextAt, questions }. Throws on errors. */
  async function fetchDaily() {
    const data = await apiGet('daily.php');
    const ok = isPlainObject(data) && typeof data.date === 'string' && DATE_PATTERN.test(data.date) &&
      Number.isInteger(data.number) && data.number >= 1 &&
      Number.isInteger(data.seconds_to_next) && data.seconds_to_next >= 0 && data.seconds_to_next * 1000 <= DAY_MS &&
      Array.isArray(data.questions) && data.questions.length >= 1 && data.questions.length <= DAILY_MAX_QUESTIONS &&
      data.questions.every(isValidStreakQuestion);
    if (!ok) throw textError('err.daily');
    return {
      date: data.date,
      number: data.number,
      nextAt: Date.now() + data.seconds_to_next * 1000,
      questions: data.questions.map(parseStreakQuestion),
    };
  }

  /** A Daily Challenge question is on the question screen (state.game is null during the run). */
  function dailyOnScreen() {
    return state.screen === 'question' && !state.game && !streakOnScreen() && !speedOnScreen() && !!daily && !!daily.current;
  }

  function dailyQuestion() {
    return daily.questions[daily.current.index];
  }

  /** "Daily Challenge" on setup: today's result when this device played it, otherwise a new run. */
  async function onDailyOpen() {
    const s = state.setup;
    if (!s || s.streak || dom.dailyOpenBtn.disabled) return;
    clearMessage(dom.startMsg);
    s.starting = true;
    dom.dailyOpenLabel.textContent = t('common.loading');
    updateStartButton();
    try {
      const challenge = await fetchDaily();
      if (state.setup !== s || state.screen !== 'setup') return;
      if (!showPlayedDaily(challenge)) {
        const timerSeconds = validateTimer(); // the setup timer, as for the Streak Challenge
        if (timerSeconds === null) {
          showMessage(dom.startMsg, () => t('daily.fix'), 'error');
          dom.timerInput.focus();
          return;
        }
        startDaily(challenge, timerSeconds);
      }
    } catch (err) {
      // Stay on setup with every input intact (as US-06).
      showMessage(dom.startMsg, () => t('daily.failed', { reason: errorText(err) }), 'error');
    } finally {
      s.starting = false;
      dom.dailyOpenLabel.textContent = t('daily.name');
      updateStartButton();
    }
  }

  /**
   * This device already has today's challenge: show its result (with a fresh countdown) or go on
   * with its unfinished run. Returns false when today's challenge is not played here yet.
   */
  function showPlayedDaily(challenge) {
    const saved = daily || loadDaily();
    if (!saved || saved.date !== challenge.date) return false;
    daily = saved;
    daily.nextAt = challenge.nextAt;
    if (daily.done) showDailyResult();
    else restoreDaily(daily);
    return true;
  }

  /** Start today's run: a fresh run that replaces any earlier day's result on this device. */
  function startDaily(challenge, timerSeconds) {
    stopTimer();
    state.game = null;
    clearSavedState();
    daily = {
      version: DAILY_VERSION,
      date: challenge.date,
      number: challenge.number,
      timerSeconds: timerSeconds,
      nextAt: challenge.nextAt,
      questions: challenge.questions,
      results: [],
      current: null,
      done: false,
      onResult: false,
    };
    challenge.questions.forEach((q) => { if (q.image) new Image().src = q.image; });
    markSoloRun('daily'); // US-59: the newest solo run is the one a reload brings back
    nextDailyQuestion();
  }

  /** Open the next question with a full timer, or show the result after the last one. */
  function nextDailyQuestion() {
    const index = daily.results.length;
    if (index >= daily.questions.length) {
      finishDaily();
      return;
    }
    const q = daily.questions[index];
    daily.current = {
      index: index,
      lang: isFilled(q.question_ar) ? 'ar' : 'en', // Arabic first, as on the board
      deadline: Date.now() + daily.timerSeconds * 1000,
      picked: null,
    };
    markSeen(q.id); // later boards and runs avoid it too
    saveDaily();
    showDailyQuestion();
  }

  /** Render the open question; its timer counts to the saved deadline (also after a refresh). */
  function showDailyQuestion() {
    const cur = daily.current;
    const q = dailyQuestion();
    setStreakLayout(true);
    renderRunHeading(q);
    renderQuestionImage(q);
    renderRunLang(q, cur, dailyAnswer);
    renderDailyPanel();
    showScreen('question');
    updateReportButton(); // US-42: once the question is answered
    onQuestionShown(cur.picked !== null); // US-48: an answered question (after a refresh) is not read again
    if (cur.picked !== null) {
      showTimerAt(daily.timerSeconds, cur.leftMs || 0);
      setTimeUp(cur.picked === STREAK_TIME_UP);
      dom.streakNext.focus();
      return;
    }
    // Never more than one full timer: a deadline moved forward in storage is pulled back.
    cur.deadline = Math.min(cur.deadline, Date.now() + daily.timerSeconds * 1000);
    saveDaily();
    const left = cur.deadline - Date.now();
    if (left <= 0) { // the time ran out while the page was closed
      showTimerAt(daily.timerSeconds, 0);
      dailyAnswer(null);
      return;
    }
    startTimer(daily.timerSeconds, left, () => dailyAnswer(null));
    dom.qHeading.focus();
  }

  /** "Daily Challenge #12", "Question 2/3", the hint, the feedback and Next / See result (no End run). */
  function renderDailyPanel() {
    const cur = daily.current;
    const q = dailyQuestion();
    const total = daily.questions.length;
    setRunPanelTexts(t('daily.name'), t('daily.question'), tn('daily.hint', total));
    dom.streakName.textContent = t('daily.number', { n: daily.number });
    dom.streakName.style.borderInlineStartColor = 'var(--gold)'; // the right edge in Arabic
    dom.streakCount.textContent = (cur.index + 1) + '/' + total;
    dom.streakChances.hidden = true; // US-57: no second chances in the Daily Challenge
    if (cur.picked === null) showStreakFeedback('', '');
    else if (cur.picked === q.correct) showStreakFeedback(t('daily.correct'), 'is-good');
    else showWrongFeedback(q, cur);
    dom.streakNext.hidden = cur.picked === null;
    dom.streakNext.disabled = false;
    dom.streakNext.textContent = cur.index + 1 >= total ? t('daily.seeResult') : t('run.next');
    dom.streakEnd.hidden = true;
  }

  function toggleDailyLang() {
    const cur = daily.current;
    const q = dailyQuestion();
    if (!isFilled(q.question_ar)) return;
    cur.lang = cur.lang === 'ar' ? 'en' : 'ar';
    renderRunLang(q, cur, dailyAnswer);
    renderDailyPanel(); // the feedback names the right answer in the shown language
    saveDaily();
  }

  /** A tapped choice, or null when the time ran out: right or wrong (0), then Next. */
  function dailyAnswer(index) {
    const cur = daily && daily.current;
    if (!cur || cur.picked !== null || daily.done || !dailyOnScreen()) return;
    const q = dailyQuestion();
    const leftMs = cur.deadline - Date.now();
    stopTimer();
    cur.leftMs = Math.max(0, leftMs);
    cur.picked = index === null || leftMs <= 0 ? STREAK_TIME_UP : index;
    daily.results.push(cur.picked === q.correct);
    saveDaily();
    showTimerAt(daily.timerSeconds, cur.leftMs);
    if (cur.picked === STREAK_TIME_UP) setTimeUp(true);
    renderRunChoices(q, cur, dailyAnswer);
    renderDailyPanel();
    updateReportButton(); // US-42: Report appears now that it is answered
    dom.streakNext.focus(); // Enter goes on
  }

  function onDailyNext() {
    if (!dailyOnScreen() || daily.current.picked === null) return;
    if (daily.current.index + 1 >= daily.questions.length) finishDaily();
    else nextDailyQuestion();
  }

  /** "Next question" / "See result" (and Enter) for whichever run is on the question screen. */
  function onRunNext() {
    if (speedOnScreen()) onSpeedRetry(); // US-59: "Try again" after a failed batch load
    else if (dailyOnScreen()) onDailyNext();
    else onStreakNext();
  }

  /** End run for whichever run is on the question screen (the Speed Round has its own, US-59). */
  function onRunEnd() {
    if (speedOnScreen()) onSpeedEnd();
    else onStreakEnd();
  }

  /** Android Back on an open question (US-40): leave after a confirm; the questions left score 0. */
  function onDailyLeave() {
    if (!dailyOnScreen() || daily.current.picked !== null) return;
    if (!window.confirm(t('daily.leave'))) return;
    if (!dailyOnScreen() || daily.current.picked !== null) return; // the time ran out meanwhile
    finishDaily();
  }

  /** End a run where it stands: the questions not answered yet score 0 (wrong). */
  function closeDaily(run) {
    while (run.results.length < run.questions.length) run.results.push(false);
    run.done = true;
    run.current = null;
  }

  /** The run is over: keep the result on this device and show it. */
  function finishDaily() {
    stopTimer();
    closeDaily(daily);
    showDailyResult();
  }

  /** The result screen (saved, so a refresh shows it again until New Game). */
  function showDailyResult() {
    daily.onResult = true;
    saveDaily();
    renderDailyResult();
    showScreen('daily');
    startDailyCountdown();
    dom.dailyTitle.focus();
  }

  function dailyRightCount(run) {
    return run.results.filter(Boolean).length;
  }

  /** "Mokh Rush Daily #12: 2/3" */
  function dailyScoreLine(run) {
    return t('daily.score', { n: run.number, right: dailyRightCount(run), total: run.results.length });
  }

  function renderDailyResult() {
    clear(dom.dailySquares);
    daily.results.forEach((ok) => {
      dom.dailySquares.appendChild(h('span', { className: 'daily-square ' + (ok ? 'is-right' : 'is-wrong') }));
    });
    renderDailyTexts();
    dom.dailyShareStatus.textContent = '';
    clearMessage(dom.dailyMsg);
    dom.dailyPlay.hidden = true;
  }

  /** The score line, the squares' label and the note of the result screen. */
  function renderDailyTexts() {
    const right = dailyRightCount(daily);
    const total = daily.results.length;
    dom.dailyScore.textContent = dailyScoreLine(daily);
    dom.dailySquares.setAttribute('aria-label', daily.results
      .map((ok, i) => t(ok ? 'daily.squareRight' : 'daily.squareWrong', { n: i + 1 })).join(t('list.sep')));
    dom.dailyNote.textContent = (right === total ? t('daily.perfect') : '') + t('daily.note');
  }

  /** The shared text: the score line and the squares (js/share.js adds the site link). */
  function dailyShareText(run) {
    return dailyScoreLine(run) + '\n' + run.results.map((ok) => (ok ? SQUARE_RIGHT : SQUARE_WRONG)).join('');
  }

  function onDailyShare() {
    if (daily && daily.done && state.screen === 'daily') shareText(dailyShareText(daily), dom.dailyShareStatus);
  }

  /** "13:05:22" */
  function formatCountdown(ms) {
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
      .map((n) => String(n).padStart(2, '0')).join(':');
  }

  function startDailyCountdown() {
    stopDailyCountdown();
    tickDailyCountdown();
    dailyTicker = window.setInterval(tickDailyCountdown, 1000);
  }

  function stopDailyCountdown() {
    if (dailyTicker !== null) window.clearInterval(dailyTicker);
    dailyTicker = null;
  }

  /** The countdown to the next challenge (midnight UTC); at 0 the new one can be played. */
  function tickDailyCountdown() {
    const left = Math.min(daily.nextAt - Date.now(), DAY_MS);
    if (left > 0) {
      dom.dailyNext.textContent = t('daily.next', { time: ltr(formatCountdown(left)) });
      return;
    }
    stopDailyCountdown();
    dom.dailyNext.textContent = t('daily.ready');
    dom.dailyPlay.hidden = false;
  }

  /** "Play the new challenge" once the countdown is over: same timer as the last run. */
  async function onDailyPlayNew() {
    if (!daily || state.screen !== 'daily' || dom.dailyPlay.disabled) return;
    clearMessage(dom.dailyMsg);
    dom.dailyPlay.disabled = true;
    dom.dailyPlay.textContent = t('common.loading');
    try {
      const challenge = await fetchDaily();
      if (state.screen !== 'daily') return;
      if (challenge.date === daily.date) { // this device's clock ran ahead of the server's day
        daily.nextAt = challenge.nextAt;
        saveDaily();
        renderDailyResult();
        startDailyCountdown();
        return;
      }
      startDaily(challenge, daily.timerSeconds);
    } catch (err) {
      showMessage(dom.dailyMsg, () => t('daily.newFailed', { reason: errorText(err) }), 'error');
    } finally {
      dom.dailyPlay.disabled = false;
      dom.dailyPlay.textContent = t('daily.playNew');
    }
  }

  /** New Game on the result screen: back to setup; today's result stays saved on this device. */
  function onDailyNewGame() {
    if (daily) {
      daily.onResult = false;
      saveDaily();
    }
    newGame();
  }

  /** US-17 for the Daily Challenge: reopen the unfinished run; an open question keeps its deadline. */
  function restoreDaily(run) {
    daily = run;
    if (run.current !== null) showDailyQuestion();
    else nextDailyQuestion();
  }

  // ---------- Speed Round (US-59, D-73) ----------
  // A solo race against one clock (SPEED_START_S, at most SPEED_CAP_S). A right answer is a point and
  // adds time by how fast it came (SPEED_TIERS); a wrong one takes SPEED_WRONG_S off and shows the right
  // choice. The run ends when the clock reaches 0. Fair timing: the clock only runs while the question
  // is visible (its picture loaded), it is frozen during the answer's feedback, a hidden tab pauses it
  // ("Paused, tap to resume") and a reload brings the run back paused with the same time left. Questions
  // are the Streak Challenge's batches (questions.php?streak=1). The best score stays on this device.

  /** Remember which solo mode started last (see LAST_SOLO_KEY). */
  function markSoloRun(mode) {
    try {
      window.localStorage.setItem(LAST_SOLO_KEY, JSON.stringify({ mode: mode, at: Date.now() }));
    } catch (err) {
      // storage full or disabled: a reload uses the usual order
    }
  }

  /** 'streak' | 'daily' | 'speed', or null when unknown (saves from before US-59). */
  function lastSoloMode() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(LAST_SOLO_KEY));
      return isPlainObject(saved) && ['streak', 'daily', 'speed'].indexOf(saved.mode) !== -1 ? saved.mode : null;
    } catch (err) {
      return null;
    }
  }

  function saveSpeed() {
    try {
      if (speed) window.localStorage.setItem(SPEED_KEY, JSON.stringify(speed));
    } catch (err) {
      // Storage full or disabled: the run still works, it just won't survive a refresh.
    }
  }

  function freshSpeed() {
    return { version: SPEED_VERSION, best: 0, bestAt: null, run: null, last: null, onResult: false };
  }

  /**
   * The saved Speed Round data. A bad run or result is dropped; the personal best is kept when it is valid.
   * A save from before US-60 (version 1) keeps its best; its run has no name, so it is dropped, and its
   * result is shown without the leaderboard.
   */
  function loadSpeed() {
    let saved = null;
    try {
      saved = JSON.parse(window.localStorage.getItem(SPEED_KEY));
    } catch (err) {
      saved = null;
    }
    if (!isPlainObject(saved) || (saved.version !== SPEED_VERSION && saved.version !== 1)) return null;
    const data = freshSpeed();
    if (Number.isInteger(saved.best) && saved.best >= 0) {
      data.best = saved.best;
      data.bestAt = Number.isFinite(saved.bestAt) ? saved.bestAt : null;
    }
    const old = saved.version === 1;
    // A result from before US-60 (version 1, or any result without a save state) is shown without the
    // leaderboard: no name, nothing to save (BUG-60-01).
    const last = isPlainObject(saved.last) && (old || saved.last.save === undefined)
      ? Object.assign({}, saved.last, { name: null, save: 'none', saved: null })
      : saved.last;
    data.run = !old && isValidSpeedRun(saved.run) ? saved.run : null;
    data.last = isValidSpeedResult(last) ? last : null;
    data.onResult = saved.onResult === true && data.last !== null;
    return data;
  }

  /** The data in memory, loaded (or made) on first use. */
  function speedData() {
    if (!speed) speed = loadSpeed() || freshSpeed();
    return speed;
  }

  const isMs = (v) => Number.isFinite(v) && v >= 0;

  function isValidSpeedRun(run) {
    if (!isPlainObject(run)) return false;
    return (run.name === null ? !run.started : isValidStreakName(run.name)) && // US-60: named before the countdown
      Number.isInteger(run.score) && run.score >= 0 &&
      Number.isInteger(run.answered) && run.answered >= run.score &&
      Array.isArray(run.times) && run.times.length === run.score && run.times.length <= SPEED_MAX_TIMES &&
      run.times.every(isMs) &&
      Array.isArray(run.queue) && run.queue.length <= STREAK_MAX_QUEUE && run.queue.every(isValidStreakQuestion) &&
      Array.isArray(run.usedIds) && run.usedIds.length <= SEEN_MAX && run.usedIds.every((id) => Number.isInteger(id) && id > 0) &&
      isValidStatsSent(run.statsSent) &&
      (run.lang === null || run.lang === 'en' || run.lang === 'ar') &&
      isMs(run.leftMs) && run.leftMs <= SPEED_CAP_S * 1000 &&
      (run.deadline === null || Number.isFinite(run.deadline)) &&
      typeof run.started === 'boolean' &&
      isValidSpeedCurrent(run.current, run);
  }

  /** The open question: one of the run's, a known language and pick, and the time it was visible. */
  function isValidSpeedCurrent(cur, run) {
    if (cur === null) return true;
    if (!isPlainObject(cur) || !isValidStreakQuestion(cur.q) || run.usedIds.indexOf(cur.q.id) === -1) return false;
    const langOk = cur.lang === 'en' || (cur.lang === 'ar' && isFilled(cur.q.question_ar));
    const pickedOk = cur.picked === null || cur.picked === STREAK_TIME_UP ||
      (Number.isInteger(cur.picked) && cur.picked >= 0 && cur.picked < CHOICE_LETTERS.length);
    return langOk && pickedOk && isMs(cur.elapsedMs);
  }

  /** A result: the score and best, and its leaderboard save (US-60; a pending one has a name and a score of 1 or more). */
  function isValidSpeedResult(r) {
    return isPlainObject(r) && Number.isInteger(r.score) && r.score >= 0 &&
      Number.isInteger(r.prevBest) && r.prevBest >= 0 && typeof r.newBest === 'boolean' &&
      (r.name === null || isValidStreakName(r.name)) && SPEED_SAVES.indexOf(r.save) !== -1 &&
      (r.save !== 'pending' || (r.name !== null && r.score >= 1)) &&
      (r.save === 'saved' ? isValidRankReply(r.saved) : r.saved === null);
  }

  /** A Speed Round question is on the question screen (the layout class is set only by the Speed Round). */
  function speedOnScreen() {
    return state.screen === 'question' && dom.screens.question.classList.contains('speed') &&
      !!speed && !!speed.run && !!speed.run.current;
  }

  function newSpeedRun() {
    return {
      name: null, score: 0, answered: 0, times: [], queue: [], usedIds: [], statsSent: [],
      lang: null, leftMs: SPEED_START_S * 1000, deadline: null, started: false, current: null,
    };
  }

  /** The tier of a right answer that took `ms`. */
  function speedTier(ms) {
    return SPEED_TIERS.find((tier) => ms <= tier.maxS * 1000);
  }

  /** "1.2 s" (one decimal), left to right inside Arabic text. */
  function speedSeconds(ms) {
    return t('speed.seconds', { n: ltr((ms / 1000).toFixed(1)) });
  }

  /** "+5 s" / "−3 s" */
  function speedDeltaText(seconds) {
    return t('speed.seconds', { n: seconds < 0 ? signed(MINUS, -seconds) : signed('+', seconds) });
  }

  function stopSpeedTimers() {
    if (speedTicker !== null) window.clearTimeout(speedTicker);
    speedTicker = null;
    stopSpeedSaver();
    speedToken += 1; // a picture still loading no longer starts its question
  }

  // --- Start: the button, the rules card (first run only) and the countdown ---

  /** "Speed Round" on setup: one tap loads the first questions and starts. */
  async function onSpeedOpen() {
    const s = state.setup;
    if (!s || s.streak || dom.speedOpenBtn.disabled) return;
    clearMessage(dom.startMsg);
    s.starting = true;
    dom.speedOpenLabel.textContent = t('common.loading');
    updateStartButton();
    try {
      await startSpeedRun();
    } catch (err) {
      // Stay on setup with every input intact (as US-06).
      showMessage(dom.startMsg, () => t('speed.failed', { reason: errorText(err) }), 'error');
    } finally {
      s.starting = false;
      dom.speedOpenLabel.textContent = t('speed.name');
      updateStartButton();
    }
  }

  /**
   * A new run: the first batch first (nothing changes when it fails), then the name step (with the
   * rules on this device's first run), then the countdown. A saved Streak run is never touched.
   */
  async function startSpeedRun() {
    const questions = await fetchStreakBatch([], false);
    if (!questions.length) throw textError('err.noQuestions');
    stopTimer();
    stopSpeedTimers();
    state.game = null;
    clearSavedState();
    const data = speedData();
    data.run = newSpeedRun();
    data.onResult = false;
    speedPauseWanted = false;
    addToQueue(data.run, questions); // also fetches their pictures
    markSoloRun('speed');
    saveSpeed();
    showSpeedIntro();
  }

  /** Which part of the Speed overlay shows: 'intro' (the name step) | 'count' | 'paused', or null to close it. */
  function showSpeedOverlay(part) {
    dom.speedIntro.hidden = part !== 'intro';
    dom.speedCount.hidden = part !== 'count';
    dom.speedPaused.hidden = part !== 'paused';
    const open = part !== null;
    if (dom.speedOverlay.hidden !== open) return; // already in that state
    dom.speedOverlay.hidden = !open;
    setPageInert(open); // keyboard focus stays on the card
  }

  function isSpeedOverlayOpen() {
    return !dom.speedOverlay.hidden;
  }

  /** The name step (US-60): every run asks, prefilled; the rules show above it every time. */
  function showSpeedIntro() {
    speedPhase = 'intro';
    dom.speedNameInput.value = speedNamePrefill();
    setFieldError(dom.speedNameInput, dom.speedNameError, '');
    showSpeedOverlay('intro');
    dom.speedNameInput.focus();
  }

  /** The run's own name (a reload on the name step), the name last used in a Streak or Speed run, or the first player's. */
  function speedNamePrefill() {
    const run = speed && speed.run;
    if (run && run.name) return run.name;
    const last = loadChallengerName();
    if (last) return last;
    const s = state.setup;
    return s && s.entries.length ? cleanName(s.entries[0].name).slice(0, NAME_MAX) : '';
  }

  /** Start on the name step (also Enter): the name is checked like the Streak's, kept with the run, then 3-2-1. */
  function onSpeedGo(event) {
    event.preventDefault();
    const run = speed && speed.run;
    if (speedPhase !== 'intro' || !run) return;
    if (!validateNameField(dom.speedNameInput, dom.speedNameError)) {
      dom.speedNameInput.focus();
      return;
    }
    run.name = cleanName(dom.speedNameInput.value);
    saveChallengerName(run.name);
    saveSpeed();
    startSpeedCountdown();
  }

  let beepAudio = null; // one AudioContext for the page, made on the first beep

  /** One race-start beep; silent when the browser has no Web Audio or blocks it. */
  function playBeep(hz, seconds) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!beepAudio) beepAudio = new Ctx();
      if (beepAudio.state === 'suspended') beepAudio.resume().catch(() => {});
      const now = beepAudio.currentTime;
      const osc = beepAudio.createOscillator();
      const gain = beepAudio.createGain();
      osc.type = 'square';
      osc.frequency.value = hz;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(SPEED_BEEP_GAIN, now + 0.01); // no click at the start
      gain.gain.setValueAtTime(SPEED_BEEP_GAIN, now + seconds - 0.05);
      gain.gain.linearRampToValueAtTime(0, now + seconds);           // nor at the end
      osc.connect(gain);
      gain.connect(beepAudio.destination);
      osc.start(now);
      osc.stop(now + seconds + 0.02);
    } catch (err) {
      // No sound is fine: the numbers still show.
    }
  }

  /** 3, 2, 1, then the first question (the clock has not started yet). */
  function startSpeedCountdown() {
    stopSpeedTimers();
    speedPhase = 'countdown';
    showSpeedOverlay('count');
    let n = SPEED_COUNTDOWN_S;
    const step = () => {
      if (n === 0) {
        speedTicker = null;
        playBeep(SPEED_GO_HZ, SPEED_GO_S);
        beginSpeedRun();
        return;
      }
      dom.speedCount.textContent = String(n);
      dom.speedCount.classList.remove('is-pop');
      void dom.speedCount.offsetWidth; // restart the pop animation for each number
      dom.speedCount.classList.add('is-pop');
      playBeep(SPEED_BEEP_HZ, SPEED_BEEP_S);
      n -= 1;
      speedTicker = window.setTimeout(step, 1000);
    };
    step();
  }

  function beginSpeedRun() {
    const run = speed && speed.run;
    if (!run) return;
    run.started = true;
    postGameLog({ mode: 'speed' });
    showSpeedOverlay(null);
    nextSpeedQuestion();
  }

  /** Back on the name step or the countdown: no run; on Paused: "End the run now?". */
  function onSpeedOverlayBack() {
    if (speedPhase === 'paused' && speed.run && speed.run.started) {
      if (window.confirm(t('speed.endConfirm', { n: speed.run.score }))) finishSpeed();
      return;
    }
    cancelSpeedStart();
  }

  /** Drop a run that has not started; the screen behind (setup or a result) stays. */
  function cancelSpeedStart() {
    stopSpeedTimers();
    speedPhase = 'idle';
    speed.run = null;
    speed.onResult = state.screen === 'speed' && speed.last !== null;
    saveSpeed();
    showSpeedOverlay(null);
    if (state.screen === 'setup' && !state.setup) startSetup(); // a reload during the countdown
    else if (state.screen === 'setup') updateStartButton();
    if (state.screen === 'setup' && !dom.speedOpenBtn.hidden) dom.speedOpenBtn.focus();
    else if (state.screen === 'speed') dom.speedAgain.focus();
  }

  // --- Questions ---

  /** The next batch for this run (one request at a time). Resolves when it is queued. */
  function requestSpeedBatch(run) {
    if (speedRequest && speedRequest.run === run) return speedRequest.promise;
    const request = { run: run, promise: null };
    request.promise = fetchStreakBatch(streakTakenIds(run), false).then((questions) => {
      if (speed && speed.run === run) {
        addToQueue(run, questions);
        saveSpeed();
      }
    }).finally(() => {
      if (speedRequest === request) speedRequest = null;
    });
    speedRequest = request;
    return request.promise;
  }

  function refillSpeed(run) {
    if (run.queue.length < STREAK_REFILL_AT) requestSpeedBatch(run).catch(() => {});
  }

  /** Fetch the next queued pictures again (the browser cache keeps them), e.g. after a reload. */
  function prefetchSpeedImages(run) {
    run.queue.slice(0, 3).forEach((q) => { if (q.image) new Image().src = q.image; });
  }

  /** The question's language: the one the player last chose, Arabic first (as the Streak). */
  function speedLang(run, q) {
    return run.lang !== 'en' && isFilled(q.question_ar) ? 'ar' : 'en';
  }

  /** Open the next question; the clock stays frozen while a batch loads. */
  async function nextSpeedQuestion() {
    const run = speed && speed.run;
    if (!run) return;
    if (!run.queue.length) {
      speedPhase = 'loading';
      dom.streakNext.hidden = true;
      if (speedOnScreen()) showStreakFeedback(t('common.loading'), '');
      let failure = null;
      try {
        await requestSpeedBatch(run);
      } catch (err) {
        failure = err;
      }
      if (!speed || speed.run !== run) return;
      if (!run.queue.length) {
        if (failure && speedOnScreen()) { // "Try again" (the clock stays frozen)
          showStreakFeedback(t('speed.nextFailed', { reason: sentence(errorText(failure)) }), 'is-bad');
          dom.streakNext.textContent = t('common.tryAgain');
          dom.streakNext.hidden = false;
          dom.streakNext.disabled = false;
          dom.streakNext.focus();
          return;
        }
        finishSpeed(); // every question was played (or nothing to retry on): the run ends with its score
        return;
      }
    }
    const q = run.queue.shift();
    run.usedIds.push(q.id);
    run.current = { q: q, lang: speedLang(run, q), picked: null, elapsedMs: 0 };
    saveSpeed();
    openSpeedQuestion();
    refillSpeed(run);
  }

  function onSpeedRetry() {
    if (speedPhase === 'loading' && !dom.streakNext.hidden && !dom.streakNext.disabled) {
      dom.streakNext.disabled = true;
      nextSpeedQuestion();
    }
  }

  /** Put the run's question on the screen with the clock stopped; it starts once the question is visible. */
  function openSpeedQuestion() {
    const run = speed.run;
    const cur = run.current;
    setStreakLayout(true);
    dom.screens.question.classList.add('speed');
    dom.qHeading.textContent = runHeading(cur.q);
    renderQuestionImage(cur.q);
    renderRunLang(cur.q, cur, speedAnswer);
    renderSpeedPanel();
    dom.streakNext.hidden = true; // "Try again" belongs to a failed load only
    showStreakFeedback('', '');
    showScreen('question');
    updateReportButton(); // none in the Speed Round
    showTimerAt(SPEED_CAP_S, run.leftMs, SPEED_LOW_S * 1000);
    setTimeUp(false);
    prefetchSpeedImages(run);
    armSpeedQuestion();
  }

  /** Start the open question when it can be seen: not while the tab is hidden, after its picture loaded. */
  function armSpeedQuestion() {
    const cur = speed.run.current;
    if (speedPauseWanted || document.hidden) {
      enterSpeedPause();
      return;
    }
    if (cur.picked !== null) { // answered before a reload or a pause: on to the next one
      nextSpeedQuestion();
      return;
    }
    speedPhase = 'wait';
    dom.screens.question.classList.add('is-waiting'); // the question shows all at once, picture included
    const token = ++speedToken;
    whenImageReady(cur.q, () => {
      if (token === speedToken && speedPhase === 'wait') goSpeedLive();
    });
  }

  /** `done` once the question's picture has loaded (or failed, or after SPEED_IMAGE_WAIT_MS); at once without one. */
  function whenImageReady(q, done) {
    const image = dom.qImage;
    if (!q.image || image.complete) { // with src set, complete = loaded or broken: start either way
      done();
      return;
    }
    let called = false;
    const once = () => {
      if (called) return;
      called = true;
      image.removeEventListener('load', once);
      image.removeEventListener('error', once);
      window.clearTimeout(wait);
      done();
    };
    const wait = window.setTimeout(once, SPEED_IMAGE_WAIT_MS);
    image.addEventListener('load', once);
    image.addEventListener('error', once);
  }

  /** The question is visible: its stopwatch and the run's clock start. */
  function goSpeedLive() {
    const run = speed.run;
    speedPhase = 'live';
    dom.screens.question.classList.remove('is-waiting');
    speedShownAt = now();
    run.deadline = Date.now() + run.leftMs;
    saveSpeed();
    startTimer(SPEED_CAP_S, run.leftMs, onSpeedTimeUp, SPEED_LOW_S * 1000);
    stopSpeedSaver();
    speedSaver = window.setInterval(saveSpeedProgress, SPEED_SAVE_MS);
    dom.qHeading.focus();
    onQuestionShown(false); // US-48: read aloud when that is on
  }

  /** BUG-59-03: while the clock runs, save the time left and the time the question has been seen. */
  function saveSpeedProgress() {
    const run = speed && speed.run;
    if (!run || speedPhase !== 'live' || !timer.running) {
      stopSpeedSaver();
      return;
    }
    const at = now();
    run.leftMs = Math.max(0, Math.min(timer.endAt - at, SPEED_CAP_S * 1000));
    run.current.elapsedMs += Math.max(0, at - speedShownAt);
    speedShownAt = at; // the stopwatch goes on from here, so nothing is counted twice
    saveSpeed();
  }

  function stopSpeedSaver() {
    if (speedSaver !== null) window.clearInterval(speedSaver);
    speedSaver = null;
  }

  /** Stop the running clock and the stopwatch, keeping the time left and the time seen. */
  function freezeSpeedClock() {
    const run = speed.run;
    stopSpeedSaver();
    pauseTimer();
    run.current.elapsedMs += Math.max(0, now() - speedShownAt);
    run.leftMs = timer.remainingMs;
    run.deadline = null;
  }

  /** A tapped choice: right +1 and time by speed, wrong −SPEED_WRONG_S; the clock is frozen for the feedback. */
  function speedAnswer(index) {
    const run = speed && speed.run;
    const cur = run && run.current;
    if (!cur || cur.picked !== null || speedPhase !== 'live' || !speedOnScreen()) return;
    freezeSpeedClock();
    cur.picked = index;
    run.answered += 1;
    const right = index === cur.q.correct;
    let seconds;
    let label = '';
    if (right) {
      const ms = Math.round(cur.elapsedMs);
      const tier = speedTier(ms);
      run.score += 1;
      run.times.push(ms);
      seconds = tier.addS;
      label = tier.label;
    } else {
      seconds = -SPEED_WRONG_S;
    }
    // US-47: right and wrong answers count for the difficulty stats (the clock running out never does)
    sendQuestionStat(run, cur.q.id, right ? STAT.correct : STAT.wrong);
    // No markSeen (D-73 ac): Speed Round neither uses nor fills the played-questions list; a question
    // never repeats within one run (usedIds, sent as exclude).
    extendDeadline(seconds * 1000);
    run.leftMs = timer.remainingMs;
    speedPhase = 'feedback';
    saveSpeed();
    stopReading();
    renderRunChoices(cur.q, cur, speedAnswer);
    renderSpeedPanel();
    showSpeedFeedback(right, label, seconds);
    speedTicker = window.setTimeout(afterSpeedFeedback, SPEED_FEEDBACK_MS);
  }

  function afterSpeedFeedback() {
    speedTicker = null;
    const run = speed && speed.run;
    if (!run || speedPhase !== 'feedback') return;
    if (run.leftMs <= 0) finishSpeed();
    else nextSpeedQuestion();
  }

  /**
   * "Lightning! +5 s" or "Wrong! −3 s. The right answer was B, Ottawa." in the polite live line, and
   * the "+5 s" / "−3 s" that floats by the clock (still under reduced motion, CSS).
   */
  function showSpeedFeedback(right, label, seconds) {
    const delta = speedDeltaText(seconds);
    const cur = speed.run.current;
    if (right) {
      showStreakFeedback(t('speed.rightLine', { label: t(label), delta: delta }), 'is-good');
    } else {
      const answer = cur.q.choices[cur.q.correct];
      const arabic = cur.lang === 'ar';
      showStreakFeedback(t('speed.wrongLine', { delta: delta }) + t('run.rightWas', { letter: CHOICE_LETTERS[cur.q.correct] }),
        'is-bad', { text: arabic ? answer.text_ar : answer.text, arabic: arabic });
    }
    const float = dom.speedDelta;
    float.textContent = delta;
    float.className = 'speed-delta ' + (seconds >= 0 ? 'is-gain' : 'is-loss');
    float.hidden = false;
  }

  /** The clock reached 0 on an open question: it shows as time's up (no stat is sent), then the result. */
  function onSpeedTimeUp() {
    const run = speed && speed.run;
    if (!run || speedPhase !== 'live') return;
    stopSpeedSaver();
    speedPhase = 'over';
    run.leftMs = 0;
    run.deadline = null;
    run.current.picked = STREAK_TIME_UP;
    saveSpeed();
    renderRunChoices(run.current.q, run.current, speedAnswer);
    showStreakFeedback(t('timer.up'), 'is-bad');
    speedTicker = window.setTimeout(finishSpeed, SPEED_FEEDBACK_MS);
  }

  /** The panel: "Best: 12", the score, the hint, End run (Next only for "Try again"). */
  function renderSpeedPanel() {
    const run = speed.run;
    setRunPanelTexts(t('speed.name'), t('speed.score'), t('speed.hint', { wrong: SPEED_WRONG_S, cap: SPEED_CAP_S }));
    dom.streakName.textContent = t('speed.bestLabel', { n: speed.best });
    dom.streakName.style.borderInlineStartColor = 'var(--gold)'; // the right edge in Arabic
    dom.streakCount.textContent = String(run.score);
    dom.streakChances.hidden = true; // no second chances here
    if (speedPhase !== 'loading') dom.streakNext.hidden = true;
    dom.streakEnd.hidden = false;
    dom.streakEnd.disabled = false;
  }

  function toggleSpeedLang() {
    const run = speed.run;
    const cur = run.current;
    if (!isFilled(cur.q.question_ar)) return;
    cur.lang = cur.lang === 'ar' ? 'en' : 'ar';
    run.lang = cur.lang; // the next questions keep the chosen language
    renderRunLang(cur.q, cur, speedAnswer);
    saveSpeed();
  }

  // --- Pause (hidden tab, reload) and End run ---

  /** The tab was hidden (or the page is being left): the run waits for a tap. */
  function pauseSpeed() {
    if (!speed || !speed.run) return;
    if (speedPhase === 'live') {
      freezeSpeedClock();
      enterSpeedPause();
    } else if (speedPhase === 'wait' || speedPhase === 'countdown') {
      stopSpeedTimers();
      enterSpeedPause();
    } else if (speedPhase === 'feedback' || speedPhase === 'loading' || speedPhase === 'hold') {
      speedPauseWanted = true; // pauses when the next question opens (or the confirm closes)
      saveSpeed();
    }
  }

  function enterSpeedPause() {
    speedPhase = 'paused';
    speedPauseWanted = false;
    stopReading();
    saveSpeed();
    showSpeedOverlay('paused');
    dom.speedResume.focus();
  }

  function onSpeedResume() {
    if (speedPhase !== 'paused' || !speed || !speed.run) return;
    showSpeedOverlay(null);
    if (!speed.run.started) startSpeedCountdown();
    else armSpeedQuestion();
  }

  function onSpeedVisibility() {
    if (document.hidden) pauseSpeed();
  }

  /** End run (or Android Back): the clock is frozen while the confirm is open. */
  function onSpeedEnd() {
    if (!speedOnScreen() || speedPhase === 'over' || speedPhase === 'paused') return;
    const wasLive = speedPhase === 'live';
    const before = speedPhase;
    if (wasLive) {
      freezeSpeedClock();
      speedPhase = 'hold';
      saveSpeed();
    } else if (speedPhase === 'wait') {
      stopSpeedTimers();
    }
    if (window.confirm(t('speed.endConfirm', { n: speed.run.score }))) {
      finishSpeed();
      return;
    }
    if (!speed.run || speedPhase === 'over') return;
    if (wasLive || before === 'wait') {
      if (speedPauseWanted || document.hidden) enterSpeedPause();
      else if (wasLive) goSpeedLive();
      else armSpeedQuestion();
    }
  }

  // --- Result ---

  /** The run is over: the result (with the personal best) is saved and shown, and sent to the leaderboard (US-60). */
  function finishSpeed() {
    const data = speed;
    const run = data && data.run;
    if (!run) return;
    stopTimer();
    stopSpeedTimers();
    speedPhase = 'over';
    speedPauseWanted = false;
    stopReading();
    const result = {
      score: run.score,
      prevBest: data.best,
      newBest: run.score > data.best,
      name: run.name,
      save: run.score >= 1 && run.name ? 'pending' : 'none', // only runs with 1 or more correct answers go on the board
      saved: null,
    };
    speedSaveError = null;
    if (result.newBest) {
      data.best = run.score;
      data.bestAt = Date.now();
    }
    data.last = result;
    data.run = null;
    data.onResult = true;
    saveSpeed();
    showSpeedOverlay(null);
    showSpeedResult();
  }

  /** The result screen; a run not on the leaderboard yet is sent (again after a reload, as the Streak's). */
  function showSpeedResult() {
    speedPhase = 'idle';
    renderSpeedResult();
    dom.speedShareStatus.textContent = '';
    clearMessage(dom.speedMsg);
    showScreen('speed');
    dom.speedTitle.focus();
    if (speed.last.save === 'pending' && !speedSaving && !speedSaveError) saveSpeedScore();
  }

  function renderSpeedResult() {
    const r = speed.last;
    dom.speedScore.textContent = String(r.score);
    dom.speedScoreLabel.textContent = tn('speed.scoreLabel', r.score);
    let best;
    if (r.newBest) best = t('speed.newBest');
    else if (r.score > 0 && r.score === r.prevBest) best = t('speed.tiedBest', { best: r.prevBest });
    else if (r.score < r.prevBest) best = tn('speed.away', r.prevBest - r.score, { best: r.prevBest });
    else best = t('speed.noScore');
    dom.speedBest.textContent = best;
    dom.speedBest.classList.toggle('is-new', r.newBest);
    renderSpeedRank();
  }

  /**
   * US-60: the leaderboard line under the best: "Saving your score...", the ranks, "Only runs with 1 or
   * more ...", or the save failure with Try again. Play again and New Game wait while it saves.
   */
  function renderSpeedRank() {
    const r = speed.last;
    const board = LB_BOARDS.speed;
    clearMessage(dom.speedSaveMsg);
    dom.speedRank.hidden = false;
    if (r.save === 'saved') {
      dom.speedRank.textContent = rankText(r.saved, r.score);
    } else if (r.save === 'pending' && speedSaveError && !speedSaving) {
      dom.speedRank.hidden = true;
      showSaveFailure(dom.speedSaveMsg, t(board.saveFailed, { reason: errorText(speedSaveError) }), saveSpeedScore);
    } else if (r.save === 'pending') {
      dom.speedRank.textContent = t(board.saving);
    } else if (r.save === 'none' && r.name !== null && r.score === 0) {
      dom.speedRank.textContent = t(board.onlyOne);
    } else {
      dom.speedRank.hidden = true; // a result from before US-60, or left unsaved
    }
    dom.speedAgain.disabled = speedSaving;
    dom.speedNewGame.disabled = speedSaving;
  }

  /**
   * The leaderboard screen's view of the result (the Streak's `result` shape), or null when the result is
   * not on the board (BUG-60-01: a result from before US-60 has no name; a score of 0 or a dropped save):
   * the board then shows no headline, no rank line and no highlighted row.
   */
  function speedBoardResult() {
    const r = speed.last;
    if (typeof r.name !== 'string' || (r.save !== 'pending' && r.save !== 'saved')) return null;
    return { name: r.name, count: r.score, saving: speedSaving, saved: r.saved, saveError: speedSaveError };
  }

  /** POST the result to the Speed leaderboard (US-60); on failure it stays pending, with Try again. */
  async function saveSpeedScore() {
    const r = speed && speed.last;
    if (!r || r.save !== 'pending' || speedSaving) return;
    speedSaving = true;
    speedSaveError = null;
    showSpeedSave();
    try {
      const saved = await apiPost(SPEED_API, { name: r.name, streak: r.score });
      if (!isValidRankReply(saved)) throw textError('err.response');
      r.saved = { rank: saved.rank, best: saved.best, week_rank: saved.week_rank, week_best: saved.week_best };
      r.save = 'saved';
    } catch (err) {
      speedSaveError = err; // shown with errorText(), in the language on screen
    }
    speedSaving = false;
    if (speed && speed.last === r) {
      saveSpeed();
      showSpeedSave();
    }
  }

  /** Draw the save state where it shows: the result screen or the Speed leaderboard opened from it. */
  function showSpeedSave() {
    if (state.screen === 'speed') {
      renderSpeedRank();
    } else if (state.screen === 'leaderboard' && lbBoard === 'speed' && leaderboardResult && speedBoardResult()) {
      leaderboardResult = speedBoardResult();
      clearMessage(dom.lbMsg);
      renderLeaderboardHead(leaderboardResult);
      if (!speedSaving) loadLeaderboardRows(); // the rows wait for the save, as the Streak's
    }
  }

  /** Leaving a result whose save failed loses it: ask first (as the Streak's lb.unsaved). */
  function confirmDropSpeedUnsaved() {
    const r = speed && speed.last;
    if (!r || r.save !== 'pending') return true;
    if (!window.confirm(t('speed.unsaved', { n: r.score }))) return false;
    r.save = 'dropped';
    speedSaveError = null;
    saveSpeed();
    renderSpeedRank();
    return true;
  }

  /** "Leaderboard" on the result: the Speed leaderboard with this run's headline and rank. */
  function onSpeedBoard() {
    if (state.screen !== 'speed' || !speed || !speed.last) return;
    openLeaderboard(speedBoardResult(), 'speed');
  }

  /** Back on the Speed leaderboard: to the result it came from, or to setup. */
  function onSpeedBoardBack() {
    if (speed && speed.last && speed.onResult) { // opened from the result (setup clears onResult)
      showSpeedResult();
      dom.speedBoard.focus();
    } else if (state.setup) {
      showScreen('setup');
      updateStartButton();
    } else {
      startSetup();
    }
  }

  /** "Mokh Rush Speed Round: 18 correct" (js/share.js adds the site link). */
  function speedShareText(r) {
    return t('speed.share', { count: tn('speed.correctCount', r.score) });
  }

  function onSpeedShare() {
    if (speed && speed.last && state.screen === 'speed') shareText(speedShareText(speed.last), dom.speedShareStatus);
  }

  /** Play again: a new run, from the name step (prefilled with this run's name). */
  async function onSpeedAgain() {
    if (dom.speedAgain.disabled || state.screen !== 'speed' || !confirmDropSpeedUnsaved()) return;
    clearMessage(dom.speedMsg);
    dom.speedAgain.disabled = true;
    dom.speedAgain.textContent = t('setup.starting');
    try {
      await startSpeedRun();
    } catch (err) {
      showMessage(dom.speedMsg, () => t('speed.failed', { reason: errorText(err) }), 'error');
    } finally {
      dom.speedAgain.disabled = speedSaving;
      dom.speedAgain.textContent = t('lb.again');
    }
  }

  /** New Game on the result: back to setup. Never newGame(): that would clear a saved Streak run. */
  function onSpeedNewGame() {
    if (dom.speedNewGame.disabled || !confirmDropSpeedUnsaved()) return;
    if (speed) {
      speed.onResult = false;
      saveSpeed();
    }
    if (state.setup) {
      showScreen('setup');
      updateStartButton();
      dom.speedOpenBtn.focus();
    } else {
      startSetup();
    }
  }

  /** A reload: the result screen, or the run paused with the time it had left. Returns true when shown. */
  function restoreSavedSpeed() {
    const data = loadSpeed();
    if (!data || (!data.run && !data.onResult)) return false;
    speed = data;
    try {
      if (data.run) restoreSpeedRun();
      else showSpeedResult();
      return true;
    } catch (err) {
      stopTimer();
      stopSpeedTimers();
      speedPhase = 'idle';
      showSpeedOverlay(null);
      speed.run = null;
      speed.onResult = false;
      saveSpeed();
      return false;
    }
  }

  function restoreSpeedRun() {
    const run = speed.run;
    // Closed without a pause (BUG-59-03): the time left saved while the clock ran (at most SPEED_SAVE_MS
    // old), never more than that and never above the cap; the run comes back paused like a reload.
    run.leftMs = Math.max(0, Math.min(run.leftMs, SPEED_CAP_S * 1000));
    run.deadline = null;
    if (run.started && run.leftMs <= 0) { // the clock ran out while the page was closed: no stat is sent
      finishSpeed();
      return;
    }
    if (!run.started || !run.current) {
      if (run.name === null) showSpeedIntro(); // US-60: closed on the name step
      else startSpeedCountdown();
      return;
    }
    speedPauseWanted = true; // the question opens under "Paused, tap to resume"
    openSpeedQuestion();
  }

  function bindSpeedEvents() {
    dom.speedOpenBtn.addEventListener('click', onSpeedOpen);
    dom.speedIntro.addEventListener('submit', onSpeedGo); // Start, or Enter in the name field
    dom.speedCancel.addEventListener('click', onSpeedOverlayBack);
    dom.speedNameInput.addEventListener('input', () => setFieldError(dom.speedNameInput, dom.speedNameError, ''));
    dom.speedBoard.addEventListener('click', onSpeedBoard);
    dom.speedResume.addEventListener('click', onSpeedResume);
    dom.speedAgain.addEventListener('click', onSpeedAgain);
    dom.speedShare.addEventListener('click', onSpeedShare);
    dom.speedNewGame.addEventListener('click', onSpeedNewGame);
    setText(dom.speedRule2, () => t('speed.rule2', { n: SPEED_WRONG_S }));
    document.addEventListener('visibilitychange', onSpeedVisibility);
    window.addEventListener('pagehide', pauseSpeed); // a reload keeps the time left exactly
  }

  // ---------- Daily Crossword (US-58, D-72) ----------
  // One grid per UTC day for everyone: api/crossword.php builds it from the question bank (clue = the
  // question, word = the cleaned answer, A-Z only) on the day's first request. The browser checks the
  // letters (the answers are in the payload, D-37 g). Letters, revealed cells, hints, the time and the
  // finished lock are saved on this device only (CROSSWORD_KEY), so a reload resumes the puzzle.

  function cwKey(row, col) {
    return row + ',' + col;
  }

  function cwOther(dir) {
    return dir === 'across' ? 'down' : 'across';
  }

  /**
   * The white cells of a puzzle: "row,col" -> { row, col, answer, n, across, down } where across/down
   * is the index of the word running that way (or null). Null when the words leave the grid, overlap
   * the same way or disagree on a crossing letter or a clue number.
   */
  function crosswordCells(p) {
    const cells = {};
    for (let i = 0; i < p.words.length; i++) {
      const w = p.words[i];
      for (let k = 0; k < w.length; k++) {
        const row = w.row + (w.dir === 'down' ? k : 0);
        const col = w.col + (w.dir === 'across' ? k : 0);
        if (row >= p.height || col >= p.width) return null;
        const key = cwKey(row, col);
        if (!cells[key]) cells[key] = { row: row, col: col, answer: w.answer[k], n: null, across: null, down: null };
        const cell = cells[key];
        if (cell.answer !== w.answer[k] || cell[w.dir] !== null) return null;
        cell[w.dir] = i;
        if (k === 0) {
          if (cell.n !== null && cell.n !== w.n) return null;
          cell.n = w.n;
        }
      }
    }
    return cells;
  }

  const textOrNull = (value) => value === null || typeof value === 'string';

  function isValidCrosswordWord(w) {
    return isPlainObject(w) && Number.isInteger(w.n) && w.n >= 1 &&
      Number.isInteger(w.row) && w.row >= 0 && Number.isInteger(w.col) && w.col >= 0 &&
      (w.dir === 'across' || w.dir === 'down') &&
      typeof w.answer === 'string' && CW_WORD_PATTERN.test(w.answer) && w.length === w.answer.length &&
      textOrNull(w.question) && textOrNull(w.question_ar) &&
      textOrNull(w.category_name) && textOrNull(w.category_name_ar);
  }

  /** Size and words of a puzzle (from the server or a save) make one consistent grid. */
  function isValidPuzzle(p) {
    return Number.isInteger(p.width) && p.width >= 1 && p.width <= CW_MAX_SIZE &&
      Number.isInteger(p.height) && p.height >= 1 && p.height <= CW_MAX_SIZE &&
      Array.isArray(p.words) && p.words.length >= 1 && p.words.length <= CW_MAX_WORDS &&
      p.words.every(isValidCrosswordWord) && crosswordCells(p) !== null;
  }

  /** Only the fields the game uses, so a save never grows with unknown data. */
  function parseCrosswordWord(w) {
    return {
      n: w.n, row: w.row, col: w.col, dir: w.dir, length: w.length, answer: w.answer,
      question: w.question, question_ar: isFilled(w.question_ar) ? w.question_ar : null,
      category_name: w.category_name, category_name_ar: isFilled(w.category_name_ar) ? w.category_name_ar : null,
    };
  }

  /** Today's puzzle from api/crossword.php: { date, number, nextAt, width, height, words }. Throws on errors. */
  async function fetchCrossword() {
    const data = await apiGet('crossword.php');
    const ok = isPlainObject(data) && typeof data.date === 'string' && DATE_PATTERN.test(data.date) &&
      Number.isInteger(data.number) && data.number >= 1 &&
      Number.isInteger(data.seconds_to_next) && data.seconds_to_next >= 0 && data.seconds_to_next * 1000 <= DAY_MS &&
      isValidPuzzle(data);
    if (!ok) throw textError('err.crossword');
    return {
      date: data.date,
      number: data.number,
      nextAt: Date.now() + data.seconds_to_next * 1000,
      width: data.width,
      height: data.height,
      words: data.words.map(parseCrosswordWord),
    };
  }

  function saveCrossword() {
    try {
      if (crossword) window.localStorage.setItem(CROSSWORD_KEY, JSON.stringify(crossword));
      else window.localStorage.removeItem(CROSSWORD_KEY);
    } catch (err) {
      // Storage full or disabled: the puzzle still works, it just won't survive a reload.
    }
  }

  /** The saved crossword, or null when nothing valid is saved (corrupt data is removed). */
  function loadCrossword() {
    let raw = null;
    try {
      raw = window.localStorage.getItem(CROSSWORD_KEY);
    } catch (err) {
      return null;
    }
    if (raw === null) return null;
    try {
      const saved = JSON.parse(raw);
      if (isValidCrosswordRun(saved)) return saved;
    } catch (err) {
      // invalid JSON: discard it
    }
    try {
      window.localStorage.removeItem(CROSSWORD_KEY);
    } catch (err) {
      // nothing to clear
    }
    return null;
  }

  function isValidCrosswordRun(run) {
    if (!isPlainObject(run) || run.version !== CROSSWORD_VERSION ||
        typeof run.date !== 'string' || !DATE_PATTERN.test(run.date) ||
        !Number.isInteger(run.number) || run.number < 1 || !Number.isFinite(run.nextAt) ||
        !isValidPuzzle(run) || !isPlainObject(run.cells) ||
        !Array.isArray(run.revealed) || !Array.isArray(run.wrong) ||
        !Number.isInteger(run.hints) || run.hints !== run.revealed.length ||
        !(run.startedAt === null || Number.isFinite(run.startedAt)) ||
        typeof run.done !== 'boolean' || typeof run.logged !== 'boolean' || typeof run.onScreen !== 'boolean') {
      return false;
    }
    const cells = crosswordCells(run);
    const lettersOk = Object.keys(run.cells).every((key) => hasOwn(cells, key) && /^[A-Z]$/.test(run.cells[key]));
    const unique = (list) => list.every((key, i) => typeof key === 'string' && hasOwn(cells, key) && list.indexOf(key) === i);
    const revealedOk = unique(run.revealed) && run.revealed.every((key) => run.cells[key] === cells[key].answer);
    const cur = run.cur;
    const curOk = isPlainObject(cur) && Number.isInteger(cur.row) && Number.isInteger(cur.col) &&
      hasOwn(cells, cwKey(cur.row, cur.col)) && (cur.dir === 'across' || cur.dir === 'down') &&
      cells[cwKey(cur.row, cur.col)][cur.dir] !== null;
    if (!lettersOk || !unique(run.wrong) || !revealedOk || !curOk) return false;
    if (!run.done) return run.solvedMs === null;
    return Number.isFinite(run.solvedMs) && run.solvedMs >= 0 &&
      Object.keys(cells).every((key) => run.cells[key] === cells[key].answer);
  }

  /** A crossword is open and still being solved. */
  function crosswordPlaying() {
    return state.screen === 'crossword' && !!crossword && !crossword.done;
  }

  /** The same grid (size, words and places): a save of it can go on with a fresh copy of the clues. */
  function samePuzzle(a, b) {
    const shape = (p) => JSON.stringify([p.width, p.height, p.words.map((w) => [w.row, w.col, w.dir, w.answer])]);
    return shape(a) === shape(b);
  }

  /** "Daily Crossword" on setup: today's puzzle, resumed or finished on this device, or a fresh one. */
  async function onCrosswordOpen() {
    const s = state.setup;
    if (!s || s.streak || dom.crosswordOpenBtn.disabled) return;
    clearMessage(dom.startMsg);
    s.starting = true;
    dom.crosswordOpenLabel.textContent = t('common.loading');
    updateStartButton();
    try {
      const puzzle = await fetchCrossword();
      if (state.setup !== s || state.screen !== 'setup') return;
      openCrossword(puzzle);
    } catch (err) {
      // Stay on setup with every input intact; a 503 (no grid today, no table) gets the friendly text.
      showMessage(dom.startMsg, () => crosswordErrorText(err, 'cw.failed'), 'error');
    } finally {
      s.starting = false;
      dom.crosswordOpenLabel.textContent = t('cw.name');
      updateStartButton();
    }
  }

  function crosswordErrorText(err, key) {
    return err && err.status === 503 ? t('cw.unavailable') : t(key, { reason: errorText(err) });
  }

  /** Show today's puzzle: this device's progress on it when there is one, else a fresh start. */
  function openCrossword(puzzle) {
    const saved = crossword || loadCrossword();
    if (saved && saved.date === puzzle.date && samePuzzle(saved, puzzle)) {
      crossword = saved;
      crossword.words = puzzle.words; // fresh clue texts (Admin fixes)
      crossword.nextAt = puzzle.nextAt;
      crossword.number = puzzle.number;
    } else {
      crossword = newCrosswordRun(puzzle); // an earlier day's save is dropped (D-72 q)
    }
    crossword.onScreen = true;
    saveCrossword();
    showCrossword();
  }

  function newCrosswordRun(p) {
    const first = p.words[0]; // the server lists across words first, by number
    return {
      version: CROSSWORD_VERSION,
      date: p.date,
      number: p.number,
      nextAt: p.nextAt,
      width: p.width,
      height: p.height,
      words: p.words,
      cells: {},
      revealed: [],
      wrong: [],
      hints: 0,
      startedAt: null,
      solvedMs: null,
      done: false,
      logged: false,
      onScreen: true,
      cur: { row: first.row, col: first.col, dir: first.dir },
    };
  }

  /** Open the crossword screen for `crossword` (also after a reload). */
  function showCrossword() {
    cwCells = crosswordCells(crossword);
    cwLang = {};
    clearCwMsg();
    dom.cwShareStatus.textContent = '';
    clearMessage(dom.cwResultMsg);
    dom.cwPlay.hidden = true;
    renderCrossword();
    showScreen('crossword');
    startCrosswordTicker();
    if (crossword.done) dom.cwSolved.focus();
    else dom.cwTitle.focus();
  }

  /** Back: to the setup screen; the progress stays saved on this device (D-72 q). */
  function onCrosswordBack() {
    if (crossword) {
      crossword.onScreen = false;
      saveCrossword();
    }
    stopCrosswordTicker();
    if (state.setup) {
      showScreen('setup');
      updateStartButton();
    } else {
      startSetup();
    }
  }

  // --- Cursor and words ---

  function curKey() {
    return cwKey(crossword.cur.row, crossword.cur.col);
  }

  function activeWordIndex() {
    return cwCells[curKey()][crossword.cur.dir];
  }

  /** The cell keys of word i, first letter first. */
  function cwWordKeys(i) {
    const w = crossword.words[i];
    const keys = [];
    for (let k = 0; k < w.length; k++) {
      keys.push(cwKey(w.row + (w.dir === 'down' ? k : 0), w.col + (w.dir === 'across' ? k : 0)));
    }
    return keys;
  }

  function isRevealed(key) {
    return crossword.revealed.indexOf(key) !== -1;
  }

  function isRightCell(key) {
    return crossword.cells[key] === cwCells[key].answer;
  }

  /** Put the cursor on a cell; the direction stays when a word runs that way there, else it switches. */
  function moveCursor(key, dir) {
    const cell = cwCells[key];
    const want = dir || crossword.cur.dir;
    crossword.cur = { row: cell.row, col: cell.col, dir: cell[want] !== null ? want : cwOther(want) };
  }

  // --- Typing ---

  /** A letter A-Z: into the current cell (revealed cells are skipped), then on to the next cell of the word. */
  function cwType(letter) {
    if (!crosswordPlaying()) return;
    const keys = cwWordKeys(activeWordIndex());
    let at = keys.indexOf(curKey());
    while (at < keys.length && isRevealed(keys[at])) at++;
    if (at >= keys.length) return; // the rest of the word is revealed
    setCwLetter(keys[at], letter);
    let next = at + 1;
    while (next < keys.length && isRevealed(keys[next])) next++;
    moveCursor(keys[next < keys.length ? next : at]);
    afterCwChange();
  }

  /** Backspace: clear the current cell, or when it is empty go back one cell of the word and clear that. */
  function cwBackspace() {
    if (!crosswordPlaying()) return;
    const key = curKey();
    if (crossword.cells[key] && !isRevealed(key)) {
      setCwLetter(key, '');
      afterCwChange();
      return;
    }
    const keys = cwWordKeys(activeWordIndex());
    let prev = keys.indexOf(key) - 1;
    while (prev >= 0 && isRevealed(keys[prev])) prev--;
    if (prev < 0) return;
    moveCursor(keys[prev]);
    setCwLetter(keys[prev], '');
    afterCwChange();
  }

  /** An arrow key: the next white cell that way (dark cells are skipped); the direction follows the arrow's axis. */
  function cwArrow(dr, dc) {
    if (!crosswordPlaying()) return;
    const axis = dr === 0 ? 'across' : 'down';
    let row = crossword.cur.row + dr;
    let col = crossword.cur.col + dc;
    while (row >= 0 && col >= 0 && row < crossword.height && col < crossword.width && !cwCells[cwKey(row, col)]) {
      row += dr;
      col += dc;
    }
    const key = cwKey(row, col);
    moveCursor(cwCells[key] ? key : curKey(), axis);
    saveCrossword();
    renderCrosswordPlay();
  }

  /** Set or clear one cell's letter; a changed cell loses its Check mark. The first letter starts the clock. */
  function setCwLetter(key, letter) {
    if (letter) crossword.cells[key] = letter;
    else delete crossword.cells[key];
    crossword.wrong = crossword.wrong.filter((k) => k !== key);
    if (letter) startCrosswordClock();
  }

  /** The timer starts on the first letter typed or revealed; that is also when the game log line goes (D-72 o). */
  function startCrosswordClock() {
    if (crossword.startedAt === null) crossword.startedAt = Date.now();
    if (!crossword.logged) {
      crossword.logged = true;
      postGameLog({ mode: 'crossword' });
    }
  }

  /** After a letter changed: solved -> the end; a full but wrong grid -> "Not quite". */
  function afterCwChange() {
    const keys = Object.keys(cwCells);
    if (keys.every(isRightCell)) {
      finishCrossword();
      return;
    }
    if (keys.every((key) => crossword.cells[key])) showCwMsg(() => t('cw.notQuite'), true);
    else clearCwMsg();
    saveCrossword();
    renderCrosswordPlay();
  }

  // --- Tools ---

  /** Check word: mark the wrong letters of the active word (free, unlimited). */
  function onCwCheck() {
    if (!crosswordPlaying()) return;
    let wrong = 0;
    cwWordKeys(activeWordIndex()).forEach((key) => {
      if (!crossword.cells[key] || isRightCell(key)) return;
      wrong++;
      if (crossword.wrong.indexOf(key) === -1) crossword.wrong.push(key);
    });
    if (wrong) showCwMsg(() => tn('cw.checkWrong', wrong), true);
    else showCwMsg(() => t('cw.checkNone'), false);
    saveCrossword();
    renderCrosswordPlay();
    refocusCwInput();
  }

  /**
   * Reveal letter (1 hint): the current cell. A cell that already shows its right letter (typed or
   * revealed) reveals nothing and costs no hint (D-72 x); a short message says so.
   */
  function onCwReveal() {
    if (!crosswordPlaying() || crossword.hints >= CW_FREE_HINTS) return;
    const key = curKey();
    if (!key) return;
    if (isRightCell(key)) {
      showCwMsg(() => t('cw.revealAlready'), false);
      refocusCwInput();
      return;
    }
    crossword.revealed.push(key);
    crossword.hints = crossword.revealed.length;
    setCwLetter(key, cwCells[key].answer);
    afterCwChange();
    refocusCwInput();
  }

  function finishCrossword() {
    crossword.done = true;
    crossword.solvedMs = Math.max(0, Date.now() - (crossword.startedAt || Date.now()));
    crossword.wrong = [];
    clearCwMsg();
    saveCrossword();
    renderCrossword();
    startCrosswordTicker(); // now the countdown to the next crossword
    dom.cwSolved.focus();
  }

  // --- Pointer and keyboard ---

  /** A click on a white cell selects it; a second click on the same cell switches the direction. */
  function onCwGridClick(event) {
    const node = event.target.closest('.cw-cell');
    if (!node || !crosswordPlaying()) return;
    const key = node.getAttribute('data-key');
    if (!cwCells[key]) return;
    if (key === curKey()) {
      const other = cwOther(crossword.cur.dir);
      if (cwCells[key][other] !== null) crossword.cur.dir = other;
    } else {
      moveCursor(key);
    }
    saveCrossword();
    renderCrosswordPlay();
    focusCwInput();
  }

  /** A clue selects its word: the first empty cell, else the first cell. */
  function onCwClueClick(event) {
    const btn = event.target.closest('.cw-clue-btn');
    if (!btn || !crosswordPlaying()) return;
    const i = Number(btn.getAttribute('data-word'));
    const w = crossword.words[i];
    if (!w) return;
    const keys = cwWordKeys(i);
    moveCursor(keys.find((key) => !crossword.cells[key]) || keys[0], w.dir);
    saveCrossword();
    renderCrosswordPlay();
    focusCwInput();
  }

  const CW_ARROWS = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };

  /** Keys while the crossword is played: letters, Backspace / Delete and the arrows (other fields keep theirs). */
  function onCrosswordKey(event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (target !== dom.cwInput && target && target.closest && target.closest('input, textarea, select')) return;
    const key = event.key;
    if (/^[a-zA-Z]$/.test(key)) {
      event.preventDefault();
      cwType(key.toUpperCase());
    } else if (key === 'Backspace' || key === 'Delete') {
      event.preventDefault();
      cwBackspace();
    } else if (hasOwn(CW_ARROWS, key)) {
      event.preventDefault();
      cwArrow(CW_ARROWS[key][0], CW_ARROWS[key][1]);
    }
  }

  /**
   * Phone keyboards often send no usable key code: the letter (or the deletion) arrives as an input
   * event on the hidden field, which always holds one space so Backspace has something to delete.
   */
  function onCwInput(event) {
    const value = dom.cwInput.value;
    resetCwInput();
    const letters = value.toUpperCase().replace(/[^A-Z]/g, '');
    if (letters) letters.split('').forEach(cwType);
    else if (value.length < 1 || (event.inputType && event.inputType.indexOf('delete') === 0)) cwBackspace();
  }

  function resetCwInput() {
    dom.cwInput.value = ' ';
    try {
      dom.cwInput.setSelectionRange(1, 1);
    } catch (err) {
      // not focused: nothing to place
    }
  }

  function focusCwInput() {
    if (!crosswordPlaying()) return;
    dom.cwInput.focus({ preventScroll: true });
    resetCwInput();
  }

  /** After a tool button: back to the grid only when the player was typing in it (no keyboard pops up otherwise). */
  function refocusCwInput() {
    if (cwTyping) focusCwInput();
  }

  // --- Drawing ---

  function renderCrossword() {
    const run = crossword;
    const screen = dom.screens.crossword;
    screen.style.setProperty('--cw-cols', String(run.width));
    screen.style.setProperty('--cw-rows', String(run.height));
    screen.classList.toggle('is-done', run.done);
    dom.cwTitle.textContent = t('cw.number', { n: run.number });
    dom.cwGrid.setAttribute('aria-label', t('cw.grid'));
    dom.cwResult.hidden = !run.done;
    if (run.done) renderCwResult();
    renderCrosswordPlay();
  }

  /** The grid, the active clue, the clue lists and the time; what changes while playing. */
  function renderCrosswordPlay() {
    renderCwGrid();
    renderCwClues();
    renderCwBar();
    renderCwStats();
    renderCwReveal();
  }

  /** Reveal letter shows the hints left (D-72 w) and hides once the 3 free hints are used. */
  function renderCwReveal() {
    const left = Math.max(0, CW_FREE_HINTS - crossword.hints);
    dom.cwReveal.hidden = left === 0;
    dom.cwReveal.textContent = tn('cw.revealLeft', left);
  }

  function renderCwGrid() {
    const run = crossword;
    const playing = !run.done;
    const wordKeys = playing ? cwWordKeys(activeWordIndex()) : [];
    const current = playing ? curKey() : null;
    const grid = dom.cwGrid;
    clear(grid);
    for (let row = 0; row < run.height; row++) {
      for (let col = 0; col < run.width; col++) {
        const key = cwKey(row, col);
        const cell = cwCells[key];
        if (!cell) {
          grid.appendChild(h('div', { className: 'cw-block' }));
          continue;
        }
        let className = 'cw-cell';
        if (wordKeys.indexOf(key) !== -1) className += ' is-word';
        if (key === current) className += ' is-current';
        if (run.wrong.indexOf(key) !== -1) className += ' is-wrong';
        if (isRevealed(key)) className += ' is-revealed';
        grid.appendChild(h('div', { className: className, 'data-key': key }, [
          cell.n !== null ? h('span', { className: 'cw-num', text: String(cell.n) }) : null,
          h('span', { className: 'cw-letter', text: run.cells[key] || '' }),
        ]));
      }
    }
    if (playing) {
      dom.cwBoard.style.setProperty('--cw-r', String(run.cur.row));
      dom.cwBoard.style.setProperty('--cw-c', String(run.cur.col));
      dom.cwInput.setAttribute('aria-label', cwClueLabel(activeWordIndex()) + ': ' + cwClue(activeWordIndex()).text);
    }
  }

  /** The clue's language: the player's toggle, else Arabic in the Arabic interface when it has Arabic (D-72 g). */
  function cwClueLang(i) {
    const w = crossword.words[i];
    if (!isFilled(w.question_ar)) return 'en';
    if (hasOwn(cwLang, i)) return cwLang[i];
    return i18n.isArabic() ? 'ar' : 'en';
  }

  /** { text, lang } of word i's clue; a deleted question reads "Clue removed: use Reveal letter." */
  function cwClue(i) {
    const w = crossword.words[i];
    if (w.question === null) return { text: t('cw.clueRemoved'), lang: i18n.lang() };
    const lang = cwClueLang(i);
    return { text: lang === 'ar' ? w.question_ar : w.question, lang: lang };
  }

  /** "3 Across" */
  function cwClueLabel(i) {
    const w = crossword.words[i];
    return t(w.dir === 'across' ? 'cw.acrossLabel' : 'cw.downLabel', { n: w.n });
  }

  function renderCwClues() {
    const active = crossword.done ? -1 : activeWordIndex();
    let activeNode = null;
    [['across', dom.cwAcross], ['down', dom.cwDown]].forEach((pair) => {
      const list = pair[1];
      clear(list);
      crossword.words.forEach((w, i) => {
        if (w.dir !== pair[0]) return;
        const clue = cwClue(i);
        const item = h('li', { className: 'cw-clue' + (i === active ? ' is-active' : '') }, [
          h('button', { type: 'button', className: 'cw-clue-btn', 'data-word': String(i), disabled: crossword.done }, [
            h('span', { className: 'cw-clue-n', text: w.n + '. ' }),
            h('span', { text: clue.text, lang: clue.lang, dir: 'auto' }),
            h('span', { className: 'cw-clue-len', text: ' (' + w.length + ')' }),
          ]),
        ]);
        if (i === active) {
          item.firstChild.setAttribute('aria-current', 'true');
          activeNode = item;
        }
        list.appendChild(item);
      });
    });
    if (activeNode) scrollClueIntoPanel(activeNode);
  }

  /** Keep the active clue in view inside the clue panel only (the page itself never scrolls for it). */
  function scrollClueIntoPanel(node) {
    const panel = dom.cwClues;
    if (panel.scrollHeight <= panel.clientHeight + 1) return; // not a scrolling panel (phones)
    const top = node.offsetTop;
    const bottom = top + node.offsetHeight;
    if (top < panel.scrollTop) panel.scrollTop = top;
    else if (bottom > panel.scrollTop + panel.clientHeight) panel.scrollTop = bottom - panel.clientHeight;
  }

  /** The active clue above the grid: "3 Across · Category", the clue with its length, and the EN/AR toggle. */
  function renderCwBar() {
    if (crossword.done) return;
    const i = activeWordIndex();
    const w = crossword.words[i];
    const clue = cwClue(i);
    const category = w.category_name === null ? '' : ' ' + DOT + ' ' + iso(localName(w.category_name, w.category_name_ar));
    dom.cwBarLabel.textContent = cwClueLabel(i) + category;
    dom.cwBarText.textContent = clue.text + ' (' + w.length + ')';
    dom.cwBarText.lang = clue.lang;
    const hasArabic = w.question !== null && isFilled(w.question_ar);
    dom.cwBarLang.hidden = !hasArabic;
    if (hasArabic) dom.cwBarLang.textContent = t(clue.lang === 'ar' ? 'lang.showEnglish' : 'lang.showArabic');
  }

  /** EN/AR on the active clue (per clue, not saved: a reload shows the default again, D-72 g). */
  function onCwLangToggle() {
    if (!crosswordPlaying()) return;
    const i = activeWordIndex();
    if (!isFilled(crossword.words[i].question_ar)) return;
    cwLang[i] = cwClueLang(i) === 'ar' ? 'en' : 'ar';
    renderCwClues();
    renderCwBar();
    renderCwGrid(); // the hidden field's label reads the clue too
  }

  function cwHintsText(hints) {
    return hints === 0 ? t('cw.noHints') : tn('cw.hints', hints);
  }

  /** "4:05" (minutes) or "1:02:09" after an hour. */
  function formatDuration(ms) {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(seconds / 3600);
    const mmss = String(Math.floor(seconds / 60) % 60).padStart(hours ? 2 : 1, '0') + ':' + String(seconds % 60).padStart(2, '0');
    return hours ? hours + ':' + mmss : mmss;
  }

  function crosswordElapsed() {
    if (crossword.done) return crossword.solvedMs;
    return crossword.startedAt === null ? 0 : Date.now() - crossword.startedAt;
  }

  function renderCwStats() {
    dom.cwTimer.textContent = ltr(formatDuration(crosswordElapsed()));
    dom.cwHints.textContent = cwHintsText(crossword.hints);
  }

  function showCwMsg(text, bad) {
    setText(dom.cwMsg, text);
    dom.cwMsg.classList.toggle('is-bad', bad);
  }

  function clearCwMsg() {
    setText(dom.cwMsg, '');
    dom.cwMsg.classList.remove('is-bad');
  }

  // --- Result, share and the next puzzle ---

  function renderCwResult() {
    dom.cwSolved.textContent = t('cw.solved', { time: ltr(formatDuration(crossword.solvedMs)) });
    dom.cwHintsLine.textContent = cwHintsText(crossword.hints);
    tickCrosswordCountdown();
  }

  /** "Mokh Rush Crossword #12: solved in 4:05 with 2 hints" (js/share.js adds the site link). */
  function crosswordShareText(run) {
    const hints = run.hints === 0 ? t('cw.shareNoHints') : tn('cw.shareHints', run.hints);
    return t('cw.share', { n: run.number, time: ltr(formatDuration(run.solvedMs)), hints: hints });
  }

  function onCrosswordShare() {
    if (crossword && crossword.done && state.screen === 'crossword') shareText(crosswordShareText(crossword), dom.cwShareStatus);
  }

  /** One interval while the screen is open: the running time, or once solved the countdown. */
  function startCrosswordTicker() {
    stopCrosswordTicker();
    cwTicker = window.setInterval(tickCrossword, CW_TICK_MS);
  }

  function stopCrosswordTicker() {
    if (cwTicker !== null) window.clearInterval(cwTicker);
    cwTicker = null;
  }

  function tickCrossword() {
    if (!crossword || state.screen !== 'crossword') {
      stopCrosswordTicker();
      return;
    }
    if (crossword.done) tickCrosswordCountdown();
    else renderCwStats();
  }

  /** "Next crossword in 13:05:22" to midnight UTC; at 0 the "Play the new crossword" button. */
  function tickCrosswordCountdown() {
    const left = Math.min(crossword.nextAt - Date.now(), DAY_MS);
    dom.cwNext.hidden = left <= 0;
    dom.cwPlay.hidden = left > 0;
    if (left > 0) dom.cwNext.textContent = t('cw.next', { time: ltr(formatCountdown(left)) });
    else stopCrosswordTicker();
  }

  /** "Play the new crossword": the server's date decides whether a new one has started. */
  async function onCrosswordPlayNew() {
    if (!crossword || state.screen !== 'crossword' || dom.cwPlay.disabled) return;
    clearMessage(dom.cwResultMsg);
    dom.cwPlay.disabled = true;
    dom.cwPlay.textContent = t('common.loading');
    try {
      const puzzle = await fetchCrossword();
      if (state.screen !== 'crossword') return;
      if (puzzle.date === crossword.date) { // this device's clock ran ahead of the server's day
        crossword.nextAt = puzzle.nextAt;
        saveCrossword();
        renderCrossword();
        startCrosswordTicker();
        return;
      }
      openCrossword(puzzle);
    } catch (err) {
      showMessage(dom.cwResultMsg, () => crosswordErrorText(err, 'cw.newFailed'), 'error');
    } finally {
      dom.cwPlay.disabled = false;
      dom.cwPlay.textContent = t('cw.playNew');
    }
  }

  /**
   * A reload while the crossword screen was open (US-58): the same day's puzzle or result comes back.
   * A save from a day that is over goes to setup; the button then loads today's puzzle.
   */
  function restoreSavedCrossword() {
    const saved = loadCrossword();
    if (!saved || !saved.onScreen) return false;
    crossword = saved;
    if (Date.now() >= saved.nextAt) {
      crossword.onScreen = false;
      saveCrossword();
      return false;
    }
    try {
      showCrossword();
      return true;
    } catch (err) {
      stopCrosswordTicker();
      crossword = null;
      saveCrossword();
      return false;
    }
  }

  function bindCrosswordEvents() {
    dom.crosswordOpenBtn.addEventListener('click', onCrosswordOpen);
    dom.cwBack.addEventListener('click', onCrosswordBack);
    dom.cwGrid.addEventListener('click', onCwGridClick);
    dom.cwClues.addEventListener('click', onCwClueClick);
    dom.cwCheck.addEventListener('click', onCwCheck);
    dom.cwReveal.addEventListener('click', onCwReveal);
    dom.cwBarLang.addEventListener('click', onCwLangToggle);
    dom.cwShare.addEventListener('click', onCrosswordShare);
    dom.cwPlay.addEventListener('click', onCrosswordPlayNew);
    dom.cwInput.addEventListener('input', onCwInput);
    dom.cwInput.addEventListener('focus', () => { cwTyping = true; });
    dom.cwInput.addEventListener('blur', () => {
      // a tool button takes the focus for a moment; anything else ends the typing
      window.setTimeout(() => {
        const active = document.activeElement;
        cwTyping = active === dom.cwInput || active === dom.cwCheck || active === dom.cwReveal || active === dom.cwBarLang;
      }, 0);
    });
  }

  // ---------- Final round: Golden Goal (US-44, D-48, D-50, D-51) ----------
  // Players see it as "Golden Goal" and the wager as their "bet" (D-50). A tiebreaker (D-51): End
  // Game offers it only when the admin turned it on (taken into the game at Start, like the helpers)
  // and 2 or more contestants share the top score. While the top is still shared after everyone is
  // marked, another round follows (new question never used in this game, new bets), until the tie
  // is broken, the host skips or no question is left. The category is shown first; then each contestant enters a wager, one at a time and
  // masked, from 0 up to their score or the largest point value of the game, whichever is higher
  // (D-48: read from the game's point values, which are the enabled ones). The question is a random
  // bank question (questions.php?random=1, the Swap draw) and opens on the question screen with the
  // timer: Correct adds that contestant's wager, Wrong subtracts it, and everyone is scored once.
  // Everything is saved with the game (saved version 4), so a refresh keeps the wagers and marks.

  /** The largest point value of this game's board (the enabled point values when it started). */
  function largestPoints(g) {
    return Math.max.apply(null, g.points);
  }

  /** D-48: a wager goes up to the contestant's score or the largest point value, whichever is higher. */
  function wagerLimit(g, score) {
    return Math.max(score, largestPoints(g));
  }

  /** A contestant's score before the final round's mark (a marked wager is taken back out). */
  function scoreBeforeFinal(f, c) {
    const key = String(c.id);
    const mark = hasOwn(f.marks, key) ? f.marks[key] : null;
    if (mark === 'correct') return c.score - f.wagers[key];
    if (mark === 'wrong') return c.score + f.wagers[key];
    return c.score;
  }

  /** The final round's question is open on the question screen. */
  function finalOnScreen() {
    const g = state.game;
    return state.screen === 'question' && !!g && g.current === null && !!g.final && g.final.stage === 'question';
  }

  /** D-51: Golden Goal is offered while 2 or more contestants share the top score (Results' D-10 rule). */
  function isTiedAtTop(g) {
    return topContestants(g).length >= 2;
  }

  /** " – round 2" from the second round on; round 1 has no counter. */
  function roundSuffix(round) {
    return round > 1 ? t('final.round', { n: round }) : '';
  }

  /** The Golden Goal question's category in the interface language. */
  function finalCategoryName(f) {
    return localName(f.category.name, f.category.nameAr);
  }

  /** "Golden Goal – round 2 – History" as plain text (Report, labels): no ball (D-50). */
  function finalHeading(f) {
    return t('final.name') + roundSuffix(f.round) + ' ' + EN_DASH + ' ' + iso(finalCategoryName(f));
  }

  /** "<before>Golden Goal ⚽<after>" in `node`; the ball is decorative, so screen readers skip it. */
  function setGoalText(node, before, after) {
    clear(node);
    node.appendChild(document.createTextNode((before || '') + t('final.name') + ' '));
    node.appendChild(h('span', { text: GOAL_BALL, 'aria-hidden': 'true' }));
    if (after) node.appendChild(document.createTextNode(after));
  }

  /** The contestant whose wager is asked for now (setup order), or null once all are in. */
  function nextWagerContestant(g) {
    return g.contestants.find((c) => !hasOwn(g.final.wagers, String(c.id))) || null;
  }

  /** Offer round `round` (1 at End Game, 2+ while the tie lasts); usedIds = the questions drawn so far. */
  function openFinalOffer(round, usedIds) {
    state.game.final = { stage: 'offer', round: round, usedIds: usedIds };
    clearMessage(dom.finalMsg);
    renderFinal();
    showScreen('final'); // also saves the state
    dom.finalPlay.focus();
  }

  /** The Golden Goal screen: the offer (who is tied), or the category with the bets. */
  function renderFinal() {
    const g = state.game;
    const f = g.final;
    const offer = f.stage === 'offer';
    dom.finalOffer.hidden = !offer;
    dom.finalWagers.hidden = offer;
    if (offer) {
      const top = topContestants(g);
      const tied = joinNames(top.map((c) => c.name));
      const score = formatScore(top[0].score);
      if (f.round === 1) {
        setGoalText(dom.finalTitle, t('final.tieBefore'), t('final.tieAfter'));
        dom.finalLead.textContent = t('final.lead1', { names: tied, score: score });
      } else {
        setGoalText(dom.finalTitle, t('final.stillBefore'), t('final.stillAfter'));
        dom.finalLead.textContent = t('final.lead2', { names: tied, score: score, n: f.round });
      }
      dom.finalRule.textContent = t('final.rule.' + MODES[g.mode].key, { max: largestPoints(g) });
      dom.finalSkip.hidden = isMatch(g); // US-61 (D-77 f): a level match must be decided
      setFinalLoading(false);
      return;
    }
    setGoalText(dom.finalTitle, '', roundSuffix(f.round));
    dom.finalCategory.textContent = iso(finalCategoryName(f));
    placeBotBet(g); // US-62: the bot locks its bet when its turn comes (the caller saves)
    renderWagerList(g);
    renderWagerTurn(g);
  }

  /** Every contestant with their score and whether their wager is in; the amounts stay hidden. */
  function renderWagerList(g) {
    const f = g.final;
    const turn = nextWagerContestant(g);
    clear(dom.finalWagerList);
    g.contestants.forEach((c) => {
      const locked = hasOwn(f.wagers, String(c.id));
      const color = paletteEntry(c.color);
      const swatch = h('span', { className: 'result-swatch', 'aria-hidden': 'true' });
      swatch.style.backgroundColor = color.value;
      const item = h('li', { className: 'final-wager-item' + (locked ? ' is-locked' : '') + (c === turn ? ' is-turn' : '') }, [
        swatch,
        h('span', { className: 'final-wager-name', text: iso(c.name) }),
        h('span', { className: 'final-wager-score' }, [
          h('span', { className: 'visually-hidden', text: t('final.scoreLabel') }),
          document.createTextNode(formatScore(c.score)),
        ]),
        h('span', {
          className: 'final-wager-state',
          text: locked ? t(isBot(c) ? 'final.botBetLocked' : 'final.betLocked') : c === turn ? t('final.yourTurn') : t('final.waiting'),
        }),
      ]);
      item.style.borderInlineStartColor = color.value; // the left edge; the right one in Arabic
      dom.finalWagerList.appendChild(item);
    });
  }

  /** The wager form for the next contestant (an empty, masked field), or "Show the question" once all are in. */
  function renderWagerTurn(g) {
    const c = nextWagerContestant(g);
    dom.finalWagerForm.hidden = c === null;
    dom.finalReady.hidden = c !== null;
    setWagerError('');
    dom.finalWagerInput.value = '';
    setWagerMasked(true);
    if (c === null) return;
    renderWagerPrompt(g, c);
  }

  /** "Sara, what's your bet?" and the limit, for the contestant on turn. */
  function renderWagerPrompt(g, c) {
    dom.finalWagerLabel.textContent = t('final.ask', { name: iso(c.name) });
    dom.finalWagerHint.textContent = t('final.betHint', { limit: wagerLimit(g, c.score) });
  }

  // Masked entry: dots instead of digits through -webkit-text-security (Chrome, Edge, Safari and
  // Firefox), so the browser never offers to save a password. Without it, a password field.
  const MASK_BY_CSS = !!(window.CSS && typeof window.CSS.supports === 'function' &&
    window.CSS.supports('-webkit-text-security', 'disc'));

  function setWagerMasked(masked) {
    const input = dom.finalWagerInput;
    input.classList.toggle('is-masked', masked && MASK_BY_CSS);
    if (!MASK_BY_CSS) input.type = masked ? 'password' : 'text';
    dom.finalWagerShow.setAttribute('aria-pressed', String(!masked));
  }

  /** "Show": the contestant checks what they typed (the room should still look away). */
  function onWagerShowToggle() {
    setWagerMasked(dom.finalWagerShow.getAttribute('aria-pressed') === 'true');
    dom.finalWagerInput.focus();
  }

  /** message: '' (none), a string, or a function giving it (see setText). */
  function setWagerError(message) {
    setText(dom.finalWagerError, message);
    dom.finalWagerError.hidden = !message;
    if (message) dom.finalWagerInput.setAttribute('aria-invalid', 'true');
    else dom.finalWagerInput.removeAttribute('aria-invalid');
  }

  /** Arabic-Indic and Persian digits as 0-9, so a wager typed on an Arabic keyboard counts too. */
  function westernDigits(text) {
    return text.replace(/[٠-٩۰-۹]/g, (d) => String(d.charCodeAt(0) & 0xf));
  }

  /** Lock in the wager of the contestant on turn: a whole number from 0 to their D-48 limit. */
  function onWagerSubmit(event) {
    event.preventDefault();
    const g = state.game;
    if (!g || !g.final || g.final.stage !== 'wager' || state.screen !== 'final') return;
    const c = nextWagerContestant(g);
    if (!c) return;
    const raw = westernDigits(dom.finalWagerInput.value.trim());
    const limit = wagerLimit(g, c.score);
    if (!WAGER_PATTERN.test(raw) || Number(raw) > limit) {
      setWagerError(() => t('final.betError', { limit: limit })); // never repeats what was typed
      dom.finalWagerInput.focus();
      return;
    }
    g.final.wagers[String(c.id)] = Number(raw);
    placeBotBet(g); // US-62: the bot's turn may come next
    saveState();
    renderWagerList(g);
    renderWagerTurn(g);
    (nextWagerContestant(g) ? dom.finalWagerInput : dom.finalOpen).focus();
  }

  function setFinalLoading(loading) {
    finalLoading = loading;
    dom.finalPlay.disabled = loading;
    dom.finalPlay.textContent = loading ? t('common.loading') : t('final.play');
  }

  /**
   * "Go for goal": draw the question (shown later), then ask for the bets. Never a question of this
   * game: the board's, the Swap helper's (FU-35) and the earlier rounds' are excluded, as the board
   * avoids repeats. When none is left (409), the game ends in a tie (Results, D-10, D-51).
   */
  async function onFinalPlay() {
    const g = state.game;
    const f = g && g.final;
    if (!f || f.stage !== 'offer' || state.screen !== 'final' || finalLoading) return;
    clearMessage(dom.finalMsg);
    setFinalLoading(true);
    let drawn = null;
    let failure = null; // a function giving the message (shown again after a language switch)
    let noneLeft = false;
    try {
      drawn = parseSwap(await apiPost('questions.php?random=1', {
        exclude: boardQuestionIds(g).concat(swapQuestionIds(g), f.usedIds),
        seen: loadSeen(),
      }));
    } catch (err) {
      noneLeft = err.status === 409;
      // US-61: a tournament match has no "skip to the results"
      const key = isMatch(g) ? 'tournament.goalFailed' : 'final.loadFailed';
      failure = () => t(key, { reason: sentence(errorText(err)) });
    }
    setFinalLoading(false);
    if (state.game !== g || g.final !== f || state.screen !== 'final') return; // skipped meanwhile
    if (noneLeft && isMatch(g)) { // US-61 (D-77 f): no question left, so a coin toss decides the match
      finishMatch('coin');
      return;
    }
    if (noneLeft) {
      g.final = null;
      showResults();
      return;
    }
    if (failure) {
      showMessage(dom.finalMsg, failure, 'error');
      return;
    }
    g.final = {
      stage: 'wager',
      round: f.round,
      usedIds: f.usedIds.concat([drawn.question.id]),
      category: { id: drawn.catId, name: drawn.catName, nameAr: drawn.catNameAr },
      question: drawn.question,
      wagers: {},
      marks: {},
      answerShown: false,
    };
    if (drawn.question.image) new Image().src = drawn.question.image;
    renderFinal();
    saveState();
    dom.finalWagerInput.focus();
  }

  function onFinalSkip() {
    const g = state.game;
    if (!g || !g.final || g.final.stage !== 'offer' || state.screen !== 'final' || isMatch(g)) return; // US-61: no Skip
    g.final = null;
    showResults();
  }

  /** "Show the question" once every wager is in. */
  function onFinalOpen() {
    const g = state.game;
    if (!g || !g.final || g.final.stage !== 'wager' || state.screen !== 'final' || nextWagerContestant(g)) return;
    g.final.stage = 'question';
    const bot = botOf(g);
    if (bot) g.final.botRoll = rollBotFinal(g, g.final.question); // US-62: rolled once, saved
    markSeen(g.final.question.id); // opened = played, as on the board
    showFinalQuestion();
  }

  /** The final question on the question screen; after a refresh its timer restarts (D-04). */
  function showFinalQuestion() {
    const g = state.game;
    const f = g.final;
    if (!hasArabic(f.question)) f.lang = 'en';
    else if (f.lang !== 'en' && f.lang !== 'ar') f.lang = 'ar';
    setStreakLayout(false);
    setFinalPanelTexts();
    setGoalText(dom.qHeading, '', roundSuffix(f.round) + ' ' + EN_DASH + ' ' + iso(finalCategoryName(f)));
    clearMessage(dom.helperMsg);
    renderQuestionImage(f.question);
    renderFinalLang();
    renderAnswerState(f.answerShown);
    renderFinalRows();
    showScreen('question'); // also saves the state
    updateReportButton();
    startTimer(g.timerSeconds);
    dom.qHeading.focus();
    onQuestionShown(false); // US-48
    armBotAnswer(); // US-62
  }

  /** The scoring panel during the final question; Back reads "Continue" or "See results" (updateFinalRows). */
  function setFinalPanelTexts() {
    const g = state.game;
    setScoringPanelTexts({
      title: t('final.name') + roundSuffix(g.final.round),
      hint: t('final.hint.' + MODES[g.mode].key),
      back: finalDoneText(g),
    });
  }

  function renderFinalLang() {
    const f = state.game.final;
    renderTextAndAnswer(f.question, f.lang === 'ar');
    clear(dom.qChoices); // no helpers in the final round
    dom.qChoices.hidden = true;
    dom.questionMain.classList.remove('has-choices');
    updateSpeakButton();
  }

  function toggleFinalLang() {
    const f = state.game.final;
    if (!hasArabic(f.question)) return;
    f.lang = f.lang === 'ar' ? 'en' : 'ar';
    renderFinalLang();
    refreshBotRows(); // US-62
    saveState();
  }

  function showFinalAnswer() {
    state.game.final.answerShown = true;
    renderAnswerState(true);
    saveState();
    dom.answerText.focus();
  }

  /** One row per contestant: Correct / Wrong without amounts; the wager shows once they are scored. */
  function renderFinalRows() {
    const g = state.game;
    clear(dom.scoreRows);
    scoringRows = g.contestants.map((c) => {
      const color = paletteEntry(c.color);
      const name = h('span', { className: 'srow-name', text: iso(c.name) });
      name.style.backgroundColor = color.value;
      name.style.color = color.ink;
      const ref = {
        contestant: c,
        wager: h('span', { className: 'srow-wager' }),
        score: h('span', { className: 'srow-score', text: formatScore(c.score) }),
        status: h('span', { className: 'visually-hidden', 'aria-live': 'polite' }),
        correct: h('button', {
          type: 'button',
          className: 'btn btn-correct',
          text: t('final.correctBtn'),
          'aria-label': t('final.correctLabel', { name: iso(c.name) }),
          onclick: () => markFinal(c, 'correct'),
        }),
        wrong: h('button', {
          type: 'button',
          className: 'btn btn-wrong',
          text: t('final.wrongBtn'),
          'aria-label': t('final.wrongLabel', { name: iso(c.name) }),
          onclick: () => markFinal(c, 'wrong'),
        }),
      };
      // The wager and the score share one block: on phones they stack, so a mark never widens the row (BUG-9-02).
      const tally = h('span', { className: 'srow-tally' }, [ref.wager, ref.score]);
      ref.note = h('span', { className: 'srow-note', 'aria-live': 'polite' }); // US-62: the bot's answer
      ref.row = h('li', { className: 'srow' + (isBot(c) ? ' is-bot' : '') }, [name, tally, ref.status, ref.correct, ref.wrong, ref.note]);
      ref.row.style.borderInlineStartColor = color.value; // the left edge; the right one in Arabic
      dom.scoreRows.appendChild(ref.row);
      return ref;
    });
    updateFinalRows();
  }

  /** A marked wager as "+400" / "−400"; a bet of 0 is plain "0" (FU-33); nothing before the mark. */
  function finalDelta(mark, wager) {
    if (mark === null) return '';
    if (wager === 0) return ltr('0');
    return signed(mark === 'correct' ? '+' : MINUS, wager);
  }

  /** Once per contestant, any number Correct; See results once everyone is scored. */
  function updateFinalRows() {
    const g = state.game;
    const f = g.final;
    scoringRows.forEach((ref) => {
      const key = String(ref.contestant.id);
      const mark = hasOwn(f.marks, key) ? f.marks[key] : null;
      const wager = f.wagers[key];
      ref.correct.disabled = mark !== null;
      ref.wrong.disabled = mark !== null;
      ref.correct.classList.toggle('is-chosen', mark === 'correct');
      ref.wrong.classList.toggle('is-chosen', mark === 'wrong');
      ref.row.classList.toggle('is-scored', mark !== null);
      ref.score.textContent = formatScore(ref.contestant.score);
      ref.wager.textContent = finalDelta(mark, wager);
      ref.wager.className = 'srow-wager' + (mark === null ? '' : ' is-' + mark);
      ref.status.textContent = mark === null ? ''
        : t(mark === 'correct' ? 'final.statusCorrect' : 'final.statusWrong',
          { name: iso(ref.contestant.name), bet: wager, score: formatScore(ref.contestant.score) });
      updateBotRow(ref, mark, f);
    });
    const allMarked = g.contestants.every((c) => hasOwn(f.marks, String(c.id)));
    dom.backBtn.disabled = !allMarked;
    // D-51: still level at the top -> the next round's offer (FU-34: "Next round"); otherwise the results.
    dom.backBtn.textContent = allMarked && isTiedAtTop(g) ? t('final.nextRound') : finalDoneText(g);
  }

  /** The button that ends Golden Goal: "See results", or "See match result" in a tournament (US-61). */
  function finalDoneText(g) {
    return isMatch(g) ? t('tournament.seeMatch') : t('run.seeResults');
  }

  function markFinal(contestant, result, byBot) {
    if (!finalOnScreen()) return;
    if (isBot(contestant) && byBot !== true) return; // US-62: the bot is marked by itself
    const f = state.game.final;
    const key = String(contestant.id);
    if (hasOwn(f.marks, key)) return;
    f.marks[key] = result;
    contestant.score += result === 'correct' ? f.wagers[key] : -f.wagers[key];
    updateFinalRows();
    saveState();
    if (byBot !== true) focusNextScoringButton();
  }

  /** The final round is over: Results (with the D-10 tie rule as always). */
  function finishFinal() {
    if (!finalOnScreen()) return;
    if (isMatch(state.game)) { // US-61: the match is decided only once one contestant leads
      if (isTiedAtTop(state.game)) return;
      stopTimer();
      finishMatch('goal');
      return;
    }
    stopTimer();
    state.game.final.stage = 'done';
    showResults();
  }

  /** The question screen's big button: Back to Board; in Golden Goal, the next round's offer or the results. */
  function onBackClick() {
    if (finalOnScreen()) {
      if (dom.backBtn.disabled) return;
      if (isTiedAtTop(state.game)) nextFinalRound();
      else finishFinal();
      return;
    }
    backToBoard();
  }

  /** D-51: everyone is marked and the top is still shared: offer another round (new question, new bets). */
  function nextFinalRound() {
    const f = state.game.final;
    stopTimer();
    openFinalOffer(f.round + 1, f.usedIds.slice());
  }

  /**
   * Android Back on the final question (US-40): ask, then the results; anyone not scored keeps their
   * score. Everyone marked and still tied asks too, as it skips the next round (FU-34, D-52 b).
   */
  function onFinalLeave() {
    if (!finalOnScreen()) return;
    const g = state.game;
    if (isMatch(g)) { // US-61 (D-77 f): close the question after a confirm; a level match plays on
      if (!window.confirm(t('tournament.goalLeave'))) return;
      if (!finalOnScreen() || state.game !== g) return;
      if (isTiedAtTop(g)) nextFinalRound();
      else finishFinal();
      return;
    }
    const unscored = g.contestants.some((c) => !hasOwn(g.final.marks, String(c.id)));
    if (unscored && !window.confirm(t('final.leave.' + MODES[g.mode].key))) return;
    if (!unscored && isTiedAtTop(g) && !window.confirm(t('final.leaveTied'))) return;
    finishFinal();
  }

  /**
   * Android Back on the Golden Goal screen: the first offer goes back to the board (undoes End Game);
   * a repeat offer goes to the results, as Skip (the board is over); the bets ask first.
   */
  function onFinalBack() {
    const g = state.game;
    const f = g && g.final;
    if (!f || isMatch(g)) return; // US-61 (D-77 f): ignored on the offer and the bets of a match
    if (f.stage === 'offer') {
      g.final = null;
      if (f.round > 1) {
        showResults();
        return;
      }
      renderGame();
      showScreen('board');
      return;
    }
    if (!window.confirm(t('final.backConfirm'))) return;
    if (state.game !== g || g.final !== f || state.screen !== 'final') return;
    g.final = null;
    showResults();
  }

  function bindFinalEvents() {
    dom.finalPlay.addEventListener('click', onFinalPlay);
    dom.finalSkip.addEventListener('click', onFinalSkip);
    dom.finalWagerForm.addEventListener('submit', onWagerSubmit);
    dom.finalWagerShow.addEventListener('click', onWagerShowToggle);
    dom.finalWagerInput.addEventListener('input', () => setWagerError(''));
    dom.finalOpen.addEventListener('click', onFinalOpen);
  }

  // ---------- Tournament (US-61, D-77) ----------
  // A knockout for 3 to 8 entries: a random draw into a bracket of 4 or 8 (empty spots are byes), each
  // match a fresh short board for its two contestants on the board and question screens, a level
  // match always decided by Golden Goal (a coin toss when no question is left). The finished
  // tournament's results stay until New game. The tournament object is described at `tourney`.

  /** A board game that is a tournament match. */
  function isMatch(g) {
    return !!g && g.mode === 'tournament';
  }

  function isPosInt(value) {
    return Number.isInteger(value) && value > 0;
  }

  /** D-77 g: 3-4 entries play a bracket of 4, 5-8 a bracket of 8. */
  function bracketSize(count) {
    return count <= 4 ? 4 : 8;
  }

  function roundCount(size) {
    return size === 4 ? 2 : 3;
  }

  function emptyMatch() {
    return { a: null, b: null, bye: false, winner: null, sa: null, sb: null, way: null };
  }

  function matchAt(rec, ref) {
    return rec.rounds[ref[0]][ref[1]];
  }

  function finalMatchOf(rec) {
    return rec.rounds[rec.rounds.length - 1][0];
  }

  function entryOf(rec, id) {
    return rec.entries.find((e) => e.id === id) || null;
  }

  /** "Quarter-finals" / "Semi-finals" / "Final": round r counted from the first. */
  function roundTitle(rec, r) {
    const fromEnd = rec.rounds.length - 1 - r;
    return t(['tournament.round.final', 'tournament.round.semi', 'tournament.round.quarter'][fromEnd]);
  }

  /** "Quarter-final 2" / "Semi-final 1" / "Final". */
  function matchName(rec, ref) {
    const fromEnd = rec.rounds.length - 1 - ref[0];
    if (fromEnd === 0) return t('tournament.match.final');
    return t(fromEnd === 1 ? 'tournament.match.semi' : 'tournament.match.quarter', { n: ref[1] + 1 });
  }

  /**
   * D-77 a, g: a random draw. The byes take the second slot of the first-round matches in BYE_ORDER,
   * so two byes never meet; the shuffle only decides who sits where.
   */
  function drawBracket(entries) {
    const humans = entries.filter((e) => e.bot !== true);
    const bot = entries.find((e) => e.bot === true) || null;
    const size = bracketSize(humans.length);
    const byes = BYE_ORDER[size].slice(0, size - humans.length);
    // US-62 (D-78): Mokh Bot takes one of the bye slots at random; the other byes stay byes.
    const botAt = bot && byes.length ? byes[Math.floor(Math.random() * byes.length)] : -1;
    const order = shuffled(humans.map((e) => e.id));
    const rounds = [];
    for (let count = size / 2; count >= 1; count /= 2) {
      rounds.push(Array.from({ length: count }, emptyMatch));
    }
    rounds[0].forEach((m, i) => {
      m.a = order.shift();
      if (i === botAt) {
        m.b = bot.id; // a real match against the bot
      } else if (byes.indexOf(i) === -1) {
        m.b = order.shift();
      } else {
        m.bye = true; // already through: no board is played
        m.winner = m.a;
        m.way = 'bye';
      }
    });
    advanceBracket(rounds);
    return rounds;
  }

  /** Fill each later round's slots from the winners of the two matches before it (null = not known yet). */
  function advanceBracket(rounds) {
    for (let r = 1; r < rounds.length; r += 1) {
      rounds[r].forEach((m, i) => {
        m.a = rounds[r - 1][2 * i].winner;
        m.b = rounds[r - 1][2 * i + 1].winner;
      });
    }
  }

  /** The next match to play ([round, index]): the first round top to bottom, then the next round; or null. */
  function nextMatch(rec) {
    for (let r = 0; r < rec.rounds.length; r += 1) {
      const i = rec.rounds[r].findIndex((m) => !m.bye && m.winner === null && m.a !== null && m.b !== null);
      if (i !== -1) return [r, i];
    }
    return null;
  }

  // ----- Saved tournament -----

  function saveTournament() {
    try {
      window.localStorage.setItem(TOURNAMENT_KEY, JSON.stringify({
        version: TOURNAMENT_VERSION,
        screen: state.screen,
        tournament: tourney,
        game: state.game, // the match on the board, else null
      }));
    } catch (err) {
      // storage full or disabled: the tournament goes on, it just won't survive a refresh
    }
  }

  function clearTournament() {
    if (INTEGRATION) return;
    try {
      window.localStorage.removeItem(TOURNAMENT_KEY);
    } catch (err) {
      // nothing to clear
    }
  }

  /** The saved { screen, tournament, game }, or null (a broken save is removed). */
  function loadTournament() {
    let raw = null;
    try {
      raw = window.localStorage.getItem(TOURNAMENT_KEY);
    } catch (err) {
      return null;
    }
    if (raw === null) return null;
    try {
      const saved = JSON.parse(raw);
      if (isPlainObject(saved) && saved.version === TOURNAMENT_VERSION && isValidTournament(saved.tournament) &&
          isValidTournamentScreen(saved.screen, saved.tournament, saved.game)) return saved;
    } catch (err) {
      // invalid JSON or an unexpected shape: discarded below
    }
    clearTournament();
    return null;
  }

  /**
   * 3 to 8 human entries: unique ids, names (D-02, D-22) and colours of the 8-colour palette; plus at most
   * one Mokh Bot entry (US-62, `bot` optional so older saves load), only when the humans leave a bye.
   */
  function isValidEntries(list) {
    if (!Array.isArray(list) || !list.every((e) => isPlainObject(e) && (e.bot === undefined || typeof e.bot === 'boolean'))) return false;
    const humans = list.filter((e) => e.bot !== true).length;
    const bots = list.length - humans;
    return humans >= TOURNAMENT_MIN && humans <= MODES.tournament.limit &&
      (bots === 0 || (bots === 1 && bracketSize(humans) > humans)) &&
      list.every((e) => typeof e.name === 'string' && e.name === e.name.trim()) &&
      isValidContestants(list.map((e) => ({ id: e.id, name: e.name, color: e.color, score: 0, helpers: allHelpers() })),
        MODES.tournament);
  }

  function isIdOrNull(value) {
    return value === null || isPosInt(value);
  }

  function isIntOrNull(value) {
    return value === null || Number.isInteger(value);
  }

  function isMatchShape(m) {
    return isPlainObject(m) && isIdOrNull(m.a) && isIdOrNull(m.b) && typeof m.bye === 'boolean' &&
      isIdOrNull(m.winner) && isIntOrNull(m.sa) && isIntOrNull(m.sb) &&
      (m.way === null || MATCH_WAYS.indexOf(m.way) !== -1);
  }

  /** A played match: the winner is one of the two, on a higher score (a coin toss only breaks a tie). */
  function isValidResult(m) {
    if (m.winner === null) return m.sa === null && m.sb === null && m.way === null;
    if (m.a === null || m.b === null || (m.winner !== m.a && m.winner !== m.b)) return false;
    if (!Number.isInteger(m.sa) || !Number.isInteger(m.sb) || m.way === null || m.way === 'bye') return false;
    const won = m.winner === m.a ? m.sa : m.sb;
    const lost = m.winner === m.a ? m.sb : m.sa;
    return m.way === 'coin' ? won === lost : won > lost;
  }

  /**
   * The bracket of these entries: its size and rounds, the byes exactly as D-77 g, every entry once in
   * the first round, each later slot holding the winner of the match before it, valid results.
   */
  function isValidRounds(rounds, entries) {
    const bot = entries.find((e) => e.bot === true) || null;
    const humans = entries.length - (bot ? 1 : 0);
    const size = bracketSize(humans);
    if (!Array.isArray(rounds) || rounds.length !== roundCount(size)) return false;
    if (!rounds.every((round, r) => Array.isArray(round) && round.length === size / Math.pow(2, r + 1) &&
        round.every(isMatchShape))) return false;
    const byes = BYE_ORDER[size].slice(0, size - humans);
    const placed = [];
    // US-62: the bot sits in the second slot of exactly one bye match, which is then a real match
    const botAt = bot ? rounds[0].findIndex((m) => m.b === bot.id) : -1;
    if (bot && (byes.indexOf(botAt) === -1 || rounds[0].some((m) => m.a === bot.id))) return false;
    const firstOk = rounds[0].every((m, i) => {
      if (m.bye !== (byes.indexOf(i) !== -1 && i !== botAt)) return false;
      placed.push(m.a);
      if (!m.bye) placed.push(m.b);
      return !m.bye || (m.b === null && m.winner === m.a && m.way === 'bye' && m.sa === null && m.sb === null);
    });
    if (!firstOk || placed.length !== entries.length || !entries.every((e) => placed.indexOf(e.id) !== -1)) return false;
    return rounds.every((round, r) => round.every((m, i) => {
      if (r > 0 && (m.bye || m.a !== rounds[r - 1][2 * i].winner || m.b !== rounds[r - 1][2 * i + 1].winner)) return false;
      return m.bye || isValidResult(m);
    }));
  }

  function isValidRef(ref, rounds) {
    return Array.isArray(ref) && ref.length === 2 && Number.isInteger(ref[0]) && ref[0] >= 0 &&
      ref[0] < rounds.length && Number.isInteger(ref[1]) && ref[1] >= 0 && ref[1] < rounds[ref[0]].length;
  }

  function isValidTournament(tt) {
    if (!isPlainObject(tt)) return false;
    const range = timerRange();
    if (!isPosInt(tt.startedAt) || !(tt.finishedAt === null || isPosInt(tt.finishedAt)) ||
        typeof tt.started !== 'boolean' || typeof tt.helpersOff !== 'boolean' ||
        !Number.isInteger(tt.timerSeconds) || tt.timerSeconds < range.min || tt.timerSeconds > range.max) return false;
    if (!isValidEntries(tt.entries) || !isValidRounds(tt.rounds, tt.entries)) return false;
    if ((tt.finishedAt !== null) !== (finalMatchOf(tt).winner !== null)) return false;
    const played = tt.rounds.some((round) => round.some((m) => !m.bye && m.winner !== null));
    if (tt.playing !== null) {
      const next = nextMatch(tt);
      if (!isValidRef(tt.playing, tt.rounds) || !next || next[0] !== tt.playing[0] || next[1] !== tt.playing[1]) return false;
    }
    if ((played || tt.playing !== null) && !tt.started) return false;
    if (tt.last !== null) {
      if (!isValidRef(tt.last, tt.rounds)) return false;
      const m = matchAt(tt, tt.last);
      if (m.bye || m.winner === null) return false;
    }
    return true;
  }

  /**
   * The saved screen fits the tournament: a match on the board / question / Golden Goal screen with a
   * valid match board of the two contestants of the match being played; the bracket, the match result
   * or the final results without one.
   */
  function isValidTournamentScreen(screen, tt, g) {
    if (TOURNAMENT_SCREENS.indexOf(screen) === -1) return false;
    const onMatch = ['board', 'question', 'final'].indexOf(screen) !== -1;
    if (onMatch !== (tt.playing !== null)) return false;
    if (!onMatch) {
      if (g !== null) return false;
      if (screen === 'match') return tt.last !== null;
      if (tt.last !== null) return false;
      return screen === 'tresults' ? tt.finishedAt !== null : tt.finishedAt === null;
    }
    if (tt.last !== null) return false;
    const m = matchAt(tt, tt.playing);
    // US-62: a match with the bot is turn-based (turn and coinShown set); any other has neither
    const withBot = [m.a, m.b].some((id) => entryOf(tt, id).bot === true);
    return isValidGame(g) && isMatch(g) && g.finalRound === true && g.timerSeconds === tt.timerSeconds &&
      g.contestants.length === 2 && g.contestants[0].id === m.a && g.contestants[1].id === m.b &&
      g.contestants.every((c) => {
        const e = entryOf(tt, c.id);
        return e.name === c.name && e.color === c.color;
      }) && withBot === (g.turn !== undefined) && withBot === (g.coinShown !== undefined) &&
      (withBot || g.botTickets === undefined) && // US-63: botTickets only on a bot match (optional there)
      isValidScreenFor(screen, g);
  }

  /** Reopen the saved tournament screen; a match comes back as a saved game does (D-04, D-25). */
  function restoreTournament(saved) {
    tourney = saved.tournament;
    relabelBot(tourney, saved.game); // US-62: the bot's name in the page language
    if (saved.screen === 'bracket') {
      showBracket();
    } else if (saved.screen === 'match') {
      showMatchResult();
    } else if (saved.screen === 'tresults') {
      showTourneyResults();
    } else {
      restoreGame({ screen: saved.screen, game: saved.game });
    }
  }

  // ----- Start, bracket, Shuffle, End tournament -----

  /**
   * Start (valid setup): the draw, the bracket screen and one game log line (D-77 m). The timer and
   * helpers_enabled serve every match; the categories are chosen before each match (D-77 ab).
   */
  function beginTournament(timerSeconds) {
    const s = state.setup;
    const entries = s.entries.map((e, i) => ({ id: i + 1, name: e.name.trim(), color: e.color }));
    const bot = botEntry(entries); // US-62: Mokh Bot fills one bye (none with 4 or 8 entries)
    if (bot) entries.push(bot);
    lastPicks = [];
    tourney = {
      startedAt: Date.now(),
      entries: entries,
      timerSeconds: timerSeconds,
      helpersOff: !s.helpersOn,
      rounds: drawBracket(entries),
      started: false,
      playing: null,
      last: null,
      finishedAt: null,
    };
    state.game = null;
    clearSavedState();
    // no categories yet (D-77 ab); the human names only (US-62: the bot is not a player)
    postGameLog({ mode: 'tournament', players: entries.filter((e) => e.bot !== true).map((e) => e.name) });
    showBracket();
  }

  function showBracket() {
    clearMessage(dom.bracketMsg);
    renderBracket();
    showScreen('bracket'); // also saves the tournament
    dom.bracketTitle.focus();
  }

  function renderBracket() {
    const tt = tourney;
    const next = nextMatch(tt);
    dom.bracketInfo.textContent = [
      tn('tournament.count', tt.entries.length),
      t('board.timer', { s: tt.timerSeconds }),
    ].join('  ' + DOT + '  ');
    clear(dom.bracketRounds);
    dom.bracketRounds.style.setProperty('--rounds', String(tt.rounds.length));
    tt.rounds.forEach((round, r) => {
      const list = h('ol', { className: 'bracket-list' });
      round.forEach((m, i) => list.appendChild(renderBracketMatch(tt, [r, i], next)));
      dom.bracketRounds.appendChild(h('section', { className: 'bracket-round', 'aria-label': roundTitle(tt, r) }, [
        h('h3', { className: 'bracket-round-title', text: roundTitle(tt, r), 'aria-hidden': 'true' }),
        list,
      ]));
    });
    const a = next ? entryOf(tt, matchAt(tt, next).a) : null;
    const b = next ? entryOf(tt, matchAt(tt, next).b) : null;
    dom.bracketNext.textContent = next
      ? t('tournament.next', { match: matchName(tt, next), a: iso(a.name), b: iso(b.name) }) : '';
    dom.bracketStart.hidden = !next;
    dom.bracketShuffle.hidden = tt.started; // D-77 d: only before the first match
    setMatchLoading(matchLoading);
  }

  /** One match card: two slots (or "Name – bye"), the scores once played, the winner marked by a ✓ and bold. */
  function renderBracketMatch(tt, ref, next) {
    const m = matchAt(tt, ref);
    const isNext = !!next && next[0] === ref[0] && next[1] === ref[1];
    const card = h('li', { className: 'bracket-match' + (isNext ? ' is-next' : '') + (m.bye ? ' is-bye' : '') }, [
      h('span', { className: 'bracket-match-name' }, [
        document.createTextNode(matchName(tt, ref)),
        isNext ? h('span', { className: 'bracket-next-tag', text: t('tournament.nextTag') }) : null,
      ]),
    ]);
    if (m.bye) {
      card.appendChild(bracketSlot(tt, m, m.a, null, true));
      return card;
    }
    card.appendChild(bracketSlot(tt, m, m.a, m.sa, false));
    card.appendChild(bracketSlot(tt, m, m.b, m.sb, false));
    if (m.way === 'goal' || m.way === 'coin') {
      card.appendChild(h('span', { className: 'bracket-way', text: t('tournament.way.' + m.way) }));
    }
    return card;
  }

  function bracketSlot(tt, m, id, score, bye) {
    const entry = id === null ? null : entryOf(tt, id);
    const won = entry !== null && m.winner === id && !bye;
    const out = entry !== null && m.winner !== null && m.winner !== id;
    const swatch = h('span', { className: 'result-swatch', 'aria-hidden': 'true' });
    if (entry) swatch.style.backgroundColor = paletteEntry(entry.color).value;
    else swatch.classList.add('is-empty');
    const name = entry ? ownDirection(h('span', { className: 'bracket-name', text: entry.name }))
      : h('span', { className: 'bracket-name', text: t('tournament.tbd') });
    return h('div', { className: 'bracket-slot' + (won ? ' is-winner' : '') + (out ? ' is-out' : '') + (entry ? '' : ' is-tbd') }, [
      h('span', { className: 'bracket-mark', text: won ? CHECK : '', 'aria-hidden': 'true' }),
      swatch,
      name,
      bye ? h('span', { className: 'bracket-bye', text: EN_DASH + ' ' + t('tournament.bye') }) : null,
      won ? h('span', { className: 'visually-hidden', text: t('tournament.through') }) : null,
      out ? h('span', { className: 'visually-hidden', text: t('tournament.out') }) : null,
      score !== null ? h('span', { className: 'bracket-score', text: formatScore(score) }) : null,
    ]);
  }

  function setMatchLoading(loading) {
    matchLoading = loading;
    dom.bracketStart.disabled = loading;
    dom.bracketShuffle.disabled = loading;
    dom.bracketStart.textContent = loading ? t('common.loading') : t('tournament.startMatch');
  }

  /** D-77 d: draw the whole bracket again, until the first match starts. */
  function onShuffle() {
    if (!tourney || tourney.started || state.screen !== 'bracket' || matchLoading) return;
    tourney.rounds = drawBracket(tourney.entries);
    renderBracket();
    saveState();
  }

  /** D-77 k: End tournament asks first; OK goes to setup and the tournament is dropped. */
  function onEndTournament() {
    if (!tourney || state.screen !== 'bracket') return;
    if (!window.confirm(t('tournament.endConfirm'))) return;
    if (!tourney || state.screen !== 'bracket') return;
    newGame();
  }

  // ----- A match -----

  // ----- The categories popup of Start match (D-77 ab) -----

  function isPickOpen() {
    return !dom.pickOverlay.hidden;
  }

  /**
   * Start match opens the popup: the playable categories are read now (a reload may have skipped the
   * setup load, and Admin may have changed them), with the last match's ticks still ticked.
   */
  async function openPicker() {
    const tt = tourney;
    if (!tt || state.screen !== 'bracket' || matchLoading || isPickOpen()) return;
    const ref = nextMatch(tt);
    if (!ref) return;
    clearMessage(dom.bracketMsg);
    const open = { ref: ref, selected: lastPicks.slice(), playable: null };
    picker = open;
    clearMessage(dom.pickError);
    dom.pickOverlay.hidden = false;
    setPageInert(true);
    renderPicker();
    dom.pickCancel.focus();
    let failure = null;
    let playable = [];
    try {
      const list = await apiGet('categories.php?playable=1');
      if (!Array.isArray(list)) throw textError('err.response');
      playable = list.filter((c) => isPlainObject(c) && Number.isInteger(c.id) && typeof c.name === 'string')
        .map((c) => ({ id: c.id, name: c.name, nameAr: isFilled(c.name_ar) ? c.name_ar : null }));
    } catch (err) {
      failure = err;
    }
    if (picker !== open) return; // closed meanwhile
    if (failure || !playable.length) {
      closePicker();
      const reason = failure ? () => sentence(errorText(failure)) : () => t('cat.none');
      showMessage(dom.bracketMsg, () => t('tournament.matchFailed', { reason: reason() }), 'error');
      return;
    }
    open.playable = playable;
    open.selected = open.selected.filter((id) => id === SURPRISE || id === MIX || playable.some((c) => c.id === id));
    renderPicker();
    const first = dom.pickList.querySelector('input:not(:disabled)');
    if (first) first.focus();
  }

  /** Cancel, Escape or Android Back: back to the bracket, nothing started. */
  function closePicker() {
    if (!isPickOpen()) return;
    dom.pickOverlay.hidden = true;
    setPageInert(false);
    picker = null;
    if (!dom.bracketStart.hidden) dom.bracketStart.focus();
  }

  /** The popup's texts and tiles: "Surprise me!" first, then the setup tiles (with Kilo Meshakkal). */
  function renderPicker() {
    const p = picker;
    if (!p) return;
    const m = matchAt(tourney, p.ref);
    dom.pickAbout.textContent = t('tournament.pickAbout', {
      match: matchName(tourney, p.ref), a: iso(entryOf(tourney, m.a).name), b: iso(entryOf(tourney, m.b).name), n: TOURNAMENT_PICK_MAX,
    });
    clear(dom.pickList);
    if (p.playable === null) {
      dom.pickList.appendChild(h('li', { className: 'hint', text: t('cat.loading') }));
      dom.pickCount.textContent = '';
      dom.pickStart.disabled = true;
      return;
    }
    const tiles = [{ id: SURPRISE, surprise: true }].concat(setupTiles({ playable: p.playable }));
    tiles.forEach((c) => {
      const inputId = 'pick-cat-' + (c.id === SURPRISE ? 'surprise' : c.id === MIX ? 'mix' : c.id);
      const box = h('input', { type: 'checkbox', id: inputId, checked: p.selected.indexOf(c.id) !== -1 });
      box.addEventListener('change', () => togglePick(c.id, box.checked));
      const name = c.surprise
        ? h('span', { className: 'cat-name-text' }, [
          document.createTextNode(t('cat.surprise')),
          h('span', { className: 'cat-surprise-hint', text: t('cat.surpriseHint', { n: SURPRISE_ALONE }) }),
        ])
        : h('span', { className: 'cat-name-text', text: iso(columnName(c)) });
      dom.pickList.appendChild(h('li', { className: c.surprise ? 'cat-surprise-item' : '' }, [
        h('label', { className: 'cat-label' + (c.surprise ? ' cat-surprise' : ''), htmlFor: inputId, 'data-cat': String(c.id) }, [
          box,
          name,
          h('span', { className: 'cat-order', 'aria-hidden': 'true' }),
        ]),
      ]));
    });
    renderPickSelection();
  }

  /** "k of up to 3 selected", the order badges, and the unticked boxes locked once 3 are ticked. */
  function renderPickSelection() {
    const p = picker;
    const count = p.selected.length;
    const full = count >= TOURNAMENT_PICK_MAX;
    dom.pickCount.textContent = t('cat.count', { k: count, n: TOURNAMENT_PICK_MAX });
    Array.prototype.forEach.call(dom.pickList.querySelectorAll('.cat-label'), (label) => {
      const order = p.selected.indexOf(Number(label.getAttribute('data-cat')));
      label.classList.toggle('is-selected', order !== -1);
      label.classList.toggle('is-locked', full && order === -1);
      label.querySelector('input').disabled = full && order === -1;
      label.querySelector('.cat-order').textContent = order === -1 ? '' : String(order + 1);
    });
    dom.pickStart.disabled = count < 1;
  }

  function togglePick(id, checked) {
    const p = picker;
    if (!p || p.playable === null) return;
    const at = p.selected.indexOf(id);
    if (checked && at === -1 && p.selected.length < TOURNAMENT_PICK_MAX) p.selected.push(id);
    if (!checked && at !== -1) p.selected.splice(at, 1);
    clearMessage(dom.pickError);
    renderPickSelection();
  }

  /** Start match in the popup: 1 to 3 ticks, "Surprise me!" drawn as on setup, then the board. */
  function onPickSubmit(event) {
    event.preventDefault();
    const p = picker;
    if (!p || p.playable === null) return;
    if (p.selected.length < 1) {
      showMessage(dom.pickError, () => t('cat.atLeast'), 'error');
      return;
    }
    let selection;
    try {
      selection = resolveSelection({ selected: p.selected, playable: p.playable, perGame: TOURNAMENT_PICK_MAX });
    } catch (err) {
      showMessage(dom.pickError, () => errorText(err), 'error');
      return;
    }
    lastPicks = p.selected.slice();
    closePicker();
    onStartMatch(selection);
  }

  function bindPickerEvents() {
    dom.pickForm.addEventListener('submit', onPickSubmit);
    dom.pickCancel.addEventListener('click', closePicker);
  }

  /**
   * Start match (after the popup): a fresh board of the chosen categories for the two contestants (the
   * played list as `seen`, so unseen questions come first), cut to the Admin's tournament point values
   * (D-77 aa), both read now (D-12 per match). selection = { ids, hidden } from resolveSelection.
   */
  async function onStartMatch(selection) {
    const tt = tourney;
    if (!tt || state.screen !== 'bracket' || matchLoading) return;
    const ref = nextMatch(tt);
    if (!ref) return;
    clearMessage(dom.bracketMsg);
    setMatchLoading(true);
    let board = null;
    let allowed = [];
    let failure = null;
    const ids = selection.ids;
    // The Admin's tournament values and bot accuracy (US-63); if the settings cannot be read, the
    // default rows and 3 right tickets are used.
    const settingsRead = apiGet('settings.php').then(
      (s) => ({ allowed: tournamentPointList(s && s.tournament_points), tickets: botTicketSetting(s && s.bot_accuracy) }),
      () => ({ allowed: [], tickets: BOT_TICKETS_DEFAULT }));
    let tickets = BOT_TICKETS_DEFAULT;
    try {
      board = parseBoard(await apiPost('questions.php?board=1', { categories: ids.join(','), seen: loadSeen() }), ids);
      const read = await settingsRead;
      allowed = read.allowed;
      tickets = read.tickets;
    } catch (err) {
      failure = err;
    }
    setMatchLoading(false);
    if (tourney !== tt || state.screen !== 'bracket') return; // ended meanwhile
    if (failure) {
      showMessage(dom.bracketMsg, () => t('tournament.matchFailed', { reason: sentence(localCategoryNames(errorText(failure))) }), 'error');
      return;
    }
    beginMatch(ref, board, allowed, selection.hidden, tickets);
  }

  /** US-63 (D-79): the settings' bot_accuracy (right tickets 0..10); anything else -> 3. */
  function botTicketSetting(value) {
    return isValidBotTickets(value) ? value : BOT_TICKETS_DEFAULT;
  }

  /** US-61 (D-77 aa): the settings' "200,400,500" -> [200, 400, 500]; anything else -> []. */
  function tournamentPointList(text) {
    if (typeof text !== 'string') return [];
    return text.split(',').map((part) => Number(part.trim())).filter((n) => Number.isInteger(n) && n > 0);
  }

  /**
   * D-77 aa: keep the board's (enabled) point values that the Admin ticked for tournaments. With none
   * ticked, or none of the ticked ones enabled, keep the lowest TOURNAMENT_ROWS (D-77 e; all of them
   * when fewer are enabled). Every enabled value is on the board for every column (the board API
   * refuses a category missing one), so any subset is playable.
   */
  function cutRows(board, allowed) {
    const picked = board.points.filter((p) => (allowed || []).indexOf(p) !== -1);
    const keep = picked.length ? picked : board.points.slice(0, TOURNAMENT_ROWS);
    board.categories.forEach((c) => {
      Object.keys(c.questions).forEach((p) => {
        if (keep.indexOf(Number(p)) === -1) delete c.questions[p];
      });
    });
    board.points = keep;
  }

  /**
   * D-77 i: the match board. Scores start at 0, 3 fresh helpers each, its own Kilo Meshakkal order
   * and double cell, dealt after the cut; Golden Goal always on. Matches are not logged (D-77 m).
   */
  function beginMatch(ref, board, allowed, hidden, tickets) {
    const tt = tourney;
    const m = matchAt(tt, ref);
    cutRows(board, allowed);
    board.categories.forEach((c) => { c.hidden = hidden.indexOf(c.id) !== -1; });
    preloadImages(board.categories);
    board.categories.forEach((c) => { if (c.id === MIX) dealMixColumn(c, board.points); });
    state.game = {
      mode: 'tournament',
      contestants: [m.a, m.b].map((id) => {
        const e = entryOf(tt, id);
        return { id: e.id, name: e.name, color: e.color, score: 0, helpers: allHelpers() };
      }),
      timerSeconds: tt.timerSeconds,
      helpersOff: tt.helpersOff,
      points: board.points,
      categories: board.categories,
      used: {},
      double: pickDoubleCell(board.categories, board.points),
      finalRound: true, // D-77 f: a level match goes to Golden Goal whatever final_round_enabled says
      final: null,
      statsSent: [],
      current: null,
    };
    // US-62: a match with the bot is turn-based; the coin flip (drawn now, shown next) picks who starts
    if (state.game.contestants.some(isBot)) {
      state.game.turn = state.game.contestants[Math.random() < 0.5 ? 0 : 1].id;
      state.game.coinShown = false;
      state.game.botTickets = tickets; // US-63: fixed for the match, saved with it
    }
    tt.started = true;
    tt.playing = ref;
    renderGame();
    showScreen('board'); // one write: the bracket with the match being played and its board
    armBotTurn();
  }

  /**
   * The match is decided ('score', 'goal' or 'coin'): the winner moves on and the match board is
   * dropped in the same write, so a reload neither replays nor loses the match.
   */
  function finishMatch(way) {
    const tt = tourney;
    const g = state.game;
    if (!tt || !isMatch(g) || tt.playing === null) return;
    stopTimer();
    const ref = tt.playing;
    const m = matchAt(tt, ref);
    m.sa = findContestant(g, m.a).score;
    m.sb = findContestant(g, m.b).score;
    if (way === 'coin') m.winner = Math.random() < 0.5 ? m.a : m.b;
    else m.winner = m.sa > m.sb ? m.a : m.b;
    m.way = way;
    advanceBracket(tt.rounds);
    tt.playing = null;
    tt.last = ref;
    if (finalMatchOf(tt).winner !== null) {
      tt.finishedAt = Date.now();
    }
    state.game = null;
    showMatchResult();
  }

  function showMatchResult() {
    renderMatchResult();
    showScreen('match'); // also saves the tournament
    dom.matchTitle.focus();
  }

  /** "Sara wins 300–200" (after Golden Goal / on a coin toss), with Continue only. */
  function renderMatchResult() {
    const tt = tourney;
    const m = matchAt(tt, tt.last);
    const aWon = m.winner === m.a;
    const winner = entryOf(tt, m.winner);
    const score = scorePair(aWon ? m.sa : m.sb, aWon ? m.sb : m.sa);
    dom.matchRound.textContent = matchName(tt, tt.last);
    dom.matchTitle.textContent = t('tournament.wins.' + m.way, { name: iso(winner.name), score: score });
    dom.matchNote.hidden = m.way !== 'coin';
    dom.matchNote.textContent = m.way === 'coin' ? t('tournament.coin', { name: iso(winner.name) }) : '';
  }

  /** "300 – 200" (spaced, so a negative score never sits against the dash). */
  function scorePair(first, second) {
    return formatScore(first) + ' ' + EN_DASH + ' ' + formatScore(second);
  }

  /** Continue: the bracket with the winner moved on, or the tournament results after the final. */
  function onMatchContinue() {
    const tt = tourney;
    if (!tt || state.screen !== 'match') return;
    tt.last = null;
    if (tt.finishedAt !== null) showTourneyResults();
    else showBracket();
  }

  // ----- Tournament results -----

  function showTourneyResults() {
    renderTourneyResults();
    showScreen('tresults');
    dom.trTitle.focus();
  }

  /**
   * D-77 h: 1st, 2nd, joint 3rd (semi-final losers), joint 5th (quarter-final losers), competition
   * ranking, in bracket order. A bye is not a loss. Returns [{ entry, rank }].
   */
  function standingsOf(rec) {
    const rows = [{ id: finalMatchOf(rec).winner, tier: 0 }];
    for (let r = rec.rounds.length - 1; r >= 0; r -= 1) {
      rec.rounds[r].forEach((m) => {
        if (m.bye || m.winner === null) return;
        rows.push({ id: m.winner === m.a ? m.b : m.a, tier: rec.rounds.length - r });
      });
    }
    return rows.map((row) => ({
      entry: entryOf(rec, row.id),
      rank: 1 + rows.filter((other) => other.tier < row.tier).length,
    }));
  }

  /** "1st", "2nd", "3rd", "5th" (the only places a bracket of 8 gives). */
  function placeText(rank) {
    return [1, 2, 3, 5].indexOf(rank) !== -1 ? t('tournament.place.' + rank) : String(rank);
  }

  /** The finished tournament's results (Share and New game). */
  function renderTourneyResults() {
    const rec = tourney;
    if (!rec) return;
    const rows = standingsOf(rec);
    dom.trWinner.textContent = t('tournament.champion', { name: iso(rows[0].entry.name) });
    clear(dom.trStandings);
    rows.forEach((row) => {
      const swatch = h('span', { className: 'result-swatch', 'aria-hidden': 'true' });
      swatch.style.backgroundColor = paletteEntry(row.entry.color).value;
      const item = h('li', { className: 'result-row tr-row' + (row.rank === 1 ? ' is-winner' : '') }, [
        h('span', { className: 'result-rank tr-rank', text: placeText(row.rank) }),
        swatch,
        h('span', { className: 'result-name', text: iso(row.entry.name) }),
      ]);
      item.style.borderInlineStartColor = paletteEntry(row.entry.color).value;
      dom.trStandings.appendChild(item);
    });
    clear(dom.trMatches);
    rec.rounds.forEach((round, r) => round.forEach((m, i) => {
      if (m.bye || m.winner === null) return;
      dom.trMatches.appendChild(renderPlayedMatch(rec, m, [r, i]));
    }));
    dom.trShareStatus.textContent = '';
  }

  /** "Semi-final 1  Sara 300–200 Omar  (after Golden Goal)": the winner in bold with a ✓. */
  function renderPlayedMatch(rec, m, ref) {
    const side = (id) => {
      const e = entryOf(rec, id);
      const won = m.winner === id;
      return ownDirection(h(won ? 'strong' : 'span', { className: 'tr-side' + (won ? ' is-winner' : ''), text: (won ? CHECK + ' ' : '') + e.name }));
    };
    return h('li', { className: 'tr-match' }, [
      h('span', { className: 'tr-match-name', text: matchName(rec, ref) }),
      h('span', { className: 'tr-match-line' }, [
        side(m.a),
        h('span', { className: 'tr-score', text: scorePair(m.sa, m.sb) }),
        side(m.b),
      ]),
      m.way === 'goal' || m.way === 'coin' ? h('span', { className: 'tr-way', text: t('tournament.way.' + m.way) }) : null,
    ]);
  }

  /** US-46: "Sara won the Mokh Rush tournament! 2nd Omar, 3rd Ali and Mona" plus the site link. */
  function tourneyShareText(rec) {
    const rows = standingsOf(rec);
    const groups = [];
    rows.slice(1).forEach((row) => {
      const last = groups[groups.length - 1];
      if (last && last.rank === row.rank) last.names.push(row.entry.name);
      else groups.push({ rank: row.rank, names: [row.entry.name] });
    });
    const head = t('tournament.shareWon', { name: iso(rows[0].entry.name) });
    if (!groups.length) return head;
    return head + ' ' + groups.map((group) =>
      t('tournament.sharePlace', { place: placeText(group.rank), names: joinNames(group.names) })).join(t('list.sep'));
  }

  function onTourneyShare() {
    const rec = tourney;
    if (!rec || state.screen !== 'tresults') return;
    shareText(tourneyShareText(rec), dom.trShareStatus);
  }

  /** Back or New Game on the results: setup, as New game (the tournament is dropped). */
  function onTourneyNewGame() {
    if (state.screen !== 'tresults') return;
    newGame();
  }

  // ---------- Mokh Bot (US-62, D-78) ----------
  // One bot fills one bye at random (3, 5, 6 or 7 humans). A match with it is turn-based: a coin
  // flip picks who starts, the turn passes after every question and there is no steal. On its turn
  // the board is locked, the bot opens a cell (US-63: picked by its accuracy and the score), "thinks",
  // says an answer (the real one when its saved roll is right, else a stored wrong option or "I don't
  // know") and is scored by itself. In a Golden Goal it bets by itself and answers the same way.
  // US-63 (D-79): every answer is a roll of a 10-face dice; the Admin's bot_accuracy sets its tickets. Every bot action is one timeout (botTimer),
  // cleared on any screen change and armed again from the saved state, so a reload resumes it.

  /** The contestant / entry is the tournament's bot. */
  function isBot(c) {
    if (!c || !tourney) return false;
    const e = entryOf(tourney, c.id);
    return !!e && e.bot === true;
  }

  /** The bot of this match board, or null (any other game). */
  function botOf(g) {
    return isMatch(g) ? g.contestants.find(isBot) || null : null;
  }

  function otherContestant(g, id) {
    return g.contestants.find((c) => c.id !== id);
  }

  /** It is the bot's turn on this match board. */
  function isBotTurn(g) {
    return !!g && g.turn !== undefined && isBot(findContestant(g, g.turn));
  }

  /** The bot's board question is open and the bot is not scored yet: Back to Board waits. */
  function botAnswerPending(g) {
    return !!g && !!g.current && isBotTurn(g) && !hasOwn(g.current.marks, String(g.turn));
  }

  /** t('tournament.botName') in the page language, with " 2" after it when a contestant already has that name. */
  function botLabel(humans) {
    const base = t('tournament.botName');
    const taken = humans.map((e) => e.name.toLowerCase());
    let name = base;
    for (let n = 2; taken.indexOf(name.toLowerCase()) !== -1; n += 1) name = base + ' ' + n;
    return name;
  }

  /** The bot entry for these human entries, or null when they fill the bracket (4 or 8). */
  function botEntry(humans) {
    if (bracketSize(humans.length) === humans.length) return null;
    const used = humans.map((e) => e.color);
    const free = FULL_PALETTE.find((p) => used.indexOf(p.value) === -1);
    return { id: humans.length + 1, name: botLabel(humans), color: free.value, bot: true };
  }

  /** The bot's name follows the page language: in the tournament and on the match board (g). */
  function relabelBot(tt, g) {
    const e = tt ? tt.entries.find((entry) => entry.bot === true) : null;
    if (!e) return;
    e.name = botLabel(tt.entries.filter((entry) => entry.bot !== true));
    const c = g ? findContestant(g, e.id) : null;
    if (c) c.name = e.name;
  }

  /** US-63: the match's right tickets out of 10 (a save from before US-63 has none: 3). */
  function botTickets(g) {
    return g && isValidBotTickets(g.botTickets) ? g.botTickets : BOT_TICKETS_DEFAULT;
  }

  /**
   * US-63 (D-79): { right, optionIndex } from one roll of a 10-face dice. Faces 1..tickets are right;
   * the next ceil((10 - tickets) / 2) are wrong, alternating stored wrong option 1 and 2 ("I don't
   * know" when the question has none); the rest are "I don't know" (optionIndex null).
   */
  function botRoll(q, tickets) {
    const face = 1 + Math.floor(Math.random() * BOT_TICKETS);
    const wrong = Math.ceil((BOT_TICKETS - tickets) / 2);
    if (face <= tickets) return { right: true, optionIndex: null };
    if (face <= tickets + wrong) return { right: false, optionIndex: hasChoices(q) ? 1 + (face - tickets - 1) % 2 : null };
    return { right: false, optionIndex: null };
  }

  /** The bot's roll on a board question (D-79: the same dice on every row). */
  function rollBot(g, categoryId, points) {
    return botRoll(findCategory(g, categoryId).questions[String(points)], botTickets(g));
  }

  /** The bot's roll on a Golden Goal question (D-79: the same dice as on the board). */
  function rollBotFinal(g, q) {
    return botRoll(q, botTickets(g));
  }

  /** What the bot says, in the shown language: the answer or a wrong option cut at its first bracket. */
  function botAnswerText(q, roll, lang) {
    const arabic = lang === 'ar' && hasArabic(q);
    if (roll.right) return choiceText(arabic ? q.answer_ar : q.answer, arabic);
    if (roll.optionIndex !== null && hasChoices(q)) return choiceTexts(q, arabic).options[roll.optionIndex];
    return t('score.botDontKnow');
  }

  /** The open question the bot may answer: the board's or Golden Goal's, else null. */
  function botOpenQuestion() {
    const g = state.game;
    if (!g || state.screen !== 'question') return null;
    return finalOnScreen() ? g.final : g.current;
  }

  /** One pending bot action at a time. */
  function botLater(ms, action) {
    if (botTimer !== null) window.clearTimeout(botTimer);
    botTimer = window.setTimeout(() => {
      botTimer = null;
      action();
    }, ms);
  }

  /** Any screen change: the bot's pending action and the coin flip stop. */
  function stopBot() {
    if (botTimer !== null) window.clearTimeout(botTimer);
    botTimer = null;
    if (coinTimer !== null) window.clearTimeout(coinTimer);
    coinTimer = null;
    if (!dom.coinOverlay.hidden) {
      dom.coinOverlay.hidden = true;
      setPageInert(false);
    }
  }

  /** "Sara's turn" over the board of a bot match; the board is locked on the bot's turn. */
  function renderTurnBanner() {
    const g = state.game;
    const on = !!g && g.turn !== undefined && !allCellsUsed(g); // a full board has no turn left
    dom.turnBanner.hidden = !on;
    dom.board.classList.toggle('is-locked', on && isBotTurn(g));
    if (!on) return;
    const c = findContestant(g, g.turn);
    const color = paletteEntry(c.color);
    dom.turnBanner.textContent = t('tournament.turn', { name: iso(c.name) }) +
      (isBotTurn(g) ? ' ' + t('tournament.botPicking') : '');
    dom.turnBanner.style.backgroundColor = color.value;
    dom.turnBanner.style.color = color.ink;
  }

  /** The board of a bot match is on show: the coin flip first, then on the bot's turn its pick. */
  function armBotTurn() {
    const g = state.game;
    if (!g || state.screen !== 'board' || g.turn === undefined || g.current) return;
    if (g.coinShown !== true) {
      showCoin();
      return;
    }
    if (isBotTurn(g) && !allCellsUsed(g)) botLater(BOT_PICK_MS, botPickCell);
  }

  /** The bot picks an open cell (botChooseCell), highlights it, then opens it as a click would. */
  function botPickCell() {
    const g = state.game;
    if (!g || state.screen !== 'board' || g.current || !isBotTurn(g)) return;
    const pick = botChooseCell(g);
    if (!pick) return;
    const find = () => dom.board.querySelector('[data-cell="' + cellKey(pick.id, pick.points) + '"]');
    const cell = find();
    if (cell) cell.classList.add('is-bot-pick');
    botLater(BOT_HIGHLIGHT_MS, () => {
      if (state.game !== g || state.screen !== 'board' || g.current) return;
      const target = find(); // the board may have been drawn again meanwhile
      if (target) target.classList.remove('is-bot-pick');
      openCellWithFx(target, pick.id, pick.points);
    });
  }

  /**
   * US-63 (D-79): the bot's cell. With more than half its tickets right it takes the highest open
   * point value; otherwise the highest when it is behind and the lowest when it is ahead or level.
   * Then a random category among the open cells of that value. It only uses what the host sees: never
   * the hidden double cell (D-40), nor the hidden values of the Kilo Meshakkal boxes (US-53), so it
   * picks a Kilo Meshakkal box (at random) only when no other cell is open.
   */
  function botChooseCell(g) {
    const open = [];
    const mix = [];
    g.categories.forEach((c) => g.points.forEach((p) => {
      if (!hasOwn(g.used, cellKey(c.id, p))) (c.id === MIX ? mix : open).push({ id: c.id, points: p });
    }));
    if (!open.length) return mix.length ? mix[Math.floor(Math.random() * mix.length)] : null;
    const bot = findContestant(g, g.turn);
    const rival = otherContestant(g, g.turn);
    const values = open.map((cell) => cell.points);
    const goHigh = botTickets(g) * 2 > BOT_TICKETS || bot.score < rival.score;
    const value = goHigh ? Math.max.apply(null, values) : Math.min.apply(null, values);
    const cells = open.filter((cell) => cell.points === value);
    return cells[Math.floor(Math.random() * cells.length)];
  }

  /**
   * The bot's question is open (board on its turn, or Golden Goal): "Thinking..." for 3 to 6 s (always
   * before the timer ends), then its answer (saved as said), then 1.5 s later its own mark. After a
   * reload an answer already said shows at once and is scored 1.5 s later; already scored: the answer
   * shows. A reload or a language switch draws the same answer from the saved roll.
   */
  function armBotAnswer() {
    const g = state.game;
    const open = botOpenQuestion();
    const bot = botOf(g);
    if (!open || !bot) return;
    const onFinal = open === g.final;
    if (!onFinal && !isBotTurn(g)) return;
    const marked = hasOwn(open.marks, String(bot.id));
    if (!open.botRoll) { // only a save from before the roll has none
      open.botRoll = onFinal ? rollBotFinal(g, open.question) : rollBot(g, open.catId, open.points);
      saveState();
    }
    const markLater = () => botLater(BOT_MARK_MS, () => {
      if (botOpenQuestion() !== open) return;
      const result = open.botRoll.right ? 'correct' : 'wrong';
      if (onFinal) markFinal(bot, result, true);
      else markContestant(bot, result, true);
    });
    botThinking = open; // BUG-62-03: "Thinking..." only from now (after the double-score popup)
    botSaid = marked || open.botRoll.said === true ? open : null;
    refreshBotRows();
    if (marked) return;
    if (botSaid === open) { // OBS-2: said before a reload
      markLater();
      return;
    }
    const left = timer.running ? timer.endAt - now() : timer.remainingMs;
    const wanted = BOT_THINK_MS[0] + Math.random() * (BOT_THINK_MS[1] - BOT_THINK_MS[0]);
    botLater(Math.max(1000, Math.min(wanted, left - BOT_MARK_MS - 500)), () => {
      if (botOpenQuestion() !== open) return;
      botSaid = open;
      open.botRoll.said = true;
      saveState();
      refreshBotRows();
      markLater();
    });
  }

  function refreshBotRows() {
    if (finalOnScreen()) updateFinalRows();
    else if (state.game && state.game.current) updateScoringRows();
  }

  /**
   * The scoring row of a bot match (open = the board question or Golden Goal): the bot's row has no
   * buttons until it is scored and shows "Thinking..." or its answer; the side that is not on turn is
   * greyed with "Waiting" or "Mokh Bot's question". Other games: nothing changes.
   */
  function updateBotRow(ref, mark, open) {
    const g = state.game;
    clear(ref.note);
    ref.row.classList.remove('is-waiting');
    if (!botOf(g)) return;
    const onFinal = open === g.final;
    const bot = isBot(ref.contestant);
    const onTurn = onFinal || g.turn === ref.contestant.id;
    ref.correct.hidden = bot && mark === null;
    ref.wrong.hidden = bot && mark === null;
    if (bot || !onTurn) {
      ref.correct.disabled = true;
      ref.wrong.disabled = true;
    }
    if (!onTurn) {
      ref.row.classList.add('is-waiting');
      const text = bot ? t('score.waiting') : t('score.botQuestion', { name: iso(findContestant(g, g.turn).name) });
      ref.note.appendChild(h('span', { className: 'srow-wait', text: text }));
      return;
    }
    if (!bot) return;
    if (botSaid !== open && mark === null) { // nothing yet while the double-score popup is open
      if (botThinking === open) ref.note.appendChild(h('span', { className: 'bot-thinking', text: t('score.botThinking') }));
      return;
    }
    const q = onFinal ? open.question : activeQuestion(g).question;
    const answer = botAnswerText(q, open.botRoll, open.lang);
    ref.note.appendChild(h('span', {
      className: 'bot-bubble',
      text: t('score.botSays', { name: iso(ref.contestant.name), answer: iso(answer) }),
    }));
  }

  /**
   * Golden Goal (D-78): the bot locks its bet when its turn comes. US-63 (D-79): its accuracy times
   * its limit, rounded to the nearest 100 and never above the limit (1000 at 70%: 700; 200 at 30%: 100).
   */
  function placeBotBet(g) {
    const f = g.final;
    const c = f && f.stage === 'wager' ? nextWagerContestant(g) : null;
    if (!c || !isBot(c)) return;
    const limit = wagerLimit(g, c.score);
    f.wagers[String(c.id)] = Math.min(limit, Math.round(limit * botTickets(g) / BOT_TICKETS / 100) * 100);
  }

  // ----- The coin flip at the start of a bot match -----

  /** The coin spins (two faces in the two colours) and lands on the starter; reduced motion: no spin. */
  function showCoin() {
    const g = state.game;
    const faces = dom.coin.querySelectorAll('.coin-face');
    g.contestants.forEach((c, i) => {
      const color = paletteEntry(c.color);
      faces[i].style.backgroundColor = color.value;
      faces[i].style.color = color.ink;
      faces[i].textContent = isBot(c) ? ROBOT : Array.from(c.name)[0].toUpperCase(); // the robot, or an initial
    });
    const second = g.turn === g.contestants[1].id;
    dom.coin.className = 'coin';
    dom.coinResult.textContent = '';
    dom.coinOverlay.classList.remove('is-leaving');
    dom.coinOverlay.hidden = false;
    setPageInert(true);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dom.coin.classList.add(second ? 'shows-b' : 'shows-a');
      landCoin();
      return;
    }
    void dom.coin.offsetWidth; // restart the spin
    dom.coin.classList.add('is-spinning', second ? 'lands-b' : 'lands-a');
    coinTimer = window.setTimeout(landCoin, COIN_SPIN_MS);
  }

  function landCoin() {
    renderCoinText();
    coinTimer = window.setTimeout(leaveCoin, COIN_HOLD_MS);
  }

  /** "Sara starts" (also drawn again after a language switch). */
  function renderCoinText() {
    const g = state.game;
    if (!g || g.turn === undefined) return;
    dom.coinResult.textContent = t('tournament.coinStarts', { name: iso(findContestant(g, g.turn).name) });
  }

  /** A short fade, then the board (none under reduced motion). */
  function leaveCoin() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishCoin();
      return;
    }
    dom.coinOverlay.classList.add('is-leaving');
    coinTimer = window.setTimeout(finishCoin, 300);
  }

  /** The flip is over (or skipped with Back): saved as shown, then the first turn starts. */
  function finishCoin() {
    if (coinTimer !== null) window.clearTimeout(coinTimer);
    coinTimer = null;
    if (dom.coinOverlay.hidden) return;
    dom.coinOverlay.hidden = true;
    dom.coinOverlay.classList.remove('is-leaving');
    setPageInert(false);
    const g = state.game;
    if (!g || g.turn === undefined || state.screen !== 'board') return;
    g.coinShown = true;
    saveState();
    dom.turnBanner.focus();
    armBotTurn();
  }

  function bindTournamentEvents() {
    dom.bracketStart.addEventListener('click', openPicker); // D-77 ab: the categories first
    bindPickerEvents();
    dom.bracketShuffle.addEventListener('click', onShuffle);
    dom.bracketEnd.addEventListener('click', onEndTournament);
    dom.matchContinue.addEventListener('click', onMatchContinue);
    dom.trNew.addEventListener('click', onTourneyNewGame);
    dom.trShare.addEventListener('click', onTourneyShare);
  }

  // ---------- Read aloud (US-48) ----------
  // A speaker button on the question screen reads the question, and the choices when they are
  // shown, with the browser's own voices (js/speech.js). It is hidden when no voice is installed
  // for the language shown (also once the browser's late voice list arrives). Reading never touches
  // the timer. It stops on a second click, when the language is switched, when the question closes
  // (Back to Board, Next, any other screen) and on a refresh. "Read questions automatically" is a
  // choice saved on this device only (setup screen, off by default): reading then starts by itself
  // when a question opens (after the double-score popup).

  function loadReadAloud() {
    try {
      return window.localStorage.getItem(READ_ALOUD_KEY) === '1';
    } catch (err) {
      return false; // storage disabled: off
    }
  }

  function saveReadAloud(on) {
    try {
      if (on) window.localStorage.setItem(READ_ALOUD_KEY, '1');
      else window.localStorage.removeItem(READ_ALOUD_KEY);
    } catch (err) {
      // storage full or disabled: the choice lasts until the page is closed
    }
  }

  /** What the speaker reads now, as [{ text, lang }] (the question first), or null when no question is open. */
  function speechParts() {
    if (state.screen !== 'question') return null;
    if (speedOnScreen()) { // US-59: only while the question is open and visible
      const cur = speed.run.current;
      return speedPhase === 'live' ? runSpeechParts(cur.q, cur) : null;
    }
    if (streakOnScreen()) return runSpeechParts(streak.current.q, streak.current);
    if (dailyOnScreen()) return runSpeechParts(dailyQuestion(), daily.current);
    const g = state.game;
    if (finalOnScreen()) {
      const arabic = g.final.lang === 'ar';
      return [{ text: arabic ? g.final.question.question_ar : g.final.question.question, lang: arabic ? 'ar' : 'en' }];
    }
    if (!g || !g.current) return null;
    const q = activeQuestion(g).question;
    const arabic = g.current.lang === 'ar';
    const parts = [{ text: arabic ? q.question_ar : q.question, lang: arabic ? 'ar' : 'en' }];
    if (g.current.choiceOrder !== undefined && hasChoices(q)) { // the "3 choices" helper, in the shown order
      const texts = choiceTexts(q, arabic);
      g.current.choiceOrder.forEach((index, position) => {
        parts.push({ text: CHOICE_LETTERS[position] + ': ' + texts.options[index], lang: texts.arabic ? 'ar' : 'en' });
      });
    }
    return parts;
  }

  /** A Streak or Daily Challenge question and its 3 choices, in the shown language. */
  function runSpeechParts(q, cur) {
    const arabic = cur.lang === 'ar';
    const lang = arabic ? 'ar' : 'en';
    return [{ text: arabic ? q.question_ar : q.question, lang: lang }].concat(q.choices.map((choice, index) => ({
      text: CHOICE_LETTERS[index] + ': ' + (arabic ? choice.text_ar : choice.text),
      lang: lang,
    })));
  }

  /** The speaker shows only with a voice for the question's language; pressed while it reads. */
  function updateSpeakButton() {
    const parts = speech ? speechParts() : null;
    const shown = parts !== null && speech.hasVoice(parts[0].lang);
    if (!shown && reading) {
      stopReading(); // updates the button again
      return;
    }
    dom.speakBtn.hidden = !shown;
    dom.questionMain.classList.toggle('can-speak', shown);
    dom.speakBtn.textContent = reading ? STOP_SIGN : SPEAKER;
    dom.speakBtn.setAttribute('aria-pressed', String(reading));
    dom.speakBtn.setAttribute('aria-label', t('speak.label'));
    dom.speakBtn.title = reading ? t('speak.stop') : t('speak.label');
  }

  function startReading() {
    const parts = speechParts();
    if (!speech || parts === null || !speech.hasVoice(parts[0].lang)) return;
    reading = speech.speak(parts, () => { // the reading ended by itself
      reading = false;
      updateSpeakButton();
    });
    updateSpeakButton();
  }

  function stopReading() {
    if (speech) speech.stop();
    reading = false;
    updateSpeakButton();
  }

  function onSpeakClick() {
    if (reading) stopReading();
    else startReading();
  }

  /** A question was put on the screen: stop the last reading; read this one if automatic reading is on. */
  function onQuestionShown(hold) {
    stopReading();
    if (!hold) autoRead();
  }

  function autoRead() {
    if (readAloud && dom.doubleOverlay.hidden) startReading();
  }

  function initReadAloud() {
    readAloud = speech !== null && loadReadAloud();
    dom.readAloudField.hidden = speech === null;
    dom.readAloudInput.checked = readAloud;
    dom.readAloudInput.addEventListener('change', () => {
      readAloud = dom.readAloudInput.checked;
      saveReadAloud(readAloud);
    });
    dom.speakBtn.addEventListener('click', onSpeakClick);
    if (speech) speech.onVoicesChanged(updateSpeakButton); // voices often arrive after the page loads
  }

  // ---------- Report a question (US-42, D-45) ----------
  // "Report" on an open board question (the Swap question once swapped) and on an answered Streak
  // question opens a small form: one of six reasons and an optional note of up to 200 characters.
  // The form lies over the question screen and leaves the timer running; the report is posted to
  // api/reports.php and changes nothing in the game, the run, the scores or their saved state.

  /** The question that Report would report now, as { id, label }, or null when there is none. */
  function reportTarget() {
    // The Integration Quiz has no Report: api/reports.php takes the public bank's question ids only.
    if (state.screen !== 'question' || INTEGRATION) return null;
    if (streakOnScreen()) {
      const cur = streak.current;
      if (cur.picked === null) return null; // a Streak question is reported once it is answered
      return { id: cur.q.id, label: runHeading(cur.q) };
    }
    if (dailyOnScreen()) { // Daily Challenge (US-43): also once answered, like the Streak
      if (daily.current.picked === null) return null;
      const q = dailyQuestion();
      return { id: q.id, label: runHeading(q) };
    }
    if (finalOnScreen()) { // final round question (US-44), like an open board question
      const f = state.game.final;
      return Number.isInteger(f.question.id) && f.question.id > 0 ? { id: f.question.id, label: finalHeading(f) } : null;
    }
    const g = state.game;
    if (!g || !g.current) return null;
    const active = activeQuestion(g);
    // A game saved before the board sent question ids has none to report.
    if (!Number.isInteger(active.question.id) || active.question.id < 1) return null;
    return { id: active.question.id, label: iso(active.catName) + ' ' + EN_DASH + ' ' + active.points };
  }

  /** Show Report only when there is a question to report; the heading then leaves room for it (CSS). */
  function updateReportButton() {
    const shown = reportTarget() !== null;
    dom.reportBtn.hidden = !shown;
    dom.questionMain.classList.toggle('can-report', shown);
  }

  function isReportOpen() {
    return !dom.reportOverlay.hidden;
  }

  function openReport() {
    const target = reportTarget();
    if (!target || isReportOpen() || !dom.doubleOverlay.hidden || isChancePopupOpen()) return;
    report = { questionId: target.id, sending: false };
    dom.reportAbout.textContent = target.label;
    dom.reportReasons.forEach((input) => { input.checked = false; });
    dom.reportNote.value = '';
    updateReportCount();
    clearMessage(dom.reportError);
    dom.reportForm.hidden = false;
    dom.reportDone.hidden = true;
    setReportSending(false);
    dom.reportOverlay.hidden = false;
    setPageInert(true); // keyboard focus stays in the form; the timer behind it keeps running
    dom.reportReasons[0].focus();
  }

  /** Cancel, Close, Escape or Android Back. A report still being sent is not cancelled. */
  function closeReport() {
    if (!isReportOpen()) return;
    dom.reportOverlay.hidden = true;
    setPageInert(false);
    report = null;
    if (!dom.reportBtn.hidden) dom.reportBtn.focus();
  }

  /** "N / 200": characters as the server counts them (an emoji is one). */
  function updateReportCount() {
    const length = Array.from(dom.reportNote.value.trim()).length;
    dom.reportCount.textContent = ltr(length + ' / ' + REPORT_NOTE_MAX); // BUG-13-01: "9 / 200" in Arabic too
    dom.reportCount.classList.toggle('is-full', length >= REPORT_NOTE_MAX);
  }

  function setReportSending(sending) {
    if (report) report.sending = sending;
    dom.reportSend.disabled = sending;
    dom.reportSend.textContent = sending ? t('report.sending') : t('report.send');
  }

  function checkedReason() {
    const checked = dom.reportReasons.find((input) => input.checked);
    return checked ? checked.value : '';
  }

  async function onReportSubmit(event) {
    event.preventDefault();
    const sent = report;
    if (!sent || sent.sending) return;
    clearMessage(dom.reportError);
    const reason = checkedReason();
    const note = dom.reportNote.value.trim();
    if (!reason) {
      showMessage(dom.reportError, t('report.chooseReason'), 'error');
      dom.reportReasons[0].focus();
      return;
    }
    if (Array.from(note).length > REPORT_NOTE_MAX) {
      showMessage(dom.reportError, t('report.noteTooLong', { max: REPORT_NOTE_MAX }), 'error');
      dom.reportNote.focus();
      return;
    }
    setReportSending(true);
    let failure = null;
    try {
      const saved = await apiPost('reports.php', { question_id: sent.questionId, reason: reason, note: note });
      if (!isPlainObject(saved) || !Number.isInteger(saved.id)) throw textError('err.response');
    } catch (err) {
      failure = err;
    }
    if (report !== sent) return; // closed meanwhile
    setReportSending(false);
    if (failure) {
      showMessage(dom.reportError, t('report.failed', { reason: errorText(failure) }), 'error');
      return;
    }
    dom.reportForm.hidden = true;
    dom.reportDone.hidden = false;
    dom.reportClose.focus();
  }

  function bindReportEvents() {
    dom.reportBtn.addEventListener('click', openReport);
    dom.reportForm.addEventListener('submit', onReportSubmit);
    dom.reportNote.addEventListener('input', updateReportCount);
    dom.reportReasons.forEach((input) => input.addEventListener('change', () => clearMessage(dom.reportError)));
    dom.reportCancel.addEventListener('click', closeReport);
    dom.reportClose.addEventListener('click', closeReport);
  }

  // ---------- Interface language (US-49) ----------
  // The EN / AR switch in the header: js/i18n.js saves the choice on this device and sets the page's
  // lang and dir; here the static texts are swapped and the screen on show is drawn again in the new
  // language. Nothing saved changes (game, Streak run, Daily Challenge), a running timer keeps going,
  // typed names and bets stay, and an open question keeps the language it is shown in.

  /** The page's own texts (data-i18n), the switch's pressed button and the mode limits. */
  function applyStaticTexts() {
    i18n.apply(document);
    // The tab title: the brand alone in Arabic (no Arabic tagline yet), the page's own title in English.
    document.title = i18n.isArabic() ? t('app.name') : PAGE_TITLE;
    const lang = i18n.lang();
    dom.uiLangBtns.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.getAttribute('data-ui-lang') === lang)));
    Object.keys(MODES).forEach((key) => {
      const limit = byId('mode-limit-' + key); // none in the Integration Quiz
      if (limit) limit.textContent = t('mode.limit', { n: MODES[key].limit });
    });
    // Names are typed left to right or right to left by their own letters in the Arabic page.
    [dom.streakNameInput, dom.speedNameInput].forEach((input) => { // US-60: the Speed name step too
      if (i18n.isArabic()) input.dir = 'auto';
      else input.removeAttribute('dir');
    });
  }

  function onUiLangClick(event) {
    i18n.setLang(event.currentTarget.getAttribute('data-ui-lang'));
  }

  function onLanguageChanged() {
    applyStaticTexts();
    refreshTexts(); // messages on screen that were made by a function
    if (state.setup) refreshSetup(); // also while hidden: Back from the leaderboard shows it as it was
    if (tourney) { // US-62: the bot's name in the new language, saved
      relabelBot(tourney, state.game);
      saveState();
    }
    refreshScreen();
    if (!dom.coinOverlay.hidden && dom.coinResult.textContent) renderCoinText();
    if (isRoomPanelOpen()) renderRoomPanel(); // US-52
  }

  function refreshSetup() {
    const s = state.setup;
    renderEntries();
    renderCategories();
    renderPlayed();
    if (s.loadErrorShown) {
      const shown = s.loadErrorShown;
      showLoadError(shown.text, shown.withRetry, shown.withAdminLink);
    }
  }

  /** Draw the screen on show again; whatever the user typed or chose stays. */
  function refreshScreen() {
    const g = state.game;
    if (g) renderGame(); // the board and scoreboard, also behind a question or Golden Goal
    if (state.screen === 'question') {
      refreshQuestion();
    } else if (state.screen === 'final') {
      refreshFinal();
    } else if (state.screen === 'results') {
      if (g) renderResults();
    } else if (state.screen === 'leaderboard') {
      renderLeaderboardHead(leaderboardResult);
      renderLeaderboardTabs();
      if (lastLeaderboard) {
        renderLeaderboardRows(lastLeaderboard.rows, lastLeaderboard.result, lastLeaderboard.failure, lastLeaderboard.period);
      } else {
        showLeaderboardLoading(); // the rows on their way replace it
      }
    } else if (state.screen === 'daily' && daily) {
      renderDailyTexts();
      if (dailyTicker !== null) tickDailyCountdown();
      else if (!dom.dailyPlay.hidden) dom.dailyNext.textContent = t('daily.ready');
    } else if (state.screen === 'crossword' && crossword) {
      renderCrossword(); // progress, the toggled clues and the timer stay (US-58)
    } else if (state.screen === 'speed' && speed && speed.last) {
      renderSpeedResult(); // US-59
    } else if (state.screen === 'bracket' && tourney) {
      renderBracket();     // US-61
      if (isPickOpen()) renderPicker(); // the ticks stay
    } else if (state.screen === 'match' && tourney) {
      renderMatchResult();
    } else if (state.screen === 'tresults') {
      renderTourneyResults();
    }
  }

  /** The open question (board, Golden Goal, Streak or Daily Challenge), without touching its timer. */
  function refreshQuestion() {
    const g = state.game;
    if (speedOnScreen()) { // US-59: the clock and its frozen or running state stay as they are
      const cur = speed.run.current;
      dom.qHeading.textContent = runHeading(cur.q);
      renderRunLang(cur.q, cur, speedAnswer);
      renderSpeedPanel();
    } else if (streakOnScreen()) {
      renderRunHeading(streak.current.q);
      renderStreakLang();
      renderStreakPanel();
    } else if (dailyOnScreen()) {
      renderRunHeading(dailyQuestion());
      renderRunLang(dailyQuestion(), daily.current, dailyAnswer);
      renderDailyPanel();
    } else if (finalOnScreen()) {
      setFinalPanelTexts();
      setGoalText(dom.qHeading, '', roundSuffix(g.final.round) + ' ' + EN_DASH + ' ' + iso(finalCategoryName(g.final)));
      renderFinalLang();
      renderFinalRows();
    } else if (g && g.current) {
      setScoringPanelTexts(scoringPanelText());
      renderQuestionHeading(activeQuestion(g));
      renderQuestionLang(activeQuestion(g).question);
      renderScoringRows();
    }
    renderTimer();
  }

  /** The Golden Goal screen: the offer, or the bets without clearing what is being typed. */
  function refreshFinal() {
    const g = state.game;
    const f = g && g.final;
    if (!f) return;
    if (f.stage === 'offer') {
      renderFinal();
      setFinalLoading(finalLoading);
      return;
    }
    setGoalText(dom.finalTitle, '', roundSuffix(f.round));
    dom.finalCategory.textContent = iso(finalCategoryName(f));
    renderWagerList(g);
    const c = nextWagerContestant(g);
    if (c) renderWagerPrompt(g, c);
  }

  // ---------- Phone buzzer (US-52, D-80) ----------
  // In a Phone buzzer game the players' phones follow the board: every saved change goes to
  // api/rooms.php (debounced, and only when what the phones see has changed), and the host polls who
  // has joined for the share panel. Host control never gets here: phoneOn() is false, so it makes no
  // rooms call at all (the regression rule of every phone sprint).

  /** A Phone buzzer game is on this screen (never a tournament match, D-80 b). */
  function phoneOn() {
    const g = state.game;
    return !INTEGRATION && !tourney && !!g && g.control === 'phone' && isPlainObject(g.room);
  }

  /**
   * What the phones may see (D-80 p), never the questions or answers: the names, colours and scores, the
   * column names (none for an unopened "Surprise me!" column; Kilo Meshakkal is named by the phone) and
   * per cell its value, owner and Swap label. An unused Kilo Meshakkal box sends its emoji only (US-53)
   * and the double-score mark (D-40) is sent only once its cell is open or played. api/rooms.php checks
   * the same rules again.
   */
  function phonePayload(g) {
    const index = (id) => g.contestants.findIndex((c) => c.id === id);
    return {
      mode: g.mode,
      screen: PHONE_SCREENS.indexOf(state.screen) === -1 ? 'board' : state.screen,
      contestants: g.contestants.map((c) => ({ name: c.name, color: c.color, score: c.score })),
      points: g.points.slice(),
      categories: g.categories.map((c) => (c.hidden || c.id === MIX
        ? { hidden: !!c.hidden, mix: c.id === MIX }
        : { name: c.name, nameAr: isFilled(c.nameAr) ? c.nameAr : null, hidden: false, mix: false })),
      cells: g.points.map((p, i) => g.categories.map((c) => (c.id === MIX
        ? phoneCell(g, c, c.order[i], c.faces[i], index) : phoneCell(g, c, p, null, index)))),
    };
  }

  function phoneCell(g, category, points, face, index) {
    const key = cellKey(category.id, points);
    const double = g.double === key;
    if (hasOwn(g.used, key)) {
      const used = g.used[key];
      const swap = used.swap
        ? { name: used.swap.catName, nameAr: isFilled(used.swap.catNameAr) ? used.swap.catNameAr : null, points: used.swap.points }
        : null;
      return { p: points, used: true, owner: used.owner === null ? null : index(used.owner), x2: double, swap: swap };
    }
    const open = g.current !== null && cellKey(g.current.catId, g.current.points) === key;
    return face ? { face: face, open: open, x2: open && double } : { p: points, open: open, x2: open && double };
  }

  /** Make the game's room (api/rooms.php create); resolves to { code, hostToken }. */
  async function createRoom(g) {
    const data = await apiPost(ROOMS_API + '?action=create', { state: phonePayload(g), session: HOST_SESSION });
    if (!isPlainObject(data) || typeof data.code !== 'string' || !ROOM_CODE_PATTERN.test(data.code) ||
        typeof data.host_token !== 'string' || !ROOM_TOKEN_PATTERN.test(data.host_token)) throw textError('err.response');
    return { code: data.code, hostToken: data.host_token };
  }

  /** The phones follow this game from now on (a new game, or a restored one). */
  function startPhone(claim) {
    phone.lastSent = null;
    phone.claiming = !!claim;
    phone.ready = claim ? claimRoom(state.game) : null;
    schedulePush();
    pollLobby();
  }

  /** A restored game: this tab takes the room over (BUG-52-02, the newest tab wins). Never rejects. */
  async function claimRoom(g) {
    const gen = phone.gen;
    try {
      await apiPost(ROOMS_API + '?action=claim', { code: g.room.code, host_token: g.room.hostToken, session: HOST_SESSION });
    } catch (err) {
      if (gen === phone.gen && err.status === 404) renewRoom(g); // expired: a new room with this session
    } finally {
      if (gen === phone.gen) phone.claiming = false;
    }
  }

  /** BUG-52-02: another tab has taken over: stop saving and pushing, and say so until "Use this tab". */
  function blockPhone() {
    if (phone.blocked) return;
    phone.blocked = true;
    phone.gen += 1;
    window.clearTimeout(phone.pushTimer);
    window.clearTimeout(phone.lobbyTimer);
    stopTimer();
    closeRoomPanel();
    dom.roomTaken.hidden = false;
    setPageInert(true);
    dom.roomTakenUse.focus();
  }

  function isRoomTakenOpen() {
    return !dom.roomTaken.hidden;
  }

  /** No more pushes or polls (New Game, or a new game starting); the room is left to expire. */
  function stopPhone() {
    phone.gen += 1;
    window.clearTimeout(phone.pushTimer);
    window.clearTimeout(phone.lobbyTimer);
    Object.assign(phone, {
      pushTimer: null, pushing: false, again: false, lastSent: null, lobbyTimer: null, lobby: null,
      shownJoined: null, message: null, renewing: null, qrCode: null, ready: null, claiming: false,
    });
    closeRoomPanel();
    dom.roomBtn.hidden = true;
  }

  function schedulePush() {
    window.clearTimeout(phone.pushTimer);
    phone.pushTimer = window.setTimeout(pushNow, ROOM_PUSH_MS);
  }

  /** Send the board to the phones when what they see changed; one push at a time. */
  async function pushNow() {
    phone.pushTimer = null;
    if (!phoneOn()) return;
    if (phone.pushing) {
      phone.again = true;
      return;
    }
    const g = state.game;
    const gen = phone.gen;
    const payload = phonePayload(g);
    const text = JSON.stringify(payload);
    if (text === phone.lastSent) return;
    phone.pushing = true;
    try {
      if (phone.ready) await phone.ready;
      if (gen !== phone.gen) return;
      await apiPost(ROOMS_API + '?action=push', {
        code: g.room.code, host_token: g.room.hostToken, session: HOST_SESSION, state: payload,
      });
      if (gen !== phone.gen) return;
      phone.lastSent = text;
      if (phone.message) setPhoneMessage(null);
    } catch (err) {
      if (gen !== phone.gen) return;
      if (err.status === 404) {
        renewRoom(g); // idle for 6 hours (or deleted): a new room, so the phones can join again
      } else if (err.status === 409) {
        blockPhone(); // BUG-52-02: another tab of this game is the host now
      } else {
        setPhoneMessage(() => t('room.syncFailed', { reason: sentence(errorText(err)) }));
        phone.pushTimer = window.setTimeout(pushNow, ROOM_RETRY_MS);
      }
    } finally {
      if (gen === phone.gen) {
        phone.pushing = false;
        if (phone.again) {
          phone.again = false;
          schedulePush();
        }
      }
    }
  }

  /** The room has expired: make a new one for the same game and show its code. */
  function renewRoom(g) {
    if (phone.renewing) return;
    const gen = phone.gen;
    phone.renewing = createRoom(g)
      .then((room) => {
        if (gen !== phone.gen || state.game !== g) return;
        g.room = room;
        phone.lobby = null;
        phone.shownJoined = null;
        phone.lastSent = null;
        saveState(); // keeps the new room and pushes the board
        setPhoneMessage(() => t('room.expired'));
        openRoomPanel();
      })
      .catch((err) => {
        if (gen === phone.gen) setPhoneMessage(() => t('room.syncFailed', { reason: sentence(errorText(err)) }));
      })
      .then(() => {
        if (gen === phone.gen) phone.renewing = null;
      });
  }

  /** Who has joined, every ROOM_LOBBY_MS while the game is on (skipped while the tab is hidden). */
  async function pollLobby() {
    window.clearTimeout(phone.lobbyTimer);
    phone.lobbyTimer = null;
    if (!phoneOn()) return;
    const g = state.game;
    const gen = phone.gen;
    if (!document.hidden) {
      try {
        const data = await apiGet(ROOMS_API + '?action=lobby&code=' + encodeURIComponent(g.room.code) +
          '&session=' + HOST_SESSION);
        if (gen !== phone.gen) return;
        if (isPlainObject(data) && data.other_tab === true && !phone.claiming) {
          blockPhone();
          return;
        }
        if (isPlainObject(data) && Array.isArray(data.players)) phone.lobby = data;
        renderLobby();
      } catch (err) {
        if (gen !== phone.gen) return;
        if (err.status === 404) renewRoom(g);
      }
    }
    if (gen === phone.gen) phone.lobbyTimer = window.setTimeout(pollLobby, ROOM_LOBBY_MS);
  }

  /** Joined (true) or waiting (false) per contestant, from the last lobby poll. */
  function lobbyJoined() {
    const g = state.game;
    const players = phone.lobby ? phone.lobby.players : null;
    if (!Array.isArray(players) || players.length !== g.contestants.length) return g.contestants.map(() => false);
    return players.map((p) => isPlainObject(p) && p.joined === true);
  }

  /** The button and the panel's list, redrawn only when someone joined or left (focus stays put). */
  function renderLobby() {
    const joined = JSON.stringify(lobbyJoined());
    if (joined === phone.shownJoined) return;
    renderRoomButton();
    if (isRoomPanelOpen()) renderRoomPlayers();
  }

  function renderRoomButton() {
    const on = phoneOn();
    dom.roomBtn.hidden = !on;
    if (!on) return;
    const total = state.game.contestants.length;
    const joined = lobbyJoined().filter(Boolean).length;
    dom.roomBtn.textContent = t('room.btn', { joined: joined, total: total });
    dom.roomBtn.setAttribute('aria-label', t('room.btnLabel', { joined: joined, total: total }));
    dom.roomBtn.classList.toggle('is-warning', phone.message !== null);
  }

  /** text: a function giving the panel's warning (shown again after a language switch), or null. */
  function setPhoneMessage(text) {
    phone.message = text;
    if (text) showMessage(dom.roomMsg, text, 'warning');
    else clearMessage(dom.roomMsg);
    renderRoomButton();
  }

  function isRoomPanelOpen() {
    return !dom.roomOverlay.hidden;
  }

  function joinLink(code) {
    return new URL('join.html?room=' + code, window.location.href).href;
  }

  /** The share and lobby panel: QR code, room code, link, joined / waiting per name. */
  function openRoomPanel() {
    if (!phoneOn() || isRoomPanelOpen()) return;
    dom.roomOverlay.hidden = false;
    setPageInert(true);
    renderRoomPanel();
    dom.roomClose.focus();
  }

  function closeRoomPanel() {
    if (!isRoomPanelOpen()) return;
    dom.roomOverlay.hidden = true;
    setPageInert(false);
    if (!dom.roomBtn.hidden && state.screen === 'board') dom.roomBtn.focus();
  }

  function renderRoomPanel() {
    if (!phoneOn()) return;
    const g = state.game;
    const link = joinLink(g.room.code);
    dom.roomHow.textContent = t('room.how.' + MODES[g.mode].key);
    dom.roomCode.textContent = g.room.code;
    dom.roomLink.textContent = link;
    dom.roomLink.href = link;
    dom.roomCopyStatus.textContent = '';
    if (phone.qrCode !== g.room.code) {
      clear(dom.roomQr);
      try {
        dom.roomQr.appendChild(window.BrainRushQR.svg(link, t('room.qrLabel')));
        phone.qrCode = g.room.code;
      } catch (err) {
        // no QR picture: the code and the link still work
      }
    } else if (dom.roomQr.firstChild) {
      dom.roomQr.firstChild.setAttribute('aria-label', t('room.qrLabel'));
    }
    if (phone.message) showMessage(dom.roomMsg, phone.message, 'warning');
    else clearMessage(dom.roomMsg);
    renderRoomPlayers();
  }

  function renderRoomPlayers() {
    const g = state.game;
    const joined = lobbyJoined();
    phone.shownJoined = JSON.stringify(joined);
    renderRoomButton();
    clear(dom.roomPlayers);
    g.contestants.forEach((c, i) => {
      const dot = h('span', { className: 'room-player-dot', 'aria-hidden': 'true' });
      dot.style.backgroundColor = paletteEntry(c.color).value;
      dom.roomPlayers.appendChild(h('li', { className: 'room-player' + (joined[i] ? ' is-joined' : '') }, [
        dot,
        ownDirection(h('span', { className: 'room-player-name', text: c.name })),
        h('span', { className: 'room-player-state', text: t(joined[i] ? 'room.joined' : 'room.waiting') }),
        joined[i] ? h('button', {
          type: 'button',
          className: 'btn btn-small',
          text: t('room.release'),
          'aria-label': t('room.releaseLabel', { name: iso(c.name) }),
          onclick: () => releaseName(i),
        }) : null,
      ]));
    });
    if (!joined.some(Boolean)) dom.roomPlayers.appendChild(h('li', { className: 'hint room-none', text: t('room.none') }));
  }

  /** Release (D-18 confirm): the name is free again; that phone goes back to the name list. */
  async function releaseName(index) {
    if (!phoneOn()) return;
    const g = state.game;
    const gen = phone.gen;
    if (!window.confirm(t('room.releaseConfirm', { name: iso(g.contestants[index].name) }))) return;
    try {
      await apiPost(ROOMS_API + '?action=release', {
        code: g.room.code, host_token: g.room.hostToken, session: HOST_SESSION, contestant: index,
      });
      if (gen !== phone.gen) return;
      if (phone.lobby && isPlainObject(phone.lobby.players[index])) phone.lobby.players[index].joined = false;
      renderLobby();
    } catch (err) {
      if (gen !== phone.gen) return;
      if (err.status === 404) renewRoom(g);
      else if (err.status === 409) blockPhone();
      else setPhoneMessage(() => t('room.releaseFailed', { reason: sentence(errorText(err)) }));
    }
  }

  function onRoomCopy() {
    const link = dom.roomLink.href;
    const done = (key) => { dom.roomCopyStatus.textContent = t(key); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(() => done('room.copied'), () => done('room.copyFailed'));
    } else {
      done('room.copyFailed');
    }
  }

  function bindPhoneEvents() {
    dom.controlInputs.forEach((input) => input.addEventListener('change', onControlChange));
    dom.roomBtn.addEventListener('click', openRoomPanel);
    dom.roomClose.addEventListener('click', closeRoomPanel);
    dom.roomCopy.addEventListener('click', onRoomCopy);
    dom.roomTakenUse.addEventListener('click', () => window.location.reload()); // the reload claims the room
    dom.roomOverlay.addEventListener('click', (event) => {
      if (event.target === dom.roomOverlay) closeRoomPanel(); // a tap beside the card
    });
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
    dom.startBtn.textContent = t('setup.start');
    dom.streakBtn.textContent = t(STREAK_START);
    dom.streakNameInput.value = '';
    setFieldError(dom.streakNameInput, dom.streakNameError, '');
    renderEntries();
    renderSetupMode();
    showScreen('setup');
    if (INTEGRATION) onStreakOpen(); // the quiz is the streak setup only
    loadSetupData();
  }

  function bindStreakEvents() {
    dom.streakOpenBtn.addEventListener('click', onStreakOpen);
    dom.streakBtn.addEventListener('click', onStreakStart);
    dom.streakCancel.addEventListener('click', onStreakCancel);
    dom.streakBoardBtn.addEventListener('click', onLeaderboardOpen);
    dom.streakNameInput.addEventListener('input', () => setFieldError(dom.streakNameInput, dom.streakNameError, ''));
    dom.streakNext.addEventListener('click', onRunNext);
    dom.streakEnd.addEventListener('click', onRunEnd);
    if (dom.chanceUse) { // US-54: not on the Integration Quiz page
      dom.chanceUse.addEventListener('click', onStreakSecondChance);
      dom.chanceEnd.addEventListener('click', onChanceEnd);
    }
    dom.lbAgain.addEventListener('click', onPlayAgain);
    dom.lbNew.addEventListener('click', onLeaderboardNewGame);
    dom.lbBack.addEventListener('click', onLeaderboardBack);
    dom.lbTabs.forEach((tab) => tab.addEventListener('click', onLeaderboardTab));
    document.addEventListener('keydown', onKeyDown);
  }

  function bindDailyEvents() {
    dom.dailyOpenBtn.addEventListener('click', onDailyOpen);
    dom.dailyShare.addEventListener('click', onDailyShare);
    dom.dailyNew.addEventListener('click', onDailyNewGame);
    dom.dailyPlay.addEventListener('click', onDailyPlayNew);
    dom.resultsShare.addEventListener('click', onResultsShare);
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
    dom.backBtn.addEventListener('click', onBackClick);
    dom.doubleOk.addEventListener('click', closeDoublePopup);
    dom.newGameBtn.addEventListener('click', newGame);
    bindPhoneEvents();
    bindStreakEvents();
    bindDailyEvents();
    bindCrosswordEvents();
    bindSpeedEvents();
    bindReportEvents();
    bindFinalEvents();
    bindTournamentEvents();
    dom.uiLangBtns.forEach((btn) => btn.addEventListener('click', onUiLangClick)); // US-49
    i18n.onChange(onLanguageChanged);
  }

  /** US-17: reopen the saved screen. An open question restarts its timer at full length (D-04). */
  function restoreGame(saved) {
    state.game = saved.game;
    if (phoneOn()) startPhone(true); // US-52: this tab takes the room over (kept, or renewed if expired)
    if (saved.screen === 'results') {
      renderResults();
      showScreen('results');
      return;
    }
    renderGame();
    preloadImages(state.game.categories);
    const f = state.game.final;
    if (saved.screen === 'final') { // the final round's offer or wagers (US-44)
      if (f.question && f.question.image) new Image().src = f.question.image;
      renderFinal();
      showScreen('final');
    } else if (saved.screen === 'question' && f) {
      showFinalQuestion(); // its timer restarts at full length, like a board question (D-04)
    } else if (saved.screen === 'question') {
      showQuestion();
    } else {
      showScreen('board');
      armBotTurn(); // US-62: the coin flip (if not played yet) or the bot's pick
    }
  }

  function init() {
    applyStaticTexts();
    bindEvents();
    initReadAloud();
    initApp();
    registerServiceWorker();
    // The Integration Quiz restores only its own run: the board game and the Daily Challenge are index.html's.
    const saved = INTEGRATION ? null : loadState();
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
    // US-61: a running tournament comes back where it was (bracket, match, results); a broken save is dropped.
    const savedTournament = INTEGRATION ? null : loadTournament();
    if (savedTournament) {
      try {
        restoreTournament(savedTournament);
        return;
      } catch (err) {
        stopTimer();
        state.game = null;
        tourney = null;
        clearTournament();
      }
    }
    // US-59: one saved solo run at a time; a Speed Round started after the others comes back first.
    if (!INTEGRATION && lastSoloMode() === 'speed' && restoreSavedSpeed()) return;
    if (!INTEGRATION && lastSoloMode() === 'daily' && restoreSavedDaily()) return;
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
    if (!INTEGRATION && restoreSavedCrossword()) return;
    if (!INTEGRATION && restoreSavedDaily()) return;
    if (!INTEGRATION && restoreSavedSpeed()) return;
    startSetup();
  }

  /**
   * A saved Daily Challenge (US-43): an unfinished run comes back on its question, and the result
   * screen comes back while it was open on the same day. Today's result stays in memory either way,
   * so the Daily Challenge button shows it again. Returns true when a screen was restored.
   */
  function restoreSavedDaily() {
    const saved = loadDaily();
    if (!saved) return false;
    daily = saved;
    try {
      if (!saved.done && Date.now() >= saved.nextAt) {
        // BUG-8-03: that challenge's day (UTC) is over. Close the leftover run (the questions not
        // answered score 0) and show its result, which offers "Play the new challenge"; the server's
        // date then decides whether a new one has really started.
        closeDaily(saved);
        showDailyResult();
        return true;
      }
      if (!saved.done) {
        restoreDaily(saved);
        return true;
      }
      if (saved.onResult && Date.now() < saved.nextAt) {
        showDailyResult();
        return true;
      }
    } catch (err) {
      stopTimer();
      daily = null;
      saveDaily();
    }
    return false;
  }

  init();
})();
