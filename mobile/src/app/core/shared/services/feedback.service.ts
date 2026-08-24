import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  constructor(
    private readonly toastController: ToastController,
  ) {}

  async success(
    message: string,
    duration = 2500,
  ): Promise<void> {
    await this.show(
      message,
      'success',
      'checkmark-circle-outline',
      duration,
    );
  }

  async error(
    message: string,
    duration = 3500,
  ): Promise<void> {
    await this.show(
      message,
      'danger',
      'close-circle-outline',
      duration,
    );
  }

  async warning(
    message: string,
    duration = 3000,
  ): Promise<void> {
    await this.show(
      message,
      'warning',
      'warning-outline',
      duration,
    );
  }

  async info(
    message: string,
    duration = 2500,
  ): Promise<void> {
    await this.show(
      message,
      'primary',
      'information-circle-outline',
      duration,
    );
  }

  private async show(
    message: string,
    color: string,
    icon: string,
    duration: number,
  ): Promise<void> {
    const toast =
      await this.toastController.create({
        message,
        duration,
        color,
        icon,
        position: 'bottom',
        buttons: [
          {
            icon: 'close-outline',
            role: 'cancel',
          },
        ],
      });

    await toast.present();
  }
}