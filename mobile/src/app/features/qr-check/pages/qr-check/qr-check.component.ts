import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { qrCodeOutline, refreshOutline, timeOutline, scanOutline, personOutline } from 'ionicons/icons';
import { interval, Subscription } from 'rxjs';

import { QrService, StudentQr } from '../../../../core/services/qr.service';
import { AuthStateService } from '../../../../core/services/auth-state.service';
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
    LastScanCardComponent,
  ],
  templateUrl: './qr-check.component.html',
  styleUrl: './qr-check.component.scss',
})
export class QrCheckComponent implements OnInit, OnDestroy {
  private qrService = inject(QrService);
  private authState = inject(AuthStateService);

  qr: StudentQr | null = null;
  loading = true;
  secondsRemaining = 0;
  private timer?: Subscription;

  // Obtenemos el rol del usuario actual
  userRole = this.authState.user()?.role;

  // Determina si es docente
  get isTeacher(): boolean {
    return this.userRole === 'TEACHER';
  }

  constructor() {
    addIcons({
      qrCodeOutline,
      refreshOutline,
      timeOutline,
      scanOutline,
      personOutline,
    });
  }

  ngOnInit(): void {
    if (!this.isTeacher) {
      this.loadQr();
    }
  }

  ngOnDestroy(): void {
    this.timer?.unsubscribe();
  }

  loadQr(): void {
    this.loading = true;
    this.qrService.getMyQr().subscribe({
      next: (qr) => {
        if (!qr.isValid) {
          this.refresh();
          return;
        }
        this.qr = qr;
        this.loading = false;
        this.startCountdown();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  refresh(): void {
    this.qrService.refreshQr().subscribe({
      next: (qr) => {
        this.qr = qr;
        this.secondsRemaining = 30;
        this.loading = false;
        this.startCountdown();
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private startCountdown(): void {
    this.timer?.unsubscribe();
    this.secondsRemaining = 30;
    this.timer = interval(1000).subscribe(() => {
      this.secondsRemaining--;
      if (this.secondsRemaining <= 0) {
        this.refresh();
      }
    });
  }

  get countdown(): string {
    const minutes = Math.floor(this.secondsRemaining / 60);
    const seconds = this.secondsRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // ---- MÉTODOS PARA DOCENTE ----

  onScanSuccess(result: string) {
    console.log('QR escaneado:', result);
    // Aquí se procesa el escaneo (registrar asistencia)
    // Ejemplo: this.attendanceService.register(result);
  }

  onScanClose() {
    console.log('Escáner cerrado');
  }
}