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
      } else if (field.type === 'tags' && (value === undefined || value === null)) {
        value = [];
      } else if (field.type === 'tags' && typeof value === 'string') {
        // Konwersja stringa na tablicę (jeśli zapisane jako string)
        value = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
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
      
      // Konwersja tablicy tagów na string (opcjonalnie, można też zostawić jako tablicę)
      if (field.type === 'tags' && Array.isArray(formValue[field.name])) {
        const tags = formValue[field.name] as unknown[];
        const tagStrings = tags.map(tag => typeof tag === 'string' ? tag : String(tag));
        
        // Aktualizuj listę wszystkich tagów
        this.allTags.update(current => {
          const newTags = [...current];
          tagStrings.forEach(tag => {
            if (!newTags.includes(tag)) {
              newTags.push(tag);
            }
          });
          return newTags;
        });
        
        // Można zapisać jako tablicę lub string - zostawiamy jako tablicę
        // formValue[field.name] = tagStrings.join(',');
      }
    }
    
    this.submitted.emit(formValue);
  }

  // Publiczna metoda do wywołania submit z zewnątrz
  submitForm(): void {
    this.onSubmit();
  }

  // Publiczna właściwość do sprawdzenia, czy formularz jest nieprawidłowy
  get isFormInvalid(): boolean {
    return this.form?.invalid ?? false;
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
    
    const trimmedValue = value.trim();
    
    // Sprawdź czy to URL (http://, https://, //)
    if (trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://') || trimmedValue.startsWith('//')) {
      return trimmedValue;
    }
    
    // Sprawdź czy to Base64
    if (trimmedValue.startsWith('data:image/')) {
      return trimmedValue;
    }
    
    // Jeśli zaczyna się od base64 bez prefiksu, dodaj prefiks
    if (trimmedValue.startsWith('/9j/') || trimmedValue.startsWith('iVBORw0KGgo')) {
      // JPEG lub PNG w Base64
      const mimeType = trimmedValue.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
      return `data:${mimeType};base64,${trimmedValue}`;
    }
    
    return null;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Ukryj obraz i pokaż placeholder lub komunikat błędu
    img.style.display = 'none';
    // Opcjonalnie: można dodać placeholder
    const parent = img.parentElement;
    if (parent && !parent.querySelector('.image-error-placeholder')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'image-error-placeholder';
      placeholder.textContent = 'Błąd ładowania obrazu';
      placeholder.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; color: rgba(255, 255, 255, 0.5); font-size: 0.875rem;';
      parent.appendChild(placeholder);
    }
  }

  onFormKeyDown(event: Event): void {
    // Jeśli Enter został naciśnięty w polu tags, zapobiegaj submitowi formularza
    const target = event.target as HTMLElement;
    if (target && target.closest('p-autocomplete')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onTagInputKeydown(event: KeyboardEvent, fieldName: string): void {
    // Jeśli naciśnięto Enter, dodaj tag i zapobiegaj submitowi formularza
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      
      const control = this.form.get(fieldName);
      if (!control) {
        return;
      }

      const input = event.target as HTMLInputElement;
      const inputValue = input.value?.trim();
      
      if (inputValue) {
        const currentTags = (control.value as string[]) || [];
        if (!currentTags.includes(inputValue)) {
          control.setValue([...currentTags, inputValue]);
          control.markAsDirty();
          input.value = '';
        }
      }
    }
  }

  private readonly tagSuggestions = signal<Record<string, string[]>>({});
  private readonly allTags = signal<string[]>([]);

  getTagSuggestions(fieldName: string): string[] {
    return this.tagSuggestions()[fieldName] || [];
  }

  onTagSearch(event: { query: string }, fieldName: string): void {
    const query = event.query?.toLowerCase() || '';
    const currentTags = this.form.get(fieldName)?.value || [];
    const existingTags = Array.isArray(currentTags) ? currentTags.map((t: unknown) => 
      typeof t === 'string' ? t.toLowerCase() : String(t).toLowerCase()
    ) : [];

    // Filtruj istniejące tagi i dodaj sugestie
    const suggestions = this.allTags()
      .filter(tag => 
        tag.toLowerCase().includes(query) && 
        !existingTags.includes(tag.toLowerCase())
      )
      .slice(0, 10);

    this.tagSuggestions.update(current => ({
      ...current,
      [fieldName]: suggestions
    }));
  }
}


