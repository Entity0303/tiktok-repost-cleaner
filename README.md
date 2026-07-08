# TikTok Repost Cleaner

Userscript do masowego usuwania **WŁASNYCH** repostów z profilu TikTok (bulk un-repost).
Userscript for bulk removal of your **OWN** reposts from your TikTok profile.

Stack: Vite + vite-plugin-monkey, czysty JS (ESM). Autor: **Entity0303**. Licencja: MIT.

---

## 🇵🇱 Polski

### Opis
Narzędzie w formie userscriptu, które masowo usuwa **Twoje własne** reposty z profilu
TikTok. Dodaje na stronie profilu pływający panel sterowania, a następnie po kolei
przechodzi przez Twoje reposty i cofa je.

### Jak działa (krótko)
- Na profilu pojawia się **panel sterowania** (prawy dolny róg, przeciągalny).
- Wchodzisz na zakładkę **Reposty** — skrypt zbiera kafelki repostów z siatki.
- Dla każdego repostu **otwiera** go, **sprawdza stan** przycisku repostu
  (po atrybutach `data-e2e`, nie po zmiennych klasach `css-*`) i **cofa repost**
  tylko wtedy, gdy przycisk jest faktycznie w stanie „zrepostowane”.
- **Dry-run domyślnie ON** — najpierw skrypt tylko loguje, co BY zrobił, niczego
  nie usuwając.
- **Limit** liczby repostów na jeden przebieg, **losowe opóźnienia** między akcjami
  oraz **safe-stop** (zatrzymanie po serii nieudanych, podejrzanych akcji) chronią
  przed przypadkowym działaniem i ograniczeniami ze strony TikToka.
- **Potwierdzenie przed realnym usuwaniem** — przy wyłączonym dry-run kliknięcie
  Start wymaga jednorazowego potwierdzenia, zanim cokolwiek zostanie usunięte.

### Wymagania
- Node.js 18+
- (Zalecane) menedżer userscriptów: Tampermonkey / Violentmonkey

### Instalacja

**Tampermonkey (zalecane):**
```bash
npm install
npm run build
```
Następnie zainstaluj wygenerowany plik `dist/tiktok-repost-cleaner.user.js`
w Tampermonkey (otwórz plik w przeglądarce albo wklej jego treść jako nowy skrypt).

**Tryb konsoli (bez Tampermonkey):**
```bash
npm install
npm run build
```
Otwórz swój profil TikTok, otwórz **DevTools → Console** i wklej całą zawartość
pliku `dist/tiktok-repost-cleaner.user.js`. Panel pojawi się na stronie.
W tym trybie ustawienia zapisują się w `localStorage` (fallback, bo brak `GM_*`).

### Użycie krok po kroku
1. Wejdź na **swój** profil TikTok.
2. Przejdź na zakładkę **Reposty**.
3. Ustaw **Limit** (np. 20–30 na pierwszy raz).
4. **ZOSTAW dry-run WŁĄCZONY** za pierwszym razem.
5. Kliknij **Start** i obserwuj **log** — zobaczysz, co skrypt BY usunął.
6. Jeśli log wygląda poprawnie, dopiero wtedy **wyłącz dry-run**
   (pojawi się **potwierdzenie**) i uruchom realne usuwanie.

### Zalecenia
- Usuwaj **partiami** (20–30 repostów), a **między partiami odświeżaj stronę**.
- Jeśli TikTok zacznie ograniczać (captcha / blokady) — **zwiększ opóźnienia**
  (min/max ms) i zrób przerwę.
- Operuj wyłącznie na **własnym** koncie i **własnych** repostach.

### Troubleshooting — jak naprawić selektory po zmianie DOM TikToka
Klasy CSS TikToka są **zaciemnione i zmienne** (np. `css-1ab2cd-DivContainer`) —
nie opieraj się na nich. Po zmianie layoutu edytuj **wyłącznie** `src/selectors.js`
i celuj w atrybuty **`data-e2e`** (stabilne hooki testowe) oraz `aria-label`.

Aktualnie używane atrybuty `data-e2e`:
- `user-post-item` — kafelek wideo/repostu w siatce profilu,
- `video-share-repost` — przycisk repostu w otwartym wideo (repost / cofnięcie),
- `repost-tag` — znacznik „repost” na kafelku (miękkie potwierdzenie).

**UWAGA — zależność od języka interfejsu:** `isReposted()` i `closeButton()`
rozpoznają stan/akcję po tekście i `aria-label`, obecnie tylko dla **PL**
(`„usuń"` / `„Zamknij"`) i **EN** (`„remove"` / `„Close"`). Jeśli masz UI TikToka
w innym języku, dopisz odpowiednie słowa kluczowe w `src/selectors.js`.

