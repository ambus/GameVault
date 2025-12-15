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
      const matchesText =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.genre.toLowerCase().includes(q);
      const matchesGenre = !genre || g.genre === genre;
      const matchesPlatform = !platform || g.platform === platform;
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
    this.api.list().subscribe({
      next: (games) => this.games.set(games),
      complete: () => this.loading.set(false)
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
      this.api.update(game.id, game).subscribe(() => this.loadGames());
    } else {
      this.api.create(game).subscribe(() => this.loadGames());
    }
  }

  remove(id: string): void {
    this.api.delete(id).subscribe(() => this.loadGames());
  }
}


