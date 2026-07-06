import { Component } from '@angular/core';

import {
  IonContent,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';

import { addIcons } from 'ionicons';

import {
  cameraOutline,
  qrCodeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonButton,
    IonIcon
  ],
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.scss'
})
export class ScannerComponent {

  constructor() {

    addIcons({
      cameraOutline,
      qrCodeOutline
    });

  }

}