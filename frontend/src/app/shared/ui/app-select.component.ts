import { Component, input, output } from '@angular/core';

export type AppSelectOption = {
  value: string;
  label: string;
};

@Component({
  selector: 'app-select',
  template: `
    <label class="app-select">
      <span class="app-select__label">{{ label() }}</span>
      <select
        class="app-select__control"
        [value]="value()"
        (change)="onChange($event)"
      >
        @for (option of options(); track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
    </label>
  `,
  styles: `
    .app-select {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      min-width: min(100%, 220px);
    }

    .app-select__label {
      font-size: 0.8rem;
      font-weight: 650;
      color: #475569;
    }

    .app-select__control {
      min-height: 2.6rem;
      padding: 0.45rem 0.8rem;
      border: 1px solid #d5dde6;
      border-radius: 10px;
      background: #ffffff;
      color: var(--ion-text-color);
      font-size: 0.95rem;
    }
  `,
})
export class AppSelectComponent {
  readonly label = input.required<string>();
  readonly options = input.required<AppSelectOption[]>();
  readonly value = input.required<string>();
  readonly valueChange = output<string>();

  onChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.valueChange.emit(select.value);
  }
}
