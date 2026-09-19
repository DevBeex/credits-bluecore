import { TestBed } from '@angular/core/testing';
import { AppPaginationComponent } from './app-pagination.component';

describe('AppPaginationComponent', () => {
  function create(page: number, limit: number, total: number, shown: number) {
    const fixture = TestBed.createComponent(AppPaginationComponent);
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('limit', limit);
    fixture.componentRef.setInput('total', total);
    fixture.componentRef.setInput('shown', shown);
    fixture.detectChanges();
    return fixture;
  }

  it('disables previous on the first page and next when there is no more data', () => {
    const fixture = create(1, 10, 8, 8);
    const component = fixture.componentInstance;

    expect(component.totalPages()).toBe(1);
    expect(component.canPrev()).toBe(false);
    expect(component.canNext()).toBe(false);
    expect(fixture.nativeElement.textContent).toContain('Mostrando 8 de 8');
  });

  it('allows next on a full first page of a larger result set', () => {
    const fixture = create(1, 10, 21, 10);
    const component = fixture.componentInstance;

    expect(component.totalPages()).toBe(3);
    expect(component.canPrev()).toBe(false);
    expect(component.canNext()).toBe(true);
  });

  it('emits the previous page when Anterior is clicked', () => {
    const fixture = create(2, 10, 21, 10);
    const emitted: number[] = [];
    fixture.componentInstance.pageChange.subscribe((page) => emitted.push(page));

    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();

    expect(emitted).toEqual([1]);
  });
});
