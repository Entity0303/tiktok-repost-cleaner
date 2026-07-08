// engine.js — silnik masowego un-repostu.
//
// Pętla robocza (docelowo): collect → open → remove → close → scroll,
// z obsługą trybu dry-run (nic nie usuwa) i możliwością anulowania (cancel).
// Między każdą akcją wykonujemy losowe opóźnienie (randomDelay) z config.
//
// Silnik NIE zna szczegółów UI — komunikuje się przez callbacki (onLog, onProgress),
// które podpina panel. Dzięki temu logikę i widok da się rozwijać niezależnie.

import { randomDelay } from './dom.js';

// Tworzy instancję silnika. `config` pochodzi z config.js.
export function createEngine(config) {
  // Flaga anulowania bieżącego przebiegu.
  let cancelled = false;
  // Czy przebieg trwa (zabezpieczenie przed podwójnym startem).
  let running = false;

  // Zewnętrzne callbacki (podpina UI). Domyślnie no-op.
  const listeners = {
    onLog: () => {},
    onProgress: () => {},
    onDone: () => {},
  };

  function on(event, handler) {
    if (event in listeners) listeners[event] = handler;
  }

  // Uruchamia przebieg usuwania. Zwraca Promise kończący się po zakończeniu/anulowaniu.
  async function start() {
    if (running) return;
    running = true;
    cancelled = false;

    listeners.onLog(config.dryRun ? '[DRY-RUN] Start (nic nie zostanie usunięte).' : 'Start.');

    // TODO: właściwa pętla:
    //   1. collect  — zbierz kafelki repostów (repost-finder / selectors.REPOST_ITEM)
    //   2. open     — otwórz akcje kafelka
    //   3. remove   — jeśli !dryRun: kliknij „Usuń repost” i potwierdź; jeśli dryRun: tylko zaloguj
    //   4. close    — zamknij modal/kartę
    //   5. scroll   — doładuj kolejne reposty (lazy-loading)
    //   między krokami: await randomDelay(config.delayMinMs, config.delayMaxMs)
    //   przerwij, gdy: cancelled === true lub osiągnięto config.limit
    void randomDelay;

    running = false;
    listeners.onDone({ removed: 0, cancelled });
  }

  // Sygnalizuje anulowanie — pętla powinna zakończyć się przy najbliższym sprawdzeniu.
  function stop() {
    cancelled = true;
  }

  return { start, stop, on, get running() { return running; } };
}
