import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
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
export class ScanFrameComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() disabled = false;
  @Input() active = true;
  @Input() autoStart = true;
  @Output() scan = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  scanStatus: ScanStatus = 'idle';

  private viewInitialized = false;
  private destroyed = false;
  private scannerRunning = false;
  private scannerStarting = false;
  private scannerQueue: Promise<void> = Promise.resolve();
  private barcodeListener?: PluginListenerHandle;
  private errorListener?: PluginListenerHandle;
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
    return this.viewInitialized && !this.destroyed && this.active && !this.disabled && !this.scannerRunning && !this.scannerStarting;
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    console.log('[QR] ScanFrame listo:', { active: this.active, disabled: this.disabled, autoStart: this.autoStart });
    this.requestScannerSync();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const relevantChange = !!changes['active'] || !!changes['disabled'] || !!changes['autoStart'];
    if (!relevantChange) return;
    console.log('[QR] Estado recibido:', { active: this.active, disabled: this.disabled, autoStart: this.autoStart });
    if (!this.viewInitialized) return;
    this.requestScannerSync();
  }

  ngOnDestroy(): void {
    console.log('[QR] Destruyendo ScanFrameComponent');
    this.destroyed = true;
    this.clearStatusTimeout();
    void this.enqueueScannerOperation(async () => {
      await this.stopScannerInternal();
    });
  }

  private requestScannerSync(): void {
    const shouldRun = this.active && !this.disabled && this.autoStart && !this.destroyed;
    void this.enqueueScannerOperation(async () => {
      if (!shouldRun) {
        await this.stopScannerInternal();
        return;
      }
      if (this.destroyed || !this.active || this.disabled || !this.autoStart) return;
      await this.startScannerInternal();
    });
  }

  private enqueueScannerOperation(operation: () => Promise<void>): Promise<void> {
    const next = this.scannerQueue.then(operation, operation);
    this.scannerQueue = next.catch(error => {
      console.error('[QR] Error en cola del scanner:', error);
    });
    return next;
  }

  async startScanner(): Promise<void> {
    await this.enqueueScannerOperation(async () => {
      await this.startScannerInternal();
    });
  }

  private async startScannerInternal(): Promise<void> {
    if (this.destroyed || !this.viewInitialized || !this.active || this.disabled || this.scannerRunning || this.scannerStarting) {
      console.log('[QR] Inicio omitido:', {
        destroyed: this.destroyed,
        viewInitialized: this.viewInitialized,
        active: this.active,
        disabled: this.disabled,
        scannerRunning: this.scannerRunning,
        scannerStarting: this.scannerStarting,
      });
      return;
    }
    if (Capacitor.getPlatform() === 'web') {
      console.warn('[QR] Scanner nativo no disponible en web');
      this.setStatus('error');
      return;
    }
    this.clearStatusTimeout();
    this.scannerStarting = true;
    this.scanStatus = 'idle';
    try {
      const permissions = await BarcodeScanner.checkPermissions();
      console.log('[QR] Permiso cámara:', permissions.camera);
      if (permissions.camera !== 'granted') {
        const requested = await BarcodeScanner.requestPermissions();
        console.log('[QR] Permiso solicitado:', requested.camera);
        if (requested.camera !== 'granted') {
          console.warn('[QR] Permiso de cámara rechazado');
          this.setStatus('error');
          return;
        }
      }
      if (this.destroyed || !this.active || this.disabled) {
        console.log('[QR] La pantalla dejó de estar activa antes de iniciar.');
        return;
      }
      await this.removeScannerListeners();
      this.barcodeListener = await BarcodeScanner.addListener('barcodesScanned', event => {
        if (this.destroyed || !this.active || this.disabled) return;
        const barcode = event.barcodes?.[0];
        if (!barcode) return;
        const qrToken = barcode.rawValue?.trim();
        if (!qrToken) return;
        this.handleQr(qrToken);
      });
      this.errorListener = await BarcodeScanner.addListener('scanError', event => {
        console.error('[QR] Error ML Kit:', event.message);
        if (!this.destroyed && this.active && !this.disabled) {
          this.setStatus('error');
        }
      });
      if (this.destroyed || !this.active || this.disabled) {
        await this.removeScannerListeners();
        return;
      }
      console.log('[QR] Iniciando cámara ML Kit...');
      document.body.classList.add('barcode-scanner-active');
      this.scannerRunning = true;
      this.scanStatus = 'scanning';
      await BarcodeScanner.startScan({ formats: [BarcodeFormat.QrCode] });
      console.log('[QR] Cámara ML Kit iniciada.');
    } catch (error) {
      console.error('[QR] Error iniciando scanner:', error);
      await this.stopScannerInternal();
      if (!this.destroyed && this.active && !this.disabled) {
        this.setStatus('error');
      }
    } finally {
      this.scannerStarting = false;
    }
  }

  private async stopScannerInternal(): Promise<void> {
    this.clearStatusTimeout();
    const hadScannerState = this.scannerRunning || this.scannerStarting || !!this.barcodeListener || !!this.errorListener;
    try {
      if (Capacitor.getPlatform() !== 'web' && hadScannerState) {
        try {
          await BarcodeScanner.stopScan();
        } catch (error) {
          console.warn('[QR] stopScan devolvió error:', error);
        }
      }
      await this.removeScannerListeners();
    } finally {
      document.body.classList.remove('barcode-scanner-active');
      this.scannerRunning = false;
      this.scannerStarting = false;
      this.lastQrToken = '';
      this.lastScanAt = 0;
      if (this.scanStatus !== 'error') {
        this.scanStatus = 'idle';
      }
      if (hadScannerState) {
        console.log('[QR] Scanner completamente detenido.');
      }
    }
  }

  async retryScan(): Promise<void> {
    if (this.destroyed || !this.active || this.disabled) return;
    await this.enqueueScannerOperation(async () => {
      await this.stopScannerInternal();
      if (this.destroyed || !this.active || this.disabled) return;
      this.scanStatus = 'idle';
      await this.delay(120);
      if (this.destroyed || !this.active || this.disabled) return;
      await this.startScannerInternal();
    });
  }

  async cancelScan(): Promise<void> {
    await this.enqueueScannerOperation(async () => {
      await this.stopScannerInternal();
    });
    this.scanStatus = 'idle';
    this.close.emit();
  }

  private handleQr(qrToken: string): void {
    if (this.destroyed || !this.active || this.disabled) return;
    const now = Date.now();
    if (qrToken === this.lastQrToken && now - this.lastScanAt < this.scanCooldown) {
      console.log('[QR] Lectura duplicada ignorada');
      return;
    }
    this.lastQrToken = qrToken;
    this.lastScanAt = now;
    this.scanStatus = 'success';
    this.scan.emit(qrToken);
    this.clearStatusTimeout();
    this.statusTimeout = setTimeout(() => {
      if (!this.destroyed && this.active && !this.disabled && this.scannerRunning) {
        this.scanStatus = 'scanning';
      }
      this.statusTimeout = undefined;
    }, 1200);
  }

  private async removeScannerListeners(): Promise<void> {
    if (this.barcodeListener) {
      try {
        await this.barcodeListener.remove();
      } catch (error) {
        console.warn('[QR] Error eliminando barcodeListener:', error);
      }
      this.barcodeListener = undefined;
    }
    if (this.errorListener) {
      try {
        await this.errorListener.remove();
      } catch (error) {
        console.warn('[QR] Error eliminando errorListener:', error);
      }
      this.errorListener = undefined;
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

  private delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }
}