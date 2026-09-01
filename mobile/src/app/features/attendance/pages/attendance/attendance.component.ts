import { Component, OnInit, inject } from '@angular/core';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, personOutline, timeOutline, warningOutline } from 'ionicons/icons';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { FeedbackService } from '@core/shared/services/feedback.service';
import { StudentProfile } from '@core/auth/models/user';
import { AttendanceScanResponse, AttendanceService, AttendanceStatus, StudentAttendanceStats } from '@features/attendance/services/attendance.service';
import { AttendanceSummaryComponent, AttendanceSummaryStatus } from '@shared/components/attendance/attendance-summary/attendance-summary.component';
import { AttendanceCardComponent, AttendanceVisualStatus } from '@shared/components/attendance/attendance-card/attendance-card.component';

interface AttendanceViewItem {
  id: number;
  subject: string;
  teacher: string;
  date: string;
  time: string;
  status: AttendanceVisualStatus;
  present: boolean;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    IonContent,
    IonIcon,
    IonSpinner,
    AttendanceSummaryComponent,
    AttendanceCardComponent,
  ],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss',
})
export class AttendanceComponent implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly feedback = inject(FeedbackService);

  children: StudentProfile[] = [];
  selectedStudent: StudentProfile | null = null;
  selectedStudentId: number | null = null;
  attendance: AttendanceScanResponse[] = [];
  stats: StudentAttendanceStats | null = null;
  loading = false;
  errorMessage = '';

  constructor() {
    addIcons({
      calendarOutline,
      personOutline,
      timeOutline,
      warningOutline,
    });
  }

  get user() {
    return this.authState.user();
  }

  get isStudent(): boolean {
    return this.user?.role === 'STUDENT';
  }

  get isParent(): boolean {
    return this.user?.role === 'PARENT';
  }

  get displayedAttendance(): AttendanceViewItem[] {
    return [...this.attendance]
      .sort((a, b) => this.getTimestamp(b.date) - this.getTimestamp(a.date))
      .map(item => ({
        id: item.id,
        subject: item.classes?.subject?.name ?? 'Materia',
        teacher: this.getTeacherName(item),
        date: this.formatDate(item.date),
        time: this.getAttendanceTime(item),
        status: this.getStatusLabel(item.status),
        present: item.status === 'PRESENT',
      }));
  }

  get attendancePercentage(): string {
    const value = Number(this.stats?.attendanceRate);
    if (!Number.isFinite(value)) return '—';
    const normalized = Math.min(100, Math.max(0, value));
    return Number.isInteger(normalized)
      ? normalized.toString()
      : normalized.toFixed(1);
  }

  get attendanceStatus(): AttendanceSummaryStatus {
    const value = Number(this.stats?.attendanceRate);
    if (!Number.isFinite(value)) return 'Sin datos';
    if (value >= 90) return 'Excelente';
    if (value >= 80) return 'Buena';
    if (value >= 70) return 'Regular';
    return 'En riesgo';
  }

  ngOnInit(): void {
    this.initializeAttendance();
  }

  onStudentChange(event: Event): void {
    if (this.loading) return;

    const target = event.target as HTMLSelectElement;
    const studentId = Number(target.value);

    if (!Number.isFinite(studentId) || studentId <= 0) return;

    const child = this.children.find(item => item.id === studentId);

    if (!child) {
      void this.feedback.error('No se encontró el alumno seleccionado.');
      return;
    }

    if (this.selectedStudentId === child.id) return;

    this.selectedStudent = child;
    this.selectedStudentId = child.id;
    this.loadAttendance(child.id);
  }

  retry(): void {
    if (this.loading || !this.selectedStudentId) return;
    this.loadAttendance(this.selectedStudentId);
  }

  getSelectedStudentName(): string {
    if (this.isParent) {
      const firstName = this.selectedStudent?.user?.firstName ?? '';
      const lastName = this.selectedStudent?.user?.lastName ?? '';
      return [firstName, lastName].filter(Boolean).join(' ').trim();
    }

    const user = this.user;

    if (!user) return '';

    return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  }

  getStudentGroup(): string {
    if (this.isParent) {
      return this.selectedStudent?.group?.name ?? 'Sin grupo';
    }

    return this.user?.studentProfile?.group?.name ?? 'Sin grupo';
  }

  private initializeAttendance(): void {
    const user = this.user;

    if (!user) {
      this.setInitialError('No se encontró información del usuario.');
      return;
    }

    if (this.isStudent) {
      this.initializeStudent();
      return;
    }

    if (this.isParent) {
      this.initializeParent();
      return;
    }

    this.errorMessage = 'Este usuario no tiene acceso al historial de asistencia.';
  }

  private initializeStudent(): void {
    const studentProfile = this.user?.studentProfile;

    if (!studentProfile?.id) {
      this.setInitialError('No se encontró el perfil del alumno.');
      return;
    }

    this.selectedStudent = studentProfile;
    this.selectedStudentId = studentProfile.id;
    this.loadAttendance(studentProfile.id);
  }

  private initializeParent(): void {
    this.children = this.user?.parentProfile?.children ?? [];

    if (!this.children.length) {
      this.errorMessage = 'No hay alumnos asociados a este tutor.';
      return;
    }

    const firstChild = this.children[0];

    this.selectedStudent = firstChild;
    this.selectedStudentId = firstChild.id;
    this.loadAttendance(firstChild.id);
  }

  private loadAttendance(studentId: number): void {
    if (this.loading) return;

    this.loading = true;
    this.errorMessage = '';
    this.attendance = [];
    this.stats = null;

    let pendingRequests = 2;
    let failed = false;

    const completeRequest = (): void => {
      pendingRequests -= 1;

      if (pendingRequests <= 0) {
        this.loading = false;
      }
    };

    const handleError = (error: unknown): void => {
      if (!failed) {
        failed = true;

        const message = this.getErrorMessage(error);

        this.errorMessage = message;

        void this.feedback.error(message);
      }

      completeRequest();
    };

    this.attendanceService.getByStudent(studentId).subscribe({
      next: response => {
        this.attendance = response ?? [];
        completeRequest();
      },
      error: handleError,
    });

    this.attendanceService.getStudentStats(studentId).subscribe({
      next: response => {
        this.stats = response ?? null;
        completeRequest();
      },
      error: handleError,
    });
  }

  private getTeacherName(item: AttendanceScanResponse): string {
    const firstName = item.classes?.teacher?.user?.firstName ?? '';
    const lastName = item.classes?.teacher?.user?.lastName ?? '';

    return [firstName, lastName].filter(Boolean).join(' ').trim() || 'Docente';
  }

  private getAttendanceTime(item: AttendanceScanResponse): string {
    const schedule = item.classSchedule
      ?? item.classes?.schedules?.find(schedule => schedule.id === item.classScheduleId);

    const startTime = schedule?.startTime ?? '';
    const endTime = schedule?.endTime ?? '';

    if (startTime && endTime) {
      return `${this.formatTime(startTime)} - ${this.formatTime(endTime)}`;
    }

    if (startTime) {
      return this.formatTime(startTime);
    }

    return '';
  }

  private getStatusLabel(status: AttendanceStatus): AttendanceVisualStatus {
    switch (status) {
      case 'PRESENT':
        return 'Presente';
      case 'ABSENT':
        return 'Falta';
      case 'LATE':
        return 'Retardo';
      case 'JUSTIFIED':
        return 'Justificada';
    }
  }

  private formatDate(date: string): string {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return '';

    return parsed.toLocaleDateString('es-MX', {
      timeZone: 'America/Mexico_City',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private formatTime(time: string): string {
    const [hours, minutes] = time.split(':');

    if (hours === undefined || minutes === undefined) {
      return time;
    }

    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  private getTimestamp(date: string): number {
    const timestamp = new Date(date).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  private setInitialError(message: string): void {
    this.errorMessage = message;
    void this.feedback.error(message);
  }

  private getErrorMessage(error: unknown): string {
    if (typeof error !== 'object' || error === null) {
      return 'No fue posible cargar la asistencia.';
    }

    const httpError = error as {
      status?: number;
      error?: {
        message?: string | string[];
      };
    };

    if (httpError.status === 403) {
      return 'No tienes permiso para consultar la asistencia de este alumno.';
    }

    if (httpError.status === 404) {
      return 'No se encontró información de asistencia para este alumno.';
    }

    const backendMessage = httpError.error?.message;

    if (Array.isArray(backendMessage)) {
      return backendMessage.join('. ');
    }

    if (typeof backendMessage === 'string' && backendMessage.trim()) {
      return backendMessage;
    }

    return 'No fue posible cargar la asistencia.';
  }
}