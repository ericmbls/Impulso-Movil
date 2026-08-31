export type PendingAttendanceStatus =
  | 'PENDING'
  | 'SYNCING'
  | 'FAILED';

export interface PendingAttendance {
  id: string;

  teacherId: number;

  qrToken: string;
  classScheduleId: number;

  /**
   * Momento REAL en que ML Kit leyó el QR.
   * Este valor nunca debe regenerarse al sincronizar.
   */
  scannedAt: string;

  attempts: number;

  status: PendingAttendanceStatus;

  lastError?: string;
}