/**
 * Narzędzia do bezpiecznej obsługi dat kalendarzowych w aplikacji.
 * Eliminuje problemy przesunięć stref czasowych (np. UTC+1 / UTC+2)
 * związane z użyciem `toISOString()` oraz `new Date('YYYY-MM-DD')`.
 */

/**
 * Konwertuje obiekt Date na ciąg znaków w formacie 'YYYY-MM-DD'
 * na podstawie lokalnych składowych daty użytkownika (rok, miesiąc, dzień).
 */
export function formatDateToIsoDate(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Bezpiecznie parsuje ciąg daty (np. 'YYYY-MM-DD') lub obiekt Date
 * na lokalny obiekt Date (godzina 00:00:00 w strefie lokalnej przeglądarki).
 *
 * Zapobiega interpretacji 'YYYY-MM-DD' jako północy UTC, która w strefach
 * o ujemnym offsecie lub przy konwersji do czasu lokalnego cofa dzień.
 */
export function parseIsoDateToLocalDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    // Dopasowanie standardowego formatu YYYY-MM-DD
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]) - 1;
      const day = Number(match[3]);
      const localDate = new Date(year, month, day);
      return isNaN(localDate.getTime()) ? null : localDate;
    }

    // Fallback dla innych formatów ISO lub ciągów z czasem
    const fallbackDate = new Date(trimmed);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
  }

  if (typeof value === 'number') {
    const numDate = new Date(value);
    return isNaN(numDate.getTime()) ? null : numDate;
  }

  return null;
}

/**
 * Formatuje datę do czytelnego formatu tekstowego (np. '16 wrz 2026').
 */
export function formatDisplayDate(date: unknown, locale = 'pl-PL'): string {
  if (!date) {
    return '';
  }

  const dateObj = parseIsoDateToLocalDate(date);
  if (!dateObj) {
    return String(date);
  }

  try {
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(date);
  }
}

/**
 * Formatuje datę do formatu numerycznego 'DD.MM.YYYY' (np. '16.09.2026').
 */
export function formatDisplayDateNumeric(date: unknown): string {
  if (!date) {
    return '';
  }

  const dateObj = parseIsoDateToLocalDate(date);
  if (!dateObj) {
    return String(date);
  }

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Zwraca klucz 'YYYY-MM' z daty (string lub Date) w sposób odporny na strefy czasowe.
 */
export function getYearMonthKey(date: unknown): string | null {
  if (!date) {
    return null;
  }

  if (typeof date === 'string') {
    const trimmed = date.trim();
    const match = /^(\d{4})-(\d{2})/.exec(trimmed);
    if (match) {
      return match[0];
    }
  }

  const dateObj = parseIsoDateToLocalDate(date);
  if (!dateObj) {
    return null;
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Zwraca rok 'YYYY' z daty (string lub Date) w sposób odporny na strefy czasowe.
 */
export function getYearKey(date: unknown): string | null {
  if (!date) {
    return null;
  }

  if (typeof date === 'string') {
    const trimmed = date.trim();
    const match = /^(\d{4})/.exec(trimmed);
    if (match) {
      return match[0];
    }
  }

  const dateObj = parseIsoDateToLocalDate(date);
  if (!dateObj) {
    return null;
  }

  return String(dateObj.getFullYear());
}
