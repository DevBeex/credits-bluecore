import { Component, computed, input, output } from '@angular/core';
import { AppButtonComponent } from './app-button.component';

@Component({
  selector: 'app-pagination',
  imports: [AppButtonComponent],
  template: `
    <nav class="app-pagination" aria-label="Paginación">
      <p class="app-pagination__summary">
        Mostrando {{ shown() }} de {{ total() }}
      </p>
      <p class="app-pagination__page">
        Página {{ page() }} de {{ totalPages() }}
      </p>
      <div class="app-pagination__actions">
        <app-button
          variant="outline"
          expand="block"
          [disabled]="!canPrev()"
          (click)="pageChange.emit(page() - 1)"
        >
          Anterior
        </app-button>
        <app-button
          variant="outline"
          expand="block"
          [disabled]="!canNext()"
          (click)="pageChange.emit(page() + 1)"
        >
          Siguiente
        </app-button>
      </div>
    </nav>
  `,
  styles: `
    .app-pagination {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.45rem;
      margin-top: 1rem;
      padding: 0.9rem 0 0.5rem;
    }

    .app-pagination__summary,
    .app-pagination__page {
      margin: 0;
      color: #64748b;
      font-size: 0.88rem;
      text-align: center;
    }

    .app-pagination__actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      width: 100%;
      max-width: 360px;
      margin-top: 0.25rem;
    }
  `,
})
export class AppPaginationComponent {
  readonly page = input.required<number>();
  readonly limit = input.required<number>();
  readonly total = input.required<number>();
  readonly shown = input.required<number>();
  readonly pageChange = output<number>();

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.limit()) || 1),
  );
  readonly canPrev = computed(() => this.page() > 1);
  readonly canNext = computed(
    () => this.total() > 0 && this.page() < this.totalPages(),
  );
}
