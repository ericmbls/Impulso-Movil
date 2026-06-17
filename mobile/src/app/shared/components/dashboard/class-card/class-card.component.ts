import { Component } from '@angular/core';

@Component({
  selector: 'app-class-card',
  standalone: true,
  templateUrl: './class-card.component.html',
  styleUrl: './class-card.component.scss'
})
export class ClassCardComponent {

  nextClass = {
    subject: 'Programación Web',
    teacher: 'Ing. Juan Pérez',
    classroom: 'Laboratorio 2',
    schedule: '08:00 - 09:00',
    status: 'En 15 minutos'
  };

}