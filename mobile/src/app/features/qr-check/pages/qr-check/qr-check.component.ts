import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, ViewDidEnter, ViewWillEnter, ViewWillLeave } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, closeCircleOutline, peopleOutline, qrCodeOutline, refreshOutline, scanOutline, timeOutline } from 'ionicons/icons';
import { interval, Subscription } from 'rxjs';
import { QrService, StudentQr } from '@features/qr-check/services/qr.service';
import { AttendanceService, AttendanceScanResponse } from '@features/attendance/services/attendance.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { StorageService } from '@core/http/services/storage.service';
import { ScheduleItem, ScheduleService } from '@features/schedule/services/schedule.service';
import { FeedbackService } from '@core/shared/services/feedback.service';
import { AttendanceSyncService } from '@core/offline/services/attendance-sync.service';
import { ScanFrameComponent } from '@shared/components/qr/scan-frame/scan-frame.component';

interface ParentChild {
  id: number;
  enrollmentId?: string;
  user?: { firstName?: string; lastName?: string; };
  group?: { id?: number; name?: string; };
}

@Component({
  selector: 'app-qr-check',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, ScanFrameComponent],
  templateUrl: './qr-check.component.html',
  styleUrl: './qr-check.component.scss',
})
export class QrCheckComponent implements ViewWillEnter, ViewDidEnter, ViewWillLeave {
  private readonly qrService = inject(QrService);
  private readonly authState = inject(AuthStateService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly feedback = inject(FeedbackService);
  private readonly attendanceSyncService = inject(AttendanceSyncService);
  private readonly storage = inject(StorageService);

  userRole = this.authState.user()?.role;
  viewActive = false;
  scannerActive = false;

  qr: StudentQr | null = null;
  loading = false;
  usingCachedQr = false;
  secondsRemaining = 0;

  lastAttendance: AttendanceScanResponse | null = null;
  lastSuccessfulScan: AttendanceScanResponse | null = null;
  scanMessage = '';
  scanError = '';
  offlineMessage = '';

  schedules: ScheduleItem[] = [];
  currentSchedule: ScheduleItem | null = null;
  lastScans: AttendanceScanResponse[] = [];
  loadingSchedules = false;
  loadingScans = false;
  scanningAttendance = false;
  pendingAttendanceCount = 0;

  parentChildren: ParentChild[] = [];
  selectedChild: ParentChild | null = null;
  loadingParentAttendance = false;

  private countdownTimer?: Subscription;
  private attendanceWatchTimer?: Subscription;
  private parentSyncTimer?: Subscription;
  private queueWatchTimer?: Subscription;
  private feedbackTimer?: ReturnType<typeof setTimeout>;
  private scannerActivationTimeout?: ReturnType<typeof setTimeout>;

  private studentAttendanceRequestInFlight = false;
  private parentAttendanceRequestInFlight = false;
  private teacherScansRequestInFlight = false;

  private lastQrToken = '';
  private lastQrTime = 0;
  private readonly qrDebounce = 3000;

  private lastKnownAttendanceId: number | null = null;
  private lastKnownParentAttendanceId: number | null = null;
  private studentAttendanceInitialized = false;

  private readonly attendanceWatchInterval = 5000;
  private readonly parentSyncInterval = 5000;
  private readonly queueWatchInterval = 5000;
  private readonly scannerActivationDelay = 250;

  constructor() {
    addIcons({ checkmarkCircleOutline, closeCircleOutline, peopleOutline, qrCodeOutline, refreshOutline, scanOutline, timeOutline });
  }

  get isStudent(): boolean {
    return this.userRole === 'STUDENT';
  }

  get isTeacher(): boolean {
    return this.userRole === 'TEACHER';
  }

  get isParent(): boolean {
    return this.userRole === 'PARENT';
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
    const hours = Math.floor(this.secondsRemaining / 3600);
    const minutes = Math.floor((this.secondsRemaining % 3600) / 60);
    const seconds = this.secondsRemaining % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  get parentChildName(): string {
    if (!this.selectedChild) return 'Alumno';
    const firstName = this.selectedChild.user?.firstName ?? '';
    const lastName = this.selectedChild.user?.lastName ?? '';
    return `${firstName} ${lastName}`.trim() || 'Alumno';
  }

  ionViewWillEnter(): void {
    this.viewActive = true;
    this.scannerActive = false;
    this.clearScannerActivationTimeout();
    this.userRole = this.authState.user()?.role;
    this.resetTransientState();

    if (this.isTeacher) {
      this.loadTeacherSchedule();
      void this.refreshPendingCount();
      void this.attendanceSyncService.syncPendingForCurrentTeacher()
        .then(async () => {
          await this.refreshPendingCount();
          if (this.currentSchedule) this.loadLastScans();
        })
        .catch(error => console.warn('[OFFLINE] No fue posible ejecutar la sincronización inicial:', error));
      this.startQueueWatch();
      return;
    }

    if (this.isParent) {
      this.loadParentProfile();
      return;
    }

    if (this.isStudent) {
      this.studentAttendanceInitialized = false;
      this.usingCachedQr = false;
      this.loadQr();
      this.loadLatestAttendance();
      this.startAttendanceWatch();
    }
  }

  ionViewDidEnter(): void {
    if (!this.viewActive || !this.isTeacher) return;
    this.clearScannerActivationTimeout();
    this.scannerActivationTimeout = setTimeout(() => {
      this.scannerActivationTimeout = undefined;
      if (!this.viewActive || !this.isTeacher) return;
      console.log('[QR PAGE] Scanner habilitado.');
      this.scannerActive = true;
    }, this.scannerActivationDelay);
  }

  ionViewWillLeave(): void {
    this.scannerActive = false;
    this.clearScannerActivationTimeout();
    this.viewActive = false;
    this.scanningAttendance = false;
    this.lastQrToken = '';
    this.lastQrTime = 0;
    this.stopCountdown();
    this.stopAttendanceWatch();
    this.stopParentSync();
    this.stopQueueWatch();
    this.clearFeedbackTimer();
    this.studentAttendanceRequestInFlight = false;
    this.parentAttendanceRequestInFlight = false;
    this.teacherScansRequestInFlight = false;
    this.offlineMessage = '';
  }

  private resetTransientState(): void {
    this.clearFeedback();
    this.scanningAttendance = false;
    this.lastQrToken = '';
    this.lastQrTime = 0;
    this.stopAttendanceWatch();
    this.stopParentSync();
    this.stopQueueWatch();
    this.studentAttendanceRequestInFlight = false;
    this.parentAttendanceRequestInFlight = false;
    this.teacherScansRequestInFlight = false;
  }

  loadQr(): void {
    if (!this.isStudent) return;
    this.stopCountdown();
    this.loading = true;
    this.scanError = '';
    this.offlineMessage = '';
    this.usingCachedQr = false;
    this.qrService.getMyQr().subscribe({
      next: async (qr: StudentQr) => {
        if (!this.viewActive || !this.isStudent) return;
        this.loading = false;
        if (this.isUsableQr(qr)) {
          this.qr = qr;
          this.usingCachedQr = false;
          this.startCountdown();
          await this.cacheCurrentStudentQr(qr);
          return;
        }
        this.qr = qr;
        this.secondsRemaining = 0;
        this.usingCachedQr = false;
      },
      error: async (error: any) => {
        if (!this.viewActive || !this.isStudent) return;
        const loadedFromCache = await this.loadCachedQr();
        this.loading = false;
        if (loadedFromCache) return;
        this.qr = null;
        this.secondsRemaining = 0;
        this.usingCachedQr = false;
        const networkError = this.isNetworkError(error);
        const message = networkError
          ? 'Sin conexión y no hay un código QR válido guardado para hoy.'
          : (error?.error?.message ?? 'No se pudo cargar el código QR.');
        this.scanError = message;
        if (networkError) {
          await this.feedback.warning(message, 4000);
        } else {
          await this.feedback.error(message);
        }
      },
    });
  }

  refresh(): void {
    if (!this.isStudent || this.loading) return;
    this.stopCountdown();
    this.loading = true;
    this.scanError = '';
    this.offlineMessage = '';
    this.secondsRemaining = 0;
    this.qrService.refreshQr().subscribe({
      next: async (qr: StudentQr) => {
        if (!this.viewActive || !this.isStudent) return;
        this.loading = false;
        if (this.isUsableQr(qr)) {
          this.qr = qr;
          this.usingCachedQr = false;
          this.startCountdown();
          await this.cacheCurrentStudentQr(qr);
          await this.feedback.success('Código QR del día disponible.');
          return;
        }
        this.qr = qr;
        this.usingCachedQr = false;
        this.secondsRemaining = 0;
        await this.feedback.warning('El código QR no se encuentra disponible.');
      },
      error: async (error: any) => {
        if (!this.viewActive || !this.isStudent) return;
        const loadedFromCache = await this.loadCachedQr();
        this.loading = false;
        if (loadedFromCache) {
          await this.feedback.warning('Sin conexión. Se mantiene el código QR guardado del día.', 3500);
          return;
        }
        const networkError = this.isNetworkError(error);
        const message = networkError
          ? 'Sin conexión y no hay un código QR válido guardado para hoy.'
          : (error?.error?.message ?? 'No se pudo obtener el código QR.');
        this.scanError = message;
        if (networkError) {
          await this.feedback.warning(message);
        } else {
          await this.feedback.error(message);
        }
      },
    });
  }

  private isUsableQr(qr: StudentQr): boolean {
    return !!(qr.isValid && qr.qrToken && qr.qrImage && qr.expiresAt);
  }

  private async cacheCurrentStudentQr(qr: StudentQr): Promise<void> {
    const studentId = this.getCurrentStudentId();
    if (!studentId || !this.isUsableQr(qr)) return;
    try {
      await this.storage.saveCachedStudentQr({ studentId, qr, cachedAt: new Date().toISOString() });
      console.log('[QR CACHE] QR del día guardado.');
    } catch (error) {
      console.warn('[QR CACHE] No fue posible almacenar el QR:', error);
    }
  }

  private async loadCachedQr(): Promise<boolean> {
    const studentId = this.getCurrentStudentId();
    if (!studentId) return false;
    try {
      const cached = await this.storage.getValidCachedStudentQr();
      if (!cached) return false;
      if (cached.studentId !== studentId) {
        console.warn('[QR CACHE] El QR almacenado pertenece a otro alumno.');
        return false;
      }
      if (!this.isQrTokenFromToday(cached.qr.qrToken)) {
        await this.storage.removeCachedStudentQr();
        return false;
      }
      this.qr = { ...cached.qr, isValid: true };
      this.usingCachedQr = true;
      this.scanError = '';
      this.offlineMessage = 'Sin conexión. Mostrando el código QR guardado del día.';
      this.startCountdown();
      console.log('[QR CACHE] QR del día recuperado.');
      return true;
    } catch (error) {
      console.warn('[QR CACHE] No fue posible recuperar el QR:', error);
      return false;
    }
  }

  private getCurrentStudentId(): number | null {
    const user: any = this.authState.user();
    return user?.studentProfile?.id ?? user?.studentProfileId ?? user?.studentId ?? null;
  }

  private isQrTokenFromToday(qrToken: string | null): boolean {
    if (!qrToken) return false;
    const parts = qrToken.split(':');
    if (parts.length !== 3) return false;
    return parts[1] === this.getMexicoCityDateString();
  }

  private startAttendanceWatch(): void {
    this.stopAttendanceWatch();
    this.attendanceWatchTimer = interval(this.attendanceWatchInterval).subscribe(() => {
      if (!this.viewActive || !this.isStudent) return;
      this.loadLatestAttendance(true);
    });
  }

  private stopAttendanceWatch(): void {
    this.attendanceWatchTimer?.unsubscribe();
    this.attendanceWatchTimer = undefined;
  }

  private loadLatestAttendance(showConfirmation = false): void {
    if (this.studentAttendanceRequestInFlight) return;
    const studentId = this.getCurrentStudentId();
    if (!studentId) {
      console.warn('[ATTENDANCE] No se encontró el perfil del alumno.');
      return;
    }
    this.studentAttendanceRequestInFlight = true;
    this.attendanceService.getByStudent(studentId).subscribe({
      next: async (records: AttendanceScanResponse[]) => {
        this.studentAttendanceRequestInFlight = false;
        if (!this.viewActive || !this.isStudent) return;
        const latest = this.getLatestAttendance(records);
        const previousId = this.lastKnownAttendanceId;
        const initialized = this.studentAttendanceInitialized;
        this.lastAttendance = latest;
        this.lastKnownAttendanceId = latest?.id ?? null;
        this.studentAttendanceInitialized = true;
        if (!initialized || !showConfirmation || !latest || latest.id === previousId) return;
        const subject = latest.classes?.subject?.name ?? 'la clase';
        await this.feedback.success(`Asistencia registrada en ${subject}.`, 4000);
      },
      error: (error: any) => {
        this.studentAttendanceRequestInFlight = false;
        console.warn('[ATTENDANCE] No fue posible consultar la asistencia:', error);
      },
    });
  }

  private loadParentProfile(): void {
    const user: any = this.authState.user();
    const children = user?.parentProfile?.children ?? user?.children ?? [];
    this.parentChildren = Array.isArray(children) ? children : [];
    if (this.parentChildren.length === 0) {
      this.selectedChild = null;
      this.lastAttendance = null;
      this.scanError = 'No se encontró un alumno asociado a este tutor.';
      console.warn('[PARENT] El perfil del tutor no contiene hijos.');
      return;
    }
    this.selectedChild = this.parentChildren[0];
    this.lastKnownParentAttendanceId = null;
    this.loadParentAttendance();
    this.startParentSync();
  }

  selectChild(child: ParentChild): void {
    if (this.selectedChild?.id === child.id) return;
    this.selectedChild = child;
    this.lastAttendance = null;
    this.lastKnownParentAttendanceId = null;
    this.parentAttendanceRequestInFlight = false;
    this.loadParentAttendance();
  }

  private loadParentAttendance(showConfirmation = false): void {
    if (this.parentAttendanceRequestInFlight) return;
    const studentId = this.selectedChild?.id;
    if (!studentId) return;
    this.parentAttendanceRequestInFlight = true;
    if (!showConfirmation) this.loadingParentAttendance = true;
    this.attendanceService.getByStudent(studentId).subscribe({
      next: async (records: AttendanceScanResponse[]) => {
        this.parentAttendanceRequestInFlight = false;
        this.loadingParentAttendance = false;
        if (!this.viewActive || !this.isParent) return;
        if (this.selectedChild?.id !== studentId) return;
        const latest = this.getLatestAttendance(records);
        const previousId = this.lastKnownParentAttendanceId;
        this.lastAttendance = latest;
        this.lastKnownParentAttendanceId = latest?.id ?? null;
        if (!showConfirmation || !latest || previousId === null || latest.id === previousId) return;
        const subject = latest.classes?.subject?.name ?? 'la clase';
        await this.feedback.success(`${this.parentChildName} registró asistencia en ${subject}.`, 4000);
      },
      error: (error: any) => {
        this.parentAttendanceRequestInFlight = false;
        this.loadingParentAttendance = false;
        console.warn('[PARENT] No fue posible consultar la asistencia:', error);
      },
    });
  }

  private startParentSync(): void {
    this.stopParentSync();
    this.parentSyncTimer = interval(this.parentSyncInterval).subscribe(() => {
      if (!this.viewActive || !this.isParent || !this.selectedChild) return;
      this.loadParentAttendance(true);
    });
  }

  private stopParentSync(): void {
    this.parentSyncTimer?.unsubscribe();
    this.parentSyncTimer = undefined;
  }

  loadTeacherSchedule(): void {
    const user: any = this.authState.user();
    const teacherId = user?.teacherProfile?.id ?? user?.teacherProfileId ?? user?.teacherId;
    if (!teacherId) {
      this.currentSchedule = null;
      this.schedules = [];
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
        if (!this.viewActive || !this.isTeacher) return;
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
        if (!this.viewActive || !this.isTeacher) return;
        this.loadingSchedules = false;
        this.currentSchedule = null;
        this.schedules = [];
        this.lastScans = [];
        const message = error?.error?.message ?? 'No se pudieron cargar los horarios del docente.';
        this.scanError = message;
        await this.feedback.error(message);
      },
    });
  }

