import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { GamesStore } from '../games.store';
import { Game } from '../games.types';
import { GAME_FORM_FIELDS } from '../schema/games-form.schema';

@Component({
  standalone: true,
  selector: 'app-game-form',
  imports: [DynamicFormComponent, ButtonModule],
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
  readonly dynamicForm = viewChild(DynamicFormComponent);

  readonly initialValue = computed(() => {
    const id = this.editingId();
    if (id) {
      const game = this.store.selectedGame();
      return game ? { ...game } : {};
    }
    return {};
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editingId.set(id);
      this.store.select(id);
    } else {
      // Wyczyść selectedId gdy dodajemy nową grę
      this.store.select(null);
    }

    // Reaguj na zmiany editingId i czyszcz selectedId gdy nie ma ID
    effect(() => {
      const currentId = this.editingId();
      if (!currentId) {
        this.store.select(null);
      }
    });
  }

  onSubmitted(value: Record<string, unknown>): void {
    const id = this.editingId();
    const game: Game = {
      ...value,
      id: id || ''
    } as Game;
    this.store.upsert(game);
    this.router.navigate(['/games']);
  }

  onCancel(): void {
    this.router.navigate(['/games']);
  }

  onSave(): void {
    const form = this.dynamicForm();
    if (form) {
      form.submitForm();
    }
  }

  readonly isFormInvalid = computed(() => {
    const form = this.dynamicForm();
    return form?.isFormInvalid ?? false;
  });
}


