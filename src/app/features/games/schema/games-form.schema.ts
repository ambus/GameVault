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
      { label: 'Akcja', value: 'Action' },
      { label: 'Akcja przygodowa', value: 'Action-Adventure' },
      { label: 'Bijatyka', value: 'Fighting' },
      { label: 'FPS', value: 'FPS' },
      { label: 'Horror', value: 'Horror' },
      { label: 'Indie', value: 'Indie' },
      { label: 'MMO', value: 'MMO' },
      { label: 'MOBA', value: 'MOBA' },
      { label: 'Platformówka', value: 'Platformer' },
      { label: 'Przygodowa', value: 'Adventure' },
      { label: 'Przygodowa point-and-click', value: 'Point-and-Click' },
      { label: 'Puzzle', value: 'Puzzle' },
      { label: 'Racing', value: 'Racing' },
      { label: 'Roguelike', value: 'Roguelike' },
      { label: 'RPG', value: 'RPG' },
      { label: 'RPG akcji', value: 'Action-RPG' },
      { label: 'RTS', value: 'RTS' },
      { label: 'Sandbox', value: 'Sandbox' },
      { label: 'Simulator', value: 'Simulator' },
      { label: 'Sportowa', value: 'Sports' },
      { label: 'Stealth', value: 'Stealth' },
      { label: 'Strategia', value: 'Strategy' },
      { label: 'Strategia turowa', value: 'Turn-Based Strategy' },
      { label: 'Survival', value: 'Survival' },
      { label: 'Symulacja życia', value: 'Life Simulation' },
      { label: 'Tower Defense', value: 'Tower Defense' },
      { label: 'TPS', value: 'TPS' },
      { label: 'Wyścigowa', value: 'Racing' },
      { label: 'Zręcznościowa', value: 'Arcade' },
      { label: 'Inny', value: 'Other' }

    ],
    validators: [Validators.required]
  },
  {
    name: 'platform',
    type: 'select',
    label: 'Platforma',
    options: [
      { label: 'PC', value: 'PC' },
      { label: 'Mac', value: 'Mac' },
      { label: 'Nintendo Switch', value: 'Nintendo Switch' },
      { label: 'Nintendo Switch 2', value: 'Nintendo Switch 2' }
    ],
    validators: [Validators.required]
  },
    {
    name: 'coverImage',
    type: 'image',
    label: 'Okładka',
    placeholder: 'Wklej URL obrazka lub Base64'
  },
    {
    name: 'version',
    type: 'select',
    label: 'Wersja',
    options: [
      { label: 'Pudełko płyta', value: 'box_disc' },
      { label: 'Pudełko kartridź', value: 'box_cartridge' },
      { label: 'Pudełko - kod', value: 'box_code' },
      { label: 'Cyfrowa', value: 'digital' }
    ]
  },
  {
    name: 'digitalStore',
    type: 'select',
    label: 'Sklep cyfrowy',
    placeholder: 'Wybierz sklep',
    options: [
      { label: 'Steam', value: 'steam' },
      { label: 'Epic Games Store', value: 'epic' },
      { label: 'Nintendo Store', value: 'nintendo' },
      { label: 'PlayStation Store', value: 'playstation' },
      { label: 'Xbox Store', value: 'xbox' },
      { label: 'GOG', value: 'gog' },
      { label: 'Origin', value: 'origin' },
      { label: 'Ubisoft Connect', value: 'ubisoft' },
      { label: 'Battle.net', value: 'battlenet' },
      { label: 'Inny', value: 'other' }
    ],
    showWhen: {
      field: 'version',
      value: 'digital'
    }
  },
  {
    name: 'purchaseDate',
    type: 'date',
    label: 'Data zakupu',
  },
    {
    name: 'purchasePrice',
    type: 'number',
    label: 'Cena zakupu',
    placeholder: '0.00',
    validators: [Validators.min(0)]
  },

  {
    name: 'description',
    type: 'textarea',
    label: 'Opis'
  },

  {
    name: 'status',
    type: 'select',
    label: 'Status',
    options: [
      { label: 'Lista życzeń', value: 'wishlist' },
      { label: 'Zamówiony Preorder', value: 'preordered' },
      { label: 'Gotowa do grania', value: 'ready_to_play' },
      { label: 'W trakcie', value: 'in_progress' },
      { label: 'Ukończona', value: 'completed' },
      { label: 'Wstrzymana', value: 'on_hold' },
      { label: 'Nie ukończona', value: 'not_completed' }
    ]
  },
  {
    name: 'completionDate',
    type: 'date',
    label: 'Data ukończenia'
  },
  {
    name: 'comment',
    type: 'textarea',
    label: 'Komentarz',
    placeholder: 'Dodaj komentarz do gry...'
  },
  {
    name: 'tags',
    type: 'tags',
    label: 'Tagi',
    placeholder: 'Wpisz tag i naciśnij Enter, Tab lub przecinek'
  },
  {
    name: 'rating',
    type: 'rating',
    label: 'Ocena',
    validators: [Validators.min(0), Validators.max(10)]
  },
  {
    name: 'isBorrowed',
    type: 'checkbox',
    label: 'Czy pożyczona'
  },
  {
    name: 'borrowDate',
    type: 'date',
    label: 'Data pożyczenia',
    showWhen: {
      field: 'isBorrowed',
      value: true
    }
  },
  {
    name: 'borrowedTo',
    type: 'text',
    label: 'Komu pożyczone',
    placeholder: 'Wprowadź imię lub nazwę',
    showWhen: {
      field: 'isBorrowed',
      value: true
    }
  }
];


