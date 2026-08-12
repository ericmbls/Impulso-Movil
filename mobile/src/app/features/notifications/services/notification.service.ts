import {
  Injectable,
  inject,
} from '@angular/core';
import {
  HttpClient,
} from '@angular/common/http';
import {
  Observable,
  Subject,
} from 'rxjs';

import {
  environment,
} from '@env/environment';

export interface AppNotification {
  id: number;

  alertId?: number | null;

  senderId?: number | null;

  recipientType: string;

  recipientId: number;

  channel: string;

  status:
    | 'PENDING'
    | 'SENT'
    | 'FAILED'
    | 'SIMULATED'
    | 'READ'
    | string;

  content: string;

  metadata?: any;

  sentAt?: string | null;

  createdAt: string;

  alert?: {
    id: number;

    studentId: number;

    type:
      | 'ATTENDANCE'
      | 'GRADE'
      | 'BEHAVIOR'
      | 'GENERAL'
      | string;

    priority:
      | 'LOW'
      | 'MEDIUM'
      | 'HIGH'
      | 'CRITICAL'
      | string;

    message: string;

    student?: {
      id: number;

      user?: {
        firstName?: string;
        lastName?: string;
      };

      group?: {
        id?: number;
        name?: string;
      };
    };
  };

  sender?: {
    firstName?: string;
    lastName?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/notifications`;

  private readonly changedSubject =
    new Subject<void>();

  readonly changed$ =
    this.changedSubject.asObservable();

  getMyNotifications():
    Observable<AppNotification[]> {
    return this.http.get<
      AppNotification[]
    >(
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
    return this.http.get<
      AppNotification
    >(
      `${this.apiUrl}/${id}`,
    );
  }

  markAsRead(
    id: number,
  ): Observable<AppNotification> {
    return this.http.put<
      AppNotification
    >(
      `${this.apiUrl}/${id}/read`,
      {},
    );
  }

  notifyChanged(): void {
    this.changedSubject.next();
  }
}