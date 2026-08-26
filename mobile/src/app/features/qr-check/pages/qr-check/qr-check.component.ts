import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, ViewWillEnter, ViewWillLeave } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeCircleOutline, qrCodeOutline, refreshOutline, scanOutline, timeOutline } from 'ionicons/icons';
import { interval, Subscription } from 'rxjs';
import { QrService, StudentQr } from '@features/qr-check/services/qr.service';
import { AttendanceService, AttendanceScanResponse } from '@features/attendance/services/attendance.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { ScheduleItem, ScheduleService } from '@features/schedule/services/schedule.service';
import { FeedbackService } from '@core/shared/services/feedback.service';
import { ScanFrameComponent } from '@shared/components/qr/scan-frame/scan-frame.component';

@Component({
  selector: 'app-qr-check',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, ScanFrameComponent],
  templateUrl: './qr-check.component.html',
  styleUrl: './qr-check.component.scss',
})
export class QrCheckComponent implements ViewWillEnter, ViewWillLeave {
  private readonly qrService = inject(QrService);
  private readonly authState = inject(AuthStateService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly feedback = inject(FeedbackService);

  qr: StudentQr | null = null;
  schedules: ScheduleItem[] = [];
  currentSchedule: ScheduleItem | null = null;
  lastScans: AttendanceScanResponse[] = [];
  lastSuccessfulScan: AttendanceScanResponse | null = null;
  viewActive = false;

  loading = false;
  loadingSchedules = false;
  loadingScans = false;
  scanningAttendance = false;

  secondsRemaining = 0;
  scanMessage = '';
  scanError = '';
  userRole = this.authState.user()?.role;

  private timer?: Subscription;
  private feedbackTimer?: ReturnType<typeof setTimeout>;
  private lastQrToken = '';
  private lastQrTime = 0;
  private readonly qrDebounce = 3000;

  constructor() {
    addIcons({ checkmarkCircleOutline, closeCircleOutline, qrCodeOutline, refreshOutline, scanOutline, timeOutline });
  }

  get isTeacher(): boolean {
    return this.userRole === 'TEACHER';
  }

  get currentSubject(): string {
    return this.currentSchedule?.class?.subject?.name ?? 'Clase actual';
  }

  get currentScheduleTime(): string {
    if (!this.currentSchedule) return '';
    return `${this.currentSchedule.startTime} - ${this.currentSchedule.endTime}`;
  }

  get currentGroup(): string {
    return this.currentSchedule?.class?.group?.name ?? '';
  }

  get currentClassroom(): string {
    return this.currentSchedule?.classroom?.name ?? this.currentSchedule?.class?.classroom?.name ?? '';
  }

  get countdown(): string {
    const minutes = Math.floor(this.secondsRemaining / 60);
    const seconds = this.secondsRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  ionViewWillEnter(): void {
    this.viewActive = true;
    this.userRole = this.authState.user()?.role;
    this.clearFeedback();
    this.scanningAttendance = false;
    this.lastQrToken = '';
    this.lastQrTime = 0;
    if (this.isTeacher) {
      this.loadTeacherSchedule();
      return;
    }
    this.loadQr();
  }

  ionViewWillLeave(): void {
    this.viewActive = false;
    this.timer?.unsubscribe();
    this.timer = undefined;
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
      this.feedbackTimer = undefined;
    }
    this.scanningAttendance = false;
    this.lastQrToken = '';
    this.lastQrTime = 0;
  }

  loadQr(): void {
    this.timer?.unsubscribe();
    this.timer = undefined;
    this.loading = true;
    this.scanError = '';
    this.qrService.getMyQr().subscribe({
      next: (qr: StudentQr) => {
        this.qr = qr;
        this.loading = false;
        if (qr.isValid && qr.expiresAt) {
          this.startCountdown();
          return;
        }
        this.secondsRemaining = 0;
      },
      error: async (error: any) => {
        this.loading = false;
        this.qr = null;
        this.secondsRemaining = 0;
        const message = error?.error?.message ?? 'No se pudo cargar el código QR.';
        this.scanError = message;
        await this.feedback.error(message);
      },
    });
  }

  refresh(): void {
    if (this.loading) return;
    this.timer?.unsubscribe();
    this.timer = undefined;
    this.loading = true;
    this.scanError = '';
    this.secondsRemaining = 0;
    this.qrService.refreshQr().subscribe({
      next: async (qr: StudentQr) => {
        this.qr = qr;
        this.loading = false;
        if (qr.isValid && qr.expiresAt) {
          this.startCountdown();
          await this.feedback.success('Nuevo código QR generado correctamente.');
          return;
        }
        this.secondsRemaining = 0;
        await this.feedback.warning('El código QR generado no se encuentra disponible.');
      },
      error: async (error: any) => {
        this.loading = false;
        const message = error?.error?.message ?? 'No se pudo generar un nuevo código QR.';
        this.scanError = message;
        await this.feedback.error(message);
      },
    });
  }

  loadTeacherSchedule(): void {
    const user = this.authState.user();
    const teacherId = user?.teacherProfile?.id ?? user?.teacherProfileId ?? user?.teacherId;
    if (!teacherId) {
      this.currentSchedule = null;
      this.lastScans = [];
      const message = 'No se encontró el perfil del docente.';
      this.scanError = message;
      void this.feedback.error(message);
      return;
    }
    this.loadingSchedules = true;
    this.scanMessage = '';
    this.scanError = '';
    this.lastSuccessfulScan = null;
    this.currentSchedule = null;
    this.scheduleService.getTeacherSchedule(teacherId).subscribe({
      next: (schedules: ScheduleItem[]) => {
        this.loadingSchedules = false;
        this.schedules = schedules ?? [];
        this.currentSchedule = this.findCurrentSchedule(this.schedules);
        if (!this.currentSchedule) {
          this.lastScans = [];
          this.scanError = '';
          return;
        }
        this.scanError = '';
        this.loadLastScans();
      },
      error: async (error: any) => {
        this.loadingSchedules = false;
        this.currentSchedule = null;
        this.lastScans = [];
        const message = error?.error?.message ?? 'No se pudieron cargar los horarios del docente.';
        this.scanError = message;
        await this.feedback.error(message);
      },
    });
  }

  loadLastScans(): void {
    if (!this.currentSchedule) {
      this.lastScans = [];
      return;
    }
    const classScheduleId = this.currentSchedule.id;
    this.loadingScans = true;
    this.attendanceService.getByClassSchedule(classScheduleId).subscribe({
      next: (records: AttendanceScanResponse[]) => {
        this.loadingScans = false;
        this.lastScans = (records ?? [])
          .filter(record => record.classScheduleId === classScheduleId && record.status === 'PRESENT')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
      },
      error: () => {
        this.loadingScans = false;
        this.lastScans = [];
      },
    });
  }

  onScanSuccess(qrToken: string): void {
    if (!this.viewActive) return;
    const token = qrToken?.trim();
    if (!token) {
      this.showError('No se pudo leer el código QR.');
      return;
    }
    if (!this.currentSchedule) {
      this.showError('QR detectado correctamente, pero no hay una clase activa en este momento.');
      void this.feedback.warning('La asistencia solo puede registrarse durante el horario de clase.');
      return;
    }
    if (this.scanningAttendance) return;
    const now = Date.now();
    if (token === this.lastQrToken && now - this.lastQrTime < this.qrDebounce) return;
    this.lastQrToken = token;
    this.lastQrTime = now;
    this.scanningAttendance = true;
    this.clearFeedback();
    this.attendanceService.scanQr(token, this.currentSchedule.id).subscribe({
      next: (response: AttendanceScanResponse) => {
        this.scanningAttendance = false;
        if (!this.viewActive) return;
        this.lastSuccessfulScan = response;
        const studentName = this.getStudentName(response);
        this.scanMessage = `Asistencia registrada para ${studentName}.`;
        void this.feedback.success(`Asistencia registrada para ${studentName}.`);
        this.loadLastScans();
        this.scheduleFeedbackClear(5000);
      },
      error: (error: any) => {
        this.scanningAttendance = false;
        if (!this.viewActive) return;
        this.lastSuccessfulScan = null;
        const message = error?.error?.message ?? 'No se pudo registrar la asistencia.';
        this.scanError = message;
        void this.feedback.error(message);
        this.scheduleFeedbackClear(6000);
      },
    });
  }

  onScanClose(): void {
    this.scanningAttendance = false;
  }

  formatAttendanceDate(date: string): string {
    const value = new Date(date);
    const recordDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(value);
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    if (recordDate === today) return 'Hoy';
    return new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', day: '2-digit', month: 'long' }).format(value);
  }

  formatAttendanceTime(date: string): string {
    return new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(date));
  }

