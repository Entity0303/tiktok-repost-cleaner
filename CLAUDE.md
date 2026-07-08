# CLAUDE.md — konwencje projektu

> **PRYWATNOŚĆ:** nigdy nie umieszczaj w żadnym pliku ani commicie prawdziwego
> imienia, nazwiska ani e-maila. Autor/copyright = handle `Entity0303` lub
> `tiktok-repost-cleaner contributors`.

Ten plik czyta Claude Code automatycznie. Trzymaj się poniższych zasad.

## O projekcie
Userscript **tiktok-repost-cleaner** — masowe usuwanie WŁASNYCH repostów z profilu
TikTok. Stack: **Vite + vite-plugin-monkey**, czysty JS (ESM, moduły), bez frameworka.

## Zasady kodu

### Język
- **Komentarze i logi po polsku.** Nazwy identyfikatorów (funkcje/zmienne) po angielsku,
  komentarze wyjaśniające — po polsku.

### Selektory
- **WSZYSTKIE selektory trzymaj wyłącznie w `src/selectors.js`.** Żaden inny plik nie
  odwołuje się do DOM po klasach/tekście na sztywno.
- Klasy CSS TikToka są **zaciemnione i zmienne** (np. `css-1ab2cd-DivContainer`) —
  **nie** używaj ich jako źródła prawdy.
- Celuj w **tekst widoczny dla użytkownika** oraz atrybuty **`aria-label` / `data-e2e`**.
- Każdy selektor ma **listę fallbacków** (warianty językowe UI, alternatywne strategie).
- Po zmianie layoutu TikToka naprawiamy **tylko** `src/selectors.js`.

### Bezpieczeństwo działań
- **Dry-run domyślnie ON** (`DEFAULT_CONFIG.dryRun = true`). W dry-run skrypt loguje,
  co BY zrobił, ale **niczego nie usuwa**. Wyłączenie dry-run to świadoma decyzja
  użytkownika w panelu.
- **Losowe opóźnienia między akcjami** — używaj `randomDelay(min, max)` z `dom.js`,
  nigdy stałych `sleep`. Zakresy pochodzą z konfiguracji.
- Operuj wyłącznie na **własnym** profilu i **własnych** repostach.
- Zawsze udostępniaj możliwość **anulowania** (`engine.stop()`).

### Architektura
- `main.js` — punkt wejścia: spina config + engine + UI. Bez logiki domenowej.
- `config.js` — ustawienia + trwałość (`GM_getValue`/`GM_setValue`).
- `selectors.js` — jedyne źródło selektorów.
- `dom.js` — helpery DOM + czas (`waitFor`, `findByText`, `sleep`, `rand`, `randomDelay`).
- `engine.js` — pętla un-repost (collect→open→remove→close→scroll), dry-run, cancel.
  Komunikuje się z UI przez callbacki, **nie** zna szczegółów widoku.
- `ui/panel.js` + `ui/panel.css` — panel sterowania; style wstrzykiwane przez `?raw`
  (bez `GM_addStyle` — trzymamy się jawnej listy `@grant`).

### Userscript / build
- `@grant` **tylko** `GM_setValue`, `GM_getValue`. Nie dodawaj kolejnych bez potrzeby;
  `autoGrant: false` w `vite.config.js` jest celowe.
- `@match https://www.tiktok.com/*`, `run-at: document-idle`.
- Metadane (w tym nazwa PL/EN) są w `vite.config.js`.

### Komendy
- `npm run dev` — dev z hot-reload userscriptu.
- `npm run build` — produkcyjny `.user.js` w `dist/`.
