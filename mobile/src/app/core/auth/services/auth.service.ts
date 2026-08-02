import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/auth`;

  // Login: guarda el token en localStorage
  login(email: string, password: string) {
    return this.http.post<{ accessToken: string, user: any }>(`${this.api}/login`, { email, password })
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.accessToken);
        })
      );
  }

  getProfile() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.api}/profile`, { headers });
  }
}
