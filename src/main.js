// main.js — punkt wejścia userscriptu.
// Wczytuje konfigurację, tworzy silnik i montuje panel UI.
// Cała logika docelowa jest w engine.js / dom.js; tu tylko spięcie modułów.

import { loadConfig } from './config.js';
import { createEngine } from './engine.js';
import { mountPanel } from './ui/panel.js';

// run-at: document-idle — DOM jest już gotowy w momencie startu.
const config = loadConfig();
const engine = createEngine(config);
mountPanel({ config, engine });
