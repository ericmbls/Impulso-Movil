import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  mailOutline,
  callOutline,
  ellipse
} from 'ionicons/icons';

import { AuthStateService } from '../../../../core/services/auth-state.service';

@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [
    CommonModule,
    IonIcon
  ],
  templateUrl: './student-card.component.html',
  styleUrls: ['./student-card.component.scss']
})
export class StudentCardComponent {

  constructor(public authState: AuthStateService) {

    addIcons({
      mailOutline,
      callOutline,
      ellipse
    });

  }

  user = computed(() => {

    const u = this.authState.user();

    if (!u) {
      return {
        name: '',
        email: '',
        phone: '',
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
      photo: u.firstName.charAt(0).toUpperCase()
    };

  });

}