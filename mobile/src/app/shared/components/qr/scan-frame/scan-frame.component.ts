import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  scanOutline,
  closeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
} from 'ionicons/icons';
import {
  BarcodeScanner,
  BarcodeFormat,
} from '@capacitor-mlkit/barcode-scanning';

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

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

  scanStatus: ScanStatus = 'idle';

  private statusTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    addIcons({
      scanOutline,
      closeOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
    });
  }

  get isScanning(): boolean {
    return this.scanStatus === 'scanning';
  }

  get showSuccess(): boolean {
    return this.scanStatus === 'success';
  }

  get showError(): boolean {
    return this.scanStatus === 'error';
  }

  async startScan(): Promise<void> {
    if (this.scanStatus !== 'idle') {
      return;
    }

    try {
      const permissions = await BarcodeScanner.checkPermissions();

      if (permissions.camera !== 'granted') {
        const requested = await BarcodeScanner.requestPermissions();

        if (requested.camera !== 'granted') {
          console.error('Permiso de cámara denegado');
          this.setStatus('error');
          return;
        }
      }

      this.setStatus('scanning');

      const result = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode],
      });

      if (!result.barcodes.length) {
        this.setStatus('idle');
        return;
      }

      const qrToken = result.barcodes[0].rawValue;

      if (!qrToken) {
        this.setStatus('error');
        return;
      }

      console.log('QR detectado:', qrToken);

      this.setStatus('success');
      this.scan.emit(qrToken);
    } catch (error) {
      console.error('Error al escanear QR:', error);
      this.setStatus('error');
    }
  }

  private setStatus(status: ScanStatus): void {
    this.scanStatus = status;

    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
      this.statusTimeout = undefined;
    }

    if (status === 'success' || status === 'error') {
      this.statusTimeout = setTimeout(() => {
        this.scanStatus = 'idle';
        this.statusTimeout = undefined;
      }, 3000);
    }
  }

  async cancelScan(): Promise<void> {
    try {
      await BarcodeScanner.stopScan();
    } catch (error) {
      console.error('Error al detener scanner:', error);
    }

    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
      this.statusTimeout = undefined;
    }

    this.scanStatus = 'idle';
    this.close.emit();
  }
}