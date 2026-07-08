// selectors.js — JEDYNE miejsce z selektorami DOM.
//
// KONWENCJA (patrz CLAUDE.md):
//  - Budujemy WYŁĄCZNIE na atrybutach data-e2e (stabilne hooki testowe TikToka)
//    oraz na aria-label. NIGDY na klasach css-* (są zaciemnione i zmienne).
//  - Po zmianie layoutu TikToka naprawiamy TYLKO ten plik.
//  - Każdy selektor ma komentarz, jak go zweryfikować w DevTools.
//
// Jak weryfikować w DevTools (ogólnie):
//   1. Otwórz profil z repostami → F12 → zakładka Elements.
//   2. Ctrl+F w panelu Elements i wklej selektor z danej metody.
//   3. Sprawdź, czy podświetla właściwy element (i tylko jego).

export const S = {
  // Kafelki repostów w siatce profilu — zwraca linki wewnątrz kafelków repostów.
  // Aktualny atrybut kafelka to data-e2e="user-repost-item" (potwierdzony w DOM 2026;
  // wcześniej „user-post-item”). Siatka repostów zawiera zarówno filmy (/video/),
  // jak i zdjęcia (/photo/) — łapiemy oba typy.
  // Weryfikacja: w konsoli wpisz
  //   document.querySelectorAll('[data-e2e="user-repost-item"] a[href*="/video/"],[data-e2e="user-repost-item"] a[href*="/photo/"]')
  //   → powinno zwrócić po jednym linku na kafelek repostu w siatce.
  // Fallback: gdy pusto, bierzemy wszystkie linki wewnątrz kafelków repostów
  //   (nadal ograniczone do user-repost-item — NIE łapiemy gołego a[href*="/video/"],
  //   bo ten wciągał przypadkowe linki spoza repostów: pasek boczny, sugerowane).
  gridItems() {
    const items = [
      ...document.querySelectorAll(
        '[data-e2e="user-repost-item"] a[href*="/video/"],[data-e2e="user-repost-item"] a[href*="/photo/"]',
      ),
    ];
    if (items.length > 0) return items;
    // fallback: dowolne linki wewnątrz kafelków repostów (oba typy: /video/ i /photo/)
    return [...document.querySelectorAll('[data-e2e="user-repost-item"] a')];
  },

  // Przycisk „Repost” w otwartym modalu przeglądania wideo („browse”).
  // Weryfikacja: otwórz swój repost (modal wideo) → w Elements znajdź
  //   [data-e2e="video-share-repost"]. To ten sam przycisk, którym repostujesz
  //   i cofasz repost (stan rozróżnia aria-label — patrz isReposted).
  repostButton() {
    return document.querySelector('[data-e2e="video-share-repost"]');
  },

  // BEZPIECZNIK STANU: czy dany przycisk repostu jest w stanie „już repostowane”.
  // Klikamy go do usunięcia TYLKO, gdy zwróci true — inaczej ryzykowalibyśmy
  // przypadkowe DODANIE repostu zamiast jego cofnięcia.
  // Weryfikacja: najedź na przycisk repostu przy własnym reposcie i sprawdź
  //   btn.getAttribute('aria-label') — dla repostu zawiera „usuń” / „remove”.
  isReposted(btn) {
    if (!btn) return false;
    const label = (btn.getAttribute('aria-label') || '').toLowerCase();
    return label.includes('usuń') || label.includes('remove');
  },

  // Opcjonalne potwierdzenie, że to repost („Repostowane przez Ciebie”).
  // Weryfikacja: [data-e2e="repost-tag"] pojawia się na kafelku/karcie repostu.
  // Może nie istnieć w każdym wariancie UI — traktujemy jako miękki sygnał.
  repostTag() {
    return document.querySelector('[data-e2e="repost-tag"]');
  },

  // Przycisk zamknięcia modala wideo (aria-label „Zamknij” / „Close”).
  // Weryfikacja: w otwartym modalu znajdź element z aria-label="Zamknij"
  //   (UI PL) lub aria-label="Close" (UI EN).
  closeButton() {
    return document.querySelector('[aria-label="Zamknij"],[aria-label="Close"]');
  },
};
