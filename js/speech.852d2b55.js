// BrainRush read aloud (US-48): a thin layer over the browser's built-in speech synthesis.
// No server work and no external service of our own. game.js decides what to read and when;
// this file picks a voice per language and starts or stops the reading.
//   window.BrainRushSpeech = { supported(), hasVoice(lang), speak(parts, onDone), stop(), onVoicesChanged(cb) }
// parts = [{ text, lang }] with lang 'en' or 'ar'; parts without a voice are skipped.
'use strict';

(function () {
  const synth = window.speechSynthesis;
  const listeners = [];
  let voices = [];
  let reading = 0;     // id of the reading in progress; events of an older (stopped) one are ignored
  let onDone = null;   // called once when the reading in progress ends by itself

  function supported() {
    return !!synth && typeof window.SpeechSynthesisUtterance === 'function';
  }

  /** "en-US", "ar_EG" or "AR" -> "en" / "ar". */
  function baseLang(lang) {
    return String(lang || '').toLowerCase().replace('_', '-').split('-')[0];
  }

  function loadVoices() {
    try {
      voices = synth.getVoices() || [];
    } catch (err) {
      voices = [];
    }
  }

  /**
   * A voice for the language: one on the device first (an online voice sends the text to the
   * browser maker's service), the system's default before the others. null when none is installed.
   */
  function voiceFor(lang) {
    const matching = voices.filter((v) => baseLang(v.lang) === lang);
    return matching.find((v) => v.localService && v.default) || matching.find((v) => v.localService) ||
      matching.find((v) => v.default) || matching[0] || null;
  }

  function hasVoice(lang) {
    return supported() && voiceFor(lang) !== null;
  }

  /** The reading ended (or failed, e.g. blocked before the first tap): tell game.js once. */
  function finish(id) {
    if (id !== reading) return;
    reading += 1;
    const done = onDone;
    onDone = null;
    if (done) done();
  }

  /** Read the parts one after the other; returns false (nothing read) when no part has a voice. */
  function speak(parts, done) {
    stop();
    const queue = parts
      .map((part) => ({ text: String(part.text || '').trim(), voice: voiceFor(part.lang) }))
      .filter((part) => part.text !== '' && part.voice !== null);
    if (!queue.length) return false;
    const id = reading;
    onDone = done || null;
    queue.forEach((part, index) => {
      const utterance = new window.SpeechSynthesisUtterance(part.text);
      utterance.voice = part.voice;
      utterance.lang = part.voice.lang;
      utterance.onerror = () => finish(id);
      if (index === queue.length - 1) utterance.onend = () => finish(id);
      synth.speak(utterance);
    });
    return true;
  }

  /** Stop at once (no onDone: the caller is the one stopping it). */
  function stop() {
    if (!supported()) return;
    reading += 1;
    onDone = null;
    try {
      synth.cancel();
    } catch (err) {
      // nothing is being read
    }
  }

  /** Browsers load their voice list late (Chrome: after the first getVoices call). */
  function onVoicesChanged(callback) {
    listeners.push(callback);
  }

  if (supported()) {
    loadVoices();
    const changed = () => {
      loadVoices();
      listeners.forEach((callback) => callback());
    };
    if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', changed);
    else synth.onvoiceschanged = changed;
    window.addEventListener('pagehide', stop); // a refresh or leaving the page stops the reading
    stop(); // nothing left over from the page before a refresh
  }

  window.BrainRushSpeech = {
    supported: supported,
    hasVoice: hasVoice,
    speak: speak,
    stop: stop,
    onVoicesChanged: onVoicesChanged,
  };
})();
