// config.js — domyślne ustawienia + trwały zapis przez GM_getValue / GM_setValue.
//
// WAŻNE: tryb DRY-RUN jest DOMYŚLNIE WŁĄCZONY. W tym trybie skrypt jedynie
// symuluje działania (loguje, co BY zrobił), ale NIC nie usuwa. Wyłączenie
// dry-run musi być świadomą decyzją użytkownika w panelu.

const STORAGE_KEY = 'trc:config';

// Domyślna konfiguracja. Opóźnienia są losowane z przedziału [minDelay, maxDelay]
// między kolejnymi akcjami, żeby zachowanie było mniej robotyczne.
export const DEFAULT_CONFIG = {
  dryRun: true, // DOMYŚLNIE ON — nic nie jest usuwane
  max: 40, // maksymalna liczba repostów do usunięcia w jednym przebiegu; 0 = bez limitu
  minDelay: 1500, // dolna granica losowego opóźnienia między akcjami [ms]
  maxDelay: 3500, // górna granica losowego opóźnienia między akcjami [ms]
};

// JEDEN współdzielony, mutowalny obiekt konfiguracji. Ten sam referencyjnie
// obiekt trafia do panelu i do silnika — panel mutuje jego pola, a silnik
// czyta je NA BIEŻĄCO (m.in. dryRun per-akcja). Nie rozdawaj kopii.
export const config = { ...DEFAULT_CONFIG };

// Wczytuje zapis z GM i scala go do współdzielonego obiektu `config`, uzupełniając
// brakujące pola z DEFAULT_CONFIG (stary zapis bez nowego pola nie wywali skryptu).
// Zwraca TEN SAM obiekt `config` (mutacja w miejscu, nie nowa referencja).
export function loadConfig() {
  const saved = GM_getValue(STORAGE_KEY, null);
  // Kolejność scalania: najpierw domyślne (fallback braków), potem zapisane wartości.
  Object.assign(config, DEFAULT_CONFIG, saved ?? {});
  return config;
}

// Zapisuje konfigurację na stałe (domyślnie współdzielony `config`).
export function saveConfig(cfg = config) {
  // TODO: walidacja przed zapisem (zakresy opóźnień, max >= 0)
  GM_setValue(STORAGE_KEY, cfg);
}
