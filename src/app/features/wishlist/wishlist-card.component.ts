import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { WishlistItem } from './wishlist.types';

@Component({
  standalone: true,
  selector: 'app-wishlist-card',
  imports: [CommonModule, CardModule, TooltipModule, ButtonModule],
  template: `
    <p-card styleClass="game-card" (click)="onCardClick()">
      <div class="game-card-content">
        <div class="game-header">
          <h3 class="game-title">{{ item().name }}</h3>
          <div class="game-actions">
            <p-button
              icon="pi pi-arrow-right"
              [rounded]="true"
              [text]="true"
              severity="secondary"
              size="small"
              (click)="onMoveToGames($event)"
              pTooltip="Przenieś do gier"
              tooltipPosition="top"
            />
            <p-button
              icon="pi pi-trash"
              [rounded]="true"
              [text]="true"
              severity="secondary"
              size="small"
              (click)="onRemove($event)"
              pTooltip="Usuń z listy życzeń"
              tooltipPosition="top"
            />
          </div>
        </div>

        <div class="game-icons">
          <span
            class="icon-wrapper"
            [pTooltip]="item().platform"
            tooltipPosition="top"
          >
            @if (isNintendoSwitch(item().platform)) {
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/9/9f/Nintendo-switch-icon.png"
                alt="Nintendo Switch"
                class="nintendo-switch-icon"
              />
            } @else if (isNintendoSwitch2(item().platform)) {
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c9/Nintendo_Switch_2_logo.svg"
                alt="Nintendo Switch 2"
                class="nintendo-switch-icon"
              />
            } @else {
              <i [class]="getPlatformIcon(item().platform)"></i>
            }
          </span>
          @if (item().distributionForm) {
            <span
              class="icon-wrapper"
              [pTooltip]="getDistributionLabel(item().distributionForm)"
              tooltipPosition="top"
            >
              <i [class]="getDistributionIcon(item().distributionForm)"></i>
            </span>
          }
        </div>

        @if (item().coverImage) {
          <div class="game-cover">
            <img [src]="item().coverImage" [alt]="item().name" />
          </div>
        }

        <div class="game-info">
          @if (item().releaseDate) {
            <div class="info-row">
              <span class="info-label">Premiera:</span>
              <span class="info-value">{{ item().releaseDate }}</span>
            </div>
          }

          @if (item().link) {
            <div class="info-row">
              <span class="info-label">Link:</span>
              <a
                [href]="item().link"
                target="_blank"
                class="info-value link-text"
                (click)="$event.stopPropagation()"
                >{{ item().link }}</a
              >
            </div>
          }

          @if (item().comment) {
            <div class="info-row">
              <span class="info-label">Komentarz:</span>
            </div>
            <div class="comment-section">
              <p class="comment-text">{{ item().comment }}</p>
            </div>
          }
        </div>
      </div>
    </p-card>
  `,
  styles: [
    `
      .game-card {
        background-color: var(--color-card-bg) !important;
        border: 1px solid var(--color-card-border) !important;
        border-radius: 8px !important;
        cursor: pointer;
        transition:
          border-color 0.2s ease,
          box-shadow 0.2s ease;
      }
      .game-card:hover {
        border-color: rgba(255, 255, 255, 0.2) !important;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
      }
      .game-card-content {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        color: var(--color-card-text);
      }
      .game-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.5rem;
      }
      .game-title {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--color-card-text);
        line-height: 1.3;
        flex: 1;
      }
      .game-actions {
        display: flex;
        gap: 0.25rem;
      }
      .game-icons {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      .icon-wrapper {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        font-size: 1.2rem;
        color: var(--color-card-text-secondary, rgba(255, 255, 255, 0.7));
      }
      .icon-wrapper i {
        font-size: 1.2rem;
      }
      .nintendo-switch-icon {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: contain;
      }
      .game-cover {
        width: 100%;
        height: 200px;
        overflow: hidden;
        border-radius: 4px;
        background-color: var(
          --color-card-bg-secondary,
          rgba(255, 255, 255, 0.05)
        );
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .game-cover img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
      .game-info {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        font-size: 0.875rem;
      }
      .info-row {
        display: flex;
        gap: 0.5rem;
        align-items: baseline;
      }
      .info-label {
        font-weight: 500;
        color: var(--color-card-text-secondary, rgba(255, 255, 255, 0.7));
        min-width: fit-content;
      }
      .info-value {
        color: var(--color-card-text);
        flex: 1;
      }
      .link-text {
        color: var(--primary-color);
        text-decoration: none;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .link-text:hover {
        text-decoration: underline;
      }
      .comment-section {
        margin-top: -0.25rem;
        padding-left: 0.5rem;
        border-left: 2px solid var(--primary-color);
      }
      .comment-text {
        margin: 0;
        font-size: 0.875rem;
        font-style: italic;
        color: var(--text-color-secondary);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistCardComponent {
  item = input.required<WishlistItem>();
  cardClick = output<WishlistItem>();
  remove = output<string>();
  moveToGames = output<WishlistItem>();

  onCardClick(): void {
    this.cardClick.emit(this.item());
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    this.remove.emit(this.item().id);
  }

  onMoveToGames(event: Event): void {
    event.stopPropagation();
    this.moveToGames.emit(this.item());
  }

  isNintendoSwitch(platform: string): boolean {
    const p = platform.toLowerCase();
    return p === 'nintendo switch' || p === 'ns' || p === 'nintendo-switch';
  }

  isNintendoSwitch2(platform: string): boolean {
    const p = platform.toLowerCase();
    return p === 'nintendo switch 2' || p === 'ns2' || p === 'nintendo-switch-2';
  }

  getPlatformIcon(platform: string): string {
    const p = platform.toLowerCase().trim();
    switch (p) {
      case 'pc':
        return 'pi pi-desktop';
      case 'mac':
        return 'pi pi-apple';
      case 'ps5':
      case 'ps4':
      case 'playstation':
        return 'pi pi-playstation';
      case 'xbox series':
      case 'xbox-series':
      case 'xbox one':
      case 'xbox-one':
      case 'xbox':
        return 'pi pi-xbox';
      default:
        return 'pi pi-desktop';
    }
  }

  getDistributionIcon(form: string | undefined): string {
    return form === 'digital' ? 'pi pi-cloud-download' : 'pi pi-box';
  }

  getDistributionLabel(form: string | undefined): string {
    return form === 'digital' ? 'Cyfrowa' : 'Pudełkowa';
  }
}
