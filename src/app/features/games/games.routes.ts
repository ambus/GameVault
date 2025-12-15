import { Routes } from '@angular/router';
import { GamesListComponent } from './games-list/games-list.component';
import { GameFormComponent } from './game-form/game-form.component';

export const GAMES_ROUTES: Routes = [
  {
    path: '',
    component: GamesListComponent
  },
  {
    path: 'new',
    component: GameFormComponent
  },
  {
    path: ':id',
    component: GameFormComponent
  }
];


