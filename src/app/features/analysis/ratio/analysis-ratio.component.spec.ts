import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GamesStore } from '../../games/games.store';
import { Game } from '../../games/games.types';
import { AnalysisRatioComponent } from './analysis-ratio.component';

describe('AnalysisRatioComponent', () => {
  let component: AnalysisRatioComponent;
  let fixture: ComponentFixture<AnalysisRatioComponent>;

  const mockGamesSignal = signal<Game[]>([]);

  const mockStore = {
    games: mockGamesSignal,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalysisRatioComponent],
      providers: [
        {
          provide: GamesStore,
          useValue: mockStore,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AnalysisRatioComponent);
    component = fixture.componentInstance;
  });

  it('powinien poprawnie utworzyć komponent', () => {
    expect(component).toBeTruthy();
  });

  it('powinien poprawnie obliczać wskaźniki KPI od początku (all-time)', () => {
    mockGamesSignal.set([
      {
        id: '1',
        name: 'Wiedźmin 3',
        purchaseDate: '2025-01-10',
        completionDate: '2025-02-15',
        status: 'completed',
        purchasePrice: 100,
      },
      {
        id: '2',
        name: 'Cyberpunk 2077',
        purchaseDate: '2025-01-20',
        status: 'in_progress',
        purchasePrice: 150,
      },
      {
        id: '3',
        name: 'Baldurs Gate 3',
        purchaseDate: '2025-03-05',
        completionDate: '2025-04-10',
        status: 'completed',
        purchasePrice: 200,
      },
      {
        id: '4',
        name: 'Pożyczona od kolegi',
        isBorrowedFrom: true,
        purchaseDate: '2025-03-01',
        status: 'in_progress',
      },
    ]);

    fixture.detectChanges();

    const kpi = component.kpiSummary();
    // 3 gry kupione (czwarta to pożyczona)
    expect(kpi.totalPurchased).toBe(3);
    // 2 gry ukończone (Wiedźmin 3, Baldurs Gate 3)
    expect(kpi.totalCompleted).toBe(2);
    // delta = 2 - 3 = -1
    expect(kpi.delta).toBe(-1);
    // backlogCount = 1 (Cyberpunk 2077)
    expect(kpi.backlogCount).toBe(1);
    expect(kpi.overallRatioText).toContain('66.7%');
  });

  it('powinien poprawnie grupować dane miesięcznie', () => {
    mockGamesSignal.set([
      {
        id: '1',
        name: 'Gra A',
        purchaseDate: '2026-01-15',
        completionDate: '2026-01-20',
        status: 'completed',
      },
      {
        id: '2',
        name: 'Gra B',
        purchaseDate: '2026-01-25',
        status: 'in_progress',
      },
      {
        id: '3',
        name: 'Gra C',
        completionDate: '2026-02-10',
        status: 'completed',
      },
    ]);

    fixture.detectChanges();

    const monthly = component.monthlyGroups();
    expect(monthly.length).toBe(2);

    // Styczeń 2026
    const jan = monthly.find((m) => m.periodKey === '2026-01');
    expect(jan).toBeDefined();
    expect(jan?.purchased.length).toBe(2);
    expect(jan?.completed.length).toBe(1);
    expect(jan?.delta).toBe(-1);
    expect(jan?.ratioText).toContain('50%');

    // Luty 2026
    const feb = monthly.find((m) => m.periodKey === '2026-02');
    expect(feb).toBeDefined();
    expect(feb?.purchased.length).toBe(0);
    expect(feb?.completed.length).toBe(1);
    expect(feb?.delta).toBe(1);
    expect(feb?.ratioText).toContain('Nadwyżka');
  });

  it('powinien poprawnie grupować dane rocznie', () => {
    mockGamesSignal.set([
      {
        id: '1',
        name: 'Gra 2024',
        purchaseDate: '2024-05-01',
        completionDate: '2024-06-01',
        status: 'completed',
      },
      {
        id: '2',
        name: 'Gra 2025 kupiona',
        purchaseDate: '2025-02-01',
        status: 'in_progress',
      },
      {
        id: '3',
        name: 'Gra 2025 ukończona',
        completionDate: '2025-03-01',
        status: 'completed',
      },
    ]);

    fixture.detectChanges();

    const yearly = component.yearlyGroups();
    expect(yearly.length).toBe(2);

    const year2024 = yearly.find((y) => y.periodKey === '2024');
    expect(year2024?.purchased.length).toBe(1);
    expect(year2024?.completed.length).toBe(1);
    expect(year2024?.ratioText).toContain('100%');

    const year2025 = yearly.find((y) => y.periodKey === '2025');
    expect(year2025?.purchased.length).toBe(1);
    expect(year2025?.completed.length).toBe(1);
    expect(year2025?.delta).toBe(0);
  });

  it('powinien poprawnie przełączać tryby widoku (viewMode)', () => {
    expect(component.viewMode()).toBe('monthly');

    component.setViewMode('yearly');
    expect(component.viewMode()).toBe('yearly');

    component.setViewMode('all-time');
    expect(component.viewMode()).toBe('all-time');
  });

  it('powinien pokazywać szczegóły tylko po wybraniu okresu i zamykać je po wyczyszczeniu', () => {
    mockGamesSignal.set([
      {
        id: '1',
        name: 'Gra A',
        purchaseDate: '2026-01-15',
        status: 'completed',
        completionDate: '2026-01-20',
      },
    ]);
    fixture.detectChanges();

    // Domyślnie brak zaznaczonego okresu -> activePeriodGroup jest null
    expect(component.selectedPeriodKey()).toBeNull();
    expect(component.activePeriodGroup()).toBeNull();

    // Wybór okresu (np. po kliknięciu w słupek wykresu)
    component.selectedPeriodKey.set('2026-01');
    expect(component.activePeriodGroup()?.periodKey).toBe('2026-01');
    expect(component.activePeriodGroup()?.purchased.length).toBe(1);

    // Zamknięcie szczegółów
    component.clearSelectedPeriod();
    expect(component.selectedPeriodKey()).toBeNull();
    expect(component.activePeriodGroup()).toBeNull();
  });
});
