import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../../environments/environment';

import { Observable } from 'rxjs';

import { ScanResponse } from '../models/scan-response.interface';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  private http = inject(HttpClient);

  private readonly api =
    `${environment.apiUrl}/attendance`;

  scanQr(
    qrToken: string,
    scheduleId: number
  ): Observable<ScanResponse> {

    return this.http.post<ScanResponse>(
      `${this.api}/scan-qr`,
      {
        qrToken,
        scheduleId
      }
    );

  }

}