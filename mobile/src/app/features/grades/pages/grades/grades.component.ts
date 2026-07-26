import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';

import { StorageService } from '@core/http/services/storage.service';
import { GradesService } from '@features/grades/services/grades.service';
import { AverageCardComponent } from '@shared/components/grades/average-card/average-card.component';
import { GradeCardComponent } from '@shared/components/grades/grade-card/grade-card.component';

interface Grade {
  subject: string;
  teacher: string;
  grade: string;
  status: string;
}

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    AverageCardComponent,
    GradeCardComponent
  ],
  templateUrl: './grades.component.html',
  styleUrl: './grades.component.scss'
})
export class GradesComponent implements OnInit {
  parcialActual = 2;
  grades: any[] = [];

  constructor(
    private storageService: StorageService,
    private gradesService: GradesService
  ) {}

  async ngOnInit(): Promise<void> {
    const user: any = await this.storageService.getUser();
    const studentId = user?.studentProfile?.id;
    if (!studentId) return;

    this.gradesService.getStudentGrades(studentId).subscribe({
      next: (grades: any) => {
        this.grades = grades;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  cambiarParcial(parcial: number): void {
    this.parcialActual = parcial;
  }

  getParcialLabel(): string {
    switch (this.parcialActual) {
      case 1: return 'Primer Parcial';
      case 2: return 'Segundo Parcial';
      case 3: return 'Tercer Parcial';
      default: return '';
    }
  }

  getAverage(): string {
    if (!this.grades.length) return '0.0';
    let total = 0;
    this.grades.forEach(g => {
      switch (this.parcialActual) {
        case 1: total += g.partial1 ?? 0; break;
        case 2: total += g.partial2 ?? 0; break;
        case 3: total += g.partial3 ?? 0; break;
      }
    });
    return (total / this.grades.length).toFixed(1);
  }

  getGrades(): Grade[] {
    return this.grades.map(g => ({
      subject: g.subject.name,
      teacher: `Docente #${g.subject.teacherId}`,
      grade: String(
        this.parcialActual === 1 ? g.partial1 :
        this.parcialActual === 2 ? g.partial2 : g.partial3
      ),
      status: g.status
    }));
  }
}