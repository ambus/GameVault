import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { Game } from '../games.types';

@Component({
  selector: 'app-game-card',
  imports: [CardModule, SkeletonModule],
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
}

