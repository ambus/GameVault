import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActiveElement, ChartEvent } from 'chart.js';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { GamesStore } from '../../games/games.store';
import { Game } from '../../games/games.types';

export type RatioViewMode = 'monthly' | 'yearly' | 'all-time';

interface PeriodGroup {
  periodKey: string;
  displayLabel: string;
  purchased: Game[];
  completed: Game[];
  ratioPercent: number | null;
  ratioText: string;
  delta: number;
}

@Component({
  standalone: true,
  selector: 'app-analysis-ratio',
  imports: [ChartModule, TableModule, DatePipe, CurrencyPipe],
  templateUrl: './analysis-ratio.component.html',
  styleUrl: './analysis-ratio.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalysisRatioComponent {
  private readonly store = inject(GamesStore);

  readonly viewMode = signal<RatioViewMode>('monthly');
  readonly selectedPeriodKey = signal<string | null>(null);

  // Filtrujemy wszystkie gry zakupione (nie pożyczone od kogoś)
  readonly purchasedGames = computed(() => {
    return this.store.games().filter((g) => !g['isBorrowedFrom']);
  });

  // Filtrujemy wszystkie gry ukończone
  readonly completedGames = computed(() => {
    return this.store
      .games()
      .filter((g) => g['status'] === 'completed' || Boolean(g['completionDate']));
  });

  // Podsumowanie globalne (Od początku)
  readonly kpiSummary = computed(() => {
    const purchased = this.purchasedGames();
    const completed = this.completedGames();

    const totalPurchased = purchased.length;
    const totalCompleted = completed.length;

    const delta = totalCompleted - totalPurchased;

    // Kupka wstydu: zakupione gry, które nie są ukończone
    const backlogCount = purchased.filter(
      (g) => g['status'] !== 'completed' && !g['completionDate'],
    ).length;

    let overallRatioText = '0%';
    if (totalPurchased > 0) {
      const pct = (totalCompleted / totalPurchased) * 100;
      overallRatioText = `${pct.toFixed(1)}% (${totalCompleted}/${totalPurchased})`;
    } else if (totalCompleted > 0) {
      overallRatioText = `>100% (${totalCompleted}/0)`;
    }

    return {
      totalPurchased,
      totalCompleted,
      delta,
      backlogCount,
      overallRatioText,
    };
  });

  // Grupowanie miesięczne
  readonly monthlyGroups = computed(() => {
    const games = this.store.games();
    const map = new Map<string, { purchased: Game[]; completed: Game[] }>();

    games.forEach((game) => {
      // Zakupy: sprawdzamy purchaseDate oraz brak isBorrowedFrom
      if (!game['isBorrowedFrom'] && game['purchaseDate']) {
        const d = new Date(game['purchaseDate'] as string | Date);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!map.has(key)) {
            map.set(key, { purchased: [], completed: [] });
          }
          map.get(key)!.purchased.push(game);
        }
      }

      // Ukończenia: sprawdzamy completionDate
      if (
        (game['status'] === 'completed' || Boolean(game['completionDate'])) &&
        game['completionDate']
      ) {
        const d = new Date(game['completionDate'] as string | Date);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!map.has(key)) {
            map.set(key, { purchased: [], completed: [] });
          }
          map.get(key)!.completed.push(game);
        }
      }
    });

    const sortedKeys = Array.from(map.keys()).sort();
    return sortedKeys.map((key) => {
      const data = map.get(key)!;
      const pCount = data.purchased.length;
      const cCount = data.completed.length;
      const delta = cCount - pCount;

      let ratioPercent: number | null = null;
      let ratioText = '0%';

      if (pCount > 0) {
        ratioPercent = (cCount / pCount) * 100;
        ratioText = `${ratioPercent.toFixed(0)}% (${cCount}/${pCount})`;
      } else if (cCount > 0) {
        ratioPercent = 100;
        ratioText = `Nadwyżka (${cCount}/0)`;
      }

      const [year, month] = key.split('-');
      const monthNames = [
        'Styczeń',
        'Luty',
        'Marzec',
        'Kwiecień',
        'Maj',
        'Czerwiec',
        'Lipiec',
        'Sierpień',
        'Wrzesień',
        'Październik',
        'Listopad',
        'Grudzień',
      ];
      const monthIndex = parseInt(month, 10) - 1;
      const displayLabel = `${monthNames[monthIndex] || month} ${year}`;

      return {
        periodKey: key,
        displayLabel,
        purchased: [...data.purchased].sort((a, b) => {
          const tA = new Date(a['purchaseDate'] as string | Date).getTime() || 0;
          const tB = new Date(b['purchaseDate'] as string | Date).getTime() || 0;
          return tB - tA;
        }),
        completed: [...data.completed].sort((a, b) => {
          const tA = new Date(a['completionDate'] as string | Date).getTime() || 0;
          const tB = new Date(b['completionDate'] as string | Date).getTime() || 0;
          return tB - tA;
        }),
        ratioPercent,
        ratioText,
        delta,
      } as PeriodGroup;
    });
  });

  // Grupowanie roczne
  readonly yearlyGroups = computed(() => {
    const games = this.store.games();
    const map = new Map<string, { purchased: Game[]; completed: Game[] }>();

    games.forEach((game) => {
      // Zakupy
      if (!game['isBorrowedFrom'] && game['purchaseDate']) {
        const d = new Date(game['purchaseDate'] as string | Date);
        if (!isNaN(d.getTime())) {
          const key = String(d.getFullYear());
          if (!map.has(key)) {
            map.set(key, { purchased: [], completed: [] });
          }
          map.get(key)!.purchased.push(game);
        }
      }

      // Ukończenia
      if (
        (game['status'] === 'completed' || Boolean(game['completionDate'])) &&
        game['completionDate']
      ) {
        const d = new Date(game['completionDate'] as string | Date);
        if (!isNaN(d.getTime())) {
          const key = String(d.getFullYear());
          if (!map.has(key)) {
            map.set(key, { purchased: [], completed: [] });
          }
          map.get(key)!.completed.push(game);
        }
      }
    });

    const sortedKeys = Array.from(map.keys()).sort();
    return sortedKeys.map((key) => {
      const data = map.get(key)!;
      const pCount = data.purchased.length;
      const cCount = data.completed.length;
      const delta = cCount - pCount;

      let ratioPercent: number | null = null;
      let ratioText = '0%';

      if (pCount > 0) {
        ratioPercent = (cCount / pCount) * 100;
        ratioText = `${ratioPercent.toFixed(0)}% (${cCount}/${pCount})`;
      } else if (cCount > 0) {
        ratioPercent = 100;
        ratioText = `Nadwyżka (${cCount}/0)`;
      }

      return {
        periodKey: key,
        displayLabel: `Rok ${key}`,
        purchased: [...data.purchased].sort((a, b) => {
          const tA = new Date(a['purchaseDate'] as string | Date).getTime() || 0;
          const tB = new Date(b['purchaseDate'] as string | Date).getTime() || 0;
          return tB - tA;
        }),
        completed: [...data.completed].sort((a, b) => {
          const tA = new Date(a['completionDate'] as string | Date).getTime() || 0;
          const tB = new Date(b['completionDate'] as string | Date).getTime() || 0;
          return tB - tA;
        }),
        ratioPercent,
        ratioText,
        delta,
      } as PeriodGroup;
    });
  });

  // Dane do wykresu słupkowego dla aktualnego trybu (miesięczny lub roczny)
  readonly currentBarChartData = computed(() => {
    const mode = this.viewMode();
    const groups = mode === 'monthly' ? this.monthlyGroups() : this.yearlyGroups();

    const labels = groups.map((g) => g.displayLabel);
    const purchasedData = groups.map((g) => g.purchased.length);
    const completedData = groups.map((g) => g.completed.length);

    return {
      labels,
      datasets: [
        {
          label: 'Zakupione gry',
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
          borderWidth: 1,
          data: purchasedData,
        },
        {
          label: 'Ukończone gry',
          backgroundColor: '#10b981',
          borderColor: '#059669',
          borderWidth: 1,
          data: completedData,
        },
      ],
    };
  });

  // Aktualnie wybrany okres i jego dane szczegółowe (tylko po kliknięciu w słupek na wykresie)
  readonly activePeriodGroup = computed(() => {
    const mode = this.viewMode();
    if (mode === 'all-time') return null;

    const selectedKey = this.selectedPeriodKey();
    if (!selectedKey) return null;

    const groups = mode === 'monthly' ? this.monthlyGroups() : this.yearlyGroups();
    return groups.find((g) => g.periodKey === selectedKey) ?? null;
  });

  // Wykres pierścieniowy dla trybu "Od początku"
  readonly allTimeDoughnutData = computed(() => {
    const kpi = this.kpiSummary();
    return {
      labels: ['Ukończone gry', 'Kupka wstydu (do ukończenia)'],
      datasets: [
        {
          data: [kpi.totalCompleted, kpi.backlogCount],
          backgroundColor: ['#10b981', '#f59e0b'],
          borderColor: ['#059669', '#d97706'],
          borderWidth: 1,
        },
      ],
    };
  });

  // Tabela roczna dla widoku "Od początku" (odwrócona kolejność: najnowsze na górze)
  readonly yearlySummaryList = computed(() => {
    return [...this.yearlyGroups()].reverse();
  });

  // Opcje wykresu słupkowego
  readonly barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: {
            family: 'Inter, sans-serif',
            size: 13,
          },
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          afterBody: (context: { datasetIndex: number; raw: unknown }[]) => {
            const purchased = (context[0]?.raw as number) || 0;
            const completed = (context[1]?.raw as number) || 0;
            const delta = completed - purchased;
            const ratio =
              purchased > 0 ? `${((completed / purchased) * 100).toFixed(0)}%` : 'Brak zakupów';
            return `\nStosunek: ${ratio}\nBilans: ${delta > 0 ? '+' : ''}${delta}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: 'rgba(255, 255, 255, 0.8)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
      },
    },
    onClick: (_event: ChartEvent, elements: ActiveElement[]) => {
      if (elements && elements.length > 0) {
        const index = elements[0].index;
        const groups = this.viewMode() === 'monthly' ? this.monthlyGroups() : this.yearlyGroups();
        if (groups[index]) {
          this.selectedPeriodKey.set(groups[index].periodKey);
        }
      }
    },
    onHover: (event: ChartEvent, elements: ActiveElement[]) => {
      if (event.native && event.native.target) {
        (event.native.target as HTMLElement).style.cursor = elements[0] ? 'pointer' : 'default';
      }
    },
  };

  // Opcje wykresu pierścieniowego
  readonly doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff',
          font: {
            family: 'Inter, sans-serif',
            size: 13,
          },
        },
      },
    },
  };

  setViewMode(mode: RatioViewMode): void {
    this.viewMode.set(mode);
    this.selectedPeriodKey.set(null);
  }

  clearSelectedPeriod(): void {
    this.selectedPeriodKey.set(null);
  }
}
