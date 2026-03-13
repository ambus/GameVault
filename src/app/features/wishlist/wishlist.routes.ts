import { Routes } from '@angular/router';

export const WISHLIST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./wishlist-list.component').then(m => m.WishlistListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./wishlist-form.component').then(m => m.WishlistFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./wishlist-form.component').then(m => m.WishlistFormComponent)
  }
];
