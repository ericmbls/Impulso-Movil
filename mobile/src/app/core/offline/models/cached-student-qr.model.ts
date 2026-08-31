import {
  StudentQr,
} from '@features/qr-check/services/qr.service';

export interface CachedStudentQr {
  studentId: number;
  qr: StudentQr;
  cachedAt: string;
}