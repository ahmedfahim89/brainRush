// Mokh Rush interface language (US-49): English and Arabic string tables, a lookup with English
// fallback, plural forms, bidi helpers and the page's lang/dir. Loaded in <head>, before the page
// is drawn, so an Arabic page is right to left from its first paint. game.js uses t() / n() for
// every visible text and calls apply() for the static texts of index.html (data-i18n="key",
// data-i18n-attr="attr:key;attr:key"). Strings are plain text: callers render them with
// textContent, never innerHTML (DoD 4). The choice is saved on this device only.
// The guide, Terms, Privacy, About, Contact and Admin pages stay English and do not load this file.
// A page with <html data-fixed-lang="en"> (the Integration Quiz) always shows that language: it has
// no EN / AR switch and ignores the choice saved on this device.
'use strict';

(function () {
  const KEY = 'brainrush.lang';
  const LANGS = ['en', 'ar'];
  const FSI = String.fromCharCode(0x2068); // first strong isolate: a name or category keeps its own direction
  const LRI = String.fromCharCode(0x2066); // left-to-right isolate: signed numbers such as -200 or +400
  const PDI = String.fromCharCode(0x2069); // pop directional isolate

  // A plural entry is an object of Intl.PluralRules categories (Arabic: zero, one, two, few, many,
  // other); {n} is the count. A missing Arabic string or form falls back to English.
  const STRINGS = {
    en: {
      // Header and footer
      'app.name': 'Mokh Rush', // D-64: the brand in the header and the tab title
      'nav.howToPlay': 'How to play',
      'nav.terms': 'Terms',
      'nav.privacy': 'Privacy',
      'nav.admin': 'Admin',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'nav.site': 'Site',
      'lang.group': 'Language',
      'maintenance.text': 'Poor AI agents are working late tonight to deliver the cool features you asked for. The game will be playable again within 24 hours.',

      // Common
      'common.loading': 'Loading...',
      'common.tryAgain': 'Try again',
      'common.newGame': 'New Game',
      'common.share': 'Share',
      'common.back': 'Back',
      'list.sep': ', ',
      'list.and': ' and ',
      'date.months': 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec',
      'date.format': '{d} {m} {y}',

      // Errors made in the browser (the server's own error texts are shown as sent)
      'err.generic': 'Something went wrong.',
      'err.network': 'Could not reach the server. Check that it is running.',
      'err.http': 'Request failed (HTTP {status}).',
      'err.response': 'The server sent an unexpected response.',
      'err.board': 'The server sent an unexpected board.',
      'err.question': 'The server sent an unexpected question.',
      'err.questions': 'The server sent unexpected questions.',
      'err.leaderboard': 'The server sent an unexpected leaderboard.',
      'err.daily': 'The server sent an unexpected Daily Challenge.',
      'err.noQuestions': 'There are no questions to play yet.',

      // Setup
      'setup.title': 'New game',
      'setup.intro': 'Free Jeopardy-style trivia quiz game for parties, classrooms and family nights: questions in English and Arabic, players or teams on one shared screen.',
      'setup.who': 'Who is playing?',
      'setup.playMode': 'Play mode',
      'setup.colorHint': 'Click a color circle to switch to the next free color.',
      'setup.start': 'Start Game',
      'setup.starting': 'Starting...',
      'mode.players': 'Players',
      'mode.teams': 'Teams',
      'mode.limit': '(max {n})',
      'entry.add.players': 'Add player',
      'entry.add.teams': 'Add team',
      'entry.label.players': 'Player {n}',
      'entry.label.teams': 'Team {n}',
      'entry.placeholder': '{label} name',
      'entry.colorTitle': '{color} - click for the next free color',
      'entry.colorLabel': '{label} color {color}. Click for the next free color.',
      'entry.remove': 'Remove',
      'entry.removeLabel': 'Remove {label}',
      'entry.tooMany.players': 'Players mode allows at most {limit} players. Remove {extra} to continue.',
      'entry.tooMany.teams': 'Teams mode allows at most {limit} teams. Remove {extra} to continue.',
      'entry.required': 'Name is required',
      'entry.unique': 'Names must be unique',
      'color.red': 'Red',
      'color.blue': 'Blue',
      'color.green': 'Green',
      'color.orange': 'Orange',
      'color.purple': 'Purple',
      'color.cyan': 'Cyan',
      'cat.legend': 'Select categories',
      'cat.legendMax': { one: 'Select up to {n} category', other: 'Select up to {n} categories' },
      'cat.loading': 'Loading categories...',
      'cat.none': 'No playable categories yet.',
      'cat.surprise': 'Surprise me!',
      'cat.surpriseHint': 'Tick alone for {n} random categories, or add it to your picks for 1 mystery category.',
      // The built-in Kilo Meshakkal column (US-53) has no DB row; the other categories' Arabic names
      // come from the database (categories.name_ar).
      'cat.mixName': 'Kilo Meshakkal',
      'cat.notEnoughStart': 'No playable categories — add questions in ',
      'cat.notEnoughEnd': '. A category is playable when it has a question for every enabled point value.',
      'cat.count': '{k} of up to {n} selected. Columns follow the order you tick them.',
      'cat.countNoMax': '{k} selected.',
      'cat.atLeast': 'Select at least 1 category.',
      'cat.tooMany': { one: 'Select up to {n} category ({k} selected).', other: 'Select up to {n} categories ({k} selected).' },
      'cat.allPicked': 'Every playable category is already picked — untick one, or untick Surprise me!',
      'timer.legend': 'Timer',
      'timer.label': 'Seconds per question (this game only)',
      'timer.invalid': 'Timer must be a whole number of seconds between {min} and {max}.',
      'readAloud.label': 'Read questions automatically',
      'readAloud.hint': 'On this device, when a question opens. The 🔊 button on a question reads it any time.',
      'played.legend': 'Played questions',
      'played.bar': 'Questions played',
      'played.reset': 'Forget played questions',
      'played.count': { one: 'Played {n} question on this device.', other: 'Played {n} questions on this device.' },
      'played.lessThan1': 'Less than 1%',
      'played.percent': '{label} of the questions played on this device.',
      'played.confirm': 'Forget the played questions? Questions you have already seen can come up again.',
      'load.incomplete': 'The game settings are incomplete (categories per game is missing).',
      'load.failed': 'Could not load the game setup: {reason}',
      'load.openAdmin': 'Open Admin',
      'start.fix': 'The game cannot start yet. Please fix the errors above.',
      'start.failed': 'Could not start the game: {reason}',

      // Board and scoreboard
      'board.title': 'Game board',
      'board.scoreboard': 'Scoreboard',
      'board.end': 'End Game',
      'board.doneBtn': 'End Game and show results',
      'board.contestants.players': { one: '{n} player', other: '{n} players' },
      'board.contestants.teams': { one: '{n} team', other: '{n} teams' },
      'board.size': '{cols} × {rows} board',
      'board.played': 'Played {used} of {total}',
      'board.timer': 'Timer {s} s',
      'board.corrections': 'Corrections {step}',
      'board.surpriseCat': 'Surprise category',
      'board.allPlayed': 'All {n} questions have been played.',
      'board.endConfirm': {
        one: 'End the game now? {n} question has not been played and will be ignored.',
        other: 'End the game now? {n} questions have not been played and will be ignored.',
      },
      'cell.label': '{cat}, {points} points',
      'cell.mix': '{name}, mystery value',
      'cell.double': ', double score',
      'cell.swapped': ', swapped to {swap}',
      'cell.won': ', won by {name}',
      'cell.none': ', no correct answer',
      'score.minus': 'Subtract {step} points from {name}',
      'score.plus': 'Add {step} points to {name}',
      'helpers.left': 'Helpers left: {list}',
      'helpers.none': 'No helpers left',

      // Double score popup
      'double.title': '×2 Double score!',
      'double.ok': "Let's play",
      'double.text': 'A correct answer earns {win} instead of {normal}. A wrong answer costs the normal {loss}.',

      // Question screen
      'question.picture': 'Question picture',
      'question.choices': 'Choices',
      'question.double': '×{factor} Double score',
      'question.swappedFrom': 'Swapped from {cat}',
      'question.leaveMarked': 'Leave this question? It will be closed and cannot be opened again.',
      'question.leaveUnmarked': 'Leave this question? It will be closed without points and cannot be opened again.',
      'lang.showEnglish': 'Show question in English',
      'lang.showArabic': 'Show question in Arabic',
      'timer.secondsLeft': 'Seconds left',
      'timer.pause': 'Pause',
      'timer.resume': 'Resume',
      'timer.reset': 'Reset',
      'timer.up': "Time's up!",
      'answer.show': 'Show Answer',
      'answer.label': 'Answer',
      'scoring.title': 'Scoring',
      'scoring.hint': 'Each player or team can be scored once. Only one can be correct. Helpers, once per game before anyone is scored: ABC 3 choices, ⇄ swap, ½ skip for half the points.',
      'scoring.back': 'Back to Board',
      'score.correctBtn': '✓ Correct ({amount})',
      'score.wrongBtn': '✗ Wrong ({amount})',
      'score.correctLabel': 'Correct for {name}, plus {n} points',
      'score.doubleNote': ' (double score)',
      'score.wrongLabel': 'Wrong for {name}, minus {n} points',
      'score.markedCorrect': '{name} marked correct',
      'score.markedWrong': '{name} marked wrong',
      'speak.label': 'Read the question aloud',
      'speak.stop': 'Stop reading',
      'report.button': 'Report',
      'report.buttonLabel': 'Report a problem with this question',

      // Helpers (US-32)
      'helper.choices': '3 choices',
      'helper.swap': 'Swap',
      'helper.skip': 'Skip',
      'helper.chipLabel': '{helper} for {name}',
      'helper.chipLabelReason': '{helper} for {name} ({reason})',
      'helper.off': 'helpers are turned off',
      'helper.loading': 'loading a new question',
      'helper.waitSwap': 'wait for the swap',
      'helper.used': 'already used in this game',
      'helper.afterAnswer': 'not after the answer is shown',
      'helper.afterScore': 'not after someone was scored',
      'helper.onlyBy': 'only {name} can use helpers on this question',
      'helper.noChoices': 'this question has no choices yet',
      'helper.ask': 'Use {helper} for {name}? ',
      'helper.askSkip': '{name} loses {half} points (half of {points}) and the question closes for everyone.',
      'helper.askSwap': 'A random question from any category replaces this one, with a new timer.',
      'helper.askChoices': 'The answer is shown among 3 choices.',
      'helper.askOnly': ' Only {name} can answer this question then.',
      'swap.failed': 'Could not swap the question: {reason} The helper was not used.',
      'swap.answerShown': 'The answer was shown meanwhile, so the Swap was not used.',

      // Results and sharing
      'results.title': 'Results',
      'results.wins': '{name} wins!',
      'results.tie': "It's a tie between {names}",
      'results.winner': 'Winner',
      'share.unavailable': 'Sharing is not available right now.',
      'share.failed': 'Could not share the result.',
      'share.copied': 'Copied',
      'share.copyFailed': 'Could not copy. Your browser blocked it.',
      'share.won': '{name} won Mokh Rush with {score}!',
      'share.tie': "It's a tie between {names} in Mokh Rush with {score} each!",

      // Streak Challenge (US-33) and its leaderboard (US-34, US-45)
      'streak.openBtn': 'Sudden Death Streak',
      'streak.solo': '(solo)',
      'streak.legend': 'Streak Challenge',
      'streak.setupHint': "Questions come from every category. Pick 1 of 3 answers before the time runs out: one wrong answer or time's up ends the run. Your streak goes on the shared leaderboard with your name.",
      'streak.nameLabel': 'Challenger name',
      'streak.cancel': 'Back to a normal game',
      'streak.leaderboard': 'Streak leaderboard',
      'streak.start': 'Start Streak Challenge',
      'streak.nameRequired': 'Challenger name is required',
      'streak.nameTooLong': 'Challenger name must be at most {max} characters',
      'streak.fix': 'The Streak Challenge cannot start yet. Please fix the errors above.',
      'streak.failed': 'Could not start the Streak Challenge: {reason}',
      'streak.count': 'Streak',
      'streak.hint': 'Pick the right answer before the time runs out. One wrong answer ends the run.',
      'streak.correct': 'Correct! Your streak is {n}.',
      'streak.nextFailed': 'Could not load the next question: {reason} Try Next again.',
      'streak.end': 'End run',
      'streak.endConfirm': 'End the run now? Your streak of {n} is saved to the leaderboard.',
      'streak.endConfirmNone': 'End the run now? You have no streak yet, so nothing is saved.',
      'run.next': 'Next question',
      'run.seeResults': 'See results',
      'run.wrong': 'Wrong!',
      'run.rightWas': ' The right answer was {letter}, ',
      'choice.right': ', the right answer',
      'choice.yours': ', your answer',
      'lb.period': 'Leaderboard period',
      'lb.week': 'This week',
      'lb.all': 'All time',
      'lb.topAll': 'Top 10 streaks of all time',
      'lb.topWeek': 'Top 10 streaks this week',
      'lb.again': 'Play again',
      'lb.loading': 'Loading the leaderboard...',
      'lb.headline': '{name}: {n} in a row!',
      'lb.noStreak': 'No streak this time',
      'lb.saving': 'Saving your streak...',
      'lb.best': 'Your best is still {best}. ',
      'lb.rankWeek': 'You are #{week} this week and #{rank} of all time.',
      'lb.rank': 'You are #{rank} of all time.',
      'lb.saveFailed': 'Your streak could not be saved: {reason} ',
      'lb.onlyOne': 'Only streaks of 1 or more go on the leaderboard.',
      'lb.emptyWeek': 'No streaks this week yet. Be the first!',
      'lb.empty': 'No streaks yet. Be the first!',
      'lb.failed': 'Could not load the leaderboard: {reason}',
      'lb.questions': { one: '{n} question', other: '{n} questions' },
      'lb.unsaved': 'Your streak of {n} was not saved. Leave it unsaved?',
      'lb.againFailed': 'Could not start a new run: {reason}',
      'ad.label': 'Advertisement',

      // Integration Quiz (integration-quiz.html): English only, the page has no Arabic
      'iq.title': 'Integration Quiz',
      'iq.setupHint': "Questions on software integration and APIs. Pick 1 of 3 answers before the time runs out: one wrong answer or time's up ends the run. Your streak goes on the Integration Quiz leaderboard with your name.",
      'iq.leaderboard': 'Integration Quiz leaderboard',
      'iq.start': 'Start the quiz',
      'iq.question': 'Question {n}',
      'iq.fix': 'The quiz cannot start yet. Please fix the errors above.',
      'iq.failed': 'Could not start the Integration Quiz: {reason}',

      // Daily Challenge (US-43)
      'daily.name': 'Daily Challenge',
      'daily.number': 'Daily Challenge #{n}',
      'daily.question': 'Question',
      'daily.hint': {
        one: "Today's {n} question is the same for everyone. A wrong answer or time's up scores 0.",
        other: "Today's {n} questions are the same for everyone. A wrong answer or time's up scores 0.",
      },
      'daily.correct': 'Correct!',
      'daily.seeResult': 'See result',
      'daily.fix': 'The Daily Challenge cannot start yet. Please fix the errors above.',
      'daily.failed': 'Could not open the Daily Challenge: {reason}',
      'daily.leave': "Leave today's Daily Challenge? The questions you haven't answered score 0, and you can play it only once today.",
      'daily.score': 'Mokh Rush Daily #{n}: {right}/{total}',
      'daily.squareRight': 'Question {n} right',
      'daily.squareWrong': 'Question {n} wrong',
      'daily.perfect': 'Perfect! ',
      'daily.note': 'Everyone gets the same questions today. Share your result and compare with your friends.',
      'daily.next': 'Next Daily Challenge in {time}',
      'daily.ready': 'A new Daily Challenge is ready!',
      'daily.playNew': 'Play the new challenge',
      'daily.newFailed': 'Could not load the new Daily Challenge: {reason}',

      // Golden Goal, the final round (US-44, D-48, D-50, D-51)
      'final.name': 'Golden Goal',
      'final.round': ' – round {n}',
      'final.tieBefore': "It's a tie! ",
      'final.tieAfter': '?',
      'final.stillBefore': 'Still tied! ',
      'final.stillAfter': ' again?',
      'final.lead1': '{names} are tied for first on {score}. One more question decides it: everyone bets, get it right and win your bet, get it wrong and lose it.',
      'final.lead2': '{names} are still level on {score}. Round {n} brings a new question, and everyone bets again from their current score.',
      'final.rule.players': 'Each player can bet from 0 up to their score or {max}, whichever is higher. You see the category before you bet.',
      'final.rule.teams': 'Each team can bet from 0 up to their score or {max}, whichever is higher. You see the category before you bet.',
      'final.play': 'Go for goal',
      'final.skip': 'Skip to results',
      'final.category': 'Category',
      'final.bets': 'Bets',
      'final.show': 'Show',
      'final.lock': 'Lock in bet',
      'final.allIn': 'All bets are in!',
      'final.open': 'Show the question',
      'final.betLocked': '✓ Bet locked',
      'final.yourTurn': 'Your turn',
      'final.waiting': 'Waiting',
      'final.scoreLabel': 'score ',
      'final.ask': "{name}, what's your bet?",
      'final.betHint': 'Your bet (up to {limit}). Everyone else, look away!',
      'final.betError': 'Enter a whole number from 0 to {limit}.',
      'final.loadFailed': 'Could not load the question: {reason} Try again, or skip to the results.',
      'final.hint.players': 'Every player answers, for example on paper. Correct wins their bet, Wrong loses it. Mark each one once.',
      'final.hint.teams': 'Every team answers, for example on paper. Correct wins their bet, Wrong loses it. Mark each one once.',
      'final.nextRound': 'Next round',
      'final.correctBtn': '✓ Correct',
      'final.wrongBtn': '✗ Wrong',
      'final.correctLabel': 'Correct for {name}, plus their bet',
      'final.wrongLabel': 'Wrong for {name}, minus their bet',
      'final.statusCorrect': '{name} marked correct, bet {bet}, score {score}',
      'final.statusWrong': '{name} marked wrong, bet {bet}, score {score}',
      'final.leave.players': 'Stop Golden Goal and show the results? Players not marked yet keep their score.',
      'final.leave.teams': 'Stop Golden Goal and show the results? Teams not marked yet keep their score.',
      'final.leaveTied': 'Stop Golden Goal and show the results? The tie stands.',
      'final.backConfirm': 'Stop Golden Goal and show the results? The bets of this round are dropped and no score changes.',

      // Report a question (US-42)
      'report.title': 'Report this question',
      'report.legend': 'What is wrong?',
      'report.reason.wrong_answer': 'Wrong answer',
      'report.reason.typo': 'Typo',
      'report.reason.translation': 'Translation',
      'report.reason.outdated': 'Outdated',
      'report.reason.picture': 'Picture problem',
      'report.reason.other': 'Other',
      'report.note': 'Note (optional)',
      'report.privacy': 'Only the question, the reason, your note and the time are saved: no name.',
      'report.send': 'Send report',
      'report.sending': 'Sending...',
      'report.cancel': 'Cancel',
      'report.thanks': 'Thank you! Your report was sent to the admin.',
      'report.close': 'Close',
      'report.chooseReason': 'Choose what is wrong with the question.',
      'report.noteTooLong': 'The note can be at most {max} characters.',
      'report.failed': 'The report could not be sent: {reason}',
    },

    // Arabic (Modern Standard Arabic), AI-drafted: to be reviewed by an Arabic speaker
    // (docs/sprints/sprint-13-dev.md lists every string). Numbers stay in Western digits.
    ar: {
      'app.name': 'مخ رش',
      'nav.howToPlay': 'طريقة اللعب',
      'nav.terms': 'الشروط',
      'nav.privacy': 'الخصوصية',
      'nav.admin': 'الإدارة',
      'nav.about': 'عن اللعبة',
      'nav.contact': 'تواصل معنا',
      'nav.site': 'روابط الموقع',
      'lang.group': 'اللغة',
      'maintenance.text': 'وكلاء الذكاء الاصطناعي المساكين يسهرون الليلة لتجهيز الميزات الرائعة التي طلبتموها. ستعود اللعبة متاحة خلال 24 ساعة.',

      'common.loading': 'جارٍ التحميل...',
      'common.tryAgain': 'حاول مرة أخرى',
      'common.newGame': 'لعبة جديدة',
      'common.share': 'مشاركة',
      'common.back': 'رجوع',
      'list.sep': '، ',
      'list.and': ' و',
      'date.months': 'يناير,فبراير,مارس,أبريل,مايو,يونيو,يوليو,أغسطس,سبتمبر,أكتوبر,نوفمبر,ديسمبر',
      'date.format': '{d} {m} {y}',

      'err.generic': 'حدث خطأ ما.',
      'err.network': 'تعذّر الوصول إلى الخادم. تأكد من أنه يعمل.',
      'err.http': 'فشل الطلب (HTTP {status}).',
      'err.response': 'أرسل الخادم ردًا غير متوقع.',
      'err.board': 'أرسل الخادم لوحة غير متوقعة.',
      'err.question': 'أرسل الخادم سؤالًا غير متوقع.',
      'err.questions': 'أرسل الخادم أسئلة غير متوقعة.',
      'err.leaderboard': 'أرسل الخادم لوحة صدارة غير متوقعة.',
      'err.daily': 'أرسل الخادم تحديًا يوميًا غير متوقع.',
      'err.noQuestions': 'لا توجد أسئلة للعب بعد.',

      'setup.title': 'لعبة جديدة',
      'setup.intro': 'لعبة مسابقات ثقافية مجانية على طريقة Jeopardy للحفلات والفصول الدراسية والسهرات العائلية: أسئلة بالعربية والإنجليزية، ولاعبون أو فرق أمام شاشة واحدة مشتركة.',
      'setup.who': 'من سيلعب؟',
      'setup.playMode': 'نوع اللعب',
      'setup.colorHint': 'اضغط على دائرة اللون للانتقال إلى اللون المتاح التالي.',
      'setup.start': 'ابدأ اللعبة',
      'setup.starting': 'جارٍ البدء...',
      'mode.players': 'لاعبون',
      'mode.teams': 'فرق',
      'mode.limit': '(حتى {n})',
      'entry.add.players': 'إضافة لاعب',
      'entry.add.teams': 'إضافة فريق',
      'entry.label.players': 'اللاعب {n}',
      'entry.label.teams': 'الفريق {n}',
      'entry.placeholder': 'اسم {label}',
      'entry.colorTitle': '{color}: اضغط للون المتاح التالي',
      'entry.colorLabel': 'لون {label}: {color}. اضغط للون المتاح التالي.',
      'entry.remove': 'حذف',
      'entry.removeLabel': 'حذف {label}',
      'entry.tooMany.players': 'الحد الأقصى في وضع اللاعبين هو {limit}. احذف {extra} للمتابعة.',
      'entry.tooMany.teams': 'الحد الأقصى في وضع الفرق هو {limit}. احذف {extra} للمتابعة.',
      'entry.required': 'الاسم مطلوب',
      'entry.unique': 'يجب ألا تتكرر الأسماء',
      'color.red': 'أحمر',
      'color.blue': 'أزرق',
      'color.green': 'أخضر',
      'color.orange': 'برتقالي',
      'color.purple': 'بنفسجي',
      'color.cyan': 'سماوي',
      'cat.legend': 'اختر الفئات',
      'cat.legendMax': {
        one: 'اختر فئة واحدة', two: 'اختر حتى فئتين', few: 'اختر حتى {n} فئات', many: 'اختر حتى {n} فئة', other: 'اختر حتى {n} فئة',
      },
      'cat.loading': 'جارٍ تحميل الفئات...',
      'cat.none': 'لا توجد فئات قابلة للعب بعد.',
      'cat.surprise': 'فاجئني!',
      'cat.surpriseHint': 'اخترها وحدها لتحصل على فئات عشوائية عددها {n}، أو أضفها إلى اختياراتك لتحصل على فئة غامضة واحدة.',
      'cat.mixName': 'كيلو مشكّل',
      'cat.notEnoughStart': 'لا توجد فئات قابلة للعب — أضف أسئلة من صفحة ',
      'cat.notEnoughEnd': '. تكون الفئة قابلة للعب عندما يكون فيها سؤال لكل قيمة نقاط مفعّلة.',
      'cat.count': 'اخترت {k} من {n} كحد أقصى. ترتيب الأعمدة يتبع ترتيب اختيارك.',
      'cat.countNoMax': 'اخترت {k}.',
      'cat.atLeast': 'اختر فئة واحدة على الأقل.',
      'cat.tooMany': {
        one: 'اختر فئة واحدة فقط (اخترت {k}).', two: 'اختر حتى فئتين (اخترت {k}).', few: 'اختر حتى {n} فئات (اخترت {k}).',
        many: 'اختر حتى {n} فئة (اخترت {k}).', other: 'اختر حتى {n} فئة (اخترت {k}).',
      },
      'cat.allPicked': 'كل الفئات القابلة للعب مختارة بالفعل — ألغِ اختيار إحداها، أو ألغِ اختيار «فاجئني!»',
      'timer.legend': 'المؤقت',
      'timer.label': 'عدد الثواني لكل سؤال (لهذه اللعبة فقط)',
      'timer.invalid': 'يجب أن يكون المؤقت عددًا صحيحًا من الثواني بين {min} و{max}.',
      'readAloud.label': 'قراءة الأسئلة تلقائيًا',
      'readAloud.hint': 'على هذا الجهاز، عند فتح السؤال. وزر 🔊 في السؤال يقرؤه في أي وقت.',
      'played.legend': 'الأسئلة الملعوبة',
      'played.bar': 'الأسئلة الملعوبة',
      'played.reset': 'مسح سجل الأسئلة الملعوبة',
      'played.count': {
        zero: 'لم يُلعب أي سؤال على هذا الجهاز بعد.', one: 'لُعب سؤال واحد على هذا الجهاز.', two: 'لُعب سؤالان على هذا الجهاز.',
        few: 'لُعبت {n} أسئلة على هذا الجهاز.', many: 'لُعب {n} سؤالًا على هذا الجهاز.', other: 'لُعب {n} سؤال على هذا الجهاز.',
      },
      'played.lessThan1': 'أقل من 1%',
      'played.percent': 'لُعب {label} من الأسئلة على هذا الجهاز.',
      'played.confirm': 'مسح سجل الأسئلة الملعوبة؟ قد تظهر مرة أخرى أسئلة رأيتها من قبل.',
      'load.incomplete': 'إعدادات اللعبة غير مكتملة (عدد الفئات لكل لعبة غير محدد).',
      'load.failed': 'تعذّر تحميل إعداد اللعبة: {reason}',
      'load.openAdmin': 'افتح صفحة الإدارة',
      'start.fix': 'لا يمكن بدء اللعبة بعد. يُرجى تصحيح الأخطاء أعلاه.',
      'start.failed': 'تعذّر بدء اللعبة: {reason}',

      'board.title': 'لوحة اللعب',
      'board.scoreboard': 'لوحة النتائج',
      'board.end': 'إنهاء اللعبة',
      'board.doneBtn': 'إنهاء اللعبة وعرض النتائج',
      'board.contestants.players': { one: 'لاعب واحد', two: 'لاعبان', few: '{n} لاعبين', many: '{n} لاعبًا', other: '{n} لاعب' },
      'board.contestants.teams': { one: 'فريق واحد', two: 'فريقان', few: '{n} فرق', many: '{n} فريقًا', other: '{n} فريق' },
      'board.size': 'لوحة {cols} × {rows}',
      'board.played': 'لُعب {used} من {total}',
      'board.timer': 'المؤقت {s} ث',
      'board.corrections': 'التصحيح {step}',
      'board.surpriseCat': 'فئة مفاجئة',
      'board.allPlayed': 'لُعبت كل الأسئلة ({n}).',
      'board.endConfirm': {
        one: 'إنهاء اللعبة الآن؟ سؤال واحد لم يُلعب وسيُتجاهل.',
        two: 'إنهاء اللعبة الآن؟ سؤالان لم يُلعبا وسيُتجاهلان.',
        few: 'إنهاء اللعبة الآن؟ {n} أسئلة لم تُلعب وستُتجاهل.',
        many: 'إنهاء اللعبة الآن؟ {n} سؤالًا لم تُلعب وستُتجاهل.',
        other: 'إنهاء اللعبة الآن؟ {n} سؤال لم تُلعب وستُتجاهل.',
      },
      'cell.label': '{cat}، {points} نقطة',
      'cell.mix': '{name}، قيمة غامضة',
      'cell.double': '، نقاط مضاعفة',
      'cell.swapped': '، استُبدل بسؤال {swap}',
      'cell.won': '، فاز به {name}',
      'cell.none': '، لا إجابة صحيحة',
      'score.minus': 'اخصم {step} من {name}',
      'score.plus': 'أضف {step} إلى {name}',
      'helpers.left': 'المساعدات المتبقية: {list}',
      'helpers.none': 'لا مساعدات متبقية',

      'double.title': '×2 نقاط مضاعفة!',
      'double.ok': 'هيا نلعب',
      'double.text': 'الإجابة الصحيحة تكسب {win} بدلًا من {normal}. والإجابة الخاطئة تخصم {loss} كالمعتاد.',

      'question.picture': 'صورة السؤال',
      'question.choices': 'الخيارات',
      'question.double': '×{factor} نقاط مضاعفة',
      'question.swappedFrom': 'بدلًا من {cat}',
      'question.leaveMarked': 'مغادرة هذا السؤال؟ سيُغلق ولا يمكن فتحه مرة أخرى.',
      'question.leaveUnmarked': 'مغادرة هذا السؤال؟ سيُغلق دون نقاط ولا يمكن فتحه مرة أخرى.',
      'lang.showEnglish': 'اعرض السؤال بالإنجليزية',
      'lang.showArabic': 'اعرض السؤال بالعربية',
      'timer.secondsLeft': 'الثواني المتبقية',
      'timer.pause': 'إيقاف مؤقت',
      'timer.resume': 'استئناف',
      'timer.reset': 'إعادة ضبط',
      'timer.up': 'انتهى الوقت!',
      'answer.show': 'اعرض الإجابة',
      'answer.label': 'الإجابة',
      'scoring.title': 'احتساب النقاط',
      'scoring.hint': 'تُحتسب إجابة كل لاعب أو فريق مرة واحدة، ولا تصح إلا إجابة واحدة. المساعدات، مرة واحدة في كل لعبة وقبل احتساب أي إجابة: ABC ثلاثة خيارات، ⇄ تبديل، ½ تخطّي بنصف النقاط.',
      'scoring.back': 'العودة إلى اللوحة',
      'score.correctBtn': '✓ صحيح ({amount})',
      'score.wrongBtn': '✗ خطأ ({amount})',
      'score.correctLabel': 'صحيح لـ{name}، زائد {n} نقطة',
      'score.doubleNote': ' (نقاط مضاعفة)',
      'score.wrongLabel': 'خطأ لـ{name}، ناقص {n} نقطة',
      'score.markedCorrect': 'احتُسبت إجابة {name} صحيحة',
      'score.markedWrong': 'احتُسبت إجابة {name} خاطئة',
      'speak.label': 'اقرأ السؤال بصوت عالٍ',
      'speak.stop': 'أوقف القراءة',
      'report.button': 'إبلاغ',
      'report.buttonLabel': 'الإبلاغ عن مشكلة في هذا السؤال',

      'helper.choices': 'ثلاثة خيارات',
      'helper.swap': 'تبديل',
      'helper.skip': 'تخطّي',
      'helper.chipLabel': '{helper} لـ{name}',
      'helper.chipLabelReason': '{helper} لـ{name} ({reason})',
      'helper.off': 'المساعدات متوقفة',
      'helper.loading': 'جارٍ تحميل سؤال جديد',
      'helper.waitSwap': 'انتظر انتهاء التبديل',
      'helper.used': 'استُخدمت في هذه اللعبة',
      'helper.afterAnswer': 'غير متاحة بعد عرض الإجابة',
      'helper.afterScore': 'غير متاحة بعد احتساب أي إجابة',
      'helper.onlyBy': 'وحده {name} يمكنه استخدام المساعدات في هذا السؤال',
      'helper.noChoices': 'لا خيارات لهذا السؤال بعد',
      'helper.ask': 'هل تستخدم مساعدة «{helper}» لـ{name}؟ ',
      'helper.askSkip': 'يخسر {name} {half} نقطة (نصف {points}) ويُغلق السؤال للجميع.',
      'helper.askSwap': 'يحل محل هذا السؤال سؤال عشوائي من أي فئة، بمؤقت جديد.',
      'helper.askChoices': 'تظهر الإجابة بين 3 خيارات.',
      'helper.askOnly': ' بعدها يجيب {name} وحده عن هذا السؤال.',
      'swap.failed': 'تعذّر تبديل السؤال: {reason} لم تُستخدم المساعدة.',
      'swap.answerShown': 'عُرضت الإجابة في الأثناء، لذلك لم يُستخدم التبديل.',

      'results.title': 'النتائج',
      'results.wins': 'الفوز لـ{name}!',
      'results.tie': 'تعادل بين {names}',
      'results.winner': 'الفائز',
      'share.unavailable': 'المشاركة غير متاحة الآن.',
      'share.failed': 'تعذّرت مشاركة النتيجة.',
      'share.copied': 'تم النسخ',
      'share.copyFailed': 'تعذّر النسخ. منعه المتصفح.',
      'share.won': 'فاز {name} في مخ رش بنتيجة {score}!',
      'share.tie': 'تعادل في مخ رش بين {names} بنتيجة {score} لكلٍّ منهم!',

      'streak.openBtn': 'سلسلة الموت المفاجئ',
      'streak.solo': '(فردي)',
      'streak.legend': 'تحدي السلسلة',
      'streak.setupHint': 'الأسئلة من كل الفئات. اختر إجابة من 3 قبل انتهاء الوقت: إجابة خاطئة واحدة أو انتهاء الوقت يُنهي الجولة. تُسجَّل سلسلتك باسمك في لوحة الصدارة المشتركة.',
      'streak.nameLabel': 'اسم المتحدّي',
      'streak.cancel': 'العودة إلى لعبة عادية',
      'streak.leaderboard': 'لوحة صدارة السلاسل',
      'streak.start': 'ابدأ تحدي السلسلة',
      'streak.nameRequired': 'اسم المتحدّي مطلوب',
      'streak.nameTooLong': 'يجب ألا يتجاوز عدد أحرف اسم المتحدّي {max}',
      'streak.fix': 'لا يمكن بدء تحدي السلسلة بعد. يُرجى تصحيح الأخطاء أعلاه.',
      'streak.failed': 'تعذّر بدء تحدي السلسلة: {reason}',
      'streak.count': 'السلسلة',
      'streak.hint': 'اختر الإجابة الصحيحة قبل انتهاء الوقت. إجابة خاطئة واحدة تُنهي الجولة.',
      'streak.correct': 'صحيح! سلسلتك الآن {n}.',
      'streak.nextFailed': 'تعذّر تحميل السؤال التالي: {reason} اضغط «السؤال التالي» مرة أخرى.',
      'streak.end': 'إنهاء الجولة',
      'streak.endConfirm': 'إنهاء الجولة الآن؟ ستُحفظ سلسلتك ({n}) في لوحة الصدارة.',
      'streak.endConfirmNone': 'إنهاء الجولة الآن؟ ليست لديك سلسلة بعد، لذلك لن يُحفظ شيء.',
      'run.next': 'السؤال التالي',
      'run.seeResults': 'عرض النتائج',
      'run.wrong': 'خطأ!',
      'run.rightWas': ' الإجابة الصحيحة كانت {letter}، ',
      'choice.right': '، الإجابة الصحيحة',
      'choice.yours': '، إجابتك',
      'lb.period': 'فترة لوحة الصدارة',
      'lb.week': 'هذا الأسبوع',
      'lb.all': 'كل الأوقات',
      'lb.topAll': 'أفضل 10 سلاسل على الإطلاق',
      'lb.topWeek': 'أفضل 10 سلاسل هذا الأسبوع',
      'lb.again': 'العب مرة أخرى',
      'lb.loading': 'جارٍ تحميل لوحة الصدارة...',
      'lb.headline': '{name}: {n} على التوالي!',
      'lb.noStreak': 'لا سلسلة هذه المرة',
      'lb.saving': 'جارٍ حفظ سلسلتك...',
      'lb.best': 'أفضل نتيجة لك ما زالت {best}. ',
      'lb.rankWeek': 'ترتيبك #{week} هذا الأسبوع و#{rank} على الإطلاق.',
      'lb.rank': 'ترتيبك #{rank} على الإطلاق.',
      'lb.saveFailed': 'تعذّر حفظ سلسلتك: {reason} ',
      'lb.onlyOne': 'لا تدخل لوحة الصدارة إلا السلاسل من 1 فأكثر.',
      'lb.emptyWeek': 'لا توجد سلاسل هذا الأسبوع بعد. كن أول من يسجّل!',
      'lb.empty': 'لا توجد سلاسل بعد. كن أول من يسجّل!',
      'lb.failed': 'تعذّر تحميل لوحة الصدارة: {reason}',
      'lb.questions': { one: 'سؤال واحد', two: 'سؤالان', few: '{n} أسئلة', many: '{n} سؤالًا', other: '{n} سؤال' },
      'lb.unsaved': 'لم تُحفظ سلسلتك ({n}). هل تغادر دون حفظها؟',
      'lb.againFailed': 'تعذّر بدء جولة جديدة: {reason}',
      'ad.label': 'إعلان',

      'daily.name': 'التحدي اليومي',
      'daily.number': 'التحدي اليومي #{n}',
      'daily.question': 'السؤال',
      'daily.hint': {
        one: 'سؤال اليوم هو نفسه للجميع. الإجابة الخاطئة أو انتهاء الوقت تُحتسب 0.',
        other: 'أسئلة اليوم ({n}) هي نفسها للجميع. الإجابة الخاطئة أو انتهاء الوقت تُحتسب 0.',
      },
      'daily.correct': 'صحيح!',
      'daily.seeResult': 'عرض النتيجة',
      'daily.fix': 'لا يمكن بدء التحدي اليومي بعد. يُرجى تصحيح الأخطاء أعلاه.',
      'daily.failed': 'تعذّر فتح التحدي اليومي: {reason}',
      'daily.leave': 'مغادرة التحدي اليومي؟ الأسئلة التي لم تُجب عنها تُحتسب 0، ولا يمكنك لعبه إلا مرة واحدة اليوم.',
      'daily.score': 'تحدي مخ رش اليومي #{n}: {right}/{total}',
      'daily.squareRight': 'السؤال {n} صحيح',
      'daily.squareWrong': 'السؤال {n} خطأ',
      'daily.perfect': 'نتيجة كاملة! ',
      'daily.note': 'الجميع يحصلون اليوم على الأسئلة نفسها. شارك نتيجتك وقارنها بنتائج أصدقائك.',
      'daily.next': 'التحدي اليومي التالي بعد {time}',
      'daily.ready': 'تحدٍّ يومي جديد جاهز!',
      'daily.playNew': 'العب التحدي الجديد',
      'daily.newFailed': 'تعذّر تحميل التحدي اليومي الجديد: {reason}',

      'final.name': 'الهدف الذهبي',
      'final.round': ' – الجولة {n}',
      'final.tieBefore': 'تعادل! ',
      'final.tieAfter': '؟',
      'final.stillBefore': 'ما زال التعادل قائمًا! ',
      'final.stillAfter': ' مرة أخرى؟',
      'final.lead1': 'التعادل في الصدارة بين {names} برصيد {score}. سؤال واحد إضافي يحسم الأمر: الجميع يراهنون، من يُصِب يربح رهانه ومن يُخطئ يخسره.',
      'final.lead2': 'ما زال التعادل قائمًا بين {names} برصيد {score}. الجولة {n} تأتي بسؤال جديد، ويراهن الجميع من جديد من رصيدهم الحالي.',
      'final.rule.players': 'يمكن لكل لاعب أن يراهن من 0 حتى رصيده أو {max}، أيهما أعلى. تظهر الفئة قبل الرهان.',
      'final.rule.teams': 'يمكن لكل فريق أن يراهن من 0 حتى رصيده أو {max}، أيهما أعلى. تظهر الفئة قبل الرهان.',
      'final.play': 'سدِّد نحو الهدف',
      'final.skip': 'تخطَّ إلى النتائج',
      'final.category': 'الفئة',
      'final.bets': 'الرهانات',
      'final.show': 'إظهار',
      'final.lock': 'ثبِّت الرهان',
      'final.allIn': 'اكتملت كل الرهانات!',
      'final.open': 'اعرض السؤال',
      'final.betLocked': '✓ تم تثبيت الرهان',
      'final.yourTurn': 'دورك',
      'final.waiting': 'في الانتظار',
      'final.scoreLabel': 'الرصيد ',
      'final.ask': '{name}، كم رهانك؟',
      'final.betHint': 'رهانك (حتى {limit}). وعلى الباقين ألا ينظروا!',
      'final.betError': 'أدخل عددًا صحيحًا من 0 إلى {limit}.',
      'final.loadFailed': 'تعذّر تحميل السؤال: {reason} حاول مرة أخرى، أو تخطَّ إلى النتائج.',
      'final.hint.players': 'يجيب كل لاعب، على ورقة مثلًا. «صحيح» يربح رهانه و«خطأ» يخسره. احتسب لكل واحد مرة واحدة.',
      'final.hint.teams': 'يجيب كل فريق، على ورقة مثلًا. «صحيح» يربح رهانه و«خطأ» يخسره. احتسب لكل فريق مرة واحدة.',
      'final.nextRound': 'الجولة التالية',
      'final.correctBtn': '✓ صحيح',
      'final.wrongBtn': '✗ خطأ',
      'final.correctLabel': 'صحيح لـ{name}، يربح رهانه',
      'final.wrongLabel': 'خطأ لـ{name}، يخسر رهانه',
      'final.statusCorrect': 'احتُسبت إجابة {name} صحيحة، الرهان {bet}، الرصيد {score}',
      'final.statusWrong': 'احتُسبت إجابة {name} خاطئة، الرهان {bet}، الرصيد {score}',
      'final.leave.players': 'إيقاف الهدف الذهبي وعرض النتائج؟ اللاعبون الذين لم تُحتسب إجاباتهم يحتفظون برصيدهم.',
      'final.leave.teams': 'إيقاف الهدف الذهبي وعرض النتائج؟ الفرق التي لم تُحتسب إجاباتها تحتفظ برصيدها.',
      'final.leaveTied': 'إيقاف الهدف الذهبي وعرض النتائج؟ يبقى التعادل قائمًا.',
      'final.backConfirm': 'إيقاف الهدف الذهبي وعرض النتائج؟ تُلغى رهانات هذه الجولة ولا يتغير أي رصيد.',

      'report.title': 'الإبلاغ عن هذا السؤال',
      'report.legend': 'ما المشكلة؟',
      'report.reason.wrong_answer': 'الإجابة خاطئة',
      'report.reason.typo': 'خطأ إملائي',
      'report.reason.translation': 'الترجمة',
      'report.reason.outdated': 'معلومة قديمة',
      'report.reason.picture': 'مشكلة في الصورة',
      'report.reason.other': 'سبب آخر',
      'report.note': 'ملاحظة (اختيارية)',
      'report.privacy': 'يُحفظ السؤال والسبب وملاحظتك والوقت فقط، دون أي اسم.',
      'report.send': 'إرسال البلاغ',
      'report.sending': 'جارٍ الإرسال...',
      'report.cancel': 'إلغاء',
      'report.thanks': 'شكرًا لك! أُرسل بلاغك إلى المشرف.',
      'report.close': 'إغلاق',
      'report.chooseReason': 'اختر المشكلة في السؤال.',
      'report.noteTooLong': 'يجب ألا يتجاوز عدد أحرف الملاحظة {max}.',
      'report.failed': 'تعذّر إرسال البلاغ: {reason}',
    },
  };

  const pluralRules = {};
  const listeners = [];
  // <html data-fixed-lang="en">: this page always shows that language (null = the device's choice).
  const fixedAttr = document.documentElement.getAttribute('data-fixed-lang');
  const fixedLang = LANGS.indexOf(fixedAttr) === -1 ? null : fixedAttr;
  let lang = loadLang();

  function loadLang() {
    if (fixedLang) return fixedLang;
    try {
      const saved = window.localStorage.getItem(KEY);
      return LANGS.indexOf(saved) === -1 ? 'en' : saved;
    } catch (err) {
      return 'en'; // storage disabled: English
    }
  }

  function saveLang() {
    try {
      if (lang === 'en') window.localStorage.removeItem(KEY);
      else window.localStorage.setItem(KEY, lang);
    } catch (err) {
      // storage full or disabled: the choice lasts until the page is closed
    }
  }

  /** <html lang dir>: Arabic is right to left; English keeps the page as it was (no dir attribute). */
  function applyDocument() {
    const root = document.documentElement;
    root.lang = lang;
    if (lang === 'ar') root.dir = 'rtl';
    else root.removeAttribute('dir');
  }

  /** The table entry for `key`, Arabic first when Arabic is on, then English; with the language it came from. */
  function entry(key) {
    const own = STRINGS[lang][key];
    if (own !== undefined) return { value: own, lang: lang };
    return { value: STRINGS.en[key], lang: 'en' };
  }

  function fill(text, params) {
    if (typeof text !== 'string') return '';
    return text.replace(/\{(\w+)\}/g, (all, name) => (params && params[name] !== undefined ? String(params[name]) : all));
  }

  /** The text of `key` with {name} placeholders filled; an unknown key returns the key itself. */
  function t(key, params) {
    const found = entry(key);
    if (found.value === undefined) return key;
    const value = typeof found.value === 'object' ? found.value.other : found.value;
    return fill(value, params);
  }

  function pluralForm(language, count) {
    if (!pluralRules[language]) {
      try {
        pluralRules[language] = new Intl.PluralRules(language);
      } catch (err) {
        pluralRules[language] = { select: (n) => (n === 1 ? 'one' : 'other') };
      }
    }
    return pluralRules[language].select(count);
  }

  /** A plural text: the form for `count` in the language the entry came from ({n} = count). */
  function n(key, count, params) {
    const found = entry(key);
    if (found.value === undefined) return key;
    const forms = typeof found.value === 'object' ? found.value : { other: found.value };
    const form = forms[pluralForm(found.lang, count)] || forms.other;
    return fill(form, Object.assign({ n: count }, params));
  }

  /** A name, category or other data inside a sentence keeps its own direction (Arabic only). */
  function iso(text) {
    return lang === 'ar' ? FSI + text + PDI : String(text);
  }

  /** A number with a sign (-200, +400) reads left to right inside Arabic text (Arabic only). */
  function ltr(text) {
    return lang === 'ar' ? LRI + text + PDI : String(text);
  }

  /** Static texts of the page: data-i18n="key" sets the text, data-i18n-attr="attr:key;..." attributes. */
  function apply(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = t(node.getAttribute('data-i18n'));
    });
    scope.querySelectorAll('[data-i18n-attr]').forEach((node) => {
      node.getAttribute('data-i18n-attr').split(';').forEach((pair) => {
        const parts = pair.split(':');
        if (parts.length === 2) node.setAttribute(parts[0].trim(), t(parts[1].trim()));
      });
    });
  }

  /** Switch the interface language: saved on this device, the page's lang/dir set, listeners told. */
  function setLang(next) {
    if (LANGS.indexOf(next) === -1 || next === lang || fixedLang) return;
    lang = next;
    saveLang();
    applyDocument();
    listeners.forEach((fn) => fn(lang));
  }

  applyDocument();

  window.BrainRushI18n = {
    lang: () => lang,
    isArabic: () => lang === 'ar',
    setLang: setLang,
    onChange: (fn) => { listeners.push(fn); },
    t: t,
    n: n,
    iso: iso,
    ltr: ltr,
    apply: apply,
  };
})();
