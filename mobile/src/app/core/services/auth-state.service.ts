import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {

  user = signal<any | null>(null);

  setUser(user: any) {
    this.user.set(user);
  }

  clear() {
    this.user.set(null);
  }

}