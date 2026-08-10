import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';
import { addIcons } from 'ionicons';
import {
  cameraOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  refreshOutline,
  scanOutline,
} from 'ionicons/icons';
import {
  BarcodeFormat,
  BarcodeScanner,
} from '@capacitor-mlkit/barcode-scanning';

type ScanStatus =
  | 'idle'
  | 'scanning'
  | 'success'
  | 'error';

@Component({
  selector: 'app-scan-frame',
  standalone: true,
  imports: [
    CommonModule,
    IonIcon,
  ],
  templateUrl: './scan-frame.component.html',
  styleUrl: './scan-frame.component.scss',
})
export class ScanFrameComponent {
  @Input()
  disabled = false;

  @Output()
  scan =
    new EventEmitter<string>();

  @Output()
  close =
    new EventEmitter<void>();

  scanStatus: ScanStatus =
    'idle';

  private scanInProgress =
    false;

  private lastScanAt =
    0;

  private readonly scanCooldown =
    1500;

  private statusTimeout?:
    ReturnType<
      typeof setTimeout
    >;

  constructor() {
    addIcons({
      cameraOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      refreshOutline,
      scanOutline,
    });
  }

  get isScanning(): boolean {
    return (
      this.scanStatus ===
      'scanning'
    );
  }

  get canScan(): boolean {
    return (
      !this.disabled &&
      !this.scanInProgress
    );
  }

  async startScan(): Promise<void> {
    const now =
      Date.now();

    if (this.disabled) {
      return;
    }

    if (this.scanInProgress) {
      return;
    }

    if (
      now -
        this.lastScanAt <
      this.scanCooldown
    ) {
      return;
    }

    this.scanInProgress =
      true;

    this.lastScanAt =
      now;

    this.clearStatusTimeout();

    try {
      const permissions =
        await BarcodeScanner
          .checkPermissions();

      if (
        permissions.camera !==
        'granted'
      ) {
        const requested =
          await BarcodeScanner
            .requestPermissions();

        if (
          requested.camera !==
          'granted'
        ) {
          this.setStatus(
            'error',
          );

          return;
        }
      }

      if (
        Capacitor.getPlatform() ===
        'android'
      ) {
        let moduleStatus =
          await BarcodeScanner
            .isGoogleBarcodeScannerModuleAvailable();

        if (
          !moduleStatus.available
        ) {
          await BarcodeScanner
            .installGoogleBarcodeScannerModule();

          await this.wait(
            3000,
          );

          moduleStatus =
            await BarcodeScanner
              .isGoogleBarcodeScannerModuleAvailable();

          if (
            !moduleStatus.available
          ) {
            this.setStatus(
              'error',
            );

            return;
          }
        }
      }

      this.scanStatus =
        'scanning';

      const result =
        await BarcodeScanner.scan({
          formats: [
            BarcodeFormat.QrCode,
          ],
        });

      if (
        !result.barcodes ||
        result.barcodes.length ===
          0
      ) {
        this.scanStatus =
          'idle';

        return;
      }

      const qrToken =
        result.barcodes[0]
          ?.rawValue
          ?.trim();

      if (!qrToken) {
        this.setStatus(
          'error',
        );

        return;
      }

      this.setStatus(
        'success',
      );

      this.scan.emit(
        qrToken,
      );
    } catch (
      error: any
    ) {
      const message =
        error?.message ??
        String(error);

      if (
        message
          .toLowerCase()
          .includes(
            'scan canceled',
          )
      ) {
        this.scanStatus =
          'idle';

        return;
      }

      this.setStatus(
        'error',
      );
    } finally {
      this.scanInProgress =
        false;
    }
  }

  cancelScan(): void {
    if (this.scanInProgress) {
      return;
    }

    this.clearStatusTimeout();

    this.scanStatus =
      'idle';

    this.close.emit();
  }

  private setStatus(
    status: ScanStatus,
  ): void {
    this.clearStatusTimeout();

    this.scanStatus =
      status;

    if (
      status === 'success' ||
      status === 'error'
    ) {
      this.statusTimeout =
        setTimeout(
          () => {
            this.scanStatus =
              'idle';

            this.statusTimeout =
              undefined;
          },
          2500,
        );
    }
  }

  private clearStatusTimeout(): void {
    if (!this.statusTimeout) {
      return;
    }

    clearTimeout(
      this.statusTimeout,
    );

    this.statusTimeout =
      undefined;
  }

  private wait(
    milliseconds: number,
  ): Promise<void> {
    return new Promise(
      (
        resolve,
      ) => {
        setTimeout(
          resolve,
          milliseconds,
        );
      },
    );
  }
}