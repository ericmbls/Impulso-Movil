import { Component, OnInit, inject } from '@angular/core';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookOutline, notificationsOutline, personOutline, schoolOutline, starOutline } from 'ionicons/icons';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { FeedbackService } from '@core/shared/services/feedback.service';
import { StudentProfile } from '@core/auth/models/user';
import { GradeItem, GradesService } from '@features/grades/services/grades.service';
import { AverageCardComponent } from '@shared/components/grades/average-card/average-card.component';
import { GradeCardComponent, GradeVisualStatus } from '@shared/components/grades/grade-card/grade-card.component';

interface GradeViewItem {
  id: number;
  subject: string;
  teacher: string;
  grade: string;
  status: GradeVisualStatus;
}

type PartialNumber = 1 | 2 | 3;

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [IonContent, IonIcon, IonSpinner, AverageCardComponent, GradeCardComponent],
  templateUrl: './grades.component.html',
  styleUrl: './grades.component.scss',
})
export class GradesComponent implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly gradesService = inject(GradesService);
  private readonly feedback = inject(FeedbackService);

  children: StudentProfile[] = [];
  selectedStudent: StudentProfile | null = null;
  selectedStudentId: number | null = null;
  grades: GradeItem[] = [];
  parcialActual: PartialNumber = 1;
  loading = false;
  errorMessage = '';

  constructor() {
    addIcons({ bookOutline, notificationsOutline, personOutline, schoolOutline, starOutline });
  }

  get user() { return this.authState.user(); }
  get isParent(): boolean { return this.user?.role === 'PARENT'; }
  get isStudent(): boolean { return this.user?.role === 'STUDENT'; }

  get displayedGrades(): GradeViewItem[] {
    return this.grades.map(grade => {
      const value = this.getPartialGrade(grade);
      return {
        id: grade.id,
        subject: grade.subject?.name ?? 'Materia',
        teacher: this.getTeacherName(grade),
        grade: value !== null ? this.formatGrade(value) : '—',
        status: this.getGradeStatus(value),
      };
    });
  }

  get average(): string {
    const values = this.grades
      .map(grade => this.getPartialGrade(grade))
      .filter((value): value is number => value !== null && Number.isFinite(value));
    if (!values.length) return '—';
    return (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
  }

  ngOnInit(): void {
    this.initializeGrades();
  }

  cambiarParcial(parcial: PartialNumber): void {
    if (this.loading || this.parcialActual === parcial) return;
    this.parcialActual = parcial;
  }

  getParcialLabel(): string {
    switch (this.parcialActual) {
      case 1: return 'Primer Parcial';
      case 2: return 'Segundo Parcial';
      case 3: return 'Tercer Parcial';
    }
  }

  onStudentChange(event: Event): void {
    if (this.loading) return;
    const target = event.target as HTMLSelectElement;
    const studentId = Number(target.value);
    if (!Number.isFinite(studentId) || studentId <= 0) return;
    const child = this.children.find(item => item.id === studentId);
    if (!child) {
      void this.feedback.error('No se encontró el alumno seleccionado.');
      return;
    }
    if (this.selectedStudentId === child.id) return;
    this.selectedStudent = child;
    this.selectedStudentId = child.id;
    this.loadGrades(child.id);
  }

  private loadGrades(studentId: number): void {
    if (this.loading) return;
    this.loading = true;
    this.errorMessage = '';
    this.grades = [];
    this.gradesService.getByStudent(studentId).subscribe({
      next: response => {
        this.grades = response ?? [];
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.grades = [];
        const message = this.getErrorMessage(error);
        this.errorMessage = message;
        void this.feedback.error(message);
      },
    });
  }

  retry(): void {
    if (this.loading || !this.selectedStudentId) return;
    this.loadGrades(this.selectedStudentId);
  }

  getSelectedStudentName(): string {
    if (this.isParent) {
      const firstName = this.selectedStudent?.user?.firstName ?? '';
      const lastName = this.selectedStudent?.user?.lastName ?? '';
      return [firstName, lastName].filter(Boolean).join(' ').trim();
    }
    const user = this.user;
    if (!user) return '';
    return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  }

  getStudentGroup(): string {
    if (this.isParent) return this.selectedStudent?.group?.name ?? 'Sin grupo';
    return this.user?.studentProfile?.group?.name ?? 'Sin grupo';
  }

  private initializeGrades(): void {
    const user = this.user;
    if (!user) {
      this.setInitialError('No se encontró información del usuario.');
      return;
    }
    if (this.isStudent) {
      this.initializeStudent();
      return;
    }
    if (this.isParent) {
      this.initializeParent();
      return;
    }
    this.errorMessage = 'Este usuario no tiene acceso a las calificaciones.';
  }

  private initializeStudent(): void {
    const studentProfile = this.user?.studentProfile;
    if (!studentProfile?.id) {
      this.setInitialError('No se encontró el perfil del alumno.');
      return;
    }
    this.selectedStudent = studentProfile;
    this.selectedStudentId = studentProfile.id;
    this.loadGrades(studentProfile.id);
  }

  private initializeParent(): void {
    this.children = this.user?.parentProfile?.children ?? [];
    if (!this.children.length) {
      this.errorMessage = 'No hay alumnos asociados a este tutor.';
      return;
    }
    const firstChild = this.children[0];
    this.selectedStudent = firstChild;
    this.selectedStudentId = firstChild.id;
    this.loadGrades(firstChild.id);
  }

  private getPartialGrade(grade: GradeItem): number | null {
    switch (this.parcialActual) {
      case 1: return grade.partial1 ?? null;
      case 2: return grade.partial2 ?? null;
      case 3: return grade.partial3 ?? null;
    }
  }

  private formatGrade(grade: number): string {
    if (!Number.isFinite(grade)) return '—';
    return grade.toFixed(1);
  }

  private getTeacherName(grade: GradeItem): string {
    const firstName = grade.subject?.teacher?.user?.firstName ?? '';
    const lastName = grade.subject?.teacher?.user?.lastName ?? '';
    return [firstName, lastName].filter(Boolean).join(' ').trim() || 'Docente';
  }

  private getGradeStatus(grade: number | null): GradeVisualStatus {
    if (grade === null) return 'Sin calificación';
    if (grade >= 9) return 'Excelente';
    if (grade >= 6) return 'Aprobado';
    return 'En riesgo';
  }

  private setInitialError(message: string): void {
    this.errorMessage = message;
    void this.feedback.error(message);
  }

  private getErrorMessage(error: unknown): string {
    if (typeof error !== 'object' || error === null) return 'No fue posible cargar las calificaciones.';
    const httpError = error as { status?: number; error?: { message?: string | string[] } };
    if (httpError.status === 403) return 'No tienes permiso para consultar las calificaciones de este alumno.';
    if (httpError.status === 404) return 'No se encontró información de calificaciones para este alumno.';
    const backendMessage = httpError.error?.message;
    if (Array.isArray(backendMessage)) return backendMessage.join('. ');
    if (typeof backendMessage === 'string' && backendMessage.trim()) return backendMessage;
    return 'No fue posible cargar las calificaciones.';
  }
}