import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  IonContent,
  IonIcon,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  calendarOutline,
  timeOutline,
} from 'ionicons/icons';

import { StorageService } from '@core/http/services/storage.service';

import {
  ScheduleService,
} from '@features/schedule/services/schedule.service';

import {
  ScheduleCardComponent,
} from '@shared/components/schedule/schedule-card/schedule-card.component';

interface ClassItem {
  id: number;
  subject: string;
  teacher: string;
  classroom: string;
  group: string;
  time: string;
  startTime: string;
  color: string;
}

interface DayData {
  label: string;
  fullLabel: string;
  day: string;
  classes: ClassItem[];
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    ScheduleCardComponent,
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
})
export class ScheduleComponent implements OnInit {
  user: any = null;

  diaActual = 0;

  teacherClasses: ClassItem[] = [];

  loading = false;

  errorMessage = '';

  days: DayData[] = [
    {
      label: 'L',
      fullLabel: 'Lunes',
      day: 'MONDAY',
      classes: [],
    },
    {
      label: 'M',
      fullLabel: 'Martes',
      day: 'TUESDAY',
      classes: [],
    },
    {
      label: 'Mi',
      fullLabel: 'Miércoles',
      day: 'WEDNESDAY',
      classes: [],
    },
    {
      label: 'J',
      fullLabel: 'Jueves',
      day: 'THURSDAY',
      classes: [],
    },
    {
      label: 'V',
      fullLabel: 'Viernes',
      day: 'FRIDAY',
      classes: [],
    },
  ];

  constructor(
    private readonly storageService: StorageService,
    private readonly scheduleService: ScheduleService,
  ) {
    addIcons({
      calendarOutline,
      timeOutline,
    });
  }

  get isTeacher(): boolean {
    return this.user?.role === 'TEACHER';
  }

  get isStudent(): boolean {
    return this.user?.role === 'STUDENT';
  }

  async ngOnInit(): Promise<void> {
    this.user =
      await this.storageService.getUser();

    if (!this.user) {
      this.errorMessage =
        'No se encontró información del usuario.';

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

    this.errorMessage =
      'Este perfil no tiene un horario disponible.';
  }

  cambiarDia(index: number): void {
    if (this.isTeacher) {
      return;
    }

    this.diaActual = index;
  }

  getSelectedDay(): string {
    if (this.isTeacher) {
      return this.getTodayLabel();
    }

    return (
      this.days[this.diaActual]
        ?.fullLabel ??
      ''
    );
  }

  getClasses(): ClassItem[] {
    if (this.isTeacher) {
      return this.teacherClasses;
    }

    return (
      this.days[this.diaActual]
        ?.classes ??
      []
    );
  }

  getSubtitle(): string {
    if (this.isTeacher) {
      return `${this.getTodayLabel()} • Horario docente`;
    }

    const group =
      this.user
        ?.studentProfile
        ?.group
        ?.name;

    return group
      ? `${this.getSelectedDay()} • ${group}`
      : this.getSelectedDay();
  }

  private loadStudentSchedule(): void {
    const studentId =
      this.user
        ?.studentProfile
        ?.id;

    if (!studentId) {
      this.errorMessage =
        'No se encontró el perfil del alumno.';

      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.clearDays();

    this.scheduleService
      .getStudentSchedule(studentId)
      .subscribe({
        next: (response: any[]) => {
          this.loading = false;

          for (const schedule of response ?? []) {
            const day =
              this.days.find(
                item =>
                  item.day ===
                  schedule.dayOfWeek,
              );

            if (!day) {
              continue;
            }

            day.classes.push(
              this.mapSchedule(
                schedule,
              ),
            );
          }

          this.sortDays();

          this.selectTodayForStudent();
        },

        error: (error: any) => {
          this.loading = false;

          this.errorMessage =
            error?.error?.message ??
            'No se pudo cargar el horario.';
        },
      });
  }

  private loadTeacherSchedule(): void {
    const teacherId =
      this.user
        ?.teacherProfile
        ?.id ??
      this.user
        ?.teacherProfileId ??
      this.user
        ?.teacherId;

    if (!teacherId) {
      this.errorMessage =
        'No se encontró el perfil del docente.';

      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.teacherClasses = [];

    const today =
      this.getMexicoCityDay();

    this.scheduleService
      .getTeacherSchedule(teacherId)
      .subscribe({
        next: (response: any[]) => {
          this.loading = false;

          this.teacherClasses =
            (response ?? [])
              .filter(
                schedule =>
                  schedule.dayOfWeek ===
                  today,
              )
              .map(
                schedule =>
                  this.mapSchedule(
                    schedule,
                  ),
              )
              .sort(
                (a, b) =>
                  this.timeToMinutes(
                    a.startTime,
                  ) -
                  this.timeToMinutes(
                    b.startTime,
                  ),
              );
        },

        error: (error: any) => {
          this.loading = false;

          this.teacherClasses = [];

          this.errorMessage =
            error?.error?.message ??
            'No se pudo cargar el horario del docente.';
        },
      });
  }

  private mapSchedule(
    schedule: any,
  ): ClassItem {
    const subject =
      schedule
        ?.class
        ?.subject;

    const teacher =
      schedule
        ?.class
        ?.teacher
        ?.user ??
      subject
        ?.teacher
        ?.user;

    const teacherName =
      `${teacher?.firstName ?? ''} ${teacher?.lastName ?? ''}`
        .trim();

    const classroom =
      schedule
        ?.classroom
        ?.name ??
      schedule
        ?.class
        ?.classroom
        ?.name ??
      'Sin aula';

    const group =
      schedule
        ?.class
        ?.group
        ?.name ??
      '';

    return {
      id:
        schedule.id,

      subject:
        subject?.name ??
        'Materia',

      teacher:
        teacherName ||
        'Docente',

      classroom,

      group,

      time:
        `${schedule.startTime} - ${schedule.endTime}`,

      startTime:
        schedule.startTime,

      color:
        '#7d1736',
    };
  }

  private clearDays(): void {
    for (const day of this.days) {
      day.classes = [];
    }
  }

  private sortDays(): void {
    for (const day of this.days) {
      day.classes.sort(
        (a, b) =>
          this.timeToMinutes(
            a.startTime,
          ) -
          this.timeToMinutes(
            b.startTime,
          ),
      );
    }
  }

  private selectTodayForStudent(): void {
    const today =
      this.getMexicoCityDay();

    const index =
      this.days.findIndex(
        day =>
          day.day === today,
      );

    if (index >= 0) {
      this.diaActual = index;
    }
  }

  private getMexicoCityDay(): string {
    const weekday =
      new Intl.DateTimeFormat(
        'en-US',
        {
          timeZone:
            'America/Mexico_City',
          weekday:
            'long',
        },
      ).format(
        new Date(),
      );

    const days:
      Record<string, string> = {
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

    return (
      days[weekday] ??
      ''
    );
  }

  private getTodayLabel(): string {
    const value =
      new Intl.DateTimeFormat(
        'es-MX',
        {
          timeZone:
            'America/Mexico_City',
          weekday:
            'long',
          day:
            'numeric',
          month:
            'long',
        },
      ).format(
        new Date(),
      );

    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );
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
}