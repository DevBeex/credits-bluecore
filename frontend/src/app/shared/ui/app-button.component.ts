import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `
    <button
      class="app-button"
      [class.app-button--primary]="variant() === 'primary'"
      [class.app-button--outline]="variant() === 'outline'"
      [class.app-button--ghost]="variant() === 'ghost'"
      [class.app-button--toolbar]="variant() === 'toolbar'"
      [class.app-button--icon]="variant() === 'icon'"
      [class.app-button--block]="expand() === 'block'"
      [attr.type]="type()"
      [attr.aria-label]="ariaLabel()"
      [disabled]="disabled()"
    >
      <ng-content />
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    :host:has(.app-button--block) {
      display: flex;
      width: 100%;
    }

    .app-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      min-height: 2.5rem;
      padding: 0.55rem 1rem;
      border: 1px solid transparent;
      border-radius: 10px;
      font-size: 0.92rem;
      font-weight: 650;
      letter-spacing: 0.01em;
      cursor: pointer;
    }

    .app-button:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .app-button--primary {
      background: var(--ion-color-primary);
      color: #ffffff;
    }

    .app-button--outline {
      background: #ffffff;
      border-color: var(--ion-color-primary);
      color: var(--ion-color-primary);
    }

    .app-button--ghost {
      background: transparent;
      color: var(--ion-color-primary);
    }

    .app-button--toolbar {
      background: #ffffff;
      color: var(--ion-color-primary);
    }

    .app-button--icon {
      min-width: 2.25rem;
      min-height: 2.25rem;
      width: 2.25rem;
      padding: 0;
      border-radius: 999px;
      background: rgb(255 255 255 / 16%);
      color: #ffffff;
    }

    .app-button--block {
      width: 100%;
    }
  `,
})
export class AppButtonComponent {
  readonly type = input<'button' | 'submit'>('button');
  readonly variant = input<
    'primary' | 'outline' | 'ghost' | 'toolbar' | 'icon'
  >('primary');
  readonly expand = input<'inline' | 'block'>('inline');
  readonly disabled = input(false);
  readonly ariaLabel = input<string | null>(null);
}
