import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  flashOutline,
  bookOutline
} from 'ionicons/icons';

import { StudentCardComponent } from '../../../../shared/components/dashboard/student-card/student-card.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { QuickActionCardComponent } from '../../../../shared/components/quick-action-card/quick-action-card.component';

import { AuthStateService } from '../../../../core/services/auth-state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    StudentCardComponent,
    StatCardComponent,
    QuickActionCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  constructor(
    public authState: AuthStateService
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
      flashOutline,
      bookOutline
    });
  }

  fullName = computed(() => {

    const user = this.authState.user();

    if (!user) return '';

    return `${user.firstName} ${user.lastName}`;

  });

  role = computed(() => {

    const user = this.authState.user();

    if (!user) return '';

    switch (user.role) {
      case 'STUDENT':
        return 'Alumno';

      case 'TEACHER':
        return 'Docente';

      case 'ADMIN':
        return 'Administrador';

      case 'PARENT':
        return 'Padre de familia';

      default:
        return user.role;
    }

  });

  stats = [
    {
      icon: 'calendar-outline',
      value: '94%',
      title: 'Asistencia',
      subtitle: 'Último mes'
    },
    {
      icon: 'star-outline',
      value: '9.2',
      title: 'Promedio',
      subtitle: 'Actual'
    }
  ];

  quickActions = [
    {
      icon: 'card-outline',
      title: 'Credencial'
    },
    {
      icon: 'checkmark-circle-outline',
      title: 'Asistencia'
    },
    {
      icon: 'notifications-outline',
      title: 'Avisos'
    },
    {
      icon: 'person-outline',
      title: 'Perfil'
    }
  ];

  nextClasses = [
    {
      name: 'Programación Web',
      time: '8:00 - 9:30',
      room: 'Aula 301',
      color: '#7d1736'
    },
    {
      name: 'Base de Datos',
      time: '10:00 - 11:30',
      room: 'Aula 205',
      color: '#c7a15a'
    },
    {
      name: 'Matemáticas',
      time: '12:00 - 13:30',
      room: 'Aula 108',
      color: '#2e7d32'
    }
  ];

}