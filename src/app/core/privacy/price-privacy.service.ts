import { Injectable, signal } from '@angular/core';

/**
 * Ukrywa prawdziwe kwoty wydatków. Domyślnie wszystkie ceny są pokazywane jako 0 zł,
 * dopiero po kliknięciu ukrytego przycisku (tytuł aplikacji w nagłówku) widać prawdziwe wartości.
 * Stan trzymany wyłącznie w pamięci — po odświeżeniu strony ceny znów są ukryte.
 */
@Injectable({ providedIn: 'root' })
export class PricePrivacyService {
  private readonly revealed = signal(false);

  readonly pricesRevealed = this.revealed.asReadonly();

  toggle(): void {
    this.revealed.update((value) => !value);
  }

  mask(price: number | null | undefined): number | null | undefined {
    if (price === null || price === undefined) return price;
    return this.revealed() ? price : 0;
  }
}
