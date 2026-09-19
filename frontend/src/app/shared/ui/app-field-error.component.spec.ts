import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { AppFieldErrorComponent } from './app-field-error.component';

describe('AppFieldErrorComponent', () => {
  it('hides the message until the field is touched or the form is submitted', () => {
    const fixture = TestBed.createComponent(AppFieldErrorComponent);
    const control = new FormControl('', Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('messages', { required: 'El correo es obligatorio' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toBe('');

    fixture.componentRef.setInput('submitted', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('El correo es obligatorio');
  });

  it('falls back to a generic message when the key is missing', () => {
    const fixture = TestBed.createComponent(AppFieldErrorComponent);
    const control = new FormControl('', Validators.required);
    control.markAsTouched();
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Dato inválido');
  });
});
