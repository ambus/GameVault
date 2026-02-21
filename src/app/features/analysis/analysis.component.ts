import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-analysis',
  imports: [RouterOutlet],
  template: `
    <div class="analysis-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
      .analysis-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalysisComponent {}
