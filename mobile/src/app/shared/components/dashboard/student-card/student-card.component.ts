import { Component, computed } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { callOutline, ellipse, mailOutline } from 'ionicons/icons';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { AdminProfile, ParentProfile, StudentProfile, TeacherProfile, UserRole } from '@core/auth/models/user';

interface UserCardViewModel {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  active: boolean;
  role: string;
  primaryDetail: string;
  secondaryDetail: string;
}

@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './student-card.component.html',
  styleUrl: './student-card.component.scss',
})
export class StudentCardComponent {
  readonly user = computed<UserCardViewModel | null>(() => {
    const user = this.authState.user();
    if (!user) return null;
    const student = user.studentProfile;
    const teacher = user.teacherProfile;
    const parent = user.parentProfile;
    const admin = user.adminProfile;
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return {
      name: name || 'Usuario',
      email: user.email,
      phone: student?.phone ?? teacher?.phone ?? parent?.phone ?? admin?.phone ?? '',
      avatar: this.getInitials(user.firstName, user.lastName),
      active: user.isActive ?? true,
      role: this.getRoleLabel(user.role),
      primaryDetail: this.getPrimaryDetail(user.role, student, teacher, parent, admin),
      secondaryDetail: this.getSecondaryDetail(user.role, student, teacher),
    };
  });

  constructor(private readonly authState: AuthStateService) {
    addIcons({ callOutline, ellipse, mailOutline });
  }

  private getInitials(firstName?: string, lastName?: string): string {
    const first = firstName?.trim().charAt(0).toUpperCase() ?? '';
    const last = lastName?.trim().charAt(0).toUpperCase() ?? '';
    return `${first}${last}` || '?';
  }

  private getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'STUDENT': return 'Alumno';
      case 'TEACHER': return 'Docente';
      case 'ADMIN': return 'Administrador';
      case 'PARENT': return 'Tutor';
    }
  }

  private getPrimaryDetail(
    role: UserRole,
    student?: StudentProfile | null,
    teacher?: TeacherProfile | null,
    parent?: ParentProfile | null,
    admin?: AdminProfile | null,
  ): string {
    switch (role) {
      case 'STUDENT': return student?.group?.name ?? '';
      case 'TEACHER': return teacher?.specialty ?? '';
      case 'ADMIN': return admin?.position ?? '';
      case 'PARENT': {
        const childCount = parent?.children?.length ?? 0;
        if (childCount === 1) return '1 alumno vinculado';
        if (childCount > 1) return `${childCount} alumnos vinculados`;
        return '';
      }
    }
  }

  private getSecondaryDetail(role: UserRole, student?: StudentProfile | null, teacher?: TeacherProfile | null): string {
    if (role === 'STUDENT') return student?.group?.career?.name ?? '';
    if (role === 'TEACHER') return teacher?.employeeId ? `No. de empleado ${teacher.employeeId}` : '';
    return '';
  }
}