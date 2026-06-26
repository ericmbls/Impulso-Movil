import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  qrCodeOutline,
  refreshOutline,
  timeOutline
} from 'ionicons/icons';

import { interval, Subscription } from 'rxjs';

import {
  QrService,
  StudentQr
} from '../../../../core/services/qr.service';

@Component({
  selector: 'app-qr-check',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon
  ],
  templateUrl: './qr-check.component.html',
  styleUrl: './qr-check.component.scss'
})
export class QrCheckComponent implements OnInit, OnDestroy {

  qr: StudentQr | null = null;
  loading = true;
  secondsRemaining = 0;

  private timer?: Subscription;

  constructor(
    private qrService: QrService
  ) {
    addIcons({
      qrCodeOutline,
      refreshOutline,
      timeOutline
    });
  }

  ngOnInit(): void {
    this.loadQr();
  }

  ngOnDestroy(): void {
    this.timer?.unsubscribe();
  }

  loadQr(): void {
    this.loading = true;

    this.qrService.getMyQr().subscribe({
      next: qr => {
        if (!qr.isValid) {
          this.refresh();
          return;
        }

        this.qr = qr;
        this.loading = false;
        this.startCountdown();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  refresh(): void {
    this.qrService.refreshQr().subscribe({
      next: qr => {
        this.qr = qr;
        this.secondsRemaining = 30; // reinicia el contador
        this.loading = false;
        this.startCountdown();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private startCountdown(): void {
    this.timer?.unsubscribe();
    this.secondsRemaining = 30;

    this.timer = interval(1000).subscribe(() => {
      this.secondsRemaining--;

      if (this.secondsRemaining <= 0) {
        this.refresh();
      }
    });
  }

  get countdown(): string {
    const minutes = Math.floor(this.secondsRemaining / 60);
    const seconds = this.secondsRemaining % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }
}
