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
  private scannerRunning = false;
  private scannerStarting = false;
  private barcodeListener?: PluginListenerHandle;
  private errorListener?: PluginListenerHandle;
  private lastQrToken = '';
  private lastScanAt = 0;
  private readonly scanCooldown = 1800;
  private statusTimeout?: ReturnType<typeof setTimeout>;
  private startTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    addIcons({ cameraOutline, checkmarkCircleOutline, closeCircleOutline, refreshOutline, scanOutline });
  }

  get isScanning(): boolean {
    return this.scanStatus === 'scanning';
  }

  get canScan(): boolean {
    return this.active && !this.disabled && !this.scannerRunning && !this.scannerStarting;
  }

  ngAfterViewInit(): void {
    console.log('[QR] ngAfterViewInit:', { active: this.active, disabled: this.disabled, autoStart: this.autoStart });
    if (!this.active || this.disabled || !this.autoStart) return;
    this.clearStartTimeout();
    this.startTimeout = setTimeout(() => {
      this.startTimeout = undefined;
      void this.startScanner();
    }, 100);
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    const activeChanged = !!changes['active'];
    const disabledChanged = !!changes['disabled'];
    const autoStartChanged = !!changes['autoStart'];
    if (!activeChanged && !disabledChanged && !autoStartChanged) return;
    console.log('[QR] estado scanner:', { active: this.active, disabled: this.disabled, autoStart: this.autoStart });
    await this.syncScannerState();
  }

  async startScanner(): Promise<void> {
    if (!this.active || this.disabled || this.scannerRunning || this.scannerStarting) {
      console.log('[QR] inicio omitido:', { active: this.active, disabled: this.disabled, scannerRunning: this.scannerRunning, scannerStarting: this.scannerStarting });
      return;
    }
    if (Capacitor.getPlatform() === 'web') {
      console.warn('[QR] El scanner nativo no está disponible en web');
      this.setStatus('error');
      return;
    }
    this.clearStatusTimeout();
    this.scannerStarting = true;
    try {
      const permissions = await BarcodeScanner.checkPermissions();
      console.log('[QR] permiso cámara:', permissions.camera);
      if (permissions.camera !== 'granted') {
        const requested = await BarcodeScanner.requestPermissions();
        console.log('[QR] permiso solicitado:', requested.camera);
        if (requested.camera !== 'granted') {
          console.warn('[QR] permiso de cámara rechazado');
          this.setStatus('error');
          return;
        }
      }
      if (!this.active || this.disabled) {
        console.log('[QR] la vista dejó de estar activa antes de iniciar la cámara');
        return;
      }
      await this.removeScannerListeners();
      this.barcodeListener = await BarcodeScanner.addListener('barcodesScanned', event => {
        if (!this.active || this.disabled) return;
        console.log('[QR] barcodes detectados:', event.barcodes);
        const barcode = event.barcodes?.[0];
        if (!barcode) {
          console.warn('[QR] evento recibido sin códigos');
          return;
        }
        const qrToken = barcode.rawValue?.trim();
        if (!qrToken) {
          console.warn('[QR] código detectado sin rawValue');
          return;
        }
        console.log('[QR] token leído:', qrToken);
        this.handleQr(qrToken);
      });
      this.errorListener = await BarcodeScanner.addListener('scanError', event => {
        console.error('[QR] error del scanner:', event.message);
        if (this.active && !this.disabled) {
          this.setStatus('error');
        }
      });
      if (!this.active || this.disabled) {
        await this.removeScannerListeners();
        return;
      }
      this.scannerRunning = true;
      this.scanStatus = 'scanning';
      document.body.classList.add('barcode-scanner-active');
      console.log('[QR] iniciando scanner ML Kit');
      await BarcodeScanner.startScan({ formats: [BarcodeFormat.QrCode] });
      console.log('[QR] scanner iniciado correctamente');
    } catch (error) {
      console.error('[QR] Error al iniciar scanner:', error);
      await this.stopScanner();
      if (this.active && !this.disabled) {
        this.setStatus('error');
      }
    } finally {
      this.scannerStarting = false;
    }
  }

  async retryScan(): Promise<void> {
    if (!this.active || this.disabled) return;
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
    console.log('[QR] ScanFrameComponent destruido');
    this.clearStartTimeout();
    await this.stopScanner();
    this.clearStatusTimeout();
  }

  private async syncScannerState(): Promise<void> {
    if (!this.active || this.disabled) {
      this.clearStartTimeout();
      await this.stopScanner();
      return;
    }
    if (this.autoStart) {
      await this.startScanner();
    }
  }

  private handleQr(qrToken: string): void {
    if (!this.active || this.disabled) return;
    const now = Date.now();
    if (qrToken === this.lastQrToken && now - this.lastScanAt < this.scanCooldown) {
      console.log('[QR] lectura duplicada ignorada');
      return;
    }
    this.lastQrToken = qrToken;
    this.lastScanAt = now;
    this.scanStatus = 'success';
    console.log('[QR] emitiendo QR al componente padre');
    this.scan.emit(qrToken);
    this.clearStatusTimeout();
    this.statusTimeout = setTimeout(() => {
      if (this.active && !this.disabled && this.scannerRunning) {
        this.scanStatus = 'scanning';
      }
      this.statusTimeout = undefined;
    }, 1200);
  }

  private async stopScanner(): Promise<void> {
    this.clearStatusTimeout();
    this.clearStartTimeout();
    const wasRunning = this.scannerRunning;
    try {
      await this.removeScannerListeners();
      if (this.scannerRunning) {
        await BarcodeScanner.stopScan();
      }
    } catch (error) {
      console.error('[QR] Error al detener scanner:', error);
    } finally {
      document.body.classList.remove('barcode-scanner-active');
      this.scannerRunning = false;
      this.scannerStarting = false;
      if (this.scanStatus === 'scanning' || this.scanStatus === 'success') {
        this.scanStatus = 'idle';
      }
      if (wasRunning) {
        console.log('[QR] scanner detenido');
      }
    }
  }

  private async removeScannerListeners(): Promise<void> {
    if (this.barcodeListener) {
      try {
        await this.barcodeListener.remove();
      } catch (error) {
        console.warn('[QR] no fue posible eliminar barcodeListener:', error);
      }
      this.barcodeListener = undefined;
    }
    if (this.errorListener) {
      try {
        await this.errorListener.remove();
      } catch (error) {
        console.warn('[QR] no fue posible eliminar errorListener:', error);
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

  private clearStartTimeout(): void {
    if (!this.startTimeout) return;
    clearTimeout(this.startTimeout);
    this.startTimeout = undefined;
  }
}