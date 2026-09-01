// schedule.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircleOutline, calendarOutline, timeOutline } from 'ionicons/icons';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { FeedbackService } from '@core/shared/services/feedback.service';
import { ScheduleDay, ScheduleItem, ScheduleService } from '@features/schedule/services/schedule.service';
import { ScheduleCardComponent } from '@shared/components/schedule/schedule-card/schedule-card.component';

interface ClassItem {
  id: number;
  subject: string;
  teacher: string;
  classroom: string;
  group: string;
  time: string;
  startTime: string;
  endTime: string;
  color: string;
}

interface DayData {
  label: string;
  fullLabel: string;
  day: ScheduleDay;
  classes: ClassItem[];
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [IonContent, IonIcon, IonSpinner, ScheduleCardComponent],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
})
export class ScheduleComponent implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly feedback = inject(FeedbackService);

  diaActual = 0;
  teacherClasses: ClassItem[] = [];
  loading = false;
  errorMessage = '';

  readonly days: DayData[] = [
    { label: 'L', fullLabel: 'Lunes', day: 'MONDAY', classes: [] },
    { label: 'M', fullLabel: 'Martes', day: 'TUESDAY', classes: [] },
    { label: 'Mi', fullLabel: 'Miércoles', day: 'WEDNESDAY', classes: [] },
    { label: 'J', fullLabel: 'Jueves', day: 'THURSDAY', classes: [] },
    { label: 'V', fullLabel: 'Viernes', day: 'FRIDAY', classes: [] },
  ];

  constructor() {
    addIcons({ alertCircleOutline, calendarOutline, timeOutline });
  }

  get user() {
    return this.authState.user();
  }

  get isTeacher(): boolean {
    return this.user?.role === 'TEACHER';
  }

  get isStudent(): boolean {
    return this.user?.role === 'STUDENT';
  }

  get selectedClasses(): ClassItem[] {
    if (this.isTeacher) return this.teacherClasses;
    return this.days[this.diaActual]?.classes ?? [];
  }

  get selectedDayLabel(): string {
    if (this.isTeacher) return this.getTodayLabel();
    return this.days[this.diaActual]?.fullLabel ?? '';
  }

  ngOnInit(): void {
    const user = this.user;
    if (!user) {
      this.setError('No se encontró información del usuario.');
      return;
    }
    if (this.isTeacher) {
      this.loadTeacherSchedule();
      return;
    }
    if (this.isStudent) {
      this.loadStudentSchedule();
      return;
    }
    this.errorMessage = 'Este perfil no tiene un horario disponible.';
  }

  cambiarDia(index: number): void {
    if (this.isTeacher || this.loading) return;
    if (index < 0 || index >= this.days.length) return;
    this.diaActual = index;
  }

  getSubtitle(): string {
    if (this.isTeacher) {
      return `${this.getTodayLabel()} • Horario docente`;
    }
    const group = this.user?.studentProfile?.group?.name;
    if (group) return `${this.selectedDayLabel} • ${group}`;
    return this.selectedDayLabel;
  }

  retry(): void {
    if (this.loading) return;
    if (this.isTeacher) {
      this.loadTeacherSchedule();
      return;
    }
    if (this.isStudent) {
      this.loadStudentSchedule();
    }
  }

  private loadStudentSchedule(): void {
    const studentId = this.user?.studentProfile?.id;
    if (!studentId) {
      this.setError('No se encontró el perfil del alumno.');
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.clearDays();
    this.scheduleService.getStudentSchedule(studentId).subscribe({
      next: response => {
        this.processStudentSchedule(response ?? []);
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        const message = this.getErrorMessage(error, 'No se pudo cargar el horario.');
        this.setError(message);
      },
    });
  }

  private processStudentSchedule(response: ScheduleItem[]): void {
    for (const schedule of response) {
      const day = this.days.find(item => item.day === schedule.dayOfWeek);
      if (!day) continue;
      day.classes.push(this.mapSchedule(schedule));
    }
    this.sortDays();
    this.selectTodayForStudent();
  }

  private loadTeacherSchedule(): void {
    const teacherId = this.user?.teacherProfile?.id;
    if (!teacherId) {
      this.setError('No se encontró el perfil del docente.');
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.teacherClasses = [];
    const today = this.getMexicoCityDay();
    this.scheduleService.getTeacherSchedule(teacherId).subscribe({
      next: response => {
        this.teacherClasses = (response ?? [])
          .filter(schedule => schedule.dayOfWeek === today)
          .map(schedule => this.mapSchedule(schedule))
          .sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime));
        this.loading = false;
      },
      error: error => {
        this.teacherClasses = [];
        this.loading = false;
        const message = this.getErrorMessage(error, 'No se pudo cargar el horario del docente.');
        this.setError(message);
      },
    });
  }

  private mapSchedule(schedule: ScheduleItem): ClassItem {
    const subject = schedule.class?.subject;
    const teacher = schedule.class?.teacher?.user ?? subject?.teacher?.user;
    const teacherName = [teacher?.firstName, teacher?.lastName].filter(Boolean).join(' ').trim();
    const classroom = schedule.classroom?.name ?? schedule.class?.classroom?.name ?? 'Sin aula';
    const group = schedule.class?.group?.name ?? '';
    return {
      id: schedule.id,
      subject: subject?.name ?? 'Materia',
      teacher: teacherName || 'Docente',
      classroom,
      group,
      time: `${this.formatTime(schedule.startTime)} - ${this.formatTime(schedule.endTime)}`,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      color: '#7d1736',
    };
  }

  private clearDays(): void {
    for (const day of this.days) {
      day.classes = [];
    }
  }

  private sortDays(): void {
    for (const day of this.days) {
      day.classes.sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime));
    }
  }

  private selectTodayForStudent(): void {
    const today = this.getMexicoCityDay();
    const index = this.days.findIndex(day => day.day === today);
    this.diaActual = index >= 0 ? index : 0;
  }

  private getMexicoCityDay(): ScheduleDay {
    const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', weekday: 'long' }).format(new Date());
    const days: Record<string, ScheduleDay> = {
      Sunday: 'SUNDAY',
      Monday: 'MONDAY',
      Tuesday: 'TUESDAY',
      Wednesday: 'WEDNESDAY',
      Thursday: 'THURSDAY',
      Friday: 'FRIDAY',
      Saturday: 'SATURDAY',
    };
    return days[weekday] ?? 'MONDAY';
  }

  private getTodayLabel(): string {
    const value = new Intl.DateTimeFormat('es-MX', { timeZone: 'America/Mexico_City', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return Number.MAX_SAFE_INTEGER;
    return hours * 60 + minutes;
  }

  private formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    if (hours === undefined || minutes === undefined) return time;
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  private setError(message: string): void {
    this.errorMessage = message;
    void this.feedback.error(message);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const httpError = error as { error?: { message?: string | string[] } };
      const message = httpError.error?.message;
      if (Array.isArray(message)) return message.join('. ');
      if (typeof message === 'string' && message.trim()) return message;
    }
    return fallback;
  }
}