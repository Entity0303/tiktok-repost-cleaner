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
  // Kafelki repostów w siatce profilu — zwraca linki do wideo w kafelkach.
  // Weryfikacja: w konsoli wpisz
  //   document.querySelectorAll('[data-e2e="user-post-item"] a[href*="/video/"]')
  //   → powinno zwrócić po jednym linku na kafelek w siatce.
  // Fallback: gdy pusto (np. inny wariant siatki), bierzemy wszystkie linki do wideo.
  gridItems() {
    const items = [
      ...document.querySelectorAll('[data-e2e="user-post-item"] a[href*="/video/"]'),
    ];
    if (items.length > 0) return items;
    // fallback: dowolne linki do wideo na stronie
    return [...document.querySelectorAll('a[href*="/video/"]')];
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
