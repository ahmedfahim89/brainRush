// BrainRush Android app mode (US-40, D-43), shared by the game page and the guide, Terms and
// Privacy pages. The app is a Trusted Web Activity: this same site, full screen in Chrome. It
// opens ./?source=twa (the manifest's start_url), and Chrome sends the app as the referrer.
// Either one marks this tab as the app in sessionStorage, so it stays in app mode while it
// navigates between the pages. In the app, links to this site's pages open in the same window
// (a new tab would lose the mode), the header has no Admin link and the home page has no
// "New game" heading or intro text. game.js reads
// window.brainrushApp for the rest (no ads, Android Back). On the website nothing changes.
'use strict';

(function () {
  const APP_KEY = 'brainrush.app';
  const APP_REFERRER = /^android-app:\/\/ninja\.integration\.brainrush(\/|$)/;

  function detectApp() {
    try {
      if (window.sessionStorage.getItem(APP_KEY) === '1') return true;
    } catch (err) {
      // storage blocked: decided from this page load only
    }
    const app = new URLSearchParams(window.location.search).get('source') === 'twa' ||
      APP_REFERRER.test(document.referrer);
    if (app) {
      try {
        window.sessionStorage.setItem(APP_KEY, '1');
      } catch (err) {
        // see above
      }
    }
    return app;
  }

  /** Links to this site that would open a new tab open in the app's own window instead. */
  function keepLinksInApp() {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      if (link.origin === window.location.origin) link.removeAttribute('target');
    });
  }

  /** The Admin link and the separator before it (the admin page is desktop-only, D-19). */
  function hideAdminLink() {
    const link = document.querySelector('.page-header nav a[href="admin.html"]');
    if (!link) return;
    const separator = link.previousSibling;
    if (separator && separator.nodeType === Node.TEXT_NODE) separator.remove();
    link.remove();
  }

  /** The "New game" heading and the home intro (D-42) are for website visitors and search
   *  engines; the app starts straight at "Who is playing?". The heading stays in the DOM because
   *  it names the setup section (aria-labelledby). */
  function hideHomeIntro() {
    document.querySelectorAll('#setup-title, .site-intro').forEach((el) => {
      el.hidden = true;
    });
  }

  const isApp = detectApp();
  window.brainrushApp = isApp;
  if (!isApp) return;
  keepLinksInApp();
  hideAdminLink();
  hideHomeIntro();
})();
