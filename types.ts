export enum UserType {
  STUDENT = 'student',
  FACULTY = 'faculty'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserType;
  identifier: string; // Student ID or Faculty ID
  details: string; // Course/Year or Department
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO String
  venue: string;
  createdBy: string; // Faculty ID
  isRequired: boolean;
  penaltyAmount: number;
  qrCodeData: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  PENDING = 'pending'
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  studentId: string;
  status: AttendanceStatus;
  timestamp?: string;
  penaltyPaid: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}