Jak zweryfikować w DevTools: otwórz profil → `F12` → zakładka **Elements** →
`Ctrl+F` i wklej selektor (np. `[data-e2e="video-share-repost"]`), sprawdzając,
czy podświetla właściwy element.

### Disclaimer
- Narzędzie działa **wyłącznie na własnym koncie** użytkownika i tylko na Twoich repostach.
- Automatyzuje ręczne akcje, które i tak możesz wykonać samodzielnie, klikając w UI.
- Cofnięte reposty znikają **NIEODWRACALNIE** — nie ma „cofnij”.
- TikTok może **ograniczać automatyzację** (captcha, tymczasowe blokady akcji),
  a **automatyzacja jest niezgodna z regulaminem TikToka**.
- Używasz **na własną odpowiedzialność**. Licencja **MIT**.

---

## 🇬🇧 English

### Description
A userscript that bulk-removes **your own** reposts from your TikTok profile.
It adds a floating control panel on your profile page, then walks through your
reposts one by one and un-reposts them.

### How it works (in short)
- A **control panel** appears on your profile (bottom-right, draggable).
- You open the **Reposts** tab — the script collects repost tiles from the grid.
- For each repost it **opens** it, **checks the repost button state**
  (via `data-e2e` attributes, not the volatile `css-*` classes) and **un-reposts**
  only when the button is genuinely in the “reposted” state.
- **Dry-run is ON by default** — at first the script only logs what it WOULD do,
  deleting nothing.
- A per-run **limit**, **random delays** between actions, and a **safe-stop**
  (halt after a streak of failed/suspicious actions) guard against accidental
  actions and TikTok rate-limiting.
- **Confirmation before real removal** — with dry-run off, clicking Start requires
  a one-time confirmation before anything is deleted.

### Requirements
- Node.js 18+
- (Recommended) a userscript manager: Tampermonkey / Violentmonkey

### Installation

**Tampermonkey (recommended):**
```bash
npm install
npm run build
```
Then install the generated `dist/tiktok-repost-cleaner.user.js` in Tampermonkey
(open the file in your browser, or paste its contents as a new script).

**Console mode (without Tampermonkey):**
```bash
npm install
npm run build
```
Open your TikTok profile, open **DevTools → Console**, and paste the full contents
of `dist/tiktok-repost-cleaner.user.js`. The panel appears on the page.
In this mode settings are stored in `localStorage` (a fallback, since `GM_*` is absent).

### Step-by-step usage
1. Go to **your** TikTok profile.
2. Open the **Reposts** tab.
3. Set a **Limit** (e.g. 20–30 for the first run).
4. **KEEP dry-run ON** the first time.
5. Click **Start** and watch the **log** — you’ll see what the script WOULD remove.
6. If the log looks correct, only then **turn dry-run OFF**
   (a **confirmation** will appear) and run the real removal.

### Recommendations
- Remove in **batches** (20–30 reposts) and **refresh the page between batches**.
- If TikTok starts rate-limiting (captcha / blocks) — **increase the delays**
  (min/max ms) and take a break.
- Operate only on **your own** account and **your own** reposts.

### Troubleshooting — fixing selectors after TikTok DOM changes
TikTok’s CSS classes are **obfuscated and volatile** (e.g. `css-1ab2cd-DivContainer`)
— don’t rely on them. When the layout changes, edit **only** `src/selectors.js`
and target **`data-e2e`** attributes (stable test hooks) and `aria-label`.

Currently used `data-e2e` attributes:
- `user-post-item` — a video/repost tile in the profile grid,
- `video-share-repost` — the repost button in an opened video (repost / undo),
- `repost-tag` — the “repost” marker on a tile (soft confirmation).

**NOTE — UI language dependency:** `isReposted()` and `closeButton()` detect the
state/action from text and `aria-label`, currently only for **PL** (`“usuń”` /
`“Zamknij”`) and **EN** (`“remove”` / `“Close”`). If your TikTok UI is in another
language, add the matching keywords in `src/selectors.js`.

How to verify in DevTools: open the profile → `F12` → **Elements** tab →
`Ctrl+F` and paste the selector (e.g. `[data-e2e="video-share-repost"]`), checking
that it highlights the right element.

### Disclaimer
- The tool works **only on your own account** and only on your own reposts.
- It automates manual actions you could perform yourself by clicking in the UI.
- Un-reposted items are removed **IRREVERSIBLY** — there is no “undo”.
- TikTok may **rate-limit automation** (captcha, temporary action blocks), and
  **automation is against TikTok’s Terms of Service**.
- Use **at your own risk**. Licensed under **MIT**.

---

## Licencja / License
MIT — see [LICENSE](./LICENSE).
