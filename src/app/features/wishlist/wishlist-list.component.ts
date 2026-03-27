import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmationService, MessageService } from 'primeng/api';
import { WishlistCardComponent } from './wishlist-card.component';
import { WishlistStore } from './wishlist.store';
import { WishlistItem } from './wishlist.types';

@Component({
  standalone: true,
  selector: 'app-wishlist-list',
  imports: [CommonModule, WishlistCardComponent, ProgressSpinnerModule],
  template: `
    <div class="wishlist-container">
      @if (loading()) {
        <div class="loading-container">
          <p-progressSpinner />
        </div>
      } @else {
        @if (items().length === 0) {
          <div class="empty-state">
            <i class="pi pi-heart-fill empty-icon"></i>
            <h3>Twoja lista życzeń jest pusta</h3>
            <p>Dodaj gry, które chcesz kupić w przyszłości.</p>
          </div>
        } @else {
          <div class="wishlist-grid">
            @for (item of items(); track item.id) {
              <app-wishlist-card
                [item]="item"
                (cardClick)="onEdit(item.id)"
                (remove)="onRemove($event)"
                (moveToGames)="onMoveToGames($event)"
              />
            }
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .wishlist-container {
        padding: 1rem;
      }
      .wishlist-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }
      .loading-container {
        display: flex;
        justify-content: center;
        padding: 4rem;
      }
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem;
        text-align: center;
        color: var(--text-color-secondary);
      }
      .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.2;
      }
      .empty-state h3 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--text-color);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistListComponent {
  private readonly store = inject(WishlistStore);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  items = this.store.filteredItems;
  loading = this.store.loading;

  onEdit(id: string): void {
    this.router.navigate(['/wishlist', id]);
  }

  onRemove(id: string): void {
    this.confirmationService.confirm({
      message: 'Czy na pewno chcesz usunąć tę grę z listy życzeń?',
      header: 'Potwierdzenie usunięcia',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Tak',
      rejectLabel: 'Nie',
      accept: () => {
        this.store.remove(id);
        this.messageService.add({
          severity: 'success',
          summary: 'Usunięto',
          detail: 'Gra została usunięta z listy życzeń',
        });
      },
    });
  }

  onMoveToGames(item: WishlistItem): void {
    this.router.navigate(['/games/new'], {
      state: {
        fromWishlistId: item.id,
        gameData: {
          name: item.name,
          platform: item.platform,
          coverImage: item.coverImage,
          comment: item.comment,
          version: item.distributionForm,
        },
      },
    });
  }
}
