import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, viewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DynamicFormComponent } from '../shared/dynamic-form/dynamic-form.component';
import { WISHLIST_FORM_FIELDS } from './schema/wishlist-form.schema';
import { WishlistStore } from './wishlist.store';
import { WishlistItem } from './wishlist.types';

@Component({
  standalone: true,
  selector: 'app-wishlist-form',
  imports: [CommonModule, DynamicFormComponent, ProgressSpinnerModule, ButtonModule],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h2>{{ isEdit() ? 'Edytuj grę na liście życzeń' : 'Dodaj do listy życzeń' }}</h2>
        <p-button
          icon="pi pi-times"
          [text]="true"
          severity="secondary"
          (click)="onCancel()"
        ></p-button>
      </div>

      @if (loading()) {
        <div class="loading-overlay">
          <p-progressSpinner />
        </div>
      }

      <app-dynamic-form
        #dynamicForm
        [fields]="fields"
        [initialValue]="$any(initialData())"
        (submitted)="onSubmit($event)"
        (formCancel)="onCancel()"
      />

      <div class="form-actions">
        <p-button
          label="Zapisz"
          icon="pi pi-save"
          [disabled]="dynamicForm.isFormInvalid"
          (click)="onSave()"
        ></p-button>
        <p-button
          label="Anuluj"
          icon="pi pi-times"
          severity="secondary"
          (click)="onCancel()"
        ></p-button>
      </div>
    </div>
  `,
  styles: [
    `
      .form-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 1.5rem;
        background: var(--surface-card);
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      }
      .form-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }
      .form-header h2 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--text-color);
      }
      .loading-overlay {
        display: flex;
        justify-content: center;
        padding: 2rem;
      }
      .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid var(--surface-border);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistFormComponent {
  private readonly store = inject(WishlistStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  dynamicForm = viewChild.required(DynamicFormComponent);

  fields = WISHLIST_FORM_FIELDS;
  loading = this.store.loading;

  isEdit = () => !!this.route.snapshot.params['id'];
  initialData = () => this.store.selectedItem();

  constructor() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.store.select(id);
    } else {
      this.store.select(null);
    }
  }

  onSave(): void {
    this.dynamicForm().submitForm();
  }

  onSubmit(data: Partial<WishlistItem>): void {
    const id = this.route.snapshot.params['id'];
    this.store.upsert({ ...data, id } as WishlistItem);
    this.router.navigate(['/wishlist']);
  }

  onCancel(): void {
    this.router.navigate(['/wishlist']);
  }
}
