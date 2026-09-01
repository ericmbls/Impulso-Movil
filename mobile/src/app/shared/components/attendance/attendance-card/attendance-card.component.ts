import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkOutline, closeOutline, timeOutline, documentTextOutline, personOutline, calendarOutline } from 'ionicons/icons';

export type AttendanceVisualStatus =
  | 'Presente'
  | 'Falta'
  | 'Retardo'
  | 'Justificada';

@Component({
  selector: 'app-attendance-card',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './attendance-card.component.html',
  styleUrl: './attendance-card.component.scss',
})
export class AttendanceCardComponent {
  @Input({ required: true }) subject = '';
  @Input() status: AttendanceVisualStatus = 'Presente';
  @Input() teacher = '';
  @Input() date = '';
  @Input() time = '';
  @Input() present = true;

  constructor() {
    addIcons({
      checkmarkOutline,
      closeOutline,
      timeOutline,
      documentTextOutline,
      personOutline,
      calendarOutline,
    });
  }

  get statusClass(): string {
    switch (this.status) {
      case 'Presente': return 'present';
      case 'Falta': return 'absent';
      case 'Retardo': return 'late';
      case 'Justificada': return 'justified';
    }
  }

  get statusIcon(): string {
    switch (this.status) {
      case 'Presente': return 'checkmark-outline';
      case 'Falta': return 'close-outline';
      case 'Retardo': return 'time-outline';
      case 'Justificada': return 'document-text-outline';
    }
  }
}