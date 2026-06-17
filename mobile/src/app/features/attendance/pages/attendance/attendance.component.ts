import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';

import { AttendanceSummaryComponent } from '../../../../shared/components/attendance/attendance-summary/attendance-summary.component';
import { AttendanceCardComponent } from '../../../../shared/components/attendance/attendance-card/attendance-card.component';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    IonContent,
    AttendanceSummaryComponent,
    AttendanceCardComponent
  ],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.scss',
})
export class AttendanceComponent {

  attendance = [

    {
      subject: 'Programación Web',
      status: 'Presente',
      present: true
    },

    {
      subject: 'Base de Datos',
      status: 'Presente',
      present: true
    },

    {
      subject: 'Matemáticas',
      status: 'Falta',
      present: false
    },

    {
      subject: 'Física',
      status: 'Presente',
      present: true
    },

    {
      subject: 'Inglés',
      status: 'Presente',
      present: true
    }

  ];

}