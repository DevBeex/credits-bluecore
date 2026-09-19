import { Component, input, output } from '@angular/core';
import { AppButtonComponent } from './app-button.component';

export type AppDialogKind = 'success' | 'error';

@Component({
  selector: 'app-dialog',
  imports: [AppButtonComponent],
  template: `
    @if (isOpen()) {
      <div class="app-dialog-backdrop" (click)="closed.emit()">
        <div
          class="app-dialog"
          [class.app-dialog--success]="kind() === 'success'"
          [class.app-dialog--error]="kind() === 'error'"
          role="dialog"
          aria-modal="true"
          (click)="$event.stopPropagation()"
        >
          <h2>{{ title() }}</h2>
          <p>{{ message() }}</p>
          <app-button expand="block" type="button" (click)="closed.emit()">
            {{ confirmLabel() }}
          </app-button>
        </div>
      </div>
    }
  `,
  styles: `
    .app-dialog-backdrop {
      position: fixed;
      inset: 0;
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: rgb(15 23 42 / 45%);
    }

    .app-dialog {
      width: min(420px, 100%);
      border-radius: 16px;
      background: #ffffff;
      padding: 1.25rem 1.3rem 1.15rem;
      box-shadow: 0 18px 40px rgb(15 23 42 / 18%);
    }

    .app-dialog h2 {
      margin: 0 0 0.45rem;
      font-size: 1.15rem;
    }

    .app-dialog p {
      margin: 0 0 1.1rem;
      color: #475569;
      line-height: 1.45;
    }

    .app-dialog--success h2 {
      color: var(--app-status-approved);
    }

    .app-dialog--error h2 {
      color: var(--app-status-rejected);
    }
  `,
})
export class AppDialogComponent {
  readonly isOpen = input(false);
  readonly kind = input<AppDialogKind>('success');
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly confirmLabel = input('Entendido');
  readonly closed = output<void>();
}
