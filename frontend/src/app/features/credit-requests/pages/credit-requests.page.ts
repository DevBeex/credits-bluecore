import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { readApiError } from '../../../core/read-api-error';
import { AppButtonComponent } from '../../../shared/ui/app-button.component';
import { AppDialogComponent } from '../../../shared/ui/app-dialog.component';
import { AppPaginationComponent } from '../../../shared/ui/app-pagination.component';
import { AppSelectComponent } from '../../../shared/ui/app-select.component';
import { AppStatusBadgeComponent } from '../../../shared/ui/app-status-badge.component';
import { CreateCreditRequestModalComponent } from '../components/create-credit-request-modal.component';
import { LIST_LIMIT } from '../credit-request.constants';
import type { CreditRequest, CreditRequestStatus } from '../credit-request.models';
import { CreditRequestsApi } from '../credit-requests.api';

type StatusFilter = CreditRequestStatus | 'ALL';

@Component({
  selector: 'app-credit-requests',
  templateUrl: './credit-requests.page.html',
  styleUrls: ['./credit-requests.page.scss'],
  imports: [
    CurrencyPipe,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonNote,
    AppButtonComponent,
    AppDialogComponent,
    AppSelectComponent,
    AppPaginationComponent,
    AppStatusBadgeComponent,
    CreateCreditRequestModalComponent,
  ],
})
export class CreditRequestsPage implements OnInit {
  readonly statusOptions = [
    { value: 'ALL', label: 'Todas' },
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'APPROVED', label: 'Aprobada' },
    { value: 'REJECTED', label: 'Rechazada' },
  ];
  readonly skeletons = [0, 1, 2];
  readonly pageSize = LIST_LIMIT;
  readonly items = signal<CreditRequest[]>([]);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly statusFilter = signal<StatusFilter>('ALL');
  readonly loading = signal(false);
  readonly listError = signal<string | null>(null);
  readonly createOpen = signal(false);
  readonly dialogOpen = signal(false);
  readonly dialogKind = signal<'success' | 'error'>('success');
  readonly dialogTitle = signal('');
  readonly dialogMessage = signal('');

  constructor(private readonly api: CreditRequestsApi) {}

  ngOnInit(): void {
    this.load();
  }

  setFilter(filter: string): void {
    const next = filter as StatusFilter;
    if (this.statusFilter() === next) {
      return;
    }
    this.statusFilter.set(next);
    this.page.set(1);
    this.load();
  }

  goToPage(page: number): void {
    const totalPages = Math.max(1, Math.ceil(this.total() / LIST_LIMIT) || 1);
    if (page < 1 || page > totalPages || page === this.page()) {
      return;
    }
    this.page.set(page);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.listError.set(null);
    const status = this.statusFilter();
    this.api
      .list({
        status: status === 'ALL' ? undefined : status,
        page: this.page(),
        limit: LIST_LIMIT,
      })
      .subscribe({
        next: (response) => {
          this.items.set(response.data);
          this.total.set(response.meta.total);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);
          this.listError.set(readApiError(error));
        },
      });
  }

  openCreate(): void {
    this.createOpen.set(true);
  }

  closeCreate(): void {
    this.createOpen.set(false);
  }

  onCreated(): void {
    this.createOpen.set(false);
    this.statusFilter.set('PENDING');
    this.page.set(1);
    this.load();
    this.openDialog(
      'success',
      'Solicitud creada',
      'La solicitud quedó pendiente de revisión.',
    );
  }

  onCreateFailed(message: string): void {
    this.openDialog('error', 'No se pudo crear la solicitud', message);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
  }

  private openDialog(
    kind: 'success' | 'error',
    title: string,
    message: string,
  ): void {
    this.dialogKind.set(kind);
    this.dialogTitle.set(title);
    this.dialogMessage.set(message);
    this.dialogOpen.set(true);
  }

  statusLabel(status: CreditRequestStatus): string {
    if (status === 'PENDING') return 'Pendiente';
    if (status === 'APPROVED') return 'Aprobada';
    return 'Rechazada';
  }

  amountNumber(amount: string): number {
    return Number(amount);
  }
}
