import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActiveElement, ChartEvent } from 'chart.js';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { GamesStore } from '../../games/games.store';

@Component({
  standalone: true,
  selector: 'app-analysis',
  imports: [ChartModule, TableModule, DatePipe],
  template: `
    <div class="analysis-container">
      <div class="chart-container">
        <h2>Ukończone gry (miesięcznie)</h2>
        <p-chart type="bar" [data]="data()" [options]="options"></p-chart>
      </div>

      @if (selectedMonth()) {
        <div class="details-container">
          <div class="header-row">
            <h2>Szczegóły dla {{ selectedMonth() }}</h2>
            <button class="btn-close" (click)="clearSelection()">Zamknij</button>
          </div>

          <p-table [value]="selectedMonthGames()" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>Data ukończenia</th>
                <th>Tytuł</th>
                <th>Platforma</th>
                <th class="text-right">Moja ocena</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-game>
              <tr>
                <td>{{ game.completionDate | date: 'dd.MM.yyyy' }}</td>
                <td>{{ game.name }}</td>
                <td>{{ game.platform }}</td>
                <td class="text-right">
                  {{ game.rating ? game.rating + '/10' : '-' }}
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .analysis-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .chart-container {
        background-color: var(--surface-card);
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
        margin-top: 2rem;
      }

      h2 {
        margin-top: 0;
        margin-bottom: 1.5rem;
        font-size: 1.25rem;
        color: var(--text-color);
      }

      .details-container {
        background-color: var(--surface-card);
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
        margin-top: 2rem;
        animation: fadeIn 0.3s ease-in-out;
      }

      .header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .text-right {
        text-align: right;
      }

      .btn-close {
        background: transparent;
        border: 1px solid var(--primary-color);
        color: var(--primary-color);
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-close:hover {
        background: var(--primary-color);
        color: #fff;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalysisCompletedComponent {
  private readonly store = inject(GamesStore);

  // Track selected month for details view
  readonly selectedMonth = signal<string | null>(null);

  readonly data = computed(() => {
    const games = this.store.games();
    const completedGamesByMonth = new Map<string, number>();

    // 1. Group completed games by month (YYYY-MM)
    games.forEach((game) => {
      // Skip if not completed
      if (!game['completionDate'] || game['status'] !== 'completed') return;

      const date = new Date(game['completionDate'] as string | Date);

      if (isNaN(date.getTime())) return;

      // Format key as YYYY-MM
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = completedGamesByMonth.get(key) || 0;
      completedGamesByMonth.set(key, current + 1);
    });

    // 2. Sort by date
    const sortedKeys = Array.from(completedGamesByMonth.keys()).sort();

    // 3. Prepare data for Chart.js
    return {
      labels: sortedKeys,
      datasets: [
        {
          label: 'Ukończone gry',
          data: sortedKeys.map((key) => completedGamesByMonth.get(key)),
          backgroundColor: '#3b82f6', // blue-500
          borderColor: '#2563eb', // blue-600
          borderWidth: 1,
        },
      ],
    };
  });

  readonly selectedMonthGames = computed(() => {
    const month = this.selectedMonth();
    if (!month) return [];

    return this.store
      .games()
      .filter((g) => {
        if (!g['completionDate'] || g['status'] !== 'completed') return false;
        const date = new Date(g['completionDate'] as string | Date);
        if (isNaN(date.getTime())) return false;

        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return key === month;
      })
      .sort((a, b) => {
        // Sort by completion date desc
        const dateA = new Date(a['completionDate'] as string | Date).getTime();
        const dateB = new Date(b['completionDate'] as string | Date).getTime();
        return dateB - dateA;
      });
  });

  readonly options = {
    plugins: {
      legend: {
        labels: {
          color: '#ffffff',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (this.data().labels && this.data().labels[index]) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.selectedMonth.set(this.data().labels[index]);
        }
      }
    },
    onHover: (event: ChartEvent, elements: ActiveElement[]) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      event.native.target.style.cursor = elements[0] ? 'pointer' : 'default';
    },
  };

  clearSelection() {
    this.selectedMonth.set(null);
  }
}
