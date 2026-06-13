import { Component } from '@angular/core';

import {
  IonContent,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonContent,
    IonCard,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}