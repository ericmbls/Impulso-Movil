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
  checkmarkCircleOutline,
  closeCircleOutline,
  qrCodeOutline,
  refreshOutline,
  scanOutline,
  timeOutline,
} from 'ionicons/icons';
import {
  interval,
  Subscription,
} from 'rxjs';

import {
  QrService,
  StudentQr,
} from '@features/qr-check/services/qr.service';

import {
  AttendanceService,
  AttendanceScanResponse,
} from '@features/attendance/services/attendance.service';

import {
  AuthStateService,
} from '@core/auth/services/auth-state.service';

import {
  ScheduleItem,
  ScheduleService,
} from '@features/schedule/services/schedule.service';

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
export class QrCheckComponent
  implements ViewWillEnter, ViewWillLeave
{
  private readonly qrService =
    inject(QrService);

  private readonly authState =
    inject(AuthStateService);

  private readonly attendanceService =
    inject(AttendanceService);

  private readonly scheduleService =
    inject(ScheduleService);

  qr: StudentQr | null = null;

  schedules: ScheduleItem[] = [];

  currentSchedule: ScheduleItem | null = null;

  lastScans: AttendanceScanResponse[] = [];

  loading = false;

  loadingSchedules = false;

  loadingScans = false;

  scanningAttendance = false;

  secondsRemaining = 0;

  scanMessage = '';

  scanError = '';

  private timer?: Subscription;

  private lastQrToken = '';

  private lastQrTime = 0;

  private readonly qrDebounce = 3000;

  userRole =
    this.authState.user()?.role;

  constructor() {
    addIcons({
      checkmarkCircleOutline,
      closeCircleOutline,
      qrCodeOutline,
      refreshOutline,
      scanOutline,
      timeOutline,
    });
  }

  get isTeacher(): boolean {
    return (
      this.userRole === 'TEACHER'
    );
  }

  get currentSubject(): string {
    return (
      this.currentSchedule
        ?.class
        ?.subject
        ?.name ??
      'Clase actual'
    );
  }

  get currentScheduleTime(): string {
    if (!this.currentSchedule) {
      return '';
    }

    return `${this.currentSchedule.startTime} - ${this.currentSchedule.endTime}`;
  }

  get currentGroup(): string {
    return (
      this.currentSchedule
        ?.class
        ?.group
        ?.name ??
      ''
    );
  }

  get currentClassroom(): string {
    return (
      this.currentSchedule
        ?.classroom
        ?.name ??
      this.currentSchedule
        ?.class
        ?.classroom
        ?.name ??
      ''
    );
  }

  get countdown(): string {
    const minutes =
      Math.floor(
        this.secondsRemaining / 60,
      );

    const seconds =
      this.secondsRemaining % 60;

    return (
      `${minutes
        .toString()
        .padStart(2, '0')}:` +
      `${seconds
        .toString()
        .padStart(2, '0')}`
    );
  }

  ionViewWillEnter(): void {
    this.userRole =
      this.authState.user()?.role;

    this.scanMessage = '';
    this.scanError = '';

    this.scanningAttendance =
      false;

    this.lastQrToken = '';

    this.lastQrTime = 0;

    if (this.isTeacher) {
      this.loadTeacherSchedule();
      return;
    }

    this.loadQr();
  }

  ionViewWillLeave(): void {
    this.timer?.unsubscribe();

    this.scanningAttendance =
      false;
  }

  loadQr(): void {
    this.timer?.unsubscribe();

    this.loading = true;
    this.scanError = '';

    this.qrService
      .getMyQr()
      .subscribe({
        next: (
          qr: StudentQr,
        ) => {
          if (!qr.isValid) {
            this.refresh();
            return;
          }

          this.qr = qr;
          this.loading = false;

          this.startCountdown();
        },

        error: (
          error: any,
        ) => {
          this.loading = false;

          this.scanError =
            error?.error?.message ??
            'No se pudo cargar el código QR.';
        },
      });
  }

  refresh(): void {
    this.timer?.unsubscribe();

    this.loading = true;
    this.scanError = '';

    this.qrService
      .refreshQr()
      .subscribe({
        next: (
          qr: StudentQr,
        ) => {
          this.qr = qr;
          this.loading = false;

          this.startCountdown();
        },

        error: (
          error: any,
        ) => {
          this.loading = false;

          this.scanError =
            error?.error?.message ??
            'No se pudo generar un nuevo código QR.';
        },
      });
  }

  loadTeacherSchedule(): void {
    const user =
      this.authState.user();

    const teacherId =
      user?.teacherProfile?.id ??
      user?.teacherProfileId ??
      user?.teacherId;

    if (!teacherId) {
      this.currentSchedule = null;
      this.lastScans = [];

      this.scanError =
        'No se encontró el perfil del docente.';

      return;
    }

    this.loadingSchedules = true;

    this.scanMessage = '';
    this.scanError = '';

    this.currentSchedule = null;

    this.scheduleService
      .getTeacherSchedule(
        teacherId,
      )
      .subscribe({
        next: (
          schedules:
            ScheduleItem[],
        ) => {
          this.loadingSchedules =
            false;

          this.schedules =
            schedules ?? [];

          this.currentSchedule =
            this.findCurrentSchedule(
              this.schedules,
            );

          if (!this.currentSchedule) {
            this.lastScans = [];

            this.scanError =
              'No hay una clase asignada para este momento.';

            return;
          }

          this.scanError = '';

          this.loadLastScans();
        },

        error: (
          error: any,
        ) => {
          this.loadingSchedules =
            false;

          this.currentSchedule = null;
          this.lastScans = [];

          this.scanError =
            error?.error?.message ??
            'No se pudieron cargar los horarios del docente.';
        },
      });
  }

  loadLastScans(): void {
    if (!this.currentSchedule) {
      this.lastScans = [];
      return;
    }

    const classScheduleId =
      this.currentSchedule.id;

    this.loadingScans = true;

    this.attendanceService
      .getByClassSchedule(
        classScheduleId,
      )
      .subscribe({
        next: (
          records:
            AttendanceScanResponse[],
        ) => {
          this.loadingScans =
            false;

          this.lastScans =
            (records ?? [])
              .filter(
                (record) =>
                  record.classScheduleId ===
                    classScheduleId &&
                  record.status ===
                    'PRESENT',
              )
              .sort(
                (a, b) =>
                  new Date(
                    b.date,
                  ).getTime() -
                  new Date(
                    a.date,
                  ).getTime(),
              )
              .slice(
                0,
                5,
              );
        },

        error: () => {
          this.loadingScans =
            false;

          this.lastScans = [];
        },
      });
  }

  onScanSuccess(
    qrToken: string,
  ): void {
    const token =
      qrToken?.trim();

    if (!token) {
      this.scanError =
        'No se pudo leer el código QR.';

      return;
    }

    if (!this.currentSchedule) {
      this.scanError =
        'No hay una clase activa para registrar asistencia.';

      return;
    }

    if (
      this.scanningAttendance
    ) {
      return;
    }

    const now =
      Date.now();

    if (
      token ===
        this.lastQrToken &&
      now -
        this.lastQrTime <
        this.qrDebounce
    ) {
      return;
    }

    this.lastQrToken =
      token;

    this.lastQrTime =
      now;

    this.scanningAttendance =
      true;

    this.scanMessage = '';
    this.scanError = '';

    this.attendanceService
      .scanQr(
        token,
        this.currentSchedule.id,
      )
      .subscribe({
        next: (
          response:
            AttendanceScanResponse,
        ) => {
          this.scanningAttendance =
            false;

          const firstName =
            response
              .student
              ?.user
              ?.firstName;

          const lastName =
            response
              .student
              ?.user
              ?.lastName;

          const studentName =
            [
              firstName,
              lastName,
            ]
              .filter(Boolean)
              .join(' ');

          this.scanMessage =
            studentName
              ? `Asistencia registrada para ${studentName}.`
              : 'Asistencia registrada correctamente.';

          this.loadLastScans();

          setTimeout(
            () => {
              this.scanMessage =
                '';
            },
            5000,
          );
        },

        error: (
          error: any,
        ) => {
          this.scanningAttendance =
            false;

          this.scanError =
            error?.error?.message ??
            'No se pudo registrar la asistencia.';

          setTimeout(
            () => {
              this.scanError =
                '';
            },
            6000,
          );
        },
      });
  }

  onScanClose(): void {
    this.scanningAttendance =
      false;
  }

  formatAttendanceDate(
    date: string,
  ): string {
    const value =
      new Date(date);

    const recordDate =
      new Intl.DateTimeFormat(
        'en-CA',
        {
          timeZone:
            'America/Mexico_City',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        },
      ).format(value);

    const today =
      new Intl.DateTimeFormat(
        'en-CA',
        {
          timeZone:
            'America/Mexico_City',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        },
      ).format(
        new Date(),
      );

    if (
      recordDate === today
    ) {
      return 'Hoy';
    }

    return new Intl.DateTimeFormat(
      'es-MX',
      {
        timeZone:
          'America/Mexico_City',
        day: '2-digit',
        month: 'long',
      },
    ).format(value);
  }

  formatAttendanceTime(
    date: string,
  ): string {
    return new Intl.DateTimeFormat(
      'es-MX',
      {
        timeZone:
          'America/Mexico_City',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    ).format(
      new Date(date),
    );
  }

  getStudentName(
    record:
      AttendanceScanResponse,
  ): string {
    const firstName =
      record
        .student
        ?.user
        ?.firstName ??
      '';

    const lastName =
      record
        .student
        ?.user
        ?.lastName ??
      '';

    const name =
      `${firstName} ${lastName}`
        .trim();

    return (
      name ||
      'Alumno'
    );
  }

  private findCurrentSchedule(
    schedules:
      ScheduleItem[],
  ): ScheduleItem | null {
    if (!schedules.length) {
      return null;
    }

    const now =
      this.getMexicoCityTime();

    return (
      schedules.find(
        (
          schedule,
        ) => {
          if (
            schedule.dayOfWeek !==
            now.day
          ) {
            return false;
          }

          const start =
            this.timeToMinutes(
              schedule.startTime,
            );

          const end =
            this.timeToMinutes(
              schedule.endTime,
            );

          return (
            now.minutes >=
              start - 15 &&
            now.minutes <=
              end + 15
          );
        },
      ) ?? null
    );
  }

  private getMexicoCityTime(): {
    day: string;
    minutes: number;
  } {
    const formatter =
      new Intl.DateTimeFormat(
        'en-US',
        {
          timeZone:
            'America/Mexico_City',
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        },
      );

    const parts =
      formatter.formatToParts(
        new Date(),
      );

    const weekday =
      parts.find(
        (part) =>
          part.type ===
          'weekday',
      )?.value ?? '';

    const hour =
      Number(
        parts.find(
          (part) =>
            part.type ===
            'hour',
        )?.value ?? 0,
      );

    const minute =
      Number(
        parts.find(
          (part) =>
            part.type ===
            'minute',
        )?.value ?? 0,
      );

    const days:
      Record<
        string,
        string
      > = {
        Sunday:
          'SUNDAY',
        Monday:
          'MONDAY',
        Tuesday:
          'TUESDAY',
        Wednesday:
          'WEDNESDAY',
        Thursday:
          'THURSDAY',
        Friday:
          'FRIDAY',
        Saturday:
          'SATURDAY',
      };

    return {
      day:
        days[weekday] ??
        '',
      minutes:
        hour * 60 +
        minute,
    };
  }

  private timeToMinutes(
    time: string,
  ): number {
    const [
      hours,
      minutes,
    ] =
      time
        .split(':')
        .map(Number);

    return (
      hours * 60 +
      minutes
    );
  }

  private startCountdown(): void {
    this.timer?.unsubscribe();

    this.updateCountdown();

    this.timer =
      interval(
        1000,
      ).subscribe(
        () => {
          this.updateCountdown();
        },
      );
  }

  private updateCountdown(): void {
    if (!this.qr?.expiresAt) {
      this.secondsRemaining = 0;
      return;
    }

    const expiration =
      new Date(
        this.qr.expiresAt,
      ).getTime();

    const remaining =
      expiration -
      Date.now();

    this.secondsRemaining =
      Math.max(
        0,
        Math.floor(
          remaining / 1000,
        ),
      );

    if (
      this.secondsRemaining <=
      0
    ) {
      this.timer?.unsubscribe();

      this.qr = {
        ...this.qr,
        isValid: false,
      };
    }
  }
}