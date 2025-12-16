import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  menuToggle = output<void>();

  onMenuClick(): void {
    this.menuToggle.emit();
  }
}

