import { Routes } from '@angular/router';
import { AnalysisComponent } from './analysis.component';

export const ANALYSIS_ROUTES: Routes = [
  {
    path: '',
    component: AnalysisComponent,
    children: [
      {
        path: '',
        redirectTo: 'expenses',
        pathMatch: 'full',
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./expenses/analysis-expenses.component').then((m) => m.AnalysisExpensesComponent),
      },
      {
        path: 'completed',
        loadComponent: () =>
          import('./completed/analysis-completed.component').then(
            (m) => m.AnalysisCompletedComponent,
          ),
      },
    ],
  },
];
