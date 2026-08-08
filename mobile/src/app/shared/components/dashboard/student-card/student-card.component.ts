import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, callOutline, ellipse } from 'ionicons/icons';
import { AuthStateService } from '@core/auth/services/auth-state.service';

@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './student-card.component.html',
  styleUrls: ['./student-card.component.scss']
})
export class StudentCardComponent {
  user = computed(() => {
    const u = this.authState.user();
    if (!u) {
      return {
        name: '',
        email: '',
        phone: '',
        avatar: '?',
        active: false,
        group: '',
        career: ''
      };
    }
    const student = u.studentProfile;
    const teacher = u.teacherProfile;
    const parent = u.parentProfile;
    return {
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      phone: student?.phone ?? teacher?.phone ?? parent?.phone ?? '',
      avatar: u.firstName.charAt(0).toUpperCase(),
      active: u.isActive ?? true,
      group: student?.group?.name ?? '',
      career: student?.group?.career?.name ?? ''
    };
  });

  constructor(private authState: AuthStateService) {
    addIcons({ mailOutline, callOutline, ellipse });
  }
}