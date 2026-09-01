import { Component, inject } from '@angular/core';
import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import {
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  calendarOutline,
  qrCodeOutline,
  scanOutline,
  statsChartOutline,
  personOutline,
} from 'ionicons/icons';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { UserRole } from '@core/auth/models/user';

@Component({
  selector: 'app-tabs-layout',
  standalone: true,
  imports: [
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './tabs-layout.component.html',
  styleUrl: './tabs-layout.component.scss',
})
export class TabsLayoutComponent {
  private readonly authState = inject(AuthStateService);

  constructor() {
    addIcons({
      homeOutline,
      calendarOutline,
      qrCodeOutline,
      scanOutline,
      statsChartOutline,
      personOutline,
    });
  }

  get role(): UserRole | undefined {
    return this.authState.user()?.role;
  }

  get showSchedule(): boolean {
    return (
      this.role === 'STUDENT' ||
      this.role === 'TEACHER'
    );
  }

  get showQr(): boolean {
    return (
      this.role === 'STUDENT' ||
      this.role === 'TEACHER' ||
      this.role === 'PARENT'
    );
  }

  get showGrades(): boolean {
    return (
      this.role === 'STUDENT' ||
      this.role === 'PARENT'
    );
  }

  get qrIcon(): string {
    return this.role === 'TEACHER'
      ? 'scan-outline'
      : 'qr-code-outline';
  }

  get qrLabel(): string {
    switch (this.role) {
      case 'TEACHER':
        return 'Escanear';

      case 'PARENT':
        return 'Asistencia';

      default:
        return 'QR';
    }
  }
}