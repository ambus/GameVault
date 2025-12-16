import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
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
  sidebarVisible = signal(false);

  toggleSidebar(): void {
    this.sidebarVisible.update((v) => !v);
  }
}

