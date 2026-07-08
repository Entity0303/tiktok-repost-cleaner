// engine.js — asynchroniczny silnik masowego un-repostu.
//
// Silnik NIE dotyka DOM-u interfejsu (żadnych paneli/przycisków UI). Komunikuje
// się ze światem WYŁĄCZNIE przez callbacki onLog / onProgress przekazane przy
// tworzeniu. Selektory bierze tylko z S (selectors.js), akcje z dom.js.
//
// Pętla robocza:
//   1. zbierz S.gridItems(), pomiń już odwiedzone (Set po href);
//   2. brak nowych → scroll na dół, poczekaj na doładowanie; brak → koniec;
//   3. clickSafe(kafelek) → waitFor(S.repostButton);
//   4. USUWANIE z bezpiecznikiem stanu (klik tylko gdy S.isReposted === true);
//   5. zamknij modal (Escape + S.closeButton);
//   6. losowa pauza minDelay..maxDelay, onProgress, następny kafelek.
//
// Zatrzymanie:
//   - stop()  → cancel token, przerywa przy najbliższym punkcie kontrolnym
//               (nigdy nie wykona kliknięcia po stop);
//   - licznik == config.max (gdy max > 0);
//   - safe-stop: 5 nieudanych akcji z rzędu.

import { pause, waitFor, clickSafe } from './dom.js';
import { S } from './selectors.js';

export function createEngine({ config, onProgress, onLog }) {
  // Cancel token — ustawiany przez stop(), sprawdzany w każdym punkcie kontrolnym.
  let cancelled = false;
  // Zabezpieczenie przed podwójnym startem.
  let running = false;

  const log = (msg) => onLog && onLog(msg);
  const progress = (data) => onProgress && onProgress(data);

  // Zwraca klucz identyfikujący kafelek (absolutny href).
  const keyOf = (tile) => tile.href || tile.getAttribute('href') || '';

  // Czy istnieją nieodwiedzone kafelki w aktualnym DOM.
  const hasFresh = (visited) =>
    S.gridItems().some((t) => {
      const k = keyOf(t);
      return k && !visited.has(k);
    });

  // Zamknięcie modala „browse”: Escape na body + przycisk zamknięcia, jeśli jest.
  async function closeModal() {
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }),
    );
    const close = S.closeButton();
    if (close) clickSafe(close);
    // Poczekaj chwilę, aż modal faktycznie zniknie (przycisk repostu przestaje istnieć).
    await waitFor(() => !S.repostButton(), 2000, 100);
  }

  async function start() {
    if (running) return;
    running = true;
    cancelled = false;

    const visited = new Set(); // href-y odwiedzonych kafelków (bez powtórek)
    let count = 0; // ile repostów usunięto (w dry-run: ile BY usunięto)
    let fails = 0; // nieudane akcje z rzędu (safe-stop po 5)

    log(config.dryRun ? '[DRY-RUN] Start — nic nie zostanie usunięte.' : 'Start.');

    // Warunek zatrzymania sprawdzany w punktach kontrolnych.
    const reachedMax = () => config.max > 0 && count >= config.max;
    const shouldStop = () => cancelled || reachedMax();

    while (!shouldStop()) {
      // 1. zbierz kafelki i odfiltruj już odwiedzone
      const fresh = S.gridItems().filter((t) => {
        const k = keyOf(t);
        return k && !visited.has(k);
      });

      // 2. brak nowych → scroll i czekaj na doładowanie
      if (fresh.length === 0) {
        window.scrollTo(0, document.body.scrollHeight);
        const grew = await waitFor(() => hasFresh(visited));
        if (!grew) {
          log('Koniec — brak nowych repostów po doładowaniu.');
          break;
        }
        continue; // wróć na górę i zbierz świeżo doładowane kafelki
      }

      // 3.–6. przetwarzaj kafelki po kolei
      for (const tile of fresh) {
        if (shouldStop()) break;

        const href = keyOf(tile);
        visited.add(href); // oznacz od razu, by nie wracać do tego samego kafelka

        // 3. otwórz modal i poczekaj na przycisk repostu
        clickSafe(tile);
        const btn = await waitFor(() => S.repostButton());

        // Cancel token — nie wykonuj żadnej akcji usuwania po stop().
        if (cancelled) {
          await closeModal();
          break;
        }

        // 4. USUWANIE z bezpiecznikiem stanu
        if (!btn || !S.isReposted(btn)) {
          log('Pominięto: nie w stanie „zrepostowane”.');
          fails += 1;
          await closeModal();
          if (fails >= 5) {
            log('⚠ Safe-stop: 5 nieudanych akcji z rzędu — zatrzymuję silnik.');
            cancelled = true;
            break;
          }
          await pause(config.minDelay, config.maxDelay);
          continue;
        }

        // Stan potwierdzony: klik toggluje repost i usuwa go od razu (bez dialogu).
        if (config.dryRun) {
          // W dry-run NIE klikamy — jedynie symulujemy, żeby domyślnie nic nie usuwać.
          log(`[DRY-RUN] Usunąłbym repost: ${href}`);
        } else {
          clickSafe(btn);
          log(`Usunięto repost: ${href}`);
        }
        count += 1;
        fails = 0; // udana akcja resetuje licznik bezpiecznika

        // 5. zamknij modal
        await closeModal();

        // 6. postęp + losowa pauza przed kolejnym kafelkiem
        progress({ count, max: config.max, href });
        if (shouldStop()) break;
        await pause(config.minDelay, config.maxDelay);
      }
    }

    running = false;
    const reason = cancelled ? (reachedMax() ? 'osiągnięto limit' : 'przerwano') : 'wyczerpano reposty';
    log(`Koniec (${reason}). Przetworzono repostów: ${count}.`);
    progress({ count, max: config.max, done: true });
  }

  // Cancel token — przerwanie nastąpi przy najbliższym punkcie kontrolnym.
  function stop() {
    if (running) log('Zatrzymywanie…');
    cancelled = true;
  }

  return { start, stop };
}
