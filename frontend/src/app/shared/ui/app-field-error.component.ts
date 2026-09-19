import { Component, computed, effect, input, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { merge } from 'rxjs';

@Component({
  selector: 'app-field-error',
  template: `
    @if (text(); as message) {
      <p class="app-field-error">{{ message }}</p>
    }
  `,
  styles: `
    .app-field-error {
      margin: 0.35rem 0.75rem 0.15rem;
      color: var(--ion-color-danger);
      font-size: 0.8rem;
    }
  `,
})
export class AppFieldErrorComponent {
  readonly control = input.required<AbstractControl | null>();
  readonly messages = input<Record<string, string>>({});
  readonly submitted = input(false);
  private readonly version = signal(0);

  constructor() {
    effect((onCleanup) => {
      const control = this.control();
      if (!control) {
        return;
      }

      const subscription = merge(
        control.statusChanges,
        control.valueChanges,
        control.events,
      ).subscribe(() => this.version.update((value) => value + 1));

      onCleanup(() => subscription.unsubscribe());
    });
  }

  readonly text = computed(() => {
    this.version();
    const submitted = this.submitted();
    const control = this.control();
    if (
      !control?.invalid ||
      !(control.touched || control.dirty || submitted)
    ) {
      return null;
    }

    const key = Object.keys(control.errors ?? {})[0];
    if (!key) {
      return null;
    }

    return this.messages()[key] ?? 'Dato inválido';
  });
}
