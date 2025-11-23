import React from 'react';
import { User, UserType } from '../types';
import { LogOut, GraduationCap, Calendar, ShieldCheck } from 'lucide-react';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-yellow-400" />
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-none tracking-tight">NVSU CITE</span>
                  <span className="text-xs text-blue-200 font-light">Event & Attendance System</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex flex-col text-right">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-blue-300 capitalize">{user.role} | {user.identifier}</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-full hover:bg-blue-800 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <span className="text-sm font-light italic">Secure Campus Portal</span>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-gray-800 text-gray-400 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; 2025 Nueva Vizcaya State University - College of Information Technology Education.</p>
          <p className="mt-1">Developed by CITE Senior Project Team.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;