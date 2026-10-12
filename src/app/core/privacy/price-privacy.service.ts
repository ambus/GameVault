import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

const INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel', 'scroll'];

/**
 * Ukrywa prawdziwe kwoty wydatków. Domyślnie wszystkie ceny są pokazywane jako 0 zł,
 * dopiero po kliknięciu ukrytego przycisku (tytuł aplikacji w nagłówku) widać prawdziwe wartości.
 * Stan trzymany wyłącznie w pamięci — po odświeżeniu strony ceny znów są ukryte.
 * Po 2 minutach braku aktywności ceny są automatycznie ponownie ukrywane.
 */
@Injectable({ providedIn: 'root' })
export class PricePrivacyService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly revealed = signal(false);
  private inactivityTimer: ReturnType<typeof setTimeout> | null = null;

  readonly pricesRevealed = this.revealed.asReadonly();

  private readonly onActivity = () => this.restartInactivityTimer();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopInactivityWatch());
  }

  toggle(): void {
    if (this.revealed()) {
      this.hide();
    } else {
      this.reveal();
    }
  }

  mask(price: number | null | undefined): number | null | undefined {
    if (price === null || price === undefined) return price;
    return this.revealed() ? price : 0;
  }

  private reveal(): void {
    this.revealed.set(true);
    this.startInactivityWatch();
  }

  private hide(): void {
    this.revealed.set(false);
    this.stopInactivityWatch();
  }

  private startInactivityWatch(): void {
    if (!this.isBrowser) return;
    // capture: true — scroll wewnętrznych kontenerów nie propaguje się do dokumentu
    ACTIVITY_EVENTS.forEach((event) =>
      this.document.addEventListener(event, this.onActivity, { capture: true, passive: true }),
    );
    this.restartInactivityTimer();
  }

  private stopInactivityWatch(): void {
    if (!this.isBrowser) return;
    ACTIVITY_EVENTS.forEach((event) =>
      this.document.removeEventListener(event, this.onActivity, { capture: true }),
    );
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  private restartInactivityTimer(): void {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(() => this.hide(), INACTIVITY_TIMEOUT_MS);
  }
}
