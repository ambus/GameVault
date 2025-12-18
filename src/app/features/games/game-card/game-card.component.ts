import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';
import { Game } from '../games.types';

@Component({
  selector: 'app-game-card',
  imports: [CardModule, SkeletonModule, Tooltip],
  templateUrl: './game-card.component.html',
  styleUrl: './game-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameCardComponent {
  game = input<Game | null>(null);
  cardClick = output<Game>();

  onCardClick(): void {
    const game = this.game();
    if (game) {
      this.cardClick.emit(game);
    }
  }

  getPlatformIcon(platform: unknown): string {
    const platformStr = String(platform || '').toLowerCase();
    const iconMap: Record<string, string> = {
      'pc': 'pi pi-desktop',
      'mac': 'pi pi-apple',
      'nintendo switch': 'pi pi-gamepad',
      'nintendo switch 2': 'pi pi-gamepad',
      'playstation': 'pi pi-play',
      'xbox': 'pi pi-microsoft',
      'mobile': 'pi pi-mobile'
    };
    return iconMap[platformStr] || 'pi pi-desktop';
  }

  getVersionIcon(version: unknown): string {
    const versionStr = String(version || '').toLowerCase();
    const iconMap: Record<string, string> = {
      'box_disc': 'pi pi-circle',
      'box_cartridge': 'pi pi-box',
      'box_code': 'pi pi-ticket',
      'digital': 'pi pi-cloud'
    };
    return iconMap[versionStr] || 'pi pi-circle';
  }

  getPlatformLabel(platform: unknown): string {
    return String(platform || 'Nieznana platforma');
  }

  getVersionLabel(version: unknown): string {
    const versionStr = String(version || '');
    const labelMap: Record<string, string> = {
      'box_disc': 'Pudełko płyta',
      'box_cartridge': 'Pudełko kartridź',
      'box_code': 'Pudełko - kod',
      'digital': 'Cyfrowa'
    };
    return labelMap[versionStr] || versionStr;
  }

  getStatusLabel(status: unknown): string {
    const statusStr = String(status || '');
    const labelMap: Record<string, string> = {
      'wishlist': 'Lista życzeń',
      'preordered': 'Zamówiony Preorder',
      'ready_to_play': 'Gotowa do grania',
      'in_progress': 'W trakcie',
      'completed': 'Ukończona',
      'on_hold': 'Wstrzymana',
      'not_completed': 'Nie ukończona'
    };
    return labelMap[statusStr] || statusStr;
  }

  formatDate(date: unknown): string {
    if (!date) {
      return '';
    }
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date as Date;
      if (isNaN(dateObj.getTime())) {
        return String(date);
      }
      return dateObj.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return String(date);
    }
  }

  getImageUrl(value: unknown): string {
    if (!value || typeof value !== 'string') {
      return '';
    }
    
    // Sprawdź czy to URL
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//')) {
      return value;
    }
    
    // Sprawdź czy to Base64
    if (value.startsWith('data:image')) {
      return value;
    }
    
    return value;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  getTags(tags: unknown): string[] {
    if (!tags) {
      return [];
    }
    return Array.isArray(tags) ? tags : [tags as string];
  }
}

