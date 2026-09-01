import {
  Component,
  OnDestroy,
  inject,
} from '@angular/core';
import {
  IonContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
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
import { Subscription } from 'rxjs';
import {
  AlertPriority,
  AppNotification,
  NotificationService,
} from '@features/notifications/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
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
  implements ViewWillEnter, OnDestroy
{
  private readonly notificationService =
    inject(NotificationService);

  notifications: AppNotification[] = [];

  unreadCount = 0;
  loading = false;
  errorMessage = '';

  private readonly changedSubscription:
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
      this.notificationService.changed$
        .subscribe(() => {
          this.loadNotifications();
        });
  }

  ionViewWillEnter(): void {
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.changedSubscription.unsubscribe();
  }

  loadNotifications(
    event?: Event,
  ): void {
    this.loading = !event;
    this.errorMessage = '';

    this.notificationService
      .getMyNotifications()
      .subscribe({
        next: notifications => {
          this.notifications =
            notifications ?? [];

          this.updateUnreadCount();

          this.loading = false;

          this.completeRefresher(event);
        },
        error: () => {
          this.loading = false;

          this.errorMessage =
            'No se pudieron cargar las notificaciones.';

          this.completeRefresher(event);
        },
      });
  }

  openNotification(
    notification: AppNotification,
  ): void {
    if (!this.isUnread(notification)) {
      return;
    }

    this.notificationService
      .markAsRead(notification.id)
      .subscribe({
        next: updated => {
          notification.status =
            updated.status === 'READ'
              ? 'READ'
              : notification.status;

          if (
            notification.status !== 'READ'
          ) {
            notification.status = 'READ';
          }

          this.updateUnreadCount();

          this.notificationService
            .notifyChanged();
        },
      });
  }

  isUnread(
    notification: AppNotification,
  ): boolean {
    return notification.status !== 'READ';
  }

  getIcon(
    notification: AppNotification,
  ): string {
    switch (notification.alert?.type) {
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
    notification: AppNotification,
  ): string {
    switch (notification.alert?.type) {
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
    notification: AppNotification,
  ): Lowercase<AlertPriority> {
    return (
      notification.alert?.priority ??
      'MEDIUM'
    ).toLowerCase() as Lowercase<AlertPriority>;
  }

  getRelativeDate(
    date: string,
  ): string {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return '';
    }

    const notificationDate =
      this.getMexicoCityDateString(value);

    const today =
      this.getMexicoCityDateString();

    if (notificationDate === today) {
      return 'Hoy';
    }

    const yesterday =
      new Date();

    yesterday.setDate(
      yesterday.getDate() - 1,
    );

    if (
      notificationDate ===
      this.getMexicoCityDateString(
        yesterday,
      )
    ) {
      return 'Ayer';
    }

    return new Intl.DateTimeFormat(
      'es-MX',
      {
        timeZone:
          'America/Mexico_City',
        day: 'numeric',
        month: 'short',
      },
    ).format(value);
  }

  getTime(
    date: string,
  ): string {
    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat(
      'es-MX',
      {
        timeZone:
          'America/Mexico_City',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      },
    ).format(value);
  }

  private getMexicoCityDateString(
    date: Date = new Date(),
  ): string {
    const formatter =
      new Intl.DateTimeFormat(
        'en-CA',
        {
          timeZone:
            'America/Mexico_City',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        },
      );

    return formatter.format(date);
  }

  private updateUnreadCount(): void {
    this.unreadCount =
      this.notifications.filter(
        notification =>
          this.isUnread(notification),
      ).length;
  }

  private completeRefresher(
    event?: Event,
  ): void {
    if (!event) return;

    const target =
      event.target as {
        complete?: () =>
          Promise<void> | void;
      } | null;

    void target?.complete?.();
  }
}