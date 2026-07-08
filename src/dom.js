// dom.js — helpery DOM oraz narzędzia czasowe (opóźnienia, losowość).
//
// Tu NIE trzymamy żadnych selektorów — te są wyłącznie w selectors.js.

// Zwraca liczbę całkowitą z przedziału [a, b] (włącznie).
export function rand(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

// Usypia na podaną liczbę milisekund.
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Losowa pauza z przedziału [min, max] ms — do stosowania między akcjami,
// żeby tempo działania nie było robotyczne (patrz CLAUDE.md).
export function pause(min, max) {
  return sleep(rand(min, max));
}

// Czeka, aż fn() zwróci wartość prawdziwą (np. element), odpytując co `step` ms.
// Zwraca tę wartość albo null po przekroczeniu `timeout`.
export async function waitFor(fn, timeout = 8000, step = 200) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    let result;
    try {
      result = fn();
    } catch {
      result = null; // błąd w predykacie traktujemy jak brak wyniku i próbujemy dalej
    }
    if (result) return result;
    await sleep(step);
  }
  return null;
}

// Bezpieczny klik: przewija element na środek widoku, po czym klika.
// Zwraca true, gdy było w co kliknąć.
export function clickSafe(el) {
  if (!el) return false;
  el.scrollIntoView({ block: 'center', inline: 'center' });
  el.click();
  return true;
}
