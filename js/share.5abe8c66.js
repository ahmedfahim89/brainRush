// BrainRush sharing (US-43, US-46): one module for the Daily Challenge result and the board game's
// final standings. share(text, status) adds the site link to the text, then opens the phone's share
// sheet when there is one (also in the Android app, US-40, which runs in Chrome), or copies the text
// to the clipboard and shows "Copied" in `status`. Desktop browsers copy too: a share sheet there
// (Windows, macOS) is rarely what a host at a laptop wants. The link is the page's canonical URL, so
// a shared result always points at the live site. Loaded before game.js, which calls
// window.BrainRushShare.share().
'use strict';

(function () {
  const STATUS_MS = 4000; // how long "Copied" stays visible
  // Interface language (US-49): js/i18n.js gives the status texts in English or Arabic; without it, English.
  const i18n = window.BrainRushI18n;
  const label = (key, english) => (i18n ? i18n.t(key) : english);

  /** The site link: the canonical URL of the page (D-42), else this page without query or hash. */
  function siteUrl() {
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && canonical.href) return canonical.href;
    return window.location.origin + window.location.pathname;
  }

  /** A phone or tablet with a share sheet: a touch screen (coarse pointer) and the Web Share API. */
  function hasShareSheet() {
    return typeof navigator.share === 'function' &&
      window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        // permission denied or not focused: try the older way below
      }
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (err) {
      copied = false;
    }
    area.remove();
    return copied;
  }

  const timers = new WeakMap(); // status node -> timeout that clears it

  /** Show a short message next to the Share button (role="status"), cleared after a few seconds. */
  function showStatus(status, message, isError) {
    if (!status) return;
    window.clearTimeout(timers.get(status));
    status.textContent = message;
    status.classList.toggle('is-error', Boolean(isError));
    timers.set(status, window.setTimeout(() => {
      status.textContent = '';
    }, STATUS_MS));
  }

  /**
   * Share `text` plus the site link. Resolves to 'shared', 'cancelled' (the share sheet was closed),
   * 'copied' or 'failed'; `status` shows "Copied" or the error.
   */
  async function share(text, status) {
    const full = text + '\n' + siteUrl();
    if (hasShareSheet()) {
      try {
        await navigator.share({ text: full });
        return 'shared';
      } catch (err) {
        if (err && err.name === 'AbortError') return 'cancelled';
        // not allowed here (e.g. no user gesture): copy instead
      }
    }
    if (await copyText(full)) {
      showStatus(status, label('share.copied', 'Copied'), false);
      return 'copied';
    }
    showStatus(status, label('share.copyFailed', 'Could not copy. Your browser blocked it.'), true);
    return 'failed';
  }

  window.BrainRushShare = { share: share, siteUrl: siteUrl };
})();
