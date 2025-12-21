import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { GamesService } from './games.service';
import { Game } from './games.types';

@Injectable({ providedIn: 'root' })
export class GamesStore {
  private readonly api = inject(GamesService);

  readonly games = signal<Game[]>([]);
  readonly loading = signal(false);
  readonly selectedId = signal<string | null>(null);
  readonly query = signal('');
  readonly filters = signal<{ 
    genre?: string; 
    platform?: string;
    rating?: number;
    isBorrowed?: boolean;
    status?: string;
    tags?: string[];
  }>({});
  readonly sortBy = signal<{ field: string; direction: 'asc' | 'desc' }>({ field: 'purchaseDate', direction: 'desc' });

  readonly selectedGame: Signal<Game | null> = computed(() => {
    const id = this.selectedId();
    return this.games().find((g) => g.id === id) ?? null;
  });

  readonly filteredGames: Signal<Game[]> = computed(() => {
    const q = this.query().toLowerCase();
    const { genre, platform, rating, isBorrowed, status, tags } = this.filters();
    const { field, direction } = this.sortBy();
    
    const filtered = this.games().filter((g) => {
      const name = String(g['name'] ?? '').toLowerCase();
      const description = String(g['description'] ?? '').toLowerCase();
      const gameGenre = String(g['genre'] ?? '').toLowerCase();
      const gamePlatform = String(g['platform'] ?? '');
      const gameRating = typeof g['rating'] === 'number' ? g['rating'] : null;
      const gameIsBorrowed = Boolean(g['isBorrowed']);
      const gameStatus = String(g['status'] ?? '');
      
      // Pobierz tagi z gry
      const gameTags = this.getGameTags(g['tags']);
      
      const matchesText =
        !q ||
        name.includes(q) ||
        description.includes(q) ||
        gameGenre.includes(q);
      const matchesGenre = !genre || gameGenre === genre.toLowerCase();
      const matchesPlatform = !platform || gamePlatform.toLowerCase() === platform.toLowerCase();
      const matchesRating = rating === undefined || (gameRating !== null && gameRating >= rating);
      const matchesIsBorrowed = isBorrowed === undefined || gameIsBorrowed === isBorrowed;
      const matchesStatus = !status || gameStatus === status;
      const matchesTags = !tags || tags.length === 0 || tags.every(tag => 
        gameTags.some(gameTag => gameTag.toLowerCase() === tag.toLowerCase())
      );
      
      return matchesText && matchesGenre && matchesPlatform && matchesRating && matchesIsBorrowed && matchesStatus && matchesTags;
    });

    // Sortowanie
    return this.sortGames(filtered, field, direction);
  });

  /**
   * Sortuje gry według wybranego pola i kierunku
   */
  private sortGames(games: Game[], field: string, direction: 'asc' | 'desc'): Game[] {
    const sorted = [...games];
    
    sorted.sort((a, b) => {
      let aValue: string | number | Date | null;
      let bValue: string | number | Date | null;
      
      switch (field) {
        case 'name':
          aValue = String(a['name'] ?? '').toLowerCase();
          bValue = String(b['name'] ?? '').toLowerCase();
          break;
        case 'purchaseDate':
          aValue = a['purchaseDate'] ? new Date(String(a['purchaseDate'])).getTime() : 0;
          bValue = b['purchaseDate'] ? new Date(String(b['purchaseDate'])).getTime() : 0;
          break;
        case 'completionDate':
          aValue = a['completionDate'] ? new Date(String(a['completionDate'])).getTime() : 0;
          bValue = b['completionDate'] ? new Date(String(b['completionDate'])).getTime() : 0;
          break;
        case 'rating':
          aValue = typeof a['rating'] === 'number' ? a['rating'] : 0;
          bValue = typeof b['rating'] === 'number' ? b['rating'] : 0;
          break;
        case 'status':
          aValue = String(a['status'] ?? '').toLowerCase();
          bValue = String(b['status'] ?? '').toLowerCase();
          break;
        case 'platform':
          aValue = String(a['platform'] ?? '').toLowerCase();
          bValue = String(b['platform'] ?? '').toLowerCase();
          break;
        default:
          aValue = String(a['name'] ?? '').toLowerCase();
          bValue = String(b['name'] ?? '').toLowerCase();
      }
      
      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return sorted;
  }

  /**
   * Konwertuje tagi z gry na tablicę stringów
   */
  private getGameTags(tags: unknown): string[] {
    if (!tags) {
      return [];
    }
    if (Array.isArray(tags)) {
      return tags.map(tag => String(tag));
    }
    if (typeof tags === 'string') {
      return tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    return [];
  }

  /**
   * Pobiera wszystkie unikalne tagi z wszystkich gier
   */
  readonly allTags: Signal<string[]> = computed(() => {
    const allTagsSet = new Set<string>();
    this.games().forEach(game => {
      const gameTags = this.getGameTags(game['tags']);
      gameTags.forEach(tag => allTagsSet.add(tag));
    });
    return Array.from(allTagsSet).sort();
  });

  constructor() {
    effect(() => {
      if (!this.games().length) {
        this.loadGames();
      }
    });
  }

  loadGames(): void {
    this.loading.set(true);
    this.api.list().then((games) => {
      return this.games.set(games);
    })
    .finally(() => {
      return this.loading.set(false);
    });
  }

  setQuery(query: string): void {
    this.query.set(query);
  }

  setFilters(filters: { 
    genre?: string; 
    platform?: string;
    rating?: number;
    isBorrowed?: boolean;
    status?: string;
    tags?: string[];
  }): void {
    this.filters.set(filters);
  }

  setSortBy(field: string, direction: 'asc' | 'desc'): void {
    this.sortBy.set({ field, direction });
  }

  select(id: string | null): void {
    this.selectedId.set(id);
  }

  upsert(game: Game): void {
    if (game.id) {
      const { id, ...gameData } = game;
      this.api.update(id, gameData).subscribe(() => this.loadGames());
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...gameData } = game;
      this.api.create(gameData).subscribe(() => this.loadGames());
    }
  }

  remove(id: string): void {
    this.api.delete(id).subscribe(() => this.loadGames());
  }
}


