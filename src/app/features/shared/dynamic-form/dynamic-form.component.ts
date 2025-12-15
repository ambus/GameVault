import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  SimpleChanges,
  input,
  output
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DynamicFieldConfig } from './dynamic-form.types';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  standalone: true,
  selector: 'app-dynamic-form',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicFormComponent implements OnChanges {
  fields = input.required<DynamicFieldConfig[]>();
  initialValue = input<Record<string, unknown> | null>(null);
  submitted = output<Record<string, unknown>>();

  form!: FormGroup;

  constructor(private readonly fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields']) {
      this.buildForm();
    }
    if (changes['initialValue'] && this.form && this.initialValue()) {
      this.form.patchValue(this.initialValue()!);
    }
  }

  private buildForm(): void {
    const controls: Record<string, unknown> = {};
    const initial = this.initialValue() ?? {};

    for (const field of this.fields()) {
      controls[field.name] = [initial[field.name] ?? null, field.validators ?? []];
    }

    this.form = this.fb.group(controls);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.value);
  }
}


