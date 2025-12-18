import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RatingModule } from 'primeng/rating';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { DynamicFieldConfig } from './dynamic-form.types';
@Component({
  standalone: true,
  selector: 'app-dynamic-form',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    CardModule,
    AutoCompleteModule,
    RatingModule,
    CheckboxModule
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicFormComponent {
  readonly #fb = inject(FormBuilder);
  readonly #cdr = inject(ChangeDetectorRef);

  fields = input.required<DynamicFieldConfig[]>();
  initialValue = input<Record<string, unknown> | null>(null);
  submitted = output<Record<string, unknown>>();

  form!: FormGroup;
  readonly ratingValues = signal<Record<string, number | null>>({});

  isFieldVisible(field: DynamicFieldConfig): boolean {
    if (!field.showWhen) {
      return true;
    }

    const control = this.form.get(field.showWhen.field);
    if (!control) {
      return false;
    }

    const value = control.value;
    return value === field.showWhen.value;
  }

  constructor() {
    // Reagowanie na zmiany fields - budowanie formularza
    effect(() => {
      this.fields(); // śledzenie zmian
      this.buildForm();
    });

    // Reagowanie na zmiany initialValue - aktualizacja wartości formularza
    effect(() => {
      const value = this.initialValue();
      if (this.form && value) {
        const initial = { ...value };
        const ratingUpdates: Record<string, number | null> = {};
        
        // Konwersja stringa daty na Date dla PrimeNG Calendar
        for (const field of this.fields()) {
          if (field.type === 'date' && typeof initial[field.name] === 'string' && initial[field.name]) {
            initial[field.name] = new Date(initial[field.name] as string);
          }
          
          // Aktualizacja wartości rating
          if (field.type === 'rating') {
            const ratingValue = initial[field.name];
            ratingUpdates[field.name] = ratingValue !== null && ratingValue !== undefined ? Number(ratingValue) : null;
          }
        }
        
        this.form.patchValue(initial);
        
        if (Object.keys(ratingUpdates).length > 0) {
          this.ratingValues.update((current) => ({ ...current, ...ratingUpdates }));
        }
      }
    });
  }

  private buildForm(): void {
    const controls: Record<string, unknown> = {};
    const initial = this.initialValue() ?? {};
    const ratingValues: Record<string, number | null> = {};

    for (const field of this.fields()) {
      let value = initial[field.name];
      
      // Dla checkboxa domyślna wartość to false
      if (field.type === 'checkbox' && value === undefined) {
        value = false;
      } else if (field.type === 'checkbox' && value === null) {
        value = false;
      } else if (value === undefined) {
        value = null;
      }
      
      // Konwersja stringa daty na Date dla PrimeNG Calendar
      if (field.type === 'date' && typeof value === 'string' && value) {
        value = new Date(value);
      }
      
      controls[field.name] = [value, field.validators ?? []];
      
      // Inicjalizacja wartości rating
      if (field.type === 'rating') {
        ratingValues[field.name] = value !== null && value !== undefined ? Number(value) : null;
      }
    }

    this.form = this.#fb.group(controls);
    this.ratingValues.set(ratingValues);

    // Subskrypcja valueChanges dla pól rating
    for (const field of this.fields()) {
      if (field.type === 'rating') {
        const control = this.form.get(field.name);
        if (control) {
          control.valueChanges.subscribe((value) => {
            const ratingValue = value !== null && value !== undefined ? Number(value) : null;
            this.ratingValues.update((current) => ({
              ...current,
              [field.name]: ratingValue
            }));
            this.#cdr.markForCheck();
          });
        }
      }
    }

    // Subskrypcja valueChanges dla pól z warunkowym wyświetlaniem
    for (const field of this.fields()) {
      if (field.showWhen) {
        const control = this.form.get(field.showWhen.field);
        if (control) {
          control.valueChanges.subscribe(() => {
            this.#cdr.markForCheck();
          });
        }
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    const formValue = { ...this.form.value };
    
    // Konwersja Date na string dla pól typu date
    for (const field of this.fields()) {
      if (field.type === 'date' && formValue[field.name] instanceof Date) {
        const date = formValue[field.name] as Date;
        formValue[field.name] = date.toISOString().split('T')[0];
      }
    }
    
    this.submitted.emit(formValue);
  }

  isFieldRequired(field: DynamicFieldConfig): boolean {
    return field.validators?.some(v => v.name === 'required') ?? false;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return control ? control.invalid && control.touched : false;
  }

  isFieldDirty(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return control ? control.dirty : false;
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'To pole jest wymagane';
    }
    if (control.errors['minlength']) {
      return `Minimalna długość to ${control.errors['minlength'].requiredLength} znaków`;
    }
    if (control.errors['min']) {
      return `Minimalna wartość to ${control.errors['min'].min}`;
    }
    if (control.errors['max']) {
      return `Maksymalna wartość to ${control.errors['max'].max}`;
    }

    return 'Nieprawidłowa wartość';
  }

  getFieldValue(fieldName: string): number | null {
    const control = this.form.get(fieldName);
    if (!control) {
      return null;
    }
    const value = control.value;
    return value !== null && value !== undefined ? Number(value) : null;
  }

  getRatingDisplay(fieldName: string, maxStars: number = 10): string {
    const value = this.ratingValues()[fieldName];
    if (value === null || value === undefined) {
      return `0/${maxStars}`;
    }
    return `${value}/${maxStars}`;
  }

  getImageUrl(fieldName: string): string | null {
    const control = this.form.get(fieldName);
    if (!control) {
      return null;
    }
    const value = control.value;
    if (!value || typeof value !== 'string') {
      return null;
    }
    
    // Sprawdź czy to URL
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('//')) {
      return value;
    }
    
    // Sprawdź czy to Base64
    if (value.startsWith('data:image/')) {
      return value;
    }
    
    // Jeśli zaczyna się od base64 bez prefiksu, dodaj prefiks
    if (value.startsWith('/9j/') || value.startsWith('iVBORw0KGgo')) {
      // JPEG lub PNG w Base64
      const mimeType = value.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
      return `data:${mimeType};base64,${value}`;
    }
    
    return null;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}


