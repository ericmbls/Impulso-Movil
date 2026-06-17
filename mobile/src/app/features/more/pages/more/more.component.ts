import { Component } from '@angular/core';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  cardOutline, 
  checkmarkCircleOutline, 
  notificationsOutline, 
  settingsOutline,
  logOutOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-more',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon
  ],
  templateUrl: './more.component.html',
  styleUrl: './more.component.scss',
})
export class MoreComponent {

  menuItems = [
    { icon: 'card-outline', label: 'Credencial', route: '/credential' },
    { icon: 'checkmark-circle-outline', label: 'Asistencia', route: '/attendance' },
    { icon: 'notifications-outline', label: 'Notificaciones', route: '/notifications' },
    { icon: 'settings-outline', label: 'Configuración', route: '/settings' }
  ];

  constructor() {
    addIcons({
      cardOutline,
      checkmarkCircleOutline,
      notificationsOutline,
      settingsOutline,
      logOutOutline
    });
  }

  navigateTo(route: string) {
    // Aquí va tu lógica de navegación
    console.log('Navegando a:', route);
  }

  logout() {
    // Aquí va tu lógica de cerrar sesión
    console.log('Cerrando sesión...');
  }
}