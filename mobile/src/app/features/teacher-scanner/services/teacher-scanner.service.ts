import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Schedule } from '@core/shared/models/schedule.model';
import { ScanResult } from '@core/shared/models/scan-result.model';

@Injectable({ providedIn: 'root' })
export class TeacherScannerService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}`;

  getMySchedules(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.api}/schedules/my`);
  }

  scanQr(qrToken: string, scheduleId: number): Observable<ScanResult> {
    return this.http.post<ScanResult>(`${this.api}/attendance/scan-qr`, {
      qrToken,
      scheduleId
    });
  }
}