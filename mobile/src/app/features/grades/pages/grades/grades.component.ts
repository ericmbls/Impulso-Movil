import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular/standalone';

import { StorageService } from '../../../../core/services/storage.service';
import { GradesService } from '../../../../core/services/grades.service';

import { AverageCardComponent } from '../../../../shared/components/grades/average-card/average-card.component';
import { GradeCardComponent } from '../../../../shared/components/grades/grade-card/grade-card.component';

interface Grade {
  subject: string;
  teacher: string;
  grade: string;
  status: string;
}

interface ParcialData {
  label: string;
  average: string;
  grades: Grade[];
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

  constructor(
    private storageService: StorageService,
    private gradesService: GradesService
  ) {}

  async ngOnInit(): Promise<void> {
    const user: any = await this.storageService.getUser();
    console.log('Usuario:', user);
  }

  private data: { [key: number]: ParcialData } = {
    1: {
      label: 'Primer Parcial',
      average: '8.8',
      grades: [
        { subject: 'Programación Web', teacher: 'Ing. Juan Pérez', grade: '9.0', status: 'Excelente' },
        { subject: 'Base de Datos', teacher: 'Mtra. García', grade: '8.5', status: 'Bueno' },
        { subject: 'Matemáticas', teacher: 'Mtro. Hernández', grade: '7.5', status: 'Regular' },
        { subject: 'Física', teacher: 'Ing. López', grade: '8.0', status: 'Bueno' },
        { subject: 'Inglés', teacher: 'Lic. Sánchez', grade: '9.5', status: 'Excelente' }
      ]
    },
    2: {
      label: 'Segundo Parcial',
      average: '9.2',
      grades: [
        { subject: 'Programación Web', teacher: 'Ing. Juan Pérez', grade: '9.8', status: 'Excelente' },
        { subject: 'Base de Datos', teacher: 'Mtra. García', grade: '9.5', status: 'Excelente' },
        { subject: 'Matemáticas', teacher: 'Mtro. Hernández', grade: '8.7', status: 'Bueno' },
        { subject: 'Física', teacher: 'Ing. López', grade: '8.4', status: 'Bueno' },
        { subject: 'Inglés', teacher: 'Lic. Sánchez', grade: '9.4', status: 'Excelente' }
      ]
    },
    3: {
      label: 'Tercer Parcial',
      average: '9.6',
      grades: [
        { subject: 'Programación Web', teacher: 'Ing. Juan Pérez', grade: '10.0', status: 'Excelente' },
        { subject: 'Base de Datos', teacher: 'Mtra. García', grade: '9.8', status: 'Excelente' },
        { subject: 'Matemáticas', teacher: 'Mtro. Hernández', grade: '9.0', status: 'Excelente' },
        { subject: 'Física', teacher: 'Ing. López', grade: '9.2', status: 'Excelente' },
        { subject: 'Inglés', teacher: 'Lic. Sánchez', grade: '9.7', status: 'Excelente' }
      ]
    }
  };

  cambiarParcial(parcial: number): void {
    if (this.data[parcial]) {
      this.parcialActual = parcial;
    }
  }

  getParcialLabel(): string {
    return this.data[this.parcialActual].label;
  }

  getAverage(): string {
    return this.data[this.parcialActual].average;
  }

  getGrades(): Grade[] {
    return this.data[this.parcialActual].grades;
  }

}