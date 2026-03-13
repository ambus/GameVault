import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';
import { WishlistService } from './wishlist.service';
import { WishlistItem } from './wishlist.types';

@Injectable({ providedIn: 'root' })
export class WishlistStore {
  private readonly api = inject(WishlistService);

  readonly items = signal<WishlistItem[]>([]);
  readonly loading = signal(false);
  readonly selectedId = signal<string | null>(null);
  readonly query = signal('');

  readonly selectedItem: Signal<WishlistItem | null> = computed(() => {
    const id = this.selectedId();
    return this.items().find((item) => item.id === id) ?? null;
  });

  readonly filteredItems: Signal<WishlistItem[]> = computed(() => {
    const q = this.query().toLowerCase();
    
    const filtered = this.items().filter((item) => {
      const name = (item.name ?? '').toLowerCase();
      const comment = (item.comment ?? '').toLowerCase();
      
      return !q || name.includes(q) || comment.includes(q);
    });

    return filtered.sort((a, b) => {
      const dateA = a.releaseDate;
      const dateB = b.releaseDate;

      // Pieces without a date first (interpreted as already released)
      if (!dateA && dateB) return -1;
      if (dateA && !dateB) return 1;

      // Both have dates, sort by earliest first
      if (dateA && dateB && dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }

      // Both missing dates or dates are equal, sort by name
      return (a.name ?? '').localeCompare(b.name ?? '');
    });
  });

  constructor() {
    effect(() => {
      if (!this.items().length) {
        this.loadItems();
      }
    });
  }

  loadItems(): void {
    this.loading.set(true);
    this.api.list().then((items) => {
      this.items.set(items);
    })
    .finally(() => {
      this.loading.set(false);
    });
  }

  setQuery(query: string): void {
    this.query.set(query);
  }

  select(id: string | null): void {
    this.selectedId.set(id);
  }

  upsert(item: WishlistItem): void {
    if (item.id) {
      const { id, ...itemData } = item;
      this.api.update(id, itemData).subscribe(() => this.loadItems());
    } else {
      const { id, ...itemData } = item;
      this.api.create(itemData).subscribe(() => this.loadItems());
    }
  }

  remove(id: string): void {
    this.api.delete(id).subscribe(() => this.loadItems());
  }
}
