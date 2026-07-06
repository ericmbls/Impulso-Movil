import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

import { Observable } from 'rxjs';

import { Schedule } from '../models/schedule.model';

import { ScanResult } from '../models/scan-result.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherScannerService {

  private http = inject(HttpClient);

  private readonly api = `${environment.apiUrl}`;

  getMySchedules(): Observable<Schedule[]> {

    return this.http.get<Schedule[]>(
      `${this.api}/schedules/my`
    );

  }

  scanQr(
    qrToken: string,
    scheduleId: number
  ): Observable<ScanResult> {

    return this.http.post<ScanResult>(
      `${this.api}/attendance/scan-qr`,
      {
        qrToken,
        scheduleId
      }
    );

  }

}