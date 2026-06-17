import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  personOutline, 
  schoolOutline, 
  mailOutline, 
  callOutline,
  calendarOutline,
  idCardOutline,
  logOutOutline,
  chevronForwardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {

  user = {
    name: 'Eric Hernández',
    email: 'eric.hernandez@cbtis61.edu.mx',
    phone: '744-123-4567',
    group: '6° A',
    career: 'Programación',
    controlNumber: '2023123456',
    photo: 'E'
  };

  menuItems = [
    { icon: 'id-card-outline', label: 'Mi credencial', route: '/credential' },
    { icon: 'calendar-outline', label: 'Horario', route: '/schedule' },
    { icon: 'school-outline', label: 'Calificaciones', route: '/grades' },
    { icon: 'person-outline', label: 'Datos personales', route: '/edit-profile' }
  ];

  constructor() {
    addIcons({
      personOutline,
      schoolOutline,
      mailOutline,
      callOutline,
      calendarOutline,
      idCardOutline,
      logOutOutline,
      chevronForwardOutline
    });
  }

  navigateTo(route: string) {
    console.log('Navegando a:', route);
  }

  logout() {
    console.log('Cerrando sesión...');
  }
}