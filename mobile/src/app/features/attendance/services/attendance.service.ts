import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ScanResponse } from '@features/teacher-scanner/models/scan-response.interface';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/attendance`;

  scanQr(qrToken: string, scheduleId: number): Observable<ScanResponse> {
    return this.http.post<ScanResponse>(`${this.api}/scan-qr`, {
      qrToken,
      scheduleId
    });
  }
}