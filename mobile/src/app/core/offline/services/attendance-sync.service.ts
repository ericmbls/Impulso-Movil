import { Injectable, inject } from '@angular/core';
import { Network } from '@capacitor/network';
import { firstValueFrom } from 'rxjs';
import { AttendanceService, AttendanceScanResponse } from '@features/attendance/services/attendance.service';
import { StorageService } from '@core/http/services/storage.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { PendingAttendance } from '@core/offline/models/pending-attendance.model';

export interface AttendanceSubmitResult {
  status: 'REGISTERED' | 'QUEUED' | 'FAILED';
  attendance?: AttendanceScanResponse;
  pending?: PendingAttendance;
  message?: string;
}

interface ApiError {
  status?: number;
  name?: string;
  message?: string;
  error?: {
    message?: string | string[];
  };
}

@Injectable({ providedIn: 'root' })
export class AttendanceSyncService {
  private readonly attendanceService = inject(AttendanceService);
  private readonly storage = inject(StorageService);
  private readonly authState = inject(AuthStateService);

  private syncing = false;
  private networkListenerInitialized = false;

  constructor() {
    void this.initializeNetworkListener();
  }

  async submitOrQueue(
    qrToken: string,
    classScheduleId: number,
    scannedAt: string,
  ): Promise<AttendanceSubmitResult> {
    const teacherId = this.getCurrentTeacherId();

    if (!teacherId) {
      return {
        status: 'FAILED',
        message: 'No se encontró el perfil del docente.',
      };
    }

    const network = await Network.getStatus();

    if (!network.connected) {
      const pending = await this.queueAttendance(
        teacherId,
        qrToken,
        classScheduleId,
        scannedAt,
      );

      return {
        status: 'QUEUED',
        pending,
        message: 'QR guardado. Se sincronizará cuando vuelva la conexión.',
      };
    }

    try {
      const attendance = await firstValueFrom(
        this.attendanceService.scanQr(
          qrToken,
          classScheduleId,
          scannedAt,
        ),
      );

      return {
        status: 'REGISTERED',
        attendance,
      };
    } catch (error: unknown) {
      if (this.isNetworkError(error)) {
        const pending = await this.queueAttendance(
          teacherId,
          qrToken,
          classScheduleId,
          scannedAt,
        );

        return {
          status: 'QUEUED',
          pending,
          message:
            'No fue posible contactar al servidor. El QR quedó pendiente de sincronización.',
        };
      }

      return {
        status: 'FAILED',
        message: this.getApiErrorMessage(error),
      };
    }
  }

  async syncPendingForCurrentTeacher(): Promise<void> {
    const teacherId = this.getCurrentTeacherId();

    if (!teacherId) return;

    await this.syncPending(teacherId);
  }

  async syncPending(teacherId: number): Promise<void> {
    if (this.syncing) return;

    const network = await Network.getStatus();

    if (!network.connected) return;

    this.syncing = true;

    try {
      const records =
        await this.storage.getPendingAttendancesByTeacher(teacherId);

      const pending = records.filter(
        record => record.status === 'PENDING',
      );

      if (!pending.length) return;

      console.log(
        `[OFFLINE] Sincronizando ${pending.length} asistencia(s)...`,
      );

      for (const record of pending) {
        const currentNetwork = await Network.getStatus();

        if (!currentNetwork.connected) break;

        await this.storage.updatePendingAttendance(record.id, {
          status: 'SYNCING',
          attempts: record.attempts + 1,
          lastError: undefined,
        });

        try {
          await firstValueFrom(
            this.attendanceService.scanQr(
              record.qrToken,
              record.classScheduleId,
              record.scannedAt,
            ),
          );

          await this.storage.removePendingAttendance(record.id);

          console.log('[OFFLINE] Sincronizada:', record.id);
        } catch (error: unknown) {
          if (this.isNetworkError(error)) {
            await this.storage.updatePendingAttendance(record.id, {
              status: 'PENDING',
              lastError: 'Sin conexión con el servidor.',
            });

            break;
          }

          const message = this.getApiErrorMessage(error);

          await this.storage.updatePendingAttendance(record.id, {
            status: 'FAILED',
            lastError: message,
          });

          console.warn(
            '[OFFLINE] Registro rechazado:',
            record.id,
            message,
          );
        }
      }
    } finally {
      this.syncing = false;
    }
  }

  async getCurrentTeacherQueue(): Promise<PendingAttendance[]> {
    const teacherId = this.getCurrentTeacherId();

    if (!teacherId) return [];

    return this.storage.getPendingAttendancesByTeacher(teacherId);
  }

  async getCurrentTeacherPendingCount(): Promise<number> {
    const records = await this.getCurrentTeacherQueue();

    return records.filter(
      record =>
        record.status === 'PENDING' ||
        record.status === 'SYNCING',
    ).length;
  }

  private async initializeNetworkListener(): Promise<void> {
    if (this.networkListenerInitialized) return;

    this.networkListenerInitialized = true;

    try {
      await Network.addListener(
        'networkStatusChange',
        status => {
          console.log(
            '[OFFLINE] Estado de red:',
            status.connected ? 'ONLINE' : 'OFFLINE',
          );

          if (status.connected) {
            void this.syncPendingForCurrentTeacher();
          }
        },
      );
    } catch (error) {
      this.networkListenerInitialized = false;

      console.warn(
        '[OFFLINE] No fue posible inicializar el listener de red:',
        error,
      );
    }
  }

  private async queueAttendance(
    teacherId: number,
    qrToken: string,
    classScheduleId: number,
    scannedAt: string,
  ): Promise<PendingAttendance> {
    const record: PendingAttendance = {
      id: this.generateLocalId(),
      teacherId,
      qrToken,
      classScheduleId,
      scannedAt,
      attempts: 0,
      status: 'PENDING',
    };

    await this.storage.addPendingAttendance(record);

    console.log('[OFFLINE] Asistencia guardada:', record.id);

    return record;
  }

  private getCurrentTeacherId(): number | null {
    return this.authState.user()?.teacherProfile?.id ?? null;
  }

  private isNetworkError(error: unknown): boolean {
    const apiError = this.asApiError(error);

    return apiError.status === 0 ||
      apiError.name === 'TimeoutError';
  }

  private getApiErrorMessage(error: unknown): string {
    const apiError = this.asApiError(error);
    const message = apiError.error?.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (
      typeof message === 'string' &&
      message.trim()
    ) {
      return message;
    }

    if (
      typeof apiError.message === 'string' &&
      apiError.message.trim()
    ) {
      return apiError.message;
    }

    return 'No se pudo registrar la asistencia.';
  }

  private asApiError(error: unknown): ApiError {
    if (
      typeof error === 'object' &&
      error !== null
    ) {
      return error as ApiError;
    }

    return {};
  }

  private generateLocalId(): string {
    return [
      'attendance',
      Date.now(),
      Math.random().toString(36).slice(2, 10),
    ].join('-');
  }
}