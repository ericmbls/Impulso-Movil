import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface StudentQr {
  qrToken: string | null;
  qrImage: string | null;
  expiresAt: string | null;
  isValid: boolean;
}

@Injectable({ providedIn: 'root' })
export class QrService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/qr`;

  getMyQr(): Observable<StudentQr> {
    return this.http.get<StudentQr>(`${this.apiUrl}/my-qr`);
  }

  refreshQr(): Observable<StudentQr> {
    return this.http.post<StudentQr>(`${this.apiUrl}/refresh`, {});
  }
}