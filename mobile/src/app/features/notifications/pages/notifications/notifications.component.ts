import {
  Component,
  inject,
} from '@angular/core';
import {
  CommonModule,
} from '@angular/common';
import {
  IonContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import {
  addIcons,
} from 'ionicons';
import {
  alertCircleOutline,
  bookOutline,
  checkmarkCircleOutline,
  chevronForwardOutline,
  megaphoneOutline,
  notificationsOutline,
  refreshOutline,
  schoolOutline,
  timeOutline,
  warningOutline,
} from 'ionicons/icons';

import {
  Subscription,
} from 'rxjs';

import {
  AppNotification,
  NotificationService,
} from '@features/notifications/services/notification.service';

@Component({
  selector:
    'app-notifications',

  standalone:
    true,

  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
  ],

  templateUrl:
    './notifications.component.html',

  styleUrl:
    './notifications.component.scss',
})
export class NotificationsComponent
  implements ViewWillEnter
{
  private readonly notificationService =
    inject(NotificationService);

  notifications:
    AppNotification[] = [];

  unreadCount =
    0;

  loading =
    false;

  errorMessage =
    '';

  private changedSubscription?:
    Subscription;

  constructor() {
    addIcons({
      alertCircleOutline,
      bookOutline,
      checkmarkCircleOutline,
      chevronForwardOutline,
      megaphoneOutline,
      notificationsOutline,
      refreshOutline,
      schoolOutline,
      timeOutline,
      warningOutline,
    });

    this.changedSubscription =
      this.notificationService
        .changed$
        .subscribe(
          () => {
            this.loadNotifications();
          },
        );
  }

  ionViewWillEnter():
    void {
    this.loadNotifications();
  }

  loadNotifications(
    event?: any,
  ): void {
    this.loading =
      !event;

    this.errorMessage =
      '';

    this.notificationService
      .getMyNotifications()
      .subscribe({
        next: (
          notifications,
        ) => {
          this.notifications =
            notifications ?? [];

          this.updateUnreadCount();

          this.loading =
            false;

          event?.target
            ?.complete();
        },

        error: () => {
          this.loading =
            false;

          this.errorMessage =
            'No se pudieron cargar las notificaciones.';

          event?.target
            ?.complete();
        },
      });
  }

  openNotification(
    notification:
      AppNotification,
  ): void {
    if (
      notification.status ===
      'READ'
    ) {
      return;
    }

    this.notificationService
      .markAsRead(
        notification.id,
      )
      .subscribe({
        next: () => {
          notification.status =
            'READ';

          this.updateUnreadCount();

          this.notificationService
            .notifyChanged();
        },
      });
  }

  isUnread(
    notification:
      AppNotification,
  ): boolean {
    return (
      notification.status !==
      'READ'
    );
  }

  getIcon(
    notification:
      AppNotification,
  ): string {
    switch (
      notification.alert?.type
    ) {
      case 'ATTENDANCE':
        return 'school-outline';

      case 'GRADE':
        return 'book-outline';

      case 'BEHAVIOR':
        return 'warning-outline';

      case 'GENERAL':
        return 'megaphone-outline';

      default:
        return 'notifications-outline';
    }
  }

  getTypeLabel(
    notification:
      AppNotification,
  ): string {
    switch (
      notification.alert?.type
    ) {
      case 'ATTENDANCE':
        return 'Asistencia';

      case 'GRADE':
        return 'Calificación';

      case 'BEHAVIOR':
        return 'Seguimiento';

      case 'GENERAL':
        return 'Aviso general';

      default:
        return 'Notificación';
    }
  }

  getPriorityClass(
    notification:
      AppNotification,
  ): string {
    return (
      notification.alert
        ?.priority
        ?.toLowerCase() ??
      'medium'
    );
  }

  getRelativeDate(
    date: string,
  ): string {
    const value =
      new Date(date);

    const now =
      new Date();

    const formatter =
      new Intl.DateTimeFormat(
        'en-CA',
        {
          timeZone:
            'America/Mexico_City',
          year:
            'numeric',
          month:
            '2-digit',
          day:
            '2-digit',
        },
      );

    const currentDate =
      formatter.format(
        now,
      );

    const notificationDate =
      formatter.format(
        value,
      );

    if (
      currentDate ===
      notificationDate
    ) {
      return 'Hoy';
    }

    return new Intl
      .DateTimeFormat(
        'es-MX',
        {
          timeZone:
            'America/Mexico_City',
          day:
            'numeric',
          month:
            'short',
        },
      )
      .format(
        value,
      );
  }

  getTime(
    date: string,
  ): string {
    return new Intl
      .DateTimeFormat(
        'es-MX',
        {
          timeZone:
            'America/Mexico_City',
          hour:
            '2-digit',
          minute:
            '2-digit',
          hour12:
            true,
        },
      )
      .format(
        new Date(date),
      );
  }

  private updateUnreadCount():
    void {
    this.unreadCount =
      this.notifications
        .filter(
          (
            notification,
          ) =>
            this.isUnread(
              notification,
            ),
        )
        .length;
  }
}