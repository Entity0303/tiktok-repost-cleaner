// panel.js — pływający panel sterowania.
//
// Zawartość panelu (docelowo): Start/Stop, przełącznik dry-run, pole limitu,
// zakresy opóźnień (min/max) oraz „live log”. Panel spina UI z silnikiem
// przez jego callbacki (engine.on('log' | 'progress' | 'done', ...)).
//
// Style wstrzykujemy z panel.css jako surowy tekst (import ?raw) w <style>,
// żeby nie potrzebować grantu GM_addStyle.

import panelCss from './panel.css?raw';
import { saveConfig } from '../config.js';

// Wstrzykuje style panelu raz (idempotentnie).
function injectStyles() {
  if (document.getElementById('trc-styles')) return;
  const style = document.createElement('style');
  style.id = 'trc-styles';
  style.textContent = panelCss;
  document.head.appendChild(style);
}

// Montuje panel w DOM i podpina zdarzenia. `deps` = { config, engine }.
export function mountPanel({ config, engine }) {
  injectStyles();

  // TODO: zbudować realny DOM panelu (przyciski, przełączniki, pole logu).
  const root = document.createElement('div');
  root.className = 'trc-panel';
  root.innerHTML = `
    <h2 class="trc-panel__title">TikTok Repost Cleaner</h2>
    <div class="trc-panel__row">
      <span>Tryb</span>
      <span class="trc-badge--dryrun">DRY-RUN</span>
    </div>
    <!-- TODO: Start/Stop, toggle dry-run, limit, opóźnienia, log -->
  `;
  document.body.appendChild(root);

  // TODO: podpiąć przyciski do engine.start()/engine.stop()
  // TODO: engine.on('log', msg => ...); engine.on('done', stats => ...)
  void engine;
  void config;
  void saveConfig;

  return root;
}
