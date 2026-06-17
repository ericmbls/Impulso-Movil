import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';

import { AverageCardComponent } from '../../../../shared/components/grades/average-card/average-card.component';
import { GradeCardComponent } from '../../../../shared/components/grades/grade-card/grade-card.component';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [
    IonContent,
    AverageCardComponent,
    GradeCardComponent
  ],
  templateUrl: './grades.component.html',
  styleUrl: './grades.component.scss',
})
export class GradesComponent {

  grades = [

    {
      subject:'Programación Web',
      teacher:'Ing. Juan Pérez',
      grade:'9.8',
      status:'Excelente'
    },

    {
      subject:'Base de Datos',
      teacher:'Mtra. García',
      grade:'9.5',
      status:'Excelente'
    },

    {
      subject:'Matemáticas',
      teacher:'Mtro. Hernández',
      grade:'8.7',
      status:'Bueno'
    },

    {
      subject:'Física',
      teacher:'Ing. López',
      grade:'8.4',
      status:'Bueno'
    },

    {
      subject:'Inglés',
      teacher:'Lic. Sánchez',
      grade:'9.4',
      status:'Excelente'
    }

  ];

}