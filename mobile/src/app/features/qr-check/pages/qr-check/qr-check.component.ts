import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon,
  ViewWillEnter,
  ViewWillLeave,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  qrCodeOutline,
  refreshOutline,
  timeOutline,
  scanOutline,
  personOutline,
} from 'ionicons/icons';
import { interval, Subscription } from 'rxjs';

import {
  QrService,
  StudentQr,
} from '@features/qr-check/services/qr.service';

import {
  AttendanceService,
} from '@features/attendance/services/attendance.service';

import {
  AuthStateService,
} from '@core/auth/services/auth-state.service';

import {
  ScanFrameComponent,
} from '@shared/components/qr/scan-frame/scan-frame.component';

import {
  LastScanCardComponent,
} from '@shared/components/qr/last-scan-card/last-scan-card.component';

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
export class QrCheckComponent implements ViewWillEnter, ViewWillLeave {
  private readonly qrService = inject(QrService);
  private readonly authState = inject(AuthStateService);
  private readonly attendanceService = inject(AttendanceService);

  qr: StudentQr | null = null;

  loading = true;
  secondsRemaining = 0;
  scanningAttendance = false;

  private timer?: Subscription;

  userRole = this.authState.user()?.role;

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

  ionViewWillEnter(): void {
    if (!this.isTeacher) {
      this.loadQr();
    }
  }

  ionViewWillLeave(): void {
    this.timer?.unsubscribe();
  }

  loadQr(): void {
    this.timer?.unsubscribe();
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
      error: (error) => {
        console.error('Error cargando QR:', error);
        this.loading = false;
      },
    });
  }

  refresh(): void {
    this.qrService.refreshQr().subscribe({
      next: (qr) => {
        this.qr = qr;
        this.loading = false;
        this.startCountdown();
      },
      error: (error) => {
        console.error('Error actualizando QR:', error);
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

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  onScanSuccess(qrToken: string): void {
    console.log('QR escaneado:', qrToken);

    const classScheduleId = 1;

    this.scanningAttendance = true;

    this.attendanceService
      .scanQr(qrToken, classScheduleId)
      .subscribe({
        next: (response) => {
          console.log('Asistencia registrada:', response);

          this.scanningAttendance = false;
        },
        error: (error) => {
          console.error('Error registrando asistencia:', error);

          this.scanningAttendance = false;
        },
      });
  }

  onScanClose(): void {
    console.log('Escáner cerrado');
    this.scanningAttendance = false;
  }
}