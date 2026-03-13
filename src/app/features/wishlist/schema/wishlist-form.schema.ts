import { Validators } from '@angular/forms';
import { DynamicFieldConfig } from '../../shared/dynamic-form/dynamic-form.types';

export const WISHLIST_FORM_FIELDS: DynamicFieldConfig[] = [
  {
    name: 'name',
    type: 'text',
    label: 'Tytuł gry',
    placeholder: 'Wprowadź tytuł',
    validators: [Validators.required, Validators.minLength(2)],
  },
  {
    name: 'platform',
    type: 'select',
    label: 'Platforma',
    options: [
      { label: 'PC', value: 'PC' },
      { label: 'Mac', value: 'Mac' },
      { label: 'Nintendo Switch', value: 'Nintendo Switch' },
      { label: 'Nintendo Switch 2', value: 'Nintendo Switch 2' },
      { label: 'PlayStation 5', value: 'PS5' },
      { label: 'Xbox Series X/S', value: 'Xbox Series' },
    ],
    validators: [Validators.required],
  },
  {
    name: 'link',
    type: 'text',
    label: 'Link',
    placeholder: 'Wklej link do gry lub sklepu',
    validators: [Validators.required],
  },
  {
    name: 'distributionForm',
    type: 'select',
    label: 'Forma dystrybucji',
    options: [
      { label: 'Cyfrowa', value: 'digital' },
      { label: 'Pudełkowa', value: 'physical' },
    ],
  },
  {
    name: 'coverImage',
    type: 'image',
    label: 'Zdjęcie / Okładka',
    placeholder: 'Wybierz plik lub wklej Base64/URL',
  },
  {
    name: 'releaseDate',
    type: 'date',
    label: 'Data premiery',
  },
  {
    name: 'comment',
    type: 'textarea',
    label: 'Komentarz',
    placeholder: 'Krótki komentarz...',
  },
];
