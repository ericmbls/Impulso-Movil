import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  callOutline,
  idCardOutline,
  logOutOutline,
  locationOutline,
  schoolOutline,
  briefcaseOutline,
  peopleOutline,
  businessOutline,
  flagOutline,
  starOutline,
  informationCircleOutline
} from 'ionicons/icons';
import { StorageService } from '@core/http/services/storage.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  seccionActiva = signal<'info' | 'academico' | 'contacto'>('info');

  constructor(
    private storageService: StorageService,
    private router: Router,
    public authState: AuthStateService
  ) {
    addIcons({
      personOutline,
      mailOutline,
      callOutline,
      idCardOutline,
      logOutOutline,
      locationOutline,
      schoolOutline,
      briefcaseOutline,
      peopleOutline,
      businessOutline,
      flagOutline,
      starOutline,
      informationCircleOutline
    });
  }

  user = computed(() => {
    const u = this.authState.user();
    if (!u) return null;

    const roleMap: Record<string, string> = {
      ADMIN: 'Administrador',
      TEACHER: 'Docente',
      STUDENT: 'Estudiante',
      PARENT: 'Padre/Tutor'
    };

    const base = {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      roleLabel: roleMap[u.role] || u.role,
      fullName: `${u.firstName} ${u.lastName}`,
      photo: (u.firstName || '?').charAt(0).toUpperCase()
    };

    const student = u.studentProfile;
    const teacher = u.teacherProfile;
    const admin = u.adminProfile;
    const parent = u.parentProfile;

    return {
      ...base,
      studentProfile: student
        ? {
            controlNumber: student.controlNumber,
            phone: student.phone,
            semaphore: student.semaphore,
            groupName: student.group?.name,
            careerName: student.group?.career?.name,
            gradeLevel: student.group?.gradeLevel
          }
        : null,
      teacherProfile: teacher
        ? {
            employeeId: teacher.employeeId,
            specialty: teacher.specialty,
            phone: teacher.phone
          }
        : null,
      adminProfile: admin
        ? {
            position: admin.position,
            phone: admin.phone
          }
        : null,
      parentProfile: parent
        ? {
            phone: parent.phone,
            address: parent.address
          }
        : null
    };
  });

  cambiarSeccion(seccion: 'info' | 'academico' | 'contacto') {
    this.seccionActiva.set(seccion);
  }

  async logout(): Promise<void> {
    await this.storageService.clear();
    this.authState.clear();
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  getSubtitulo(): string {
    const map = {
      info: 'Información personal',
      academico: 'Datos académicos / profesionales',
      contacto: 'Contacto'
    };
    return map[this.seccionActiva()];
  }

  mostrarSeccionAcademica(): boolean {
    const u = this.user();
    if (!u) return false;
    return !!(u.studentProfile || u.teacherProfile || u.adminProfile || u.parentProfile);
  }
}