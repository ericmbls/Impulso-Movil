import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface QrScanRequest {
  qrToken: string;
  classScheduleId: number;
}

export interface AttendanceScanResponse {
  id?: number;
  status?: string;
  message?: string;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/attendance`;

  scanQr(
    qrToken: string,
    classScheduleId: number
  ): Observable<AttendanceScanResponse> {
    return this.http.post<AttendanceScanResponse>(
      `${this.apiUrl}/scan-qr`,
      {
        qrToken,
        classScheduleId,
      }
    );
  }
}