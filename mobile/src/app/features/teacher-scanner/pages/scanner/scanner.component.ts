import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  scanOutline,
  qrCodeOutline,
} from 'ionicons/icons';

import {
  ScanFrameComponent,
} from '@shared/components/qr/scan-frame/scan-frame.component';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    ScanFrameComponent,
  ],
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.scss',
})
export class ScannerComponent {
  constructor() {
    addIcons({
      scanOutline,
      qrCodeOutline,
    });
  }

  onScanSuccess(qrToken: string): void {
    console.log('QR escaneado:', qrToken);
  }

  onScanClose(): void {
    console.log('Scanner cerrado');
  }
}