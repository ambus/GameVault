import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { LayoutComponent } from './core/layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'games'
      },
      {
        path: 'games',
        loadChildren: () =>
          import('./features/games/games.routes').then((m) => m.GAMES_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'games'
  }
];
