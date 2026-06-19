import { Component, EventEmitter, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import { 
  scanOutline, 
  closeOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-scan-frame',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './scan-frame.component.html',
  styleUrl: './scan-frame.component.scss',
})
export class ScanFrameComponent {

  @Output() scan = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  isScanning = false;

  constructor() {
    addIcons({ 
      scanOutline, 
      closeOutline 
    });
  }

  startScan() {
    this.isScanning = true;
    this.scan.emit();
  }

  cancelScan() {
    this.isScanning = false;
    this.close.emit();
  }
}