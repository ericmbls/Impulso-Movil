import { Component, EventEmitter, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { scanOutline, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-scan-frame',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './scan-frame.component.html',
  styleUrl: './scan-frame.component.scss',
})
export class ScanFrameComponent {
  @Output() scan = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  isScanning = false;

  constructor() {
    addIcons({ scanOutline, closeOutline });
  }

  startScan() {
    this.isScanning = true;
    setTimeout(() => {
      this.isScanning = false;
      this.scan.emit('QR_CODE_SAMPLE_123456');
    }, 2000);
  }

  cancelScan() {
    this.isScanning = false;
    this.close.emit();
  }
}