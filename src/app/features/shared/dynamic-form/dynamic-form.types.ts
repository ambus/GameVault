import { ValidatorFn } from '@angular/forms';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'rating'
  | 'checkbox'
  | 'image'
  | 'tags';

export interface DynamicFieldOption {
  label: string;
  value: unknown;
}
export interface DynamicFieldCondition {
  field: string;
  value?: boolean | string | number | (boolean | string | number)[];
  operator?: 'EQUALS' | 'NOT_EQUALS' | 'NOT_EMPTY' | 'EMPTY';
}

export type DynamicFieldShowWhen =
  | DynamicFieldCondition
  | DynamicFieldCondition[]
  | {
      conditions: DynamicFieldCondition[];
      logic?: 'AND' | 'OR';
    };

export interface DynamicFieldConfig {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: DynamicFieldOption[];
  validators?: ValidatorFn[];
  min?: number;
  max?: number;
  showWhen?: DynamicFieldShowWhen;
}
