export interface ScanResponse {

  success: boolean;

  message: string;

  attendance?: {

    id: number;

    studentName: string;

    subject: string;

    status: string;

    date: string;

  };

}