import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { GamesStore } from '../games/games.store';

@Component({
  standalone: true,
  selector: 'app-analysis',
  imports: [ChartModule],
  template: `
    <div class="analysis-container">
      <h1>Analizy</h1>

      <div class="chart-container">
        <h2>Wydatki na gry (miesięcznie)</h2>
        <p-chart type="bar" [data]="data()" [options]="options"></p-chart>
      </div>
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalysisComponent {
  private readonly store = inject(GamesStore);

  readonly data = computed(() => {
    const games = this.store.games();
    const expensesByMonth = new Map<string, number>();

    // 1. Group expenses by month (YYYY-MM)
    games.forEach((game) => {
      // Skip if no price or not purchased
      if (!game.purchasePrice || !game.purchaseDate) return;

      const price = Number(game.purchasePrice);
      const date = new Date(game.purchaseDate as string | Date);

      if (isNaN(price) || isNaN(date.getTime())) return;

      // Format key as YYYY-MM
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = expensesByMonth.get(key) || 0;
      expensesByMonth.set(key, current + price);
    });

    // 2. Sort by date
    const sortedKeys = Array.from(expensesByMonth.keys()).sort();

    // 3. Prepare data for Chart.js
    return {
      labels: sortedKeys,
      datasets: [
        {
          label: 'Wydatki (PLN)',
          data: sortedKeys.map((key) => expensesByMonth.get(key)),
          backgroundColor: '#4ade80', // green-400
          borderColor: '#22c55e', // green-500
          borderWidth: 1,
        },
      ],
    };
  });

  readonly options = {
    plugins: {
      legend: {
        labels: {
          color: '#ffffff',
        },
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
  };
}
