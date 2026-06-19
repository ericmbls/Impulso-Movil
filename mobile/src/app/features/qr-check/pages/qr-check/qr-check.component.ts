import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { qrCodeOutline, scanOutline, timeOutline } from 'ionicons/icons';

import { ScanFrameComponent } from '../../../../shared/components/qr/scan-frame/scan-frame.component';
import { LastScanCardComponent } from '../../../../shared/components/qr/last-scan-card/last-scan-card.component';

@Component({
  selector: 'app-qr-check',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    ScanFrameComponent,
    LastScanCardComponent
  ],
  templateUrl: './qr-check.component.html',
  styleUrl: './qr-check.component.scss',
})
export class QrCheckComponent {

  constructor() {
    addIcons({ qrCodeOutline, scanOutline, timeOutline });
  }
}