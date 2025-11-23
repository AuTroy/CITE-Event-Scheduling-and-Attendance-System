import { User, Event, AttendanceRecord, UserType, AttendanceStatus } from '../types';

// Storage Keys
const USERS_KEY = 'nvsu_users';
const EVENTS_KEY = 'nvsu_events';
const ATTENDANCE_KEY = 'nvsu_attendance';
const CURRENT_USER_KEY = 'nvsu_current_user';

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize Data if Empty
const initializeData = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    const defaultUsers: User[] = [
      {
        id: '1',
        name: 'Julius Peter Simon',
        email: 'faculty@nvsu.edu.ph',
        role: UserType.FACULTY,
        identifier: 'F-1001',
        details: 'Computer Science'
      },
      {
        id: '2',
        name: 'Troy Justine Au',
        email: 'student@nvsu.edu.ph',
        role: UserType.STUDENT,
        identifier: '20-00123',
        details: 'BSIT-3'
      }
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(EVENTS_KEY)) {
    const defaultEvents: Event[] = [
      {
        id: '101',
        title: 'CITE General Assembly',
        description: 'Mandatory assembly for all IT students regarding new policies.',
        date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
        venue: 'University Gym',
        createdBy: '1',
        isRequired: true,
        penaltyAmount: 150.00,
        qrCodeData: 'EVENT-101-SECURE-HASH',
        status: 'upcoming'
      },
      {
        id: '102',
        title: 'Tech Talk: AI in 2025',
        description: 'A seminar on the future of Artificial Intelligence.',
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        venue: 'AVR 1',
        createdBy: '1',
        isRequired: false,
        penaltyAmount: 0,
        qrCodeData: 'EVENT-102-SECURE-HASH',
        status: 'completed'
      }
    ];
    localStorage.setItem(EVENTS_KEY, JSON.stringify(defaultEvents));
  }

  // Generate some dummy attendance for the past event
  if (!localStorage.getItem(ATTENDANCE_KEY)) {
      const pastEventAttendance: AttendanceRecord[] = [
          {
              id: 'att-1',
              eventId: '102',
              studentId: '2',
              status: AttendanceStatus.PRESENT,
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              penaltyPaid: false
          }
      ];
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(pastEventAttendance));
  }
};

initializeData();

// API Methods
export const MockAPI = {
  login: async (email: string, role: UserType): Promise<User> => {
    await delay(500);
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    // Password check skipped for mock demo; typically would hash verify here
    const user = users.find((u: User) => u.email === email && u.role === role);
    if (!user) throw new Error('Invalid credentials');
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  signup: async (user: Omit<User, 'id'>): Promise<User> => {
    await delay(500);
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.find((u: User) => u.email === user.email)) {
      throw new Error('Email already exists');
    }
    const newUser = { ...user, id: Math.random().toString(36).substr(2, 9) };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  logout: async () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  getEvents: async (): Promise<Event[]> => {
    await delay(300);
    return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
  },

  createEvent: async (eventData: Omit<Event, 'id' | 'qrCodeData' | 'status'>): Promise<Event> => {
    await delay(500);
    const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
    const newEvent: Event = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
      qrCodeData: `EVENT-${Date.now()}-HASH`,
      status: 'upcoming'
    };
    events.push(newEvent);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    return newEvent;
  },

  getAttendance: async (studentId: string): Promise<AttendanceRecord[]> => {
    await delay(300);
    const records = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]');
    return records.filter((r: AttendanceRecord) => r.studentId === studentId);
  },

  getEventAttendance: async (eventId: string): Promise<{record: AttendanceRecord, studentName: string}[]> => {
      await delay(300);
      const records = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]');
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      
      const eventRecords = records.filter((r: AttendanceRecord) => r.eventId === eventId);
      
      return eventRecords.map((r: AttendanceRecord) => {
          const student = users.find((u: User) => u.id === r.studentId);
          return {
              record: r,
              studentName: student ? student.name : 'Unknown Student'
          };
      });
  },

  markAttendance: async (eventId: string, studentId: string): Promise<AttendanceRecord> => {
    await delay(800);
    const records = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]');
    
    // Check if already present
    const existing = records.find((r: AttendanceRecord) => r.eventId === eventId && r.studentId === studentId);
    if (existing) return existing;

    const newRecord: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      eventId,
      studentId,
      status: AttendanceStatus.PRESENT,
      timestamp: new Date().toISOString(),
      penaltyPaid: false
    };
    records.push(newRecord);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
    return newRecord;
  },

  // Faculty triggers this to finalize an event and issue fines
  finalizeEvent: async (eventId: string) => {
      await delay(500);
      const events = JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]');
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const records = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]');

      const eventIndex = events.findIndex((e: Event) => e.id === eventId);
      if (eventIndex === -1) return;

      const event = events[eventIndex];
      // Only penalize if required
      if (event.isRequired) {
          const students = users.filter((u: User) => u.role === UserType.STUDENT);
          
          students.forEach((student: User) => {
              const hasAttended = records.some((r: AttendanceRecord) => r.eventId === eventId && r.studentId === student.id);
              
              if (!hasAttended) {
                  records.push({
                      id: Math.random().toString(36).substr(2, 9),
                      eventId: event.id,
                      studentId: student.id,
                      status: AttendanceStatus.ABSENT,
                      timestamp: new Date().toISOString(),
                      penaltyPaid: false
                  });
              }
          });
      }

      event.status = 'completed';
      events[eventIndex] = event;

      localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
  },

  payFine: async (recordId: string) => {
      await delay(500);
      const records = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '[]');
      const idx = records.findIndex((r: AttendanceRecord) => r.id === recordId);
      if (idx !== -1) {
          records[idx].penaltyPaid = true;
          localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
      }
  }
};