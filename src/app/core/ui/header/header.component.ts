import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { toSignal as toSignalRxjs } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { filter, map } from 'rxjs';
import { GamesStore } from '../../../features/games/games.store';
import { AuthService } from '../../auth/auth.service';
import { PricePrivacyService } from '../../privacy/price-privacy.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [AvatarModule, ButtonModule, SkeletonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly gamesStore = inject(GamesStore);
  private readonly pricePrivacy = inject(PricePrivacyService);

  menuToggle = output<void>();
  isDarkMode = signal(true);

  readonly user = this.authService.user;
  readonly userEmail = computed(() => this.user()?.email || '');
  readonly searchQuery = computed(() => this.gamesStore.query());

  private readonly currentUrl = toSignalRxjs(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  readonly isSearchDisabled = computed(() => {
    const url = this.currentUrl();
    // Wyłącz wyszukiwanie na stronach formularza (new lub :id)
    return url?.includes('/games/new') || /\/games\/[^/]+$/.test(url || '');
  });

  // Ukryty przełącznik: kliknięcie tytułu odsłania / ukrywa prawdziwe ceny
  onTitleClick(): void {
    this.pricePrivacy.toggle();
  }

  onMenuClick(): void {
    this.menuToggle.emit();
  }

  toggleTheme(): void {
    this.isDarkMode.update((value) => !value);
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.gamesStore.setQuery(target.value);
  }
}

