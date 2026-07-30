import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, timeOutline } from 'ionicons/icons';

import { StorageService } from '@core/http/services/storage.service';
import { ScheduleService } from '@features/schedule/services/schedule.service';
import { ScheduleCardComponent } from '@shared/components/schedule/schedule-card/schedule-card.component';

interface ClassItem {
  subject: string;
  teacher: string;
  classroom: string;
  time: string;
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
    ScheduleCardComponent
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent implements OnInit {
  diaActual = 0;

  days: DayData[] = [
    { label: 'L', fullLabel: 'Lunes', day: 'MONDAY', classes: [] },
    { label: 'M', fullLabel: 'Martes', day: 'TUESDAY', classes: [] },
    { label: 'Mi', fullLabel: 'Miércoles', day: 'WEDNESDAY', classes: [] },
    { label: 'J', fullLabel: 'Jueves', day: 'THURSDAY', classes: [] },
    { label: 'V', fullLabel: 'Viernes', day: 'FRIDAY', classes: [] }
  ];

  constructor(
    private storageService: StorageService,
    private scheduleService: ScheduleService
  ) {
    addIcons({ calendarOutline, timeOutline });
  }

  async ngOnInit(): Promise<void> {
    const user: any = await this.storageService.getUser();
    const studentId = user?.studentProfile?.id;

    if (!studentId) return;

    this.scheduleService.getStudentSchedule(studentId).subscribe({
      next: (response: any[]) => {
        response.forEach(schedule => {
          const day = this.days.find(d => d.day === schedule.dayOfWeek);
          if (!day) return;

          day.classes.push({
            subject: schedule.class.subject.name,
            teacher: `${schedule.class.subject.teacher.user.firstName} ${schedule.class.subject.teacher.user.lastName}`,
            classroom: schedule.class.classroom?.name ?? 'Sin aula',
            time: `${schedule.startTime} - ${schedule.endTime}`,
            color: '#7d1736'
          });
        });
      },
      error: err => console.error(err)
    });
  }

  cambiarDia(index: number): void {
    this.diaActual = index;
  }

  getSelectedDay(): string {
    return this.days[this.diaActual].fullLabel;
  }

  getClasses(): ClassItem[] {
    return this.days[this.diaActual].classes;
  }
}