import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [AvatarModule, SkeletonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  menuToggle = output<void>();
  isDarkMode = signal(true);

  onMenuClick(): void {
    this.menuToggle.emit();
  }

  toggleTheme(): void {
    this.isDarkMode.update((value) => !value);
  }

  onAvatarClick(): void {
    // Placeholder dla obsługi kliknięcia avatara
  }
}

