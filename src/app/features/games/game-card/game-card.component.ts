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

  getPlatformIcon(platform: unknown): string | null {
    if (!platform) {
      return 'pi pi-desktop';
    }
    
    const platformStr = String(platform).toLowerCase().trim();
    
    // Sprawdź czy to Nintendo Switch - zwróć null, żeby użyć SVG
    if (platformStr === 'nintendo switch' || platformStr === 'ns') {
      return null; // Zwróć null, żeby użyć SVG w template
    }
    
    if (platformStr === 'nintendo switch 2' || platformStr === 'ns2') {
      return null; // Zwróć null, żeby użyć SVG w template
    }
    
    const iconMap: Record<string, string> = {
      'pc': 'pi pi-desktop',
      'mac': 'pi pi-apple',
      'playstation': 'pi pi-play',
      'xbox': 'pi pi-microsoft',
      'mobile': 'pi pi-mobile'
    };
    
    return iconMap[platformStr] || 'pi pi-desktop';
  }

  isNintendoSwitch(platform: unknown): boolean {
    if (!platform) {
      return false;
    }
    const platformStr = String(platform).toLowerCase().trim();
    return platformStr === 'nintendo switch' || platformStr === 'ns';
  }

  isNintendoSwitch2(platform: unknown): boolean {
    if (!platform) {
      return false;
    }
    const platformStr = String(platform).toLowerCase().trim();
    return platformStr === 'nintendo switch 2' || platformStr === 'ns2';
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
    
    const trimmedValue = value.trim();
    
    // Sprawdź czy to URL (http://, https://, //)
    if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://') || trimmedValue.startsWith('//')) {
      return trimmedValue;
    }
    
    // Sprawdź czy to Base64
    if (trimmedValue.startsWith('data:image')) {
      return trimmedValue;
    }
    
    // Jeśli zaczyna się od base64 bez prefiksu, dodaj prefiks
    if (trimmedValue.startsWith('/9j/') || trimmedValue.startsWith('iVBORw0KGgo')) {
      // JPEG lub PNG w Base64
      const mimeType = trimmedValue.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
      return `data:${mimeType};base64,${trimmedValue}`;
    }
    
    // Jeśli nie pasuje do żadnego wzorca, zwróć pusty string (zamiast nieprawidłowej wartości)
    return '';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Ukryj obraz i pokaż placeholder lub komunikat błędu
    img.style.display = 'none';
    // Opcjonalnie: można dodać placeholder
    const parent = img.parentElement;
    if (parent && !parent.querySelector('.image-error-placeholder')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'image-error-placeholder';
      placeholder.textContent = 'Błąd ładowania obrazu';
      placeholder.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; color: rgba(255, 255, 255, 0.5); font-size: 0.875rem;';
      parent.appendChild(placeholder);
    }
  }

  getTags(tags: unknown): string[] {
    if (!tags) {
      return [];
    }
    return Array.isArray(tags) ? tags : [tags as string];
  }
}

