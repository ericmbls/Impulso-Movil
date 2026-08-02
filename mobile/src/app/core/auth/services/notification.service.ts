import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '@core/http/services/api.service';
import { Notification } from '@core/shared/models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {

  private api = inject(ApiService);

  getMyNotifications(): Observable<Notification[]> {
    return this.api.get<Notification[]>('/notifications/my-notifications');
  }

}