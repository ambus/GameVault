import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    effect,
    inject,
    signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { GamesStore } from '../games.store';
import { GAME_FORM_FIELDS } from '../schema/games-form.schema';

interface FilterOption {
  label: string;
  value: string | number | boolean | null;
}

/**
 * Pobiera opcje dla danego pola z schema
 */
function getOptionsFromSchema(fieldName: string): FilterOption[] {
  const field = GAME_FORM_FIELDS.find(f => f.name === fieldName);
  if (!field || !field.options) {
    return [];
  }
  return field.options.map(opt => ({
    label: opt.label,
    value: opt.value as string | number | boolean | null
  }));
}

/**
 * Tworzy opcje dla filtra rating (5+, 6+, 7+, 8+, 9+, 10)
 */
function getRatingOptions(): FilterOption[] {
  return [
    { label: 'Wszystkie oceny', value: null },
    { label: '5+', value: 5 },
    { label: '6+', value: 6 },
    { label: '7+', value: 7 },
    { label: '8+', value: 8 },
    { label: '9+', value: 9 },
    { label: '10', value: 10 }
  ];
}

/**
 * Tworzy opcje dla filtra isBorrowed
 */
function getIsBorrowedOptions(): FilterOption[] {
  return [
    { label: 'Wszystkie', value: null },
    { label: 'Pożyczone', value: true },
    { label: 'Nie pożyczone', value: false }
  ];
}

/**
 * Dodaje opcję "Wszystkie" na początku listy opcji
 */
function addAllOption(options: FilterOption[], allLabel: string): FilterOption[] {
  return [
    { label: allLabel, value: null },
    ...options
  ];
}

