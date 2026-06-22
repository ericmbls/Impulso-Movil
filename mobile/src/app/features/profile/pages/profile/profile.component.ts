import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  personOutline,
  schoolOutline,
  mailOutline,
  callOutline,
  calendarOutline,
  idCardOutline,
  logOutOutline,
  chevronForwardOutline,
  menuOutline
} from 'ionicons/icons';

import { StorageService } from '../../../../core/services/storage.service';
import { AuthStateService } from '../../../../core/services/auth-state.service';

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

  constructor(
    private storageService: StorageService,
    private router: Router,
    public authState: AuthStateService
  ) {

    addIcons({
      personOutline,
      schoolOutline,
      mailOutline,
      callOutline,
      calendarOutline,
      idCardOutline,
      logOutOutline,
      chevronForwardOutline,
      menuOutline
    });

  }

  user = computed(() => {

    const u = this.authState.user();

    if (!u) {

      return {
        name: '',
        email: '',
        phone: '',
        group: '',
        career: '',
        controlNumber: '',
        photo: '?'
      };

    }

    return {

      name: `${u.firstName} ${u.lastName}`,

      email: u.email,

      phone:
        u.studentProfile?.phone ??
        u.teacherProfile?.phone ??
        '',

      group:
        u.studentProfile?.group?.name ??
        u.role,

      career:
        u.studentProfile?.group?.career?.name ??
        u.teacherProfile?.specialty ??
        '',

      controlNumber:
        u.studentProfile?.controlNumber ??
        u.teacherProfile?.employeeId ??
        '',

      photo: (u.firstName || '?')
        .charAt(0)
        .toUpperCase()

    };

  });

  menuItems = [
    {
      icon: 'id-card-outline',
      label: 'Mi credencial',
      route: '/app/credential'
    },
    {
      icon: 'calendar-outline',
      label: 'Horario',
      route: '/app/schedule'
    },
    {
      icon: 'school-outline',
      label: 'Calificaciones',
      route: '/app/grades'
    }
  ];

  navigateTo(route: string) {

    this.router.navigateByUrl(route);

  }

  async logout() {

    await this.storageService.clear();

    this.authState.clear();

    await this.router.navigateByUrl('/login', {
      replaceUrl: true
    });

  }

}