  loadLastScans(): void {
    if (!this.currentSchedule || this.teacherScansRequestInFlight) {
      if (!this.currentSchedule) this.lastScans = [];
      return;
    }
    const classScheduleId = this.currentSchedule.id;
    this.teacherScansRequestInFlight = true;
    this.loadingScans = true;
    this.attendanceService.getByClassSchedule(classScheduleId).subscribe({
      next: (records: AttendanceScanResponse[]) => {
        this.teacherScansRequestInFlight = false;
        this.loadingScans = false;
        if (!this.viewActive || !this.isTeacher || this.currentSchedule?.id !== classScheduleId) return;
        this.lastScans = (records ?? [])
          .filter(record => record.classScheduleId === classScheduleId && record.status === 'PRESENT')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);
      },
      error: (error: any) => {
        this.teacherScansRequestInFlight = false;
        this.loadingScans = false;
        console.warn('[TEACHER] No fue posible cargar los últimos registros:', error);
      },
    });
  }

  async onScanSuccess(qrToken: string): Promise<void> {
    if (!this.viewActive || !this.scannerActive || !this.isTeacher) return;
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
    const scannedAt = new Date().toISOString();
    this.scanningAttendance = true;
    this.clearFeedback();
    try {
      const result = await this.attendanceSyncService.submitOrQueue(token, this.currentSchedule.id, scannedAt);
      this.scanningAttendance = false;
      if (!this.viewActive || !this.isTeacher) return;
      if (result.status === 'REGISTERED' && result.attendance) {
        const attendance = result.attendance;
        this.lastSuccessfulScan = attendance;
        const studentName = this.getStudentName(attendance);
        this.scanMessage = `Asistencia registrada para ${studentName}.`;
        this.offlineMessage = '';
        void this.feedback.success(`Asistencia registrada para ${studentName}.`);
        this.loadLastScans();
        await this.refreshPendingCount();
        this.scheduleFeedbackClear(5000);
        return;
      }
      if (result.status === 'QUEUED') {
        this.lastSuccessfulScan = null;
        this.scanMessage = '';
        this.scanError = '';
        this.offlineMessage = result.message ?? 'QR guardado. Pendiente de sincronización.';
        await this.refreshPendingCount();
        void this.feedback.warning('Sin conexión. El QR quedó pendiente de sincronización.', 4000);
        this.scheduleOfflineMessageClear(5000);
        return;
      }
      this.lastSuccessfulScan = null;
      this.offlineMessage = '';
      const message = result.message ?? 'No se pudo registrar la asistencia.';
      this.scanError = message;
      void this.feedback.error(message);
      this.scheduleFeedbackClear(6000);
    } catch (error: any) {
      this.scanningAttendance = false;
      if (!this.viewActive || !this.isTeacher) return;
      this.lastSuccessfulScan = null;
      const message = error?.message ?? 'No se pudo procesar el código QR.';
      this.scanError = message;
      void this.feedback.error(message);
      this.scheduleFeedbackClear(6000);
    }
  }

  onScanClose(): void {
    this.scanningAttendance = false;
  }

  private async refreshPendingCount(): Promise<void> {
    if (!this.isTeacher) return;
    try {
      this.pendingAttendanceCount = await this.attendanceSyncService.getCurrentTeacherPendingCount();
    } catch (error) {
      console.warn('[OFFLINE] No fue posible consultar la cola:', error);
    }
  }

  async syncPendingAttendances(): Promise<void> {
    if (!this.isTeacher) return;
    try {
      await this.attendanceSyncService.syncPendingForCurrentTeacher();
      await this.refreshPendingCount();
      if (this.currentSchedule) this.loadLastScans();
      if (this.pendingAttendanceCount === 0) {
        this.offlineMessage = '';
        void this.feedback.success('Las asistencias pendientes fueron sincronizadas.');
        return;
      }
      void this.feedback.warning(`${this.pendingAttendanceCount} asistencia(s) continúan pendientes.`);
    } catch (error: any) {
      const message = error?.message ?? 'No fue posible sincronizar las asistencias pendientes.';
      void this.feedback.error(message);
    }
  }

  private startQueueWatch(): void {
    this.stopQueueWatch();
    this.queueWatchTimer = interval(this.queueWatchInterval).subscribe(() => {
      if (!this.viewActive || !this.isTeacher) return;
      void this.refreshPendingCount();
    });
  }

  private stopQueueWatch(): void {
    this.queueWatchTimer?.unsubscribe();
    this.queueWatchTimer = undefined;
  }

  getAttendanceStatusLabel(status: string): string {
    switch (status) {
      case 'PRESENT': return 'Presente';
      case 'ABSENT': return 'Falta';
      case 'LATE': return 'Retardo';
      case 'JUSTIFIED': return 'Justificada';
      default: return status;
    }
  }

  formatAttendanceDate(date: string): string {
    const value = new Date(date);
    const recordDate = this.getMexicoCityDateString(value);
    const today = this.getMexicoCityDateString();
    if (recordDate === today) return 'Hoy';
    return new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', day: '2-digit', month: 'long' }).format(value);
  }

  formatAttendanceTime(date: string): string {
    return new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(date));
  }

  private getMexicoCityDateString(date: Date = new Date()): string {
    const formatter = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', year: 'numeric', month: '2-digit', day: '2-digit' });
    const parts = formatter.formatToParts(date);
    const year = parts.find(part => part.type === 'year')?.value ?? '';
    const month = parts.find(part => part.type === 'month')?.value ?? '';
    const day = parts.find(part => part.type === 'day')?.value ?? '';
    return `${year}-${month}-${day}`;
  }

  getStudentName(record: AttendanceScanResponse): string {
    const firstName = record.student?.user?.firstName ?? '';
    const lastName = record.student?.user?.lastName ?? '';
    const name = `${firstName} ${lastName}`.trim();
    return name || 'Alumno';
  }

  private getLatestAttendance(records: AttendanceScanResponse[]): AttendanceScanResponse | null {
    return (records ?? []).slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null;
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
    this.stopCountdown();
    this.updateCountdown();
    this.countdownTimer = interval(1000).subscribe(() => this.updateCountdown());
  }

  private stopCountdown(): void {
    this.countdownTimer?.unsubscribe();
    this.countdownTimer = undefined;
  }

  private updateCountdown(): void {
    if (!this.qr?.expiresAt) {
      this.secondsRemaining = 0;
      return;
    }
    const expiration = new Date(this.qr.expiresAt).getTime();
    if (Number.isNaN(expiration)) {
      this.secondsRemaining = 0;
      return;
    }
    const remaining = expiration - Date.now();
    this.secondsRemaining = Math.max(0, Math.floor(remaining / 1000));
    if (this.secondsRemaining > 0) return;
    this.stopCountdown();
    this.qr = { ...this.qr, isValid: false };
    this.usingCachedQr = false;
    void this.storage.removeCachedStudentQr();
  }

  private isNetworkError(error: any): boolean {
    return error?.status === 0 || error?.name === 'TimeoutError';
  }

  private showError(message: string): void {
    this.clearFeedback();
    this.scanError = message;
    this.scheduleFeedbackClear(6000);
  }

  private scheduleFeedbackClear(duration: number): void {
    this.clearFeedbackTimer();
    this.feedbackTimer = setTimeout(() => { this.clearFeedback(); }, duration);
  }

  private scheduleOfflineMessageClear(duration: number): void {
    this.clearFeedbackTimer();
    this.feedbackTimer = setTimeout(() => {
      this.offlineMessage = '';
      this.feedbackTimer = undefined;
    }, duration);
  }

  private clearFeedback(): void {
    this.clearFeedbackTimer();
    this.scanMessage = '';
    this.scanError = '';
    this.offlineMessage = '';
    this.lastSuccessfulScan = null;
  }

  private clearFeedbackTimer(): void {
    if (!this.feedbackTimer) return;
    clearTimeout(this.feedbackTimer);
    this.feedbackTimer = undefined;
  }

  private clearScannerActivationTimeout(): void {
    if (!this.scannerActivationTimeout) return;
    clearTimeout(this.scannerActivationTimeout);
    this.scannerActivationTimeout = undefined;
  }
}