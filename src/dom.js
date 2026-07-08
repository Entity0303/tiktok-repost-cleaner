// dom.js — helpery DOM oraz narzędzia czasowe (opóźnienia, losowość).
//
// Wszystkie funkcje operujące na DOM przyjmują strategie selektorów z selectors.js.
// Tu NIE trzymamy żadnych selektorów na sztywno.

// Zwraca liczbę całkowitą z przedziału [min, max] (włącznie).
export function rand(min, max) {
  // TODO: właściwa implementacja
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Usypia na podaną liczbę milisekund.
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Losowe opóźnienie z przedziału [minMs, maxMs] — do stosowania między akcjami.
export function randomDelay(minMs, maxMs) {
  return sleep(rand(minMs, maxMs));
}

// Czeka aż spełniony zostanie warunek (np. pojawienie się elementu) albo minie timeout.
// TODO: implementacja z MutationObserver / pollingiem.
export async function waitFor(predicate, { timeoutMs = 10000, intervalMs = 200 } = {}) {
  void predicate;
  void timeoutMs;
  void intervalMs;
  return null;
}

// Znajduje element po widocznym tekście (z uwzględnieniem listy wariantów językowych).
// TODO: implementacja — przeszukanie drzewa, dopasowanie tekstu, filtr widoczności.
export function findByText(texts, { root = document, exact = false } = {}) {
  void texts;
  void root;
  void exact;
  return null;
}

// Znajduje pierwszy element pasujący do listy strategii selektorów (z fallbackami).
// TODO: implementacja interpretera strategii z selectors.js.
export function findByStrategies(strategies, { root = document } = {}) {
  void strategies;
  void root;
  return null;
}

// Bezpieczny klik (sprawdza widoczność, przewija do elementu). TODO: implementacja.
export function click(el) {
  void el;
}
