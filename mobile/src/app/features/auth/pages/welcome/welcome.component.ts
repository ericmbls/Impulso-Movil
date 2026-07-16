import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  schoolOutline,
  logInOutline,
  calendarOutline,
  clipboardOutline,
  peopleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, IonContent, IonButton, IonIcon],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent {
  constructor(private router: Router) {
    addIcons({ schoolOutline, logInOutline, calendarOutline, clipboardOutline, peopleOutline });
  }

  goToLogin() {
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}