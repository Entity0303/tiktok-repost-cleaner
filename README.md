# TikTok Repost Cleaner

> ⚠️ **Szkielet / Scaffold** — logika jeszcze nie zaimplementowana. Na razie projekt tylko się builduje.

Userscript do masowego usuwania **WŁASNYCH** repostów z profilu TikTok (bulk un-repost).
Userscript for bulk removal of your **OWN** reposts from your TikTok profile.

---

## 🇵🇱 Polski

### Wymagania
- Node.js 18+
- Menedżer userscriptów w przeglądarce (Tampermonkey / Violentmonkey)

### Instalacja (deweloperska)
```bash
npm install
npm run dev     # tryb dev — auto-przeładowanie userscriptu
npm run build   # produkcyjny build do dist/
```
W trybie `dev` vite-plugin-monkey udostępnia link instalacyjny w konsoli. Build produkcyjny tworzy plik `.user.js` w `dist/`, który instalujesz w Tampermonkey.

### Bezpieczeństwo / Disclaimer
- **Tryb dry-run jest domyślnie WŁĄCZONY** — skrypt niczego nie usuwa, dopóki świadomie go nie wyłączysz.
- Narzędzie działa wyłącznie na **Twoim** profilu i **Twoich** repostach.
- Używasz na własną odpowiedzialność. Automatyzacja może naruszać regulamin TikToka i skutkować ograniczeniami konta.
- Selektory zależą od aktualnego layoutu TikToka — po zmianach po stronie TikToka może wymagać naprawy (patrz `src/selectors.js`).

### Troubleshooting
- **Panel się nie pojawia** → sprawdź, czy jesteś na `https://www.tiktok.com/*` i czy skrypt jest włączony.
- **Nie znajduje repostów / przycisków** → TikTok zmienił UI; zaktualizuj `src/selectors.js`.

---

## 🇬🇧 English

### Requirements
- Node.js 18+
- A userscript manager (Tampermonkey / Violentmonkey)

### Install (development)
```bash
npm install
npm run dev     # dev mode — userscript hot-reload
npm run build   # production build into dist/
```

### Safety / Disclaimer
- **Dry-run mode is ON by default** — nothing is deleted until you consciously disable it.
- Operates only on **your** profile and **your** reposts.
- Use at your own risk. Automation may violate TikTok's Terms of Service and lead to account limits.
- Selectors depend on TikTok's current layout; edit `src/selectors.js` if TikTok changes its UI.

---

## Licencja / License
MIT — see [LICENSE](./LICENSE).