  getStudentName(record: AttendanceScanResponse): string {
    const firstName = record.student?.user?.firstName ?? '';
    const lastName = record.student?.user?.lastName ?? '';
    const name = `${firstName} ${lastName}`.trim();
    return name || 'Alumno';
  }

  private findCurrentSchedule(schedules: ScheduleItem[]): ScheduleItem | null {
    if (!schedules.length) return null;
    const now = this.getMexicoCityTime();
    return schedules.find(schedule => {
      if (schedule.dayOfWeek !== now.day) return false;
      const start = this.timeToMinutes(schedule.startTime);
      const end = this.timeToMinutes(schedule.endTime);
      return now.minutes >= start - 15 && now.minutes <= end + 15;
    }) ?? null;
  }

  private getMexicoCityTime(): { day: string; minutes: number } {
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false });
    const parts = formatter.formatToParts(new Date());
    const weekday = parts.find(part => part.type === 'weekday')?.value ?? '';
    const hour = Number(parts.find(part => part.type === 'hour')?.value ?? 0);
    const minute = Number(parts.find(part => part.type === 'minute')?.value ?? 0);
    const days: Record<string, string> = {
      Sunday: 'SUNDAY',
      Monday: 'MONDAY',
      Tuesday: 'TUESDAY',
      Wednesday: 'WEDNESDAY',
      Thursday: 'THURSDAY',
      Friday: 'FRIDAY',
      Saturday: 'SATURDAY',
    };
    return { day: days[weekday] ?? '', minutes: hour * 60 + minute };
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private startCountdown(): void {
    this.timer?.unsubscribe();
    this.updateCountdown();
    this.timer = interval(1000).subscribe(() => this.updateCountdown());
  }

  private updateCountdown(): void {
    if (!this.qr?.expiresAt) {
      this.secondsRemaining = 0;
      return;
    }
    const expiration = new Date(this.qr.expiresAt).getTime();
    const remaining = expiration - Date.now();
    this.secondsRemaining = Math.max(0, Math.floor(remaining / 1000));
    if (this.secondsRemaining <= 0) {
      this.timer?.unsubscribe();
      this.timer = undefined;
      this.qr = { ...this.qr, isValid: false };
    }
  }

  private showError(message: string): void {
    this.clearFeedback();
    this.scanError = message;
    this.scheduleFeedbackClear(6000);
  }

  private scheduleFeedbackClear(duration: number): void {
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => this.clearFeedback(), duration);
  }

  private clearFeedback(): void {
    if (this.feedbackTimer) {
      clearTimeout(this.feedbackTimer);
      this.feedbackTimer = undefined;
    }
    this.scanMessage = '';
    this.scanError = '';
    this.lastSuccessfulScan = null;
  }
}