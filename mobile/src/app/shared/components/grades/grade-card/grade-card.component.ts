// grade-card.component.ts
import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline } from 'ionicons/icons';

export type GradeVisualStatus = 'Excelente' | 'Aprobado' | 'En riesgo' | 'Sin calificación';

@Component({
  selector: 'app-grade-card',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './grade-card.component.html',
  styleUrl: './grade-card.component.scss',
})
export class GradeCardComponent {
  @Input({ required: true }) subject = '';
  @Input() teacher = '';
  @Input({ required: true }) grade = '—';
  @Input() status: GradeVisualStatus = 'Sin calificación';

  constructor() {
    addIcons({ personOutline });
  }

  get statusClass(): string {
    switch (this.status) {
      case 'Excelente': return 'excellent';
      case 'Aprobado': return 'approved';
      case 'En riesgo': return 'risk';
      case 'Sin calificación': return 'pending';
    }
  }
}