import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '@env/environment';

export type NotificationStatus =
  | 'PENDING'
  | 'SENT'
  | 'FAILED'
  | 'SIMULATED'
  | 'READ';

export type NotificationChannel =
  | 'EMAIL'
  | 'SMS'
  | 'WHATSAPP'
  | 'PUSH'
  | 'IN_APP';

export type NotificationRecipientType =
  | 'STUDENT'
  | 'PARENT'
  | 'TEACHER'
  | 'ADMIN';

export type AlertType =
  | 'ATTENDANCE'
  | 'GRADE'
  | 'BEHAVIOR'
  | 'GENERAL';

export type AlertPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export interface NotificationStudent {
  id: number;
  user?: {
    firstName?: string;
    lastName?: string;
  } | null;
  group?: {
    id?: number;
    name?: string;
  } | null;
}

export interface NotificationAlert {
  id: number;
  studentId: number;
  type: AlertType;
  priority: AlertPriority;
  message: string;
  student?: NotificationStudent | null;
}

export interface NotificationSender {
  firstName?: string;
  lastName?: string;
}

export interface AppNotification {
  id: number;
  alertId?: number | null;
  senderId?: number | null;
  recipientType: NotificationRecipientType;
  recipientId: number;
  channel: NotificationChannel;
  status: NotificationStatus;
  content: string;
  metadata?: Record<string, unknown> | null;
  sentAt?: string | null;
  createdAt: string;
  alert?: NotificationAlert | null;
  sender?: NotificationSender | null;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl =
    `${environment.apiUrl}/notifications`;

  private readonly changedSubject =
    new Subject<void>();

  readonly changed$ =
    this.changedSubject.asObservable();

  getMyNotifications():
    Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(
      `${this.apiUrl}/my-notifications`,
    );
  }

  getUnreadCount():
    Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}/unread-count`,
    );
  }

  getById(
    id: number,
  ): Observable<AppNotification> {
    return this.http.get<AppNotification>(
      `${this.apiUrl}/${id}`,
    );
  }

  markAsRead(
    id: number,
  ): Observable<AppNotification> {
    return this.http.put<AppNotification>(
      `${this.apiUrl}/${id}/read`,
      {},
    );
  }

  notifyChanged(): void {
    this.changedSubject.next();
  }
}