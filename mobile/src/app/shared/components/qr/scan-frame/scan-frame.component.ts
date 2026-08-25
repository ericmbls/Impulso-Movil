import { Component, EventEmitter, Input, Output, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { addIcons } from 'ionicons';
import { cameraOutline, checkmarkCircleOutline, closeCircleOutline, refreshOutline, scanOutline } from 'ionicons/icons';
import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

type ScanStatus = 'idle' | 'scanning' | 'success' | 'error';

@Component({
  selector: 'app-scan-frame',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './scan-frame.component.html',
  styleUrl: './scan-frame.component.scss',
})
export class ScanFrameComponent implements OnChanges, OnDestroy {
  @Input() disabled = false;
  @Input() autoStart = true;
  @Output() scan = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  scanStatus: ScanStatus = 'idle';
  private scannerRunning = false;
  private listener?: PluginListenerHandle;
  private lastQrToken = '';
  private lastScanAt = 0;
  private readonly scanCooldown = 1800;
  private statusTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    addIcons({ cameraOutline, checkmarkCircleOutline, closeCircleOutline, refreshOutline, scanOutline });
  }

  get isScanning(): boolean {
    return this.scanStatus === 'scanning';
  }

  get canScan(): boolean {
    return !this.disabled && !this.scannerRunning;
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!changes['disabled']) return;
    if (this.disabled) {
      await this.stopScanner();
      return;
    }
    if (this.autoStart) {
      await this.startScanner();
    }
  }

  async startScanner(): Promise<void> {
    if (this.disabled || this.scannerRunning) return;
    if (Capacitor.getPlatform() === 'web') {
      this.setStatus('error');
      return;
    }
    this.clearStatusTimeout();
    try {
      const permissions = await BarcodeScanner.checkPermissions();
      if (permissions.camera !== 'granted') {
        const requested = await BarcodeScanner.requestPermissions();
        if (requested.camera !== 'granted') {
          this.setStatus('error');
          return;
        }
      }
      this.scannerRunning = true;
      this.scanStatus = 'scanning';
      document.body.classList.add('barcode-scanner-active');
      this.listener = await BarcodeScanner.addListener('barcodesScanned', event => {
        const qrToken = event.barcodes?.[0]?.rawValue?.trim();
        if (!qrToken) return;
        this.handleQr(qrToken);
      });
      await BarcodeScanner.startScan({ formats: [BarcodeFormat.QrCode] });
    } catch (error) {
      console.error('[QR] Error al iniciar scanner:', error);
      await this.stopScanner();
      this.setStatus('error');
    }
  }

  async retryScan(): Promise<void> {
    await this.stopScanner();
    this.scanStatus = 'idle';
    await this.startScanner();
  }

  async cancelScan(): Promise<void> {
    await this.stopScanner();
    this.scanStatus = 'idle';
    this.close.emit();
  }

  async ngOnDestroy(): Promise<void> {
    await this.stopScanner();
    this.clearStatusTimeout();
  }

  private handleQr(qrToken: string): void {
    const now = Date.now();
    if (qrToken === this.lastQrToken && now - this.lastScanAt < this.scanCooldown) return;
    this.lastQrToken = qrToken;
    this.lastScanAt = now;
    this.scanStatus = 'success';
    this.scan.emit(qrToken);
    this.clearStatusTimeout();
    this.statusTimeout = setTimeout(() => {
      if (this.scannerRunning) {
        this.scanStatus = 'scanning';
      }
      this.statusTimeout = undefined;
    }, 1200);
  }

  private async stopScanner(): Promise<void> {
    this.clearStatusTimeout();
    try {
      if (this.listener) {
        await this.listener.remove();
        this.listener = undefined;
      }
      if (this.scannerRunning) {
        await BarcodeScanner.stopScan();
      }
    } catch (error) {
      console.error('[QR] Error al detener scanner:', error);
    } finally {
      document.body.classList.remove('barcode-scanner-active');
      this.scannerRunning = false;
      if (this.scanStatus === 'scanning') {
        this.scanStatus = 'idle';
      }
    }
  }

  private setStatus(status: ScanStatus): void {
    this.clearStatusTimeout();
    this.scanStatus = status;
  }

  private clearStatusTimeout(): void {
    if (!this.statusTimeout) return;
    clearTimeout(this.statusTimeout);
    this.statusTimeout = undefined;
  }
}