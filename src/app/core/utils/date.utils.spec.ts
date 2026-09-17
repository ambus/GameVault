import {
  formatDateToIsoDate,
  formatDisplayDate,
  formatDisplayDateNumeric,
  getYearKey,
  getYearMonthKey,
  parseIsoDateToLocalDate,
} from './date.utils';

describe('date.utils', () => {
  describe('formatDateToIsoDate', () => {
    it('powinien poprawnie sformatować obiekt Date do formatu YYYY-MM-DD na podstawie lokalnych składowych', () => {
      // 16 września 2026
      const date = new Date(2026, 8, 16, 0, 0, 0);
      expect(formatDateToIsoDate(date)).toBe('2026-09-16');
    });

    it('powinien uzupełniać jednocyfrowe miesiące i dni zerami wiodącymi', () => {
      // 5 stycznia 2026
      const date = new Date(2026, 0, 5, 0, 0, 0);
      expect(formatDateToIsoDate(date)).toBe('2026-01-05');
    });

    it('powinien poprawnie obsłużyć przełom roku', () => {
      const date = new Date(2026, 11, 31, 23, 59, 59);
      expect(formatDateToIsoDate(date)).toBe('2026-12-31');
    });

    it('powinien zwrócić pusty ciąg dla niepoprawnej daty', () => {
      const invalidDate = new Date('nie-data');
      expect(formatDateToIsoDate(invalidDate)).toBe('');
    });
  });

  describe('parseIsoDateToLocalDate', () => {
    it('powinien sparsować YYYY-MM-DD do lokalnej północy z zachowaniem roku, miesiąca i dnia', () => {
      const parsed = parseIsoDateToLocalDate('2026-09-16');
      expect(parsed).not.toBeNull();
      expect(parsed!.getFullYear()).toBe(2026);
      expect(parsed!.getMonth()).toBe(8); // Wrzesień = 8
      expect(parsed!.getDate()).toBe(16);
      expect(parsed!.getHours()).toBe(0);
      expect(parsed!.getMinutes()).toBe(0);
    });

    it('powinien poprawnie obsłużyć pierwszy i ostatni dzień miesiąca', () => {
      const first = parseIsoDateToLocalDate('2026-01-01');
      expect(first!.getFullYear()).toBe(2026);
      expect(first!.getMonth()).toBe(0);
      expect(first!.getDate()).toBe(1);

      const last = parseIsoDateToLocalDate('2026-12-31');
      expect(last!.getFullYear()).toBe(2026);
      expect(last!.getMonth()).toBe(11);
      expect(last!.getDate()).toBe(31);
    });

    it('powinien zwrócić ten sam obiekt jeśli przekazano instancję Date', () => {
      const date = new Date(2026, 8, 16);
      expect(parseIsoDateToLocalDate(date)).toBe(date);
    });

    it('powinien zwrócić null dla pustych lub niepoprawnych wartości', () => {
      expect(parseIsoDateToLocalDate(null)).toBeNull();
      expect(parseIsoDateToLocalDate(undefined)).toBeNull();
      expect(parseIsoDateToLocalDate('')).toBeNull();
      expect(parseIsoDateToLocalDate('   ')).toBeNull();
      expect(parseIsoDateToLocalDate('niepoprawna-data')).toBeNull();
    });
  });

  describe('Round-trip (parse -> format)', () => {
    it('powinien zachować identyczny ciąg znaków po sparsowaniu i ponownym sformatowaniu', () => {
      const input = '2026-09-16';
      const parsed = parseIsoDateToLocalDate(input);
      expect(parsed).not.toBeNull();
      const output = formatDateToIsoDate(parsed!);
      expect(output).toBe(input);
    });

    it('powinien zachować daty na przełomie miesięcy bez cofania o 1 dzień', () => {
      const dates = ['2026-01-01', '2026-02-28', '2026-03-01', '2026-09-16', '2026-12-31'];
      for (const d of dates) {
        const parsed = parseIsoDateToLocalDate(d);
        expect(formatDateToIsoDate(parsed!)).toBe(d);
      }
    });
  });

  describe('formatDisplayDate', () => {
    it('powinien poprawnie sformatować datę po polsku', () => {
      const result = formatDisplayDate('2026-09-16');
      expect(result).toContain('16');
      expect(result).toContain('wrz');
      expect(result).toContain('2026');
    });

    it('powinien zwrócić pusty ciąg dla pustych wartości', () => {
      expect(formatDisplayDate(null)).toBe('');
      expect(formatDisplayDate(undefined)).toBe('');
      expect(formatDisplayDate('')).toBe('');
    });
  });

  describe('formatDisplayDateNumeric', () => {
    it('powinien poprawnie sformatować datę do formatu DD.MM.YYYY', () => {
      expect(formatDisplayDateNumeric('2026-09-16')).toBe('16.09.2026');
      expect(formatDisplayDateNumeric('2026-01-05')).toBe('05.01.2026');
    });

    it('powinien zwrócić pusty ciąg dla braku daty', () => {
      expect(formatDisplayDateNumeric(null)).toBe('');
    });
  });

  describe('getYearMonthKey', () => {
    it('powinien wyodrębnić YYYY-MM z ciągu znaków bez przesunięcia', () => {
      expect(getYearMonthKey('2026-09-16')).toBe('2026-09');
      expect(getYearMonthKey('2026-01-01')).toBe('2026-01');
      expect(getYearMonthKey('2026-12-31')).toBe('2026-12');
    });

    it('powinien wyodrębnić YYYY-MM z obiektu Date', () => {
      const date = new Date(2026, 8, 1);
      expect(getYearMonthKey(date)).toBe('2026-09');
    });

    it('powinien zwrócić null dla braku wartości', () => {
      expect(getYearMonthKey(null)).toBeNull();
      expect(getYearMonthKey('')).toBeNull();
    });
  });

  describe('getYearKey', () => {
    it('powinien wyodrębnić YYYY z ciągu znaków lub obiektu Date', () => {
      expect(getYearKey('2026-09-16')).toBe('2026');
      expect(getYearKey(new Date(2026, 0, 1))).toBe('2026');
    });

    it('powinien zwrócić null dla braku wartości', () => {
      expect(getYearKey(null)).toBeNull();
    });
  });
});
