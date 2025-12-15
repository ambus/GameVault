import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output
} from '@angular/core';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { GamesStore } from '../games.store';
import { Game } from '../games.types';

@Component({
  standalone: true,
  selector: 'app-games-list',
  imports: [TableModule, InputTextModule, ButtonModule],
  templateUrl: './games-list.component.html',
  styleUrl: './games-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GamesListComponent {
  private readonly store = inject(GamesStore);
  private readonly router = inject(Router);

  // Sygnałowe I/O (dla możliwości reużycia)
  games = input<Game[] | null>(null);
  gameSelected = output<Game>();

  readonly loading = computed(() => this.store.loading());

  readonly displayedGames = computed(() => {
    const external = this.games();
    return external && external.length ? external : this.store.filteredGames();
  });

  onSearch(value: string): void {
    this.store.setQuery(value);
  }

  onRowClick(game: Game | Game[] | undefined): void {
    const selected = Array.isArray(game) ? game[0] : game;
    if (!selected) {
      return;
    }

    this.store.select(selected.id);
    this.gameSelected.emit(selected);
    this.router.navigate(['/games', selected.id]);
  }

  onAdd(): void {
    this.router.navigate(['/games/new']);
  }

  onDelete(game: Game): void {
    this.store.remove(game.id);
  }
}


