import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { AuthStateService } from '@core/auth/services/auth-state.service';

import {
  GradeItem,
  GradesService,
} from '@features/grades/services/grades.service';

import { AverageCardComponent } from '@shared/components/grades/average-card/average-card.component';
import { GradeCardComponent } from '@shared/components/grades/grade-card/grade-card.component';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    AverageCardComponent,
    GradeCardComponent,
  ],
  templateUrl: './grades.component.html',
  styleUrl: './grades.component.scss',
})
export class GradesComponent implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly gradesService = inject(GradesService);

  user: any = null;
  children: any[] = [];

  selectedStudent: any = null;
  selectedStudentId: number | null = null;

  grades: GradeItem[] = [];

  parcialActual = 1;

  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.initializeGrades();
  }

  get isParent(): boolean {
    return this.user?.role === 'PARENT';
  }

  get isStudent(): boolean {
    return this.user?.role === 'STUDENT';
  }

  cambiarParcial(parcial: number): void {
    this.parcialActual = parcial;
  }

  onStudentChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const studentId = Number(target.value);

    const child = this.children.find(
      item => item.id === studentId
    );

    if (!child) {
      return;
    }

    this.selectedStudent = child;
    this.selectedStudentId = child.id;

    this.loadGrades(child.id);
  }

  loadGrades(studentId: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.grades = [];

    this.gradesService
      .getByStudent(studentId)
      .subscribe({
        next: response => {
          this.grades = response ?? [];
          this.loading = false;
        },

        error: error => {
          this.loading = false;
          this.grades = [];

          if (error?.status === 403) {
            this.errorMessage =
              'No tienes permiso para consultar las calificaciones de este alumno.';

            return;
          }

          if (error?.status === 404) {
            this.errorMessage =
              'No se encontró información de calificaciones para este alumno.';

            return;
          }

          this.errorMessage =
            error?.error?.message ??
            'No fue posible cargar las calificaciones.';
        },
      });
  }

  getGrades(): {
    subject: string;
    teacher: string;
    grade: string;
    status: string;
  }[] {
    return this.grades.map(grade => {
      const value = this.getPartialGrade(grade);

      const normalized =
        value !== null
          ? this.normalizeGrade(value)
          : null;

      return {
        subject:
          grade.subject?.name ??
          'Materia',

        teacher:
          this.getTeacherName(grade),

        grade:
          normalized !== null
            ? normalized.toFixed(1)
            : '-',

        status:
          this.getGradeStatus(normalized),
      };
    });
  }

  getAverage(): string {
    const values = this.grades
      .map(grade => {
        const value = this.getPartialGrade(grade);

        return value !== null
          ? this.normalizeGrade(value)
          : null;
      })
      .filter(
        (value): value is number =>
          value !== null
      );

    if (values.length === 0) {
      return '-';
    }

    const total = values.reduce(
      (sum, value) => sum + value,
      0
    );

    return (
      total / values.length
    ).toFixed(1);
  }

  getParcialLabel(): string {
    switch (this.parcialActual) {
      case 1:
        return 'Primer Parcial';

      case 2:
        return 'Segundo Parcial';

      case 3:
        return 'Tercer Parcial';

      default:
        return 'Calificaciones';
    }
  }

  getSelectedStudentName(): string {
    if (!this.selectedStudent) {
      return '';
    }

    if (this.isParent) {
      const firstName =
        this.selectedStudent
          ?.user
          ?.firstName ?? '';

      const lastName =
        this.selectedStudent
          ?.user
          ?.lastName ?? '';

      return `${firstName} ${lastName}`.trim();
    }

    return `${this.user?.firstName ?? ''} ${this.user?.lastName ?? ''}`.trim();
  }

  getStudentGroup(): string {
    if (this.isParent) {
      return (
        this.selectedStudent
          ?.group
          ?.name ??
        'Sin grupo'
      );
    }

    return (
      this.user
        ?.studentProfile
        ?.group
        ?.name ??
      'Sin grupo'
    );
  }

  private initializeGrades(): void {
    this.user = this.authState.user();

    if (!this.user) {
      this.errorMessage =
        'No se encontró información del usuario.';

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

    this.errorMessage =
      'Este usuario no tiene acceso a las calificaciones.';
  }

  private initializeStudent(): void {
    const studentProfile =
      this.user?.studentProfile;

    const studentId =
      studentProfile?.id;

    if (!studentId) {
      this.errorMessage =
        'No se encontró el perfil del alumno.';

      return;
    }

    this.selectedStudent =
      studentProfile;

    this.selectedStudentId =
      studentId;

    this.loadGrades(studentId);
  }

  private initializeParent(): void {
    this.children =
      this.user
        ?.parentProfile
        ?.children ?? [];

    if (this.children.length === 0) {
      this.errorMessage =
        'No hay alumnos asociados a este tutor.';

      return;
    }

    const firstChild =
      this.children[0];

    this.selectedStudent =
      firstChild;

    this.selectedStudentId =
      firstChild.id;

    this.loadGrades(firstChild.id);
  }

  private getPartialGrade(
    grade: GradeItem
  ): number | null {
    switch (this.parcialActual) {
      case 1:
        return grade.partial1 ?? null;

      case 2:
        return grade.partial2 ?? null;

      case 3:
        return grade.partial3 ?? null;

      default:
        return null;
    }
  }

  private getTeacherName(
    grade: GradeItem
  ): string {
    const firstName =
      grade
        .subject
        ?.teacher
        ?.user
        ?.firstName ?? '';

    const lastName =
      grade
        .subject
        ?.teacher
        ?.user
        ?.lastName ?? '';

    return (
      `${firstName} ${lastName}`.trim() ||
      'Docente'
    );
  }

  private getGradeStatus(
    grade: number | null
  ): string {
    if (grade === null) {
      return 'Sin calificación';
    }

    if (grade >= 9) {
      return 'Excelente';
    }

    if (grade >= 7) {
      return 'Aprobado';
    }

    return 'En riesgo';
  }

  private normalizeGrade(
    grade: number
  ): number {
    if (grade > 10) {
      return Number(
        (grade / 10).toFixed(1)
      );
    }

    return grade;
  }
}