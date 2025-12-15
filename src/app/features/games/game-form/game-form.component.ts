import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GamesStore } from '../games.store';
import { GAME_FORM_FIELDS } from '../schema/games-form.schema';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';

@Component({
  standalone: true,
  selector: 'app-game-form',
  imports: [DynamicFormComponent],
  templateUrl: './game-form.component.html',
  styleUrl: './game-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameFormComponent {
  private readonly store = inject(GamesStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly fields = GAME_FORM_FIELDS;
  readonly editingId = signal<string | null>(null);

  readonly initialValue = computed(() => {
    const game = this.store.selectedGame();
    return game ? { ...game } : {};
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editingId.set(id);
      this.store.select(id);
    }
  }

  onSubmitted(value: Record<string, unknown>): void {
    const id = this.editingId();
    const game = { ...(value as any), id: id ?? '' };
    this.store.upsert(game);
    this.router.navigate(['/games']);
  }
}


