import { ValidatorFn } from '@angular/forms';

export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'rating' | 'checkbox' | 'image' | 'tags';

export interface DynamicFieldOption {
  label: string;
  value: unknown;
}

export interface DynamicFieldConfig {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: DynamicFieldOption[];
  validators?: ValidatorFn[];
  showWhen?: {
    field: string;
    value: boolean | string | number;
  };
}