@Component({
  standalone: true,
  selector: 'app-games-filters',
  imports: [SelectModule, ButtonModule, FormsModule, AutoCompleteModule],
  templateUrl: './games-filters.component.html',
  styleUrl: './games-filters.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GamesFiltersComponent {
  private readonly store = inject(GamesStore);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly currentFilters = computed(() => this.store.filters());

  // Pobieramy opcje ze schema i dodajemy opcję "Wszystkie"
  readonly genreOptions = addAllOption(
    getOptionsFromSchema('genre'),
    'Wszystkie gatunki'
  );

  readonly platformOptions = addAllOption(
    getOptionsFromSchema('platform'),
    'Wszystkie platformy'
  );

  readonly statusOptions = addAllOption(
    getOptionsFromSchema('status'),
    'Wszystkie statusy'
  );

  // Rating i isBorrowed nie mają opcji w schema, więc tworzymy je programatycznie
  readonly ratingOptions = getRatingOptions();
  readonly isBorrowedOptions = getIsBorrowedOptions();

  // Pobieramy dostępne tagi z store
  readonly availableTags = computed(() => this.store.allTags());
  private readonly tagSuggestionsSignal = signal<string[]>([]);

  // Wartości dla ngModel z p-select (nie signals, bo ngModel wymaga zwykłych właściwości)
  selectedGenreValue: string | null = null;
  selectedPlatformValue: string | null = null;
  selectedRatingValue: number | null = null;
  selectedIsBorrowedValue: boolean | null = null;
  selectedStatusValue: string | null = null;
  selectedTagsValue: string[] = [];

  constructor() {
    // Synchronizacja wartości z store do właściwości (tylko w jedną stronę)
    effect(() => {
      const genre = this.currentFilters().genre;
      const currentValue = this.selectedGenreValue;
      if (currentValue !== (genre || null)) {
        this.selectedGenreValue = genre || null;
        this.cdr.markForCheck();
      }
    });

    effect(() => {
      const platform = this.currentFilters().platform;
      const currentValue = this.selectedPlatformValue;
      if (currentValue !== (platform || null)) {
        this.selectedPlatformValue = platform || null;
        this.cdr.markForCheck();
      }
    });

    effect(() => {
      const rating = this.currentFilters().rating;
      const currentValue = this.selectedRatingValue;
      if (currentValue !== (rating ?? null)) {
        this.selectedRatingValue = rating ?? null;
        this.cdr.markForCheck();
      }
    });

    effect(() => {
      const isBorrowed = this.currentFilters().isBorrowed;
      const currentValue = this.selectedIsBorrowedValue;
      if (currentValue !== (isBorrowed ?? null)) {
        this.selectedIsBorrowedValue = isBorrowed ?? null;
        this.cdr.markForCheck();
      }
    });

    effect(() => {
      const status = this.currentFilters().status;
      const currentValue = this.selectedStatusValue;
      if (currentValue !== (status || null)) {
        this.selectedStatusValue = status || null;
        this.cdr.markForCheck();
      }
    });

    effect(() => {
      const tags = this.currentFilters().tags;
      const currentValue = this.selectedTagsValue;
      const tagsArray = tags || [];
      if (JSON.stringify(currentValue.sort()) !== JSON.stringify(tagsArray.sort())) {
        this.selectedTagsValue = [...tagsArray];
        this.cdr.markForCheck();
      }
    });
  }

  onGenreChange(genre: unknown): void {
    const genreValue = genre as string | null | undefined;
    const currentFilters = this.store.filters();
    const newFilters = { ...currentFilters };
    
    if (genreValue === null || genreValue === undefined) {
      delete newFilters.genre;
    } else {
      newFilters.genre = genreValue;
    }
    
    this.store.setFilters(newFilters);
    this.cdr.markForCheck();
  }

  onPlatformChange(platform: unknown): void {
    const platformValue = platform as string | null | undefined;
    const currentFilters = this.store.filters();
    const newFilters = { ...currentFilters };
    
    if (platformValue === null || platformValue === undefined) {
      delete newFilters.platform;
    } else {
      newFilters.platform = platformValue;
    }
    
    this.store.setFilters(newFilters);
    this.cdr.markForCheck();
  }

  onRatingChange(rating: unknown): void {
    const ratingValue = rating as number | null | undefined;
    const currentFilters = this.store.filters();
    const newFilters = { ...currentFilters };
    
    if (ratingValue === null || ratingValue === undefined) {
      delete newFilters.rating;
    } else {
      newFilters.rating = ratingValue;
    }
    
    this.store.setFilters(newFilters);
    this.cdr.markForCheck();
  }

  onIsBorrowedChange(isBorrowed: unknown): void {
    const isBorrowedValue = isBorrowed as boolean | null | undefined;
    const currentFilters = this.store.filters();
    const newFilters = { ...currentFilters };
    
    if (isBorrowedValue === null || isBorrowedValue === undefined) {
      delete newFilters.isBorrowed;
    } else {
      newFilters.isBorrowed = isBorrowedValue;
    }
    
    this.store.setFilters(newFilters);
    this.cdr.markForCheck();
  }

  onStatusChange(status: unknown): void {
    const statusValue = status as string | null | undefined;
    const currentFilters = this.store.filters();
    const newFilters = { ...currentFilters };
    
    if (statusValue === null || statusValue === undefined) {
      delete newFilters.status;
    } else {
      newFilters.status = statusValue;
    }
    
    this.store.setFilters(newFilters);
    this.cdr.markForCheck();
  }

  onTagsChange(tags: string[]): void {
    const currentFilters = this.store.filters();
    const newFilters = { ...currentFilters };
    
    if (!tags || tags.length === 0) {
      delete newFilters.tags;
    } else {
      newFilters.tags = tags;
    }
    
    this.store.setFilters(newFilters);
    this.cdr.markForCheck();
  }

  onTagSearch(event: { query: string }): void {
    const query = event.query?.toLowerCase() || '';
    const allTags = this.availableTags();
    const currentTags = this.selectedTagsValue || [];
    const existingTags = currentTags.map(tag => tag.toLowerCase());

    // Filtruj tagi na podstawie zapytania i wyklucz już wybrane
    const suggestions = allTags
      .filter(tag => 
        tag.toLowerCase().includes(query) && 
        !existingTags.includes(tag.toLowerCase())
      )
      .slice(0, 10);

    this.tagSuggestionsSignal.set(suggestions);
    this.cdr.markForCheck();
  }

  get tagSuggestions(): string[] {
    return this.tagSuggestionsSignal();
  }

  clearFilters(): void {
    this.store.setFilters({});
  }

  readonly hasActiveFilters = computed(() => {
    const filters = this.currentFilters();
    return !!(filters.genre || filters.platform || filters.rating !== undefined || filters.isBorrowed !== undefined || filters.status || (filters.tags && filters.tags.length > 0));
  });
}

