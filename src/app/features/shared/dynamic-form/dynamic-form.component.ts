import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
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
    AutoCompleteModule
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicFormComponent {
  readonly #fb = inject(FormBuilder);

  fields = input.required<DynamicFieldConfig[]>();
  initialValue = input<Record<string, unknown> | null>(null);
  submitted = output<Record<string, unknown>>();

  form!: FormGroup;

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
        
        // Konwersja stringa daty na Date dla PrimeNG Calendar
        for (const field of this.fields()) {
          if (field.type === 'date' && typeof initial[field.name] === 'string' && initial[field.name]) {
            initial[field.name] = new Date(initial[field.name] as string);
          }
        }
        
        this.form.patchValue(initial);
      }
    });
  }

  private buildForm(): void {
    const controls: Record<string, unknown> = {};
    const initial = this.initialValue() ?? {};

    for (const field of this.fields()) {
      let value = initial[field.name] ?? null;
      
      // Konwersja stringa daty na Date dla PrimeNG Calendar
      if (field.type === 'date' && typeof value === 'string' && value) {
        value = new Date(value);
      }
      
      controls[field.name] = [value, field.validators ?? []];
    }

    this.form = this.#fb.group(controls);
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
}


