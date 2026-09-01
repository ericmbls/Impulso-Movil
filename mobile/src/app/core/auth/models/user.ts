export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
export type SemaphoreStatus = 'GREEN' | 'YELLOW' | 'RED';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  adminProfile?: AdminProfile | null;
  teacherProfile?: TeacherProfile | null;
  studentProfile?: StudentProfile | null;
  parentProfile?: ParentProfile | null;
}

export interface AdminProfile {
  id: number;
  userId?: number;
  position?: string | null;
  phone?: string | null;
}

export interface TeacherProfile {
  id: number;
  userId?: number;
  employeeId?: string;
  specialty?: string | null;
  phone?: string | null;
}

export interface StudentProfile {
  id: number;
  userId?: number;
  user?: { id?: number; email?: string; firstName?: string; lastName?: string; } | null;
  enrollmentId?: string;
  controlNumber?: string;
  groupId: number;
  parentId?: number | null;
  phone?: string | null;
  qrToken?: string | null;
  qrExpiresAt?: string | null;
  semaphore?: SemaphoreStatus;
  group?: Group | null;
  parent?: ParentProfile | null;
}

export interface ParentProfile {
  id: number;
  userId?: number;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  children?: StudentProfile[];
}

export interface Group {
  id: number;
  name: string;
  gradeLevel?: number | string;
  career?: Career | null;
}

export interface Career {
  id?: number;
  name?: string;
  code?: string;
  description?: string | null;
}