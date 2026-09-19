import { Component } from '@angular/core';
import {
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

@Component({
  selector: 'app-credit-requests',
  templateUrl: './credit-requests.page.html',
  styleUrls: ['./credit-requests.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons, 
    IonMenuButton,
    IonTitle,
    IonContent,
    IonChip,
    IonNote,
  ],
})
export class CreditRequestsPage {}