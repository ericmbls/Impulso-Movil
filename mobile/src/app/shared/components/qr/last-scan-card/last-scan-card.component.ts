import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  qrCodeOutline,
  checkmarkCircleOutline, 
  timeOutline, 
  calendarOutline,
  closeCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-last-scan-card',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './last-scan-card.component.html',
  styleUrl: './last-scan-card.component.scss',
})
export class LastScanCardComponent {

  @Input() subject = 'Programación Web';
  @Input() studentName = 'Eric Hernández';
  @Input() date = 'Hoy, 19 de junio';
  @Input() time = '08:01 AM';
  @Input() status: 'success' | 'pending' | 'error' = 'success';

  constructor() {
    addIcons({ 
      qrCodeOutline,
      checkmarkCircleOutline, 
      timeOutline, 
      calendarOutline,
      closeCircleOutline
    });
  }

  getStatusIcon(): string {
    switch (this.status) {
      case 'success': return 'checkmark-circle-outline';
      case 'pending': return 'time-outline';
      case 'error': return 'close-circle-outline';
      default: return 'checkmark-circle-outline';
    }
  }

  getStatusClass(): string {
    return this.status;
  }

  getStatusText(): string {
    switch (this.status) {
      case 'success': return 'Registrado';
      case 'pending': return 'Pendiente';
      case 'error': return 'Error';
      default: return 'Registrado';
    }
  }
}