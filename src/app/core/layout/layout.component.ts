import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { filter, map } from 'rxjs';
import { HeaderComponent } from '../ui/header/header.component';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, HeaderComponent, ButtonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent {
  private readonly router = inject(Router);
  
  sidebarVisible = signal(false);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  readonly showAddButton = computed(() => {
    const url = this.currentUrl();
    // Przycisk widoczny tylko na stronie głównej listy gier (/games bez /new ani /:id)
    return url === '/games' || url === '/games/';
  });

  toggleSidebar(): void {
    this.sidebarVisible.update((v) => !v);
  }
}

