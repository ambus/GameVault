import { Validators } from '@angular/forms';
import { DynamicFieldConfig } from '../../shared/dynamic-form/dynamic-form.types';

export const GAME_FORM_FIELDS: DynamicFieldConfig[] = [
  {
    name: 'name',
    type: 'text',
    label: 'Nazwa gry',
    placeholder: 'Wprowadź nazwę',
    validators: [Validators.required, Validators.minLength(2)]
  },
  {
    name: 'genre',
    type: 'select',
    label: 'Gatunek',
    options: [
      { label: 'RPG', value: 'RPG' },
      { label: 'FPS', value: 'FPS' },
      { label: 'Strategia', value: 'Strategy' }
    ],
    validators: [Validators.required]
  },
  {
    name: 'platform',
    type: 'select',
    label: 'Platforma',
    options: [
      { label: 'PC', value: 'PC' },
      { label: 'PS5', value: 'PS5' },
      { label: 'Xbox Series', value: 'Xbox' }
    ],
    validators: [Validators.required]
  },
  {
    name: 'releaseDate',
    type: 'date',
    label: 'Data wydania',
    validators: [Validators.required]
  },
  {
    name: 'rating',
    type: 'number',
    label: 'Ocena',
    validators: [Validators.min(0), Validators.max(10)]
  },
  {
    name: 'description',
    type: 'textarea',
    label: 'Opis'
  }
];


