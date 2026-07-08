// panel.js — pływający, przeciągalny panel sterowania.
//
// ZASADA: panel TYLKO renderuje i emituje zdarzenia — nie zna logiki domenowej
// (nie dotyka DOM-u TikToka, nie wie, jak działa un-repost). Ze światem rozmawia
// przez:
//   - callbacki wejściowe: onStart / onStop / onChange (emitowane z panelu),
//   - kontroler zwrotny: { log, setProgress, setRunning, destroy } (main woła je,
//     przekazując dane z silnika — onLog/onProgress).
//
// Ustawienia czyta z przekazanego `config` (już wczytanego przez loadConfig),
// a zapisuje trwale przez saveConfig (GM_setValue) — patrz config.js.
//
// Style wstrzykujemy z panel.css jako surowy tekst (import ?raw) do <style>,
// żeby nie potrzebować grantu GM_addStyle.

import panelCss from './panel.css?raw';
import { saveConfig } from '../config.js';

// Ile ostatnich linii logu trzymamy w widoku.
const MAX_LOG_LINES = 50;

// Wstrzykuje style panelu raz (idempotentnie).
function injectStyles() {
  if (document.getElementById('trc-styles')) return;
  const style = document.createElement('style');
  style.id = 'trc-styles';
  style.textContent = panelCss;
  document.head.appendChild(style);
}

// Mały helper tworzenia elementów: props ustawiane jako właściwości/atrybuty,
// `text` jako textContent, `on*` jako listenery. Bez innerHTML → bez wstrzyknięć.
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key in node) {
      node[key] = value;
    } else {
      node.setAttribute(key, value);
    }
  }
  for (const child of [].concat(children)) {
    if (child != null && child !== false) node.append(child);
  }
  return node;
}

