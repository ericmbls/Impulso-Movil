import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { timeOutline, calendarOutline } from 'ionicons/icons';

import { ScheduleCardComponent } from '../../../../shared/components/schedule/schedule-card/schedule-card.component';

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
  styleUrl: './schedule.component.scss',
})
export class ScheduleComponent {

  diaActual: number = 0;

  days: DayData[] = [
    {
      label: 'L',
      fullLabel: 'Lunes',
      classes: [
        { subject: 'Programación Web', teacher: 'Ing. Juan Pérez', classroom: 'Aula 301', time: '8:00 - 9:30', color: '#7d1736' },
        { subject: 'Base de Datos', teacher: 'Mtra. García', classroom: 'Aula 205', time: '10:00 - 11:30', color: '#c7a15a' },
        { subject: 'Matemáticas', teacher: 'Mtro. Hernández', classroom: 'Aula 108', time: '12:00 - 13:30', color: '#2e7d32' },
      ]
    },
    {
      label: 'M',
      fullLabel: 'Martes',
      classes: [
        { subject: 'Física', teacher: 'Ing. López', classroom: 'Aula 302', time: '8:00 - 9:30', color: '#1565c0' },
        { subject: 'Inglés', teacher: 'Lic. Sánchez', classroom: 'Aula 204', time: '10:00 - 11:30', color: '#6a1b9a' },
        { subject: 'Programación Web', teacher: 'Ing. Juan Pérez', classroom: 'Aula 301', time: '12:00 - 13:30', color: '#7d1736' },
      ]
    },
    {
      label: 'Mi',
      fullLabel: 'Miércoles',
      classes: [
        { subject: 'Base de Datos', teacher: 'Mtra. García', classroom: 'Aula 205', time: '8:00 - 9:30', color: '#c7a15a' },
        { subject: 'Matemáticas', teacher: 'Mtro. Hernández', classroom: 'Aula 108', time: '10:00 - 11:30', color: '#2e7d32' },
        { subject: 'Física', teacher: 'Ing. López', classroom: 'Aula 302', time: '12:00 - 13:30', color: '#1565c0' },
      ]
    },
    {
      label: 'J',
      fullLabel: 'Jueves',
      classes: [
        { subject: 'Inglés', teacher: 'Lic. Sánchez', classroom: 'Aula 204', time: '8:00 - 9:30', color: '#6a1b9a' },
        { subject: 'Programación Web', teacher: 'Ing. Juan Pérez', classroom: 'Aula 301', time: '10:00 - 11:30', color: '#7d1736' },
        { subject: 'Base de Datos', teacher: 'Mtra. García', classroom: 'Aula 205', time: '12:00 - 13:30', color: '#c7a15a' },
      ]
    },
    {
      label: 'V',
      fullLabel: 'Viernes',
      classes: [
        { subject: 'Matemáticas', teacher: 'Mtro. Hernández', classroom: 'Aula 108', time: '8:00 - 9:30', color: '#2e7d32' },
        { subject: 'Física', teacher: 'Ing. López', classroom: 'Aula 302', time: '10:00 - 11:30', color: '#1565c0' },
        { subject: 'Inglés', teacher: 'Lic. Sánchez', classroom: 'Aula 204', time: '12:00 - 13:30', color: '#6a1b9a' },
      ]
    }
  ];

  constructor() {
    addIcons({ timeOutline, calendarOutline });
  }

  cambiarDia(index: number) {
    if (this.days[index]) {
      this.diaActual = index;
    }
  }

  getSelectedDay(): string {
    return this.days[this.diaActual]?.fullLabel || 'Lunes';
  }

  getClasses(): ClassItem[] {
    return this.days[this.diaActual]?.classes || [];
  }
}