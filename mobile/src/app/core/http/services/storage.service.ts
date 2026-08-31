import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { PendingAttendance } from '@core/offline/models/pending-attendance.model';
import { CachedStudentQr } from '@core/offline/models/cached-student-qr.model';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user';
  private readonly PENDING_ATTENDANCE_KEY = 'pending_attendance_queue';
  private readonly CACHED_STUDENT_QR_KEY = 'cached_student_qr';

  async saveToken(token: string): Promise<void> {
    await Preferences.set({ key: this.TOKEN_KEY, value: token });
  }

  async getToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: this.TOKEN_KEY });
    return value;
  }

  async removeToken(): Promise<void> {
    await Preferences.remove({ key: this.TOKEN_KEY });
  }

  async saveUser(user: unknown): Promise<void> {
    await Preferences.set({ key: this.USER_KEY, value: JSON.stringify(user) });
  }

  async getUser<T>(): Promise<T | null> {
    const { value } = await Preferences.get({ key: this.USER_KEY });
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async removeUser(): Promise<void> {
    await Preferences.remove({ key: this.USER_KEY });
  }

  async saveCachedStudentQr(value: CachedStudentQr): Promise<void> {
    await Preferences.set({ key: this.CACHED_STUDENT_QR_KEY, value: JSON.stringify(value) });
  }

  async getCachedStudentQr(): Promise<CachedStudentQr | null> {
    const { value } = await Preferences.get({ key: this.CACHED_STUDENT_QR_KEY });
    if (!value) return null;
    try {
      return JSON.parse(value) as CachedStudentQr;
    } catch {
      return null;
    }
  }

  async removeCachedStudentQr(): Promise<void> {
    await Preferences.remove({ key: this.CACHED_STUDENT_QR_KEY });
  }

  async getValidCachedStudentQr(): Promise<CachedStudentQr | null> {
    const cached = await this.getCachedStudentQr();
    if (!cached || !cached.qr || !cached.qr.qrToken || !cached.qr.qrImage || !cached.qr.expiresAt) {
      return null;
    }
    const expiration = new Date(cached.qr.expiresAt).getTime();
    if (Number.isNaN(expiration) || expiration <= Date.now()) {
      await this.removeCachedStudentQr();
      return null;
    }
    return cached;
  }

  async getPendingAttendances(): Promise<PendingAttendance[]> {
    const { value } = await Preferences.get({ key: this.PENDING_ATTENDANCE_KEY });
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed as PendingAttendance[] : [];
    } catch {
      return [];
    }
  }

  async savePendingAttendances(records: PendingAttendance[]): Promise<void> {
    await Preferences.set({ key: this.PENDING_ATTENDANCE_KEY, value: JSON.stringify(records) });
  }

  async addPendingAttendance(record: PendingAttendance): Promise<boolean> {
    const records = await this.getPendingAttendances();
    const duplicate = records.some(
      item =>
        item.teacherId === record.teacherId &&
        item.qrToken === record.qrToken &&
        item.classScheduleId === record.classScheduleId &&
        item.scannedAt === record.scannedAt
    );
    if (duplicate) return false;
    records.push(record);
    await this.savePendingAttendances(records);
    return true;
  }

  async updatePendingAttendance(id: string, changes: Partial<PendingAttendance>): Promise<void> {
    const records = await this.getPendingAttendances();
    const updated = records.map(record =>
      record.id === id ? { ...record, ...changes } : record
    );
    await this.savePendingAttendances(updated);
  }

  async removePendingAttendance(id: string): Promise<void> {
    const records = await this.getPendingAttendances();
    const filtered = records.filter(record => record.id !== id);
    await this.savePendingAttendances(filtered);
  }

  async getPendingAttendancesByTeacher(teacherId: number): Promise<PendingAttendance[]> {
    const records = await this.getPendingAttendances();
    return records.filter(record => record.teacherId === teacherId);
  }

  async getPendingAttendanceCount(teacherId?: number): Promise<number> {
    const records = await this.getPendingAttendances();
    if (!teacherId) return records.length;
    return records.filter(record => record.teacherId === teacherId).length;
  }

  async clearPendingAttendances(): Promise<void> {
    await Preferences.remove({ key: this.PENDING_ATTENDANCE_KEY });
  }

  async clear(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
  }

  async isLoggedIn(): Promise<boolean> {
    return !!(await this.getToken());
  }
}