// Zamienia wartość pola na nieujemną liczbę całkowitą (puste/NaN → fallback).
function toIntGE0(value, fallback = 0) {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

// Montuje panel w DOM i zwraca kontroler. `deps`:
//   config    — obiekt konfiguracji (współdzielony z silnikiem; panel go mutuje),
//   onStart   — wołane po kliknięciu „Start”,
//   onStop    — wołane po kliknięciu „Stop”,
//   onChange  — wołane po każdej zmianie ustawień (dostaje aktualny config).
export function mountPanel({ config, onStart, onStop, onChange } = {}) {
  injectStyles();

  // — Kontrolki formularza ————————————————————————————————————————
  const dryRunEl = el('input', { type: 'checkbox', checked: !!config.dryRun });
  const limitEl = el('input', {
    class: 'trc-panel__input',
    type: 'number',
    min: '0',
    step: '1',
    value: String(config.max),
  });
  const minDelayEl = el('input', {
    class: 'trc-panel__input trc-panel__input--narrow',
    type: 'number',
    min: '0',
    step: '50',
    value: String(config.minDelay),
  });
  const maxDelayEl = el('input', {
    class: 'trc-panel__input trc-panel__input--narrow',
    type: 'number',
    min: '0',
    step: '50',
    value: String(config.maxDelay),
  });

  // — Przyciski, postęp, log ——————————————————————————————————————
  const startBtn = el('button', { class: 'trc-panel__btn trc-panel__btn--start', text: 'Start' });
  const stopBtn = el('button', { class: 'trc-panel__btn trc-panel__btn--stop', text: 'Stop', disabled: true });
  const progressValue = el('span', { class: 'trc-panel__progress-value', text: '0 / —' });
  const logBox = el('div', { class: 'trc-panel__log' });
  const badge = el('span', { class: 'trc-badge--dryrun', text: 'DRY-RUN' });

  // — Składanie drzewa panelu ——————————————————————————————————————
  const header = el('div', { class: 'trc-panel__header' }, [
    el('h2', { class: 'trc-panel__title', text: 'TikTok Repost Cleaner' }),
    badge,
    el('button', { class: 'trc-panel__collapse', text: '–', title: 'Zwiń / rozwiń' }),
  ]);
  const collapseBtn = header.querySelector('.trc-panel__collapse');

  const body = el('div', { class: 'trc-panel__body' }, [
    el('label', { class: 'trc-panel__toggle' }, [dryRunEl, el('span', { text: 'Dry-run (nic nie usuwaj)' })]),
    el('div', { class: 'trc-panel__warn', text: '⚠ Dry-run WYŁĄCZONY — reposty będą realnie usuwane.' }),
    el('div', { class: 'trc-panel__row' }, [el('label', { text: 'Limit (0 = bez limitu)' }), limitEl]),
    el('div', { class: 'trc-panel__row trc-panel__row--delays' }, [
      el('label', { text: 'Opóźnienie [ms]' }),
      minDelayEl,
      el('span', { class: 'trc-panel__sep', text: '–' }),
      maxDelayEl,
    ]),
    el('div', { class: 'trc-panel__actions' }, [startBtn, stopBtn]),
    el('div', { class: 'trc-panel__progress' }, [
      el('span', { text: 'Postęp:' }),
      progressValue,
    ]),
    logBox,
  ]);

  const root = el('div', { class: 'trc-panel' }, [header, body]);

  // Odzwierciedla tryb dry-run: klasa --live + kolor/tekst plakietki.
  function reflectMode() {
    const live = !config.dryRun;
    root.classList.toggle('trc-panel--live', live);
    badge.textContent = live ? 'NA ŻYWO' : 'DRY-RUN';
  }

  // Zbiera wartości z pól, sanityzuje, zapisuje i emituje onChange.
  function commit() {
    config.dryRun = dryRunEl.checked;
    config.max = toIntGE0(limitEl.value, 0);
    config.minDelay = toIntGE0(minDelayEl.value, 0);
    config.maxDelay = toIntGE0(maxDelayEl.value, config.minDelay);
    // max nie może być mniejsze niż min — inaczej rand(min,max) byłby błędny.
    if (config.maxDelay < config.minDelay) config.maxDelay = config.minDelay;

    // Zapisz zsanityzowane wartości z powrotem do pól (spójny widok).
    limitEl.value = String(config.max);
    minDelayEl.value = String(config.minDelay);
    maxDelayEl.value = String(config.maxDelay);

    saveConfig(config); // trwały zapis przez GM_setValue
    reflectMode();
    if (onChange) onChange(config);
  }

  // Zmiany ustawień zapisujemy po zatwierdzeniu pola (change), nie przy każdym znaku.
  dryRunEl.addEventListener('change', commit);
  for (const input of [limitEl, minDelayEl, maxDelayEl]) {
    input.addEventListener('change', commit);
  }

  // Blokuje/odblokowuje edycję ustawień na czas pracy silnika.
  function setInputsDisabled(disabled) {
    for (const input of [dryRunEl, limitEl, minDelayEl, maxDelayEl]) {
      input.disabled = disabled;
    }
  }

  // — Przyciski Start/Stop ————————————————————————————————————————
  // Panel tylko emituje zdarzenie; stanem „w toku” (setRunning) steruje main.js,
  // żeby był jeden ośrodek prawdy (start/stop + naturalny koniec przez setProgress).
  startBtn.addEventListener('click', () => {
    if (onStart) onStart();
  });
  stopBtn.addEventListener('click', () => {
    if (onStop) onStop();
  });

  // — Zwijanie panelu ————————————————————————————————————————————
  collapseBtn.addEventListener('click', () => {
    const collapsed = root.classList.toggle('trc-panel--collapsed');
    collapseBtn.textContent = collapsed ? '+' : '–';
  });

  // — Przeciąganie za nagłówek ———————————————————————————————————
  let drag = null;
  header.addEventListener('mousedown', (e) => {
    if (e.target === collapseBtn) return; // klik w „zwiń” nie startuje przeciągania
    const r = root.getBoundingClientRect();
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    // Przełącz na pozycjonowanie od góry-lewej, żeby swobodnie przesuwać.
    root.style.left = `${r.left}px`;
    root.style.top = `${r.top}px`;
    root.style.right = 'auto';
    root.style.bottom = 'auto';
    e.preventDefault();
  });
  window.addEventListener('mousemove', (e) => {
    if (!drag) return;
    // Ogranicz pozycję do widocznego obszaru okna.
    const maxX = window.innerWidth - root.offsetWidth;
    const maxY = window.innerHeight - root.offsetHeight;
    const x = Math.min(Math.max(0, e.clientX - drag.dx), Math.max(0, maxX));
    const y = Math.min(Math.max(0, e.clientY - drag.dy), Math.max(0, maxY));
    root.style.left = `${x}px`;
    root.style.top = `${y}px`;
  });
  window.addEventListener('mouseup', () => {
    drag = null;
  });

  document.body.appendChild(root);
  reflectMode();

  // — Kontroler zwrotny dla main.js ——————————————————————————————

  // Dopisuje linię do live-logu; utrzymuje maks. MAX_LOG_LINES ostatnich linii.
  function log(msg) {
    const atBottom = logBox.scrollHeight - logBox.scrollTop - logBox.clientHeight < 4;
    logBox.append(el('div', { class: 'trc-panel__log-line', text: String(msg) }));
    while (logBox.childElementCount > MAX_LOG_LINES) {
      logBox.removeChild(logBox.firstChild);
    }
    // Auto-scroll tylko, gdy użytkownik był już na dole (nie przerywaj czytania).
    if (atBottom) logBox.scrollTop = logBox.scrollHeight;
  }

  // Aktualizuje licznik X / Y. Y = max (>0) albo „∞” przy braku limitu.
  // done: true → koniec przebiegu, odblokuj UI.
  function setProgress(p = {}) {
    const count = p.count ?? 0;
    const total = p.max > 0 ? p.max : '∞';
    progressValue.textContent = `${count} / ${total}`;
    if (p.done) setRunning(false);
  }

  // Przełącza UI między stanem „pracuje” a „bezczynny”.
  function setRunning(running) {
    startBtn.disabled = running;
    stopBtn.disabled = !running;
    setInputsDisabled(running);
  }

  // Usuwa panel z DOM (na wypadek odmontowania).
  function destroy() {
    root.remove();
  }

  return { log, setProgress, setRunning, destroy, root };
}
