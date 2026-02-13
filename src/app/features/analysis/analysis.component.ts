import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-analysis',
  template: `
    <div class="analysis-container">
      <h1>Analizy</h1>
      <p>Tutaj pojawią się wykresy i statystyki.</p>
    </div>
  `,
  styles: [
    `
      .analysis-container {
        padding: 2rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalysisComponent {}
