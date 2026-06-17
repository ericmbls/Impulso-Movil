import { Component } from '@angular/core';
import {
  IonContent,
  IonButton,
  IonCard,
  IonCardContent,
  IonAvatar
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-credential',
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonCard,
    IonCardContent,
    IonAvatar
  ],
  templateUrl: './credential.component.html',
  styleUrl: './credential.component.scss',
})
export class CredentialComponent {

  student = {
    name: 'Eric Morales Baltazar',
    enrollment: '22180045',
    semester: '6°',
    group: 'A',
    career: 'Programación',
    school: 'CBTIS 61',
    validity: '2026'
  };

}