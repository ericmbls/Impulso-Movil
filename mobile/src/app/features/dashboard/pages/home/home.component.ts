import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

import {
  calendarOutline,
  starOutline,
  cardOutline,
  checkmarkCircleOutline,
  notificationsOutline,
  personOutline,
  timeOutline,
  schoolOutline,
  bookOutline,
  megaphoneOutline,
  peopleOutline
} from 'ionicons/icons';

import { StudentCardComponent } from '../../../../shared/components/dashboard/student-card/student-card.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { AuthStateService } from '../../../../core/services/auth-state.service';

type StatItem = {
  icon: string;
  value: string;
  title: string;
  subtitle: string;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    StudentCardComponent,
    StatCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  get fullName(): string {
    const user = this.authState.user();
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  get role(): string {
    const user = this.authState.user();
    if (!user) return '';
    switch (user.role) {
      case 'STUDENT': return 'Alumno';
      case 'TEACHER': return 'Docente';
      case 'ADMIN': return 'Administrador';
      case 'PARENT': return 'Padre de familia';
      default: return user.role;
    }
  }

  get stats(): StatItem[] {
    const user = this.authState.user();
    if (!user) return [];

    switch (user.role) {
      case 'STUDENT':
        return [
          { icon: 'calendar-outline', value: '94%', title: 'Asistencia', subtitle: 'Último mes' },
          { icon: 'star-outline', value: '9.2', title: 'Promedio', subtitle: 'Actual' }
        ];
      case 'TEACHER':
        return [
          { icon: 'people-outline', value: '5', title: 'Grupos', subtitle: 'Activos' },
          { icon: 'person-outline', value: '120', title: 'Alumnos', subtitle: 'Totales' },
          { icon: 'calendar-outline', value: '4', title: 'Clases hoy', subtitle: 'Pendientes' }
        ];
      case 'ADMIN':
        return [
          { icon: 'people-outline', value: '23', title: 'Docentes', subtitle: 'Activos' },
          { icon: 'school-outline', value: '18', title: 'Grupos', subtitle: 'Totales' },
          { icon: 'calendar-outline', value: '8', title: 'Clases hoy', subtitle: 'En curso' }
        ];
      case 'PARENT':
        return [
          { icon: 'star-outline', value: '9.0', title: 'Promedio', subtitle: 'De tu hijo(a)' },
          { icon: 'calendar-outline', value: '85%', title: 'Asistencia', subtitle: 'Último mes' }
        ];
      default:
        return [];
    }
  }

  nextClasses = [
    { name: 'Programación Web', time: '8:00 - 9:30', room: 'Aula 301', color: '#7d1736', remaining: 'En 15 min' },
    { name: 'Base de Datos', time: '10:00 - 11:30', room: 'Aula 205', color: '#c7a15a', remaining: 'En 2h' },
    { name: 'Matemáticas', time: '12:00 - 13:30', room: 'Aula 108', color: '#2e7d32' }
  ];

  recentActivities = [
    { id: 1, icon: 'checkmark-circle-outline', text: 'Tarea de Matemáticas entregada', time: 'Hace 2 horas' },
    { id: 2, icon: 'calendar-outline', text: 'Clase de Física cancelada', time: 'Hoy 08:30' },
    { id: 3, icon: 'megaphone-outline', text: 'Nuevo aviso de dirección', time: 'Ayer 18:00' }
  ];

  constructor(
    public authState: AuthStateService,
    private router: Router
  ) {
    addIcons({
      calendarOutline,
      starOutline,
      cardOutline,
      checkmarkCircleOutline,
      notificationsOutline,
      personOutline,
      timeOutline,
      schoolOutline,
      bookOutline,
      megaphoneOutline,
      peopleOutline
    });
  }

  goToSchedule() {
    this.router.navigateByUrl('/app/schedule');
  }

  goToNotifications() {
    this.router.navigateByUrl('/app/notifications');
  }
}