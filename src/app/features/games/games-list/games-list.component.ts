import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output
} from '@angular/core';
import { Router } from '@angular/router';
import { GameCardComponent } from '../game-card/game-card.component';
import { GamesFiltersComponent } from '../games-filters/games-filters.component';
import { GamesStore } from '../games.store';
import { Game } from '../games.types';

@Component({
  standalone: true,
  selector: 'app-games-list',
  imports: [GameCardComponent, GamesFiltersComponent],
  templateUrl: './games-list.component.html',
  styleUrl: './games-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GamesListComponent {
  private readonly store = inject(GamesStore);
  private readonly router = inject(Router);

  games = input<Game[] | null>(null);
  gameSelected = output<Game>();

  readonly loading = computed(() => this.store.loading());

  readonly displayedGames = computed(() => {
    // Zawsze używamy filteredGames z store, który uwzględnia filtry i wyszukiwanie
    this.store.filters(); // Zależność od filters dla reaktywności
    return this.store.filteredGames();
  });

  readonly placeholderCards = computed(() => Array(12).fill(null));

  onRowClick(game: Game): void {
    this.store.select(game.id);
    this.gameSelected.emit(game);
    this.router.navigate(['/games', game.id]);
  }
}
