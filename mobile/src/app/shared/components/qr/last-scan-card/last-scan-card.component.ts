import {
  Component,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  qrCodeOutline,
  timeOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-last-scan-card',
  standalone: true,
  imports: [
    CommonModule,
    IonIcon,
  ],
  templateUrl: './last-scan-card.component.html',
  styleUrl: './last-scan-card.component.scss',
})
export class LastScanCardComponent {
  @Input() subject = '';

  @Input() studentName = '';

  @Input() date = '';

  @Input() time = '';

  @Input()
  status:
    | 'success'
    | 'pending'
    | 'error' = 'success';

  constructor() {
    addIcons({
      calendarOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      qrCodeOutline,
      timeOutline,
    });
  }

  getStatusIcon(): string {
    switch (this.status) {
      case 'success':
        return 'checkmark-circle-outline';

      case 'pending':
        return 'time-outline';

      case 'error':
        return 'close-circle-outline';
    }
  }

  getStatusText(): string {
    switch (this.status) {
      case 'success':
        return 'Registrado';

      case 'pending':
        return 'Pendiente';

      case 'error':
        return 'Error';
    }
  }
}