export interface Notification {
  id: number;
  alertId: number;
  senderId: number;
  recipientType: string;
  recipientId: number;
  channel: string;
  status: string;
  content: string;
  metadata?: {
    simulated?: boolean;
    reason?: string;
    retryable?: boolean;
  };
  sentAt: string;
  createdAt: string;
}