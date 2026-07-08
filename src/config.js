// config.js — domyślne ustawienia + trwały zapis przez GM_getValue / GM_setValue.
//
// WAŻNE: tryb DRY-RUN jest DOMYŚLNIE WŁĄCZONY. W tym trybie skrypt jedynie
// symuluje działania (loguje, co BY zrobił), ale NIC nie usuwa. Wyłączenie
// dry-run musi być świadomą decyzją użytkownika w panelu.

const STORAGE_KEY = 'trc:config';

// Domyślna konfiguracja. Opóźnienia są losowane z przedziału [delayMinMs, delayMaxMs]
// między kolejnymi akcjami, żeby zachowanie było mniej robotyczne.
export const DEFAULT_CONFIG = {
  dryRun: true, // DOMYŚLNIE ON — nic nie jest usuwane
  limit: 0, // maksymalna liczba repostów do usunięcia w jednym przebiegu; 0 = bez limitu
  delayMinMs: 800, // dolna granica losowego opóźnienia między akcjami
  delayMaxMs: 2500, // górna granica losowego opóźnienia między akcjami
};

// Wczytuje konfigurację, scalając zapisane wartości z domyślnymi.
export function loadConfig() {
  // TODO: walidacja i migracja starszych zapisów
  const saved = GM_getValue(STORAGE_KEY, null);
  return { ...DEFAULT_CONFIG, ...(saved ?? {}) };
}

// Zapisuje konfigurację na stałe.
export function saveConfig(config) {
  // TODO: walidacja przed zapisem (zakresy opóźnień, limit >= 0)
  GM_setValue(STORAGE_KEY, config);
}
