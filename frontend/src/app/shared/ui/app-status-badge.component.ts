import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  template: ` <span class="status-badge" [class]="status()">{{ label() }}</span> `,
  styles: `
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    .PENDING {
      background: var(--app-status-pending);
    }

    .APPROVED {
      background: var(--app-status-approved);
    }

    .REJECTED {
      background: var(--app-status-rejected);
    }
  `,
})
export class AppStatusBadgeComponent {
  readonly status = input.required<string>();
  readonly label = input.required<string>();
}
