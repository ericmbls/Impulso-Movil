import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cardOutline, 
  checkmarkCircleOutline, 
  notificationsOutline, 
  settingsOutline,
  logOutOutline
} from 'ionicons/icons';

import { AuthStateService } from '@core/auth/services/auth-state.service';
import { StorageService } from '@core/http/services/storage.service';

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

  constructor(
    private router: Router,
    private storageService: StorageService,
    private authState: AuthStateService
  ) {
    addIcons({
      cardOutline,
      checkmarkCircleOutline,
      notificationsOutline,
      settingsOutline,
      logOutOutline
    });
  }

  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
  }

  async logout(): Promise<void> {
    await this.storageService.clear();
    this.authState.clear();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}