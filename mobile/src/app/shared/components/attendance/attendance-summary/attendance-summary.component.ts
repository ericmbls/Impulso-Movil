import { Component, Input } from '@angular/core';

export type AttendanceSummaryStatus =
  | 'Excelente'
  | 'Buena'
  | 'Regular'
  | 'En riesgo'
  | 'Sin datos';

@Component({
  selector: 'app-attendance-summary',
  standalone: true,
  imports: [],
  templateUrl: './attendance-summary.component.html',
  styleUrl: './attendance-summary.component.scss',
})
export class AttendanceSummaryComponent {
  @Input({ required: true }) percentage = '—';
  @Input() status: AttendanceSummaryStatus = 'Sin datos';

  get hasPercentage(): boolean {
    return Number.isFinite(Number(this.percentage));
  }

  get percentageValue(): number {
    const value = Number(this.percentage);
    if (!Number.isFinite(value)) return 0;
    return Math.min(100, Math.max(0, value));
  }

  get statusClass(): string {
    switch (this.status) {
      case 'Excelente': return 'excellent';
      case 'Buena': return 'good';
      case 'Regular': return 'regular';
      case 'En riesgo': return 'risk';
      case 'Sin datos': return 'empty';
    }
  }
}