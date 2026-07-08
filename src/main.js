// main.js — punkt wejścia userscriptu.
// Wczytuje konfigurację, montuje panel UI i tworzy silnik.
// Cała logika docelowa jest w engine.js / dom.js; tu tylko spięcie modułów.

import { loadConfig, saveConfig } from './config.js';
import { createEngine } from './engine.js';
import { mountPanel } from './ui/panel.js';

// run-at: document-idle — DOM jest już gotowy w momencie startu.
// loadConfig() zwraca JEDEN współdzielony obiekt config, którym karmimy
// i panel, i silnik — obie strony pracują na tej samej referencji.
const config = loadConfig();

// Panel montujemy pierwszy: jest źródłem prawdy dla logów i postępu, więc
// silnik (tworzony niżej) może od razu do niego pisać.
//   onChange — po każdej zmianie ustawień w panelu zapisujemy config trwale;
//              silnik i tak widzi zmiany na żywo (ta sama referencja).
//   onStart / onStop — sterują silnikiem i stanem „w toku” panelu.
const panel = mountPanel({
  config,
  onChange: (cfg) => saveConfig(cfg),
  onStart: () => {
    engine.start();
    panel.setRunning(true);
  },
  onStop: () => {
    engine.stop();
    panel.setRunning(false);
  },
});

// Callbacki onLog/onProgress to JEDYNY kanał komunikacji silnika ze światem —
// kierujemy je wyłącznie do panelu (panel jest źródłem prawdy).
// Po naturalnym końcu pętli silnik woła onProgress({ done: true }), a panel
// w setProgress zdejmuje stan „w toku” (setRunning(false)) — UI wraca do spoczynku.
const engine = createEngine({
  config,
  onLog: (msg) => panel.log(msg),
  onProgress: (p) => panel.setProgress(p),
});
