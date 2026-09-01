// average-card.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-average-card',
  standalone: true,
  imports: [],
  templateUrl: './average-card.component.html',
  styleUrl: './average-card.component.scss',
})
export class AverageCardComponent {
  @Input({ required: true }) average = '—';
  @Input() label = 'Promedio del parcial';

  get description(): string {
    const value = Number(this.average);
    if (!Number.isFinite(value)) {
      return 'Sin calificaciones registradas';
    }
    if (value >= 9) return 'Excelente desempeño';
    if (value >= 8) return 'Muy buen desempeño';
    if (value >= 6) return 'Desempeño aprobatorio';
    return 'Requiere atención académica';
  }

  get hasAverage(): boolean {
    return Number.isFinite(Number(this.average));
  }
}