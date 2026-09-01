import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, mailOutline, callOutline, cardOutline, logOutOutline, locationOutline, schoolOutline, briefcaseOutline, peopleOutline, flagOutline, starOutline } from 'ionicons/icons';
import { StorageService } from '@core/http/services/storage.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { SemaphoreStatus, UserRole } from '@core/auth/models/user';

type ProfileSection = 'info' | 'academico' | 'contacto';

interface StudentProfileView {
  controlNumber: string;
  phone: string;
  semaphore: SemaphoreStatus | null;
  semaphoreLabel: string;
  groupName: string;
  careerName: string;
  gradeLevel: number | string | null;
}

interface TeacherProfileView {
  employeeId: string;
  specialty: string;
  phone: string;
}

interface AdminProfileView {
  position: string;
  phone: string;
}

interface ParentProfileView {
  phone: string;
  address: string;
}

interface ProfileViewModel {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  roleLabel: string;
  fullName: string;
  photo: string;
  studentProfile: StudentProfileView | null;
  teacherProfile: TeacherProfileView | null;
  adminProfile: AdminProfileView | null;
  parentProfile: ParentProfileView | null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [IonContent, IonIcon],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  readonly seccionActiva = signal<ProfileSection>('info');

  readonly user = computed<ProfileViewModel | null>(() => {
    const user = this.authState.user();

    if (!user) return null;

    const student = user.studentProfile;
    const teacher = user.teacherProfile;
    const admin = user.adminProfile;
    const parent = user.parentProfile;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      roleLabel: this.getRoleLabel(user.role),
      fullName: [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Usuario',
      photo: this.getInitials(user.firstName, user.lastName),
      studentProfile: student
        ? {
            controlNumber: student.controlNumber ?? student.enrollmentId ?? '',
            phone: student.phone ?? '',
            semaphore: student.semaphore ?? null,
            semaphoreLabel: this.getSemaphoreLabel(student.semaphore),
            groupName: student.group?.name ?? '',
            careerName: student.group?.career?.name ?? '',
            gradeLevel: student.group?.gradeLevel ?? null,
          }
        : null,
      teacherProfile: teacher
        ? {
            employeeId: teacher.employeeId ?? '',
            specialty: teacher.specialty ?? '',
            phone: teacher.phone ?? '',
          }
        : null,
      adminProfile: admin
        ? {
            position: admin.position ?? '',
            phone: admin.phone ?? '',
          }
        : null,
      parentProfile: parent
        ? {
            phone: parent.phone ?? '',
            address: parent.address ?? '',
          }
        : null,
    };
  });

  constructor(
    private readonly storageService: StorageService,
    private readonly router: Router,
    public readonly authState: AuthStateService,
  ) {
    addIcons({
      personOutline,
      mailOutline,
      callOutline,
      cardOutline,
      logOutOutline,
      locationOutline,
      schoolOutline,
      briefcaseOutline,
      peopleOutline,
      flagOutline,
      starOutline,
    });
  }

  cambiarSeccion(seccion: ProfileSection): void {
    if (seccion === 'academico' && !this.mostrarSeccionAcademica()) return;
    this.seccionActiva.set(seccion);
  }

  async logout(): Promise<void> {
    await this.storageService.clear();
    this.authState.clear();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  getSubtitulo(): string {
    switch (this.seccionActiva()) {
      case 'info':
        return 'Información personal';
      case 'academico':
        return 'Datos académicos y profesionales';
      case 'contacto':
        return 'Información de contacto';
    }
  }

  mostrarSeccionAcademica(): boolean {
    const user = this.user();

    if (!user) return false;

    return user.role === 'STUDENT'
      || user.role === 'TEACHER'
      || user.role === 'ADMIN';
  }

  getSemaphoreClass(semaphore: SemaphoreStatus | null): string {
    switch (semaphore) {
      case 'GREEN':
        return 'green';
      case 'YELLOW':
        return 'yellow';
      case 'RED':
        return 'red';
      default:
        return 'neutral';
    }
  }

  private getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'TEACHER':
        return 'Docente';
      case 'STUDENT':
        return 'Alumno';
      case 'PARENT':
        return 'Tutor';
    }
  }

  private getSemaphoreLabel(semaphore?: SemaphoreStatus): string {
    switch (semaphore) {
      case 'GREEN':
        return 'Verde';
      case 'YELLOW':
        return 'Amarillo';
      case 'RED':
        return 'Rojo';
      default:
        return 'No definido';
    }
  }

  private getInitials(firstName?: string, lastName?: string): string {
    const first = firstName?.trim().charAt(0).toUpperCase() ?? '';
    const last = lastName?.trim().charAt(0).toUpperCase() ?? '';
    return `${first}${last}` || '?';
  }
}