// auth-state.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from '@core/http/services/storage.service';
import { User } from '@core/auth/models/user';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly storage = inject(StorageService);
  readonly user = signal<User | null>(null);
  readonly initialized = signal(false);

  get isAuthenticated(): boolean {
    return this.user() !== null;
  }

  async loadUser(): Promise<void> {
    try {
      const user = await this.storage.getUser<User>();
      this.user.set(user);
    } catch (error) {
      console.warn('[AUTH STATE] No fue posible cargar el usuario:', error);
      this.user.set(null);
    } finally {
      this.initialized.set(true);
    }
  }

  setUser(user: User): void {
    this.user.set(user);
  }

  clear(): void {
    this.user.set(null);
  }
}