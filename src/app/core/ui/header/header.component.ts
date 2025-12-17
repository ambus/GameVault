import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { toSignal as toSignalRxjs } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { filter, map } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

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

  menuToggle = output<void>();
  isDarkMode = signal(true);

  readonly user = this.authService.user;
  readonly userEmail = computed(() => this.user()?.email || '');

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

  onMenuClick(): void {
    this.menuToggle.emit();
  }

  toggleTheme(): void {
    this.isDarkMode.update((value) => !value);
  }

  onAvatarClick(): void {
    // Placeholder dla obsługi kliknięcia avatara
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
  }
}

