import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';

import { ScheduleCardComponent } from '../../../../shared/components/schedule/schedule-card/schedule-card.component';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [
    IonContent,
    ScheduleCardComponent
  ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss',
})
export class ScheduleComponent {

  selectedDay = 'Lunes';

  classes = [
    {
      subject: 'Programación Web',
      teacher: 'Ing. Juan Pérez',
      classroom: 'Laboratorio 2',
      time: '08:00 - 09:00',
      color: '#7D1736'
    },
    {
      subject: 'Base de Datos',
      teacher: 'Mtra. García',
      classroom: 'Laboratorio 1',
      time: '09:00 - 10:00',
      color: '#C7A15A'
    },
    {
      subject: 'Matemáticas',
      teacher: 'Mtro. Hernández',
      classroom: 'Aula 12',
      time: '10:00 - 11:00',
      color: '#2E7D32'
    }
  ];

}