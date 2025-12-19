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
  readonly filters = signal<{ genre?: string; platform?: string }>({});

  readonly selectedGame: Signal<Game | null> = computed(() => {
    const id = this.selectedId();
    return this.games().find((g) => g.id === id) ?? null;
  });

  readonly filteredGames: Signal<Game[]> = computed(() => {
    const q = this.query().toLowerCase();
    const { genre, platform } = this.filters();
    return this.games().filter((g) => {
      const name = String(g['name'] ?? '').toLowerCase();
      const description = String(g['description'] ?? '').toLowerCase();
      const gameGenre = String(g['genre'] ?? '').toLowerCase();
      const gamePlatform = String(g['platform'] ?? '');
      
      const matchesText =
        !q ||
        name.includes(q) ||
        description.includes(q) ||
        gameGenre.includes(q);
      const matchesGenre = !genre || gameGenre === genre.toLowerCase();
      const matchesPlatform = !platform || gamePlatform === platform;
      return matchesText && matchesGenre && matchesPlatform;
    });
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

  setFilters(filters: { genre?: string; platform?: string }): void {
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


