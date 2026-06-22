import { Injectable, signal, inject } from '@angular/core';

import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {

  private storage = inject(StorageService);

  user = signal<any | null>(null);

  async loadUser() {

    const user = await this.storage.getUser();

    this.user.set(user);

  }

  setUser(user: any) {
    this.user.set(user);
  }

  clear() {
    this.user.set(null);
  }

}