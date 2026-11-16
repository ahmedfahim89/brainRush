// CHRISTMAS (US-55, D-66): Christmas theme for the game page (index.html only). Remove after Christmas.
// Loaded as the first element of <body>, so the last known state (saved on this device) is applied
// before the first paint and returning players see no flash of the normal theme. It then reads
// api/settings.php itself (game.js is not changed): christmas_theme 1 turns the theme on, anything
// else turns it off and clears the saved state. When on it adds body.theme-christmas (styles in
// css/christmas.css), sets <meta name="theme-color">, fills the greeting strip (#xmas-greeting) and
// adds a tree emoji by the header title and a snowfall layer, all decorative and aria-hidden.
// The admin greeting is rendered with textContent, never as HTML (US-27).
'use strict';

(function () {
  const STORE_KEY = 'brainrush.christmas';
  const THEME_CLASS = 'theme-christmas';
  const THEME_COLOR = '#0b2318'; // --bg of the theme in css/christmas.css
  const FLAKE_COUNT = 22;        // low density: css/christmas.css shows only 12 on phones
  const DEFAULT_GREETING = {
    en: 'Merry Christmas from Mokh Rush!',
    ar: 'عيد ميلاد مجيد من مخ رش!',
  };
  // Emojis are allowed in this theme (D-66); all of them are decorative
  const TREE = '\u{1F384}';
  const SANTA = '\u{1F385}';
  const GIFT = '\u{1F381}';
  const SNOWMAN = '⛄';
  const FLAKE = '❄';

  const body = document.body;
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const normalThemeColor = themeMeta ? themeMeta.getAttribute('content') : null;
  let added = [];        // elements this script added, removed when the theme goes off
  let customText = '';   // admin greeting; empty = the built-in one in the page language
  let languageHooked = false;

  function savedOn() {
    try {
      return window.localStorage.getItem(STORE_KEY) === '1';
    } catch (err) {
      return false; // storage blocked: wait for the settings call
    }
  }

  function save(on) {
    try {
      if (on) window.localStorage.setItem(STORE_KEY, '1');
      else window.localStorage.removeItem(STORE_KEY);
    } catch (err) {
      // storage blocked: the theme still follows the settings call on every visit
    }
  }

  function setThemeClass(on) {
    body.classList.toggle(THEME_CLASS, on);
    if (themeMeta && normalThemeColor !== null) {
      themeMeta.setAttribute('content', on ? THEME_COLOR : normalThemeColor);
    }
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function decorative(tag, className, text) {
    const node = el(tag, className, text);
    node.setAttribute('aria-hidden', 'true');
    return node;
  }

  function currentLang() {
    const i18n = window.BrainRushI18n;
    return i18n && i18n.lang() === 'ar' ? 'ar' : 'en';
  }

  /** Greeting strip: the admin text as plain text, or the built-in greeting in the page language. */
  function renderGreeting() {
    const strip = document.getElementById('xmas-greeting');
    if (!strip) return;
    while (strip.firstChild) strip.removeChild(strip.firstChild);
    const text = el('span', 'xmas-greeting-text', customText || DEFAULT_GREETING[currentLang()]);
    if (customText) text.setAttribute('dir', 'auto'); // the admin may write English or Arabic
    strip.appendChild(decorative('span', 'xmas-greeting-emoji', TREE + SANTA));
    strip.appendChild(text);
    strip.appendChild(decorative('span', 'xmas-greeting-emoji', GIFT + SNOWMAN));
    strip.hidden = false;
  }

  function hideGreeting() {
    const strip = document.getElementById('xmas-greeting');
    if (!strip) return;
    strip.hidden = true;
    while (strip.firstChild) strip.removeChild(strip.firstChild);
  }

  /** Snowfall layer: random position, size, speed and sway per flake, set as CSS variables. */
  function makeSnow() {
    const layer = decorative('div', 'xmas-snow');
    for (let i = 0; i < FLAKE_COUNT; i += 1) {
      const flake = el('span', 'xmas-flake', FLAKE);
      const style = flake.style;
      style.setProperty('--x', (Math.random() * 100).toFixed(1) + '%');
      style.setProperty('--size', (0.6 + Math.random() * 0.8).toFixed(2) + 'rem');
      style.setProperty('--alpha', (0.35 + Math.random() * 0.4).toFixed(2));
      style.setProperty('--dur', (11 + Math.random() * 10).toFixed(1) + 's');
      style.setProperty('--delay', (-Math.random() * 20).toFixed(1) + 's'); // already falling on load
      style.setProperty('--sway', Math.round(Math.random() * 60 - 30) + 'px');
      layer.appendChild(flake);
    }
    return layer;
  }

  function addDecorations() {
    if (added.length) return;
    const title = document.querySelector('.page-header h1');
    if (title) {
      const tree = decorative('span', 'xmas-title-emoji', TREE);
      title.appendChild(tree);
      added.push(tree);
    }
    const snow = makeSnow();
    body.insertBefore(snow, body.firstChild);
    added.push(snow);
  }

  function removeDecorations() {
    added.forEach((node) => {
      if (node.parentNode) node.parentNode.removeChild(node);
    });
    added = [];
  }

  function turnOn(text) {
    customText = text;
    setThemeClass(true);
    addDecorations();
    renderGreeting();
    if (!languageHooked && window.BrainRushI18n) {
      languageHooked = true;
      window.BrainRushI18n.onChange(() => {
        if (body.classList.contains(THEME_CLASS)) renderGreeting();
      });
    }
  }

  function turnOff() {
    setThemeClass(false);
    removeDecorations();
    hideGreeting();
  }

  function loadSettings() {
    return fetch('api/settings.php', { headers: { Accept: 'application/json' }, cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      });
  }

  const domReady = new Promise((resolve) => {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', resolve, { once: true });
    else resolve();
  });

  // Last known state first (no flash), then the server's answer decides
  if (savedOn()) setThemeClass(true);

  Promise.all([loadSettings().catch(() => null), domReady]).then((results) => {
    const settings = results[0];
    if (!settings || typeof settings !== 'object') {
      // Settings unreachable: keep the last known state, with the built-in greeting
      if (savedOn()) turnOn('');
      return;
    }
    const on = settings.christmas_theme === 1;
    save(on);
    if (on) {
      const text = typeof settings.christmas_banner_text === 'string' ? settings.christmas_banner_text.trim() : '';
      turnOn(text);
    } else {
      turnOff();
    }
  });
})();
