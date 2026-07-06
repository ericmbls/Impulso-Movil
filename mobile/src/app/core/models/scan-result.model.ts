export interface ScanResult {

  success: boolean;

  message: string;

  attendanceId?: number;

  student?: {

    id: number;

    firstName: string;

    lastName: string;

  };

}