import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { GameCardComponent } from '../game-card/game-card.component';
import { GamesStore } from '../games.store';
import { Game } from '../games.types';

@Component({
  standalone: true,
  selector: 'app-games-list',
  imports: [GameCardComponent, SelectModule, ButtonModule, FormsModule],
  templateUrl: './games-list.component.html',
  styleUrl: './games-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GamesListComponent {
  private readonly store = inject(GamesStore);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  games = input<Game[] | null>(null);
  gameSelected = output<Game>();

  readonly loading = computed(() => this.store.loading());

  readonly displayedGames = computed(() => {
    // Zawsze używamy filteredGames z store, który uwzględnia filtry i wyszukiwanie
    this.store.filters(); // Zależność od filters dla reaktywności
    return this.store.filteredGames();
  });

  readonly placeholderCards = computed(() => Array(12).fill(null));

  readonly currentFilters = computed(() => this.store.filters());

  readonly genreOptions = [
    { label: 'Wszystkie gatunki', value: null },
    { label: 'RPG', value: 'RPG' },
    { label: 'FPS', value: 'FPS' },
    { label: 'Strategia', value: 'Strategy' }
  ];

  readonly platformOptions = [
    { label: 'Wszystkie platformy', value: null },
    { label: 'PC', value: 'PC' },
    { label: 'Mac', value: 'Mac' },
    { label: 'Nintendo Switch', value: 'Nintendo Switch' },
    { label: 'Nintendo Switch 2', value: 'Nintendo Switch 2' }
  ];

  readonly selectedGenre = computed(() => this.currentFilters().genre || null);
  readonly selectedPlatform = computed(() => this.currentFilters().platform || null);

  // Wartości dla ngModel z p-select (nie signals, bo ngModel wymaga zwykłych właściwości)
  selectedGenreValue: string | null = null;
  selectedPlatformValue: string | null = null;

  constructor() {
    // Synchronizacja wartości z store do właściwości (tylko w jedną stronę)
    effect(() => {
      const genre = this.currentFilters().genre;
      const currentValue = this.selectedGenreValue;
      if (currentValue !== (genre || null)) {
        this.selectedGenreValue = genre || null;
        this.cdr.markForCheck();
      }
    });

    effect(() => {
      const platform = this.currentFilters().platform;
      const currentValue = this.selectedPlatformValue;
      if (currentValue !== (platform || null)) {
        this.selectedPlatformValue = platform || null;
        this.cdr.markForCheck();
      }
    });
  }

  onGenreChange(genre: unknown): void {
    const genreValue = genre as string | null | undefined;
    // ngModel już zaktualizował selectedGenreValue, więc tylko aktualizujemy store
    const currentFilters = this.store.filters();
    const newFilters: { genre?: string; platform?: string } = { ...currentFilters };
    
    if (genreValue === null || genreValue === undefined) {
      delete newFilters.genre;
    } else {
      newFilters.genre = genreValue;
    }
    
    this.store.setFilters(newFilters);
    this.cdr.markForCheck();
  }

  onPlatformChange(platform: unknown): void {
    const platformValue = platform as string | null | undefined;
    // ngModel już zaktualizował selectedPlatformValue, więc tylko aktualizujemy store
    const currentFilters = this.store.filters();
    const newFilters: { genre?: string; platform?: string } = { ...currentFilters };
    
    if (platformValue === null || platformValue === undefined) {
      delete newFilters.platform;
    } else {
      newFilters.platform = platformValue;
    }
    
    this.store.setFilters(newFilters);
    this.cdr.markForCheck();
  }

  onRowClick(game: Game): void {
    this.store.select(game.id);
    this.gameSelected.emit(game);
    this.router.navigate(['/games', game.id]);
  }


  clearFilters(): void {
    this.store.setFilters({});
  }

  readonly hasActiveFilters = computed(() => {
    const filters = this.currentFilters();
    return !!(filters.genre || filters.platform);
  });
}


