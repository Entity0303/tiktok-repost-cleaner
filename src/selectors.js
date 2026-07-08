// selectors.js — JEDYNE miejsce z selektorami DOM.
//
// KONWENCJA (patrz CLAUDE.md):
//  - Klasy CSS TikToka są zaciemnione (np. "css-1abcde-DivWrapper") i zmieniają się
//    po każdym deployu, dlatego NIE opieramy się na nich jako na źródle prawdy.
//  - Celujemy w tekst widoczny dla użytkownika oraz atrybuty aria-label / data-e2e,
//    które są znacznie stabilniejsze.
//  - Każdy selektor ma listę fallbacków — próbujemy po kolei, aż coś zadziała.
//  - Po zmianie layoutu TikToka naprawiamy WYŁĄCZNIE ten plik.
//
// Format: tablica strategii. Strategia to obiekt opisujący, JAK znaleźć element.
// Interpretacją tych strategii zajmują się helpery z dom.js (TODO).

// Teksty przycisków w różnych językach UI TikToka (do dopasowania po treści).
// TODO: uzupełnić o realne warianty zaobserwowane w DOM.
export const TEXT = {
  repost: ['Repost', 'Repostuj', 'Reposted', 'Repostowano'],
  removeRepost: ['Remove repost', 'Usuń repost', 'Undo repost', 'Cofnij repost'],
  confirm: ['Remove', 'Usuń', 'Confirm', 'Potwierdź'],
  cancel: ['Cancel', 'Anuluj'],
};

// Selektory kafelków repostów na siatce profilu.
// TODO: zweryfikować data-e2e / aria-label w realnym DOM.
export const REPOST_ITEM = [
  { by: 'attr', attr: 'data-e2e', value: 'user-post-item' },
  // fallback: kafelek zawierający ikonę/etykietę „Reposted”
  // { by: 'containsText', text: TEXT.repost },
];

// Menu akcji na kafelku (np. „...”) — otwiera opcje repostu.
// TODO: uzupełnić realne aria-label.
export const ITEM_ACTIONS_MENU = [
  { by: 'ariaLabel', value: ['More', 'Więcej', 'Actions', 'Akcje'] },
];

// Przycisk usuwający repost (po otwarciu menu / karty wideo).
export const REMOVE_REPOST_BUTTON = [
  { by: 'containsText', text: TEXT.removeRepost },
  { by: 'ariaLabel', value: TEXT.removeRepost },
];

// Przycisk potwierdzenia w modalu.
export const CONFIRM_BUTTON = [
  { by: 'containsText', text: TEXT.confirm },
];

// Zakładka „Reposts” na profilu użytkownika (jeśli reposty są w osobnej zakładce).
export const REPOSTS_TAB = [
  { by: 'attr', attr: 'data-e2e', value: 'repost-tab' },
  { by: 'containsText', text: TEXT.repost },
];
