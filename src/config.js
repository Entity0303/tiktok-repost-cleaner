// config.js — domyślne ustawienia + trwały zapis.
//
// WAŻNE: tryb DRY-RUN jest DOMYŚLNIE WŁĄCZONY. W tym trybie skrypt jedynie
// symuluje działania (loguje, co BY zrobił), ale NIC nie usuwa. Wyłączenie
// dry-run musi być świadomą decyzją użytkownika w panelu.
//
// TRWAŁOŚĆ: w Tampermonkey używamy GM_getValue/GM_setValue (jak deklaruje @grant).
// Poza Tampermonkey (np. gołe uruchomienie w konsoli) GM_* nie istnieją — wtedy
// spadamy na localStorage, a gdyby i on był niedostępny — na zmienną w pamięci.

const GM_KEY = 'trc:config'; // klucz w magazynie Tampermonkey (GM_*)
const LS_KEY = 'trc_config'; // klucz w localStorage (fallback bez GM)

// Detekcja przez typeof — samo odwołanie do GM_* bez tego rzucałoby ReferenceError
// w środowisku bez Tampermonkey.
const hasGM = typeof GM_getValue === 'function' && typeof GM_setValue === 'function';

// Ostateczny fallback: kopia zapisu w pamięci modułu (gdy brak GM i localStorage).
let memoryStore = null;

// Wewnętrzny helper storage — jedno miejsce, które wie, gdzie fizycznie czytać/pisać.
const storage = {
  // Zwraca zapisany obiekt konfiguracji albo null, gdy nic nie zapisano.
  read() {
    if (hasGM) return GM_getValue(GM_KEY, null);
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw != null) return JSON.parse(raw);
    } catch {
      // localStorage niedostępny/rzuca (np. tryb prywatny) — spadamy na pamięć.
    }
    return memoryStore;
  },
  // Zapisuje obiekt konfiguracji trwale (na ile pozwala środowisko).
  write(value) {
    memoryStore = value; // zawsze trzymaj kopię w pamięci jako ostateczny fallback
    if (hasGM) {
      GM_setValue(GM_KEY, value);
      return;
    }
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(value));
    } catch {
      // Zostaje wersja w pamięci (memoryStore) — nic więcej nie zrobimy.
    }
  },
};

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

// Wczytuje zapis przez helper storage i scala go do współdzielonego obiektu `config`,
// uzupełniając brakujące pola z DEFAULT_CONFIG (stary zapis bez nowego pola nie wywali
// skryptu). Zwraca TEN SAM obiekt `config` (mutacja w miejscu, nie nowa referencja).
export function loadConfig() {
  const saved = storage.read();
  // Kolejność scalania: najpierw domyślne (fallback braków), potem zapisane wartości.
  Object.assign(config, DEFAULT_CONFIG, saved ?? {});
  return config;
}

// Zapisuje konfigurację na stałe (domyślnie współdzielony `config`) przez helper storage.
export function saveConfig(cfg = config) {
  // TODO: walidacja przed zapisem (zakresy opóźnień, max >= 0)
  storage.write(cfg);
}
