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

  readonly selectedGame: Signal<Game | null> = computed(() => {
    const id = this.selectedId();
    return this.games().find((g) => g.id === id) ?? null;
  });

  readonly filteredGames: Signal<Game[]> = computed(() => {
    const q = this.query().toLowerCase();
    const { genre, platform, rating, isBorrowed, status, tags } = this.filters();
    return this.games().filter((g) => {
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
  });

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


