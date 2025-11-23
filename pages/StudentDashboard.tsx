import React, { useEffect, useState } from 'react';
import { User, Event, AttendanceRecord, AttendanceStatus } from '../types';
import { MockAPI } from '../services/mockBackend';
import { Calendar, QrCode, DollarSign, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StudentDashboardProps {
  user: User;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'attendance' | 'fines'>('upcoming');
  const [events, setEvents] = useState<Event[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{success: boolean, message: string} | null>(null);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    const allEvents = await MockAPI.getEvents();
    setEvents(allEvents);
    const myAttendance = await MockAPI.getAttendance(user.id);
    setAttendance(myAttendance);
  };

  const handleSimulateScan = async (event: Event) => {
    setScanning(true);
    setScanResult(null);
    
    // Simulate camera opening
    setTimeout(async () => {
      try {
        await MockAPI.markAttendance(event.id, user.id);
        setScanResult({ success: true, message: `Successfully marked present for ${event.title}` });
        loadData(); // Refresh
      } catch (e) {
        setScanResult({ success: false, message: 'Failed to record attendance.' });
      } finally {
        setScanning(false);
      }
    }, 1500);
  };

  const handlePayFine = async (recordId: string) => {
    await MockAPI.payFine(recordId);
    loadData();
  };

  const upcomingEvents = events
    .filter(e => e.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const unpaidFines = attendance.filter(r => 
      r.status === AttendanceStatus.ABSENT && 
      !r.penaltyPaid &&
      // Find the event and ensure it has a penalty
      events.find(e => e.id === r.eventId && e.penaltyAmount > 0)
  );

  const getEventById = (id: string) => events.find(e => e.id === id);

  // Stats for chart
  const attendanceStats = [
      { name: 'Present', value: attendance.filter(a => a.status === AttendanceStatus.PRESENT).length, color: '#22c55e' },
      { name: 'Absent', value: attendance.filter(a => a.status === AttendanceStatus.ABSENT).length, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user.name}</p>
        </div>
        <div className="hidden md:block">
           <div className="text-right">
             <div className="text-sm text-gray-400">Current Course</div>
             <div className="font-semibold text-blue-800">{user.details}</div>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {[
          { id: 'upcoming', label: 'Upcoming Events', icon: Calendar },
          { id: 'attendance', label: 'My Attendance', icon: CheckCircle },
          { id: 'fines', label: 'Fines & Penalties', icon: DollarSign },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm rounded-t-lg transition ${
              activeTab === tab.id 
                ? 'bg-white text-blue-700 border-b-2 border-blue-700' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.id === 'fines' && unpaidFines.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unpaidFines.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {/* UPCOMING EVENTS TAB */}
        {activeTab === 'upcoming' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400">No upcoming events scheduled.</div>
            ) : (
                upcomingEvents.map(event => {
                    const isAttended = attendance.some(a => a.eventId === event.id && a.status === AttendanceStatus.PRESENT);
                    return (
                        <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition">
                        <div className="p-1 bg-gradient-to-r from-blue-600 to-blue-500"></div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-xl text-gray-900 leading-tight">{event.title}</h3>
                                {event.isRequired && (
                                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                                        Required
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                            
                            <div className="space-y-2 text-sm text-gray-500 mb-6">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-400" />
                                    <span>{new Date(event.date).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-blue-400" />
                                    <span>{event.venue}</span>
                                </div>
                                {event.isRequired && (
                                    <div className="flex items-center gap-2 text-red-500">
                                        <DollarSign className="h-4 w-4" />
                                        <span>Penalty: ₱{event.penaltyAmount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            {isAttended ? (
                                <button disabled className="w-full py-2 bg-green-100 text-green-700 rounded-lg font-medium flex justify-center items-center gap-2">
                                    <CheckCircle className="h-4 w-4" /> Checked In
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleSimulateScan(event)}
                                    disabled={scanning}
                                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex justify-center items-center gap-2"
                                >
                                    <QrCode className="h-4 w-4" /> {scanning ? 'Scanning...' : 'Scan QR Code'}
                                </button>
                            )}
                            
                            {/* Scanning Feedback Modal/Overlay */}
                            {scanning && (
                                <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
                                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm text-center">
                                        <div className="w-64 h-64 bg-gray-900 mx-auto mb-4 rounded-xl flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 border-4 border-blue-500/50 animate-pulse"></div>
                                            <p className="text-white text-sm">Align QR code within frame</p>
                                        </div>
                                        <p className="font-bold mb-2">Scanning...</p>
                                        <p className="text-sm text-gray-500">Camera active.</p>
                                    </div>
                                </div>
                            )}
                            
                            {scanResult && !scanning && (
                                <div className="mt-2 text-center text-sm font-medium text-green-600 animate-fade-in">
                                    {scanResult.message}
                                </div>
                            )}
                        </div>
                        </div>
                    );
                })
            )}
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Event</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                          {attendance.map(record => {
                              const event = getEventById(record.eventId);
                              return (
                                  <tr key={record.id} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{event?.title || 'Unknown Event'}</td>
                                      <td className="px-6 py-4 text-sm text-gray-500">{event ? new Date(event.date).toLocaleDateString() : '-'}</td>
                                      <td className="px-6 py-4">
                                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                              record.status === AttendanceStatus.PRESENT ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                          }`}>
                                              {record.status === AttendanceStatus.PRESENT ? <CheckCircle className="w-3 h-3 mr-1"/> : <XCircle className="w-3 h-3 mr-1"/>}
                                              {record.status}
                                          </span>
                                      </td>
                                  </tr>
                              );
                          })}
                          {attendance.length === 0 && (
                              <tr>
                                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">No attendance records found.</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Overview</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={attendanceStats}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {attendanceStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>
          </div>
        )}

        {/* FINES TAB */}
        {activeTab === 'fines' && (
           <div className="space-y-4">
               {unpaidFines.length === 0 ? (
                   <div className="bg-green-50 p-12 rounded-xl text-center border border-green-100">
                       <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                           <CheckCircle className="h-8 w-8" />
                       </div>
                       <h3 className="text-xl font-bold text-green-800">You're All Good!</h3>
                       <p className="text-green-600 mt-2">No unpaid fines or penalties.</p>
                   </div>
               ) : (
                   unpaidFines.map(record => {
                       const event = getEventById(record.eventId);
                       if (!event) return null;
                       return (
                           <div key={record.id} className="bg-white border-l-4 border-red-500 rounded-lg shadow-sm p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                               <div>
                                   <h4 className="text-lg font-bold text-gray-900">Absent: {event.title}</h4>
                                   <p className="text-sm text-gray-500">{new Date(event.date).toDateString()} at {event.venue}</p>
                                   <p className="text-xs text-red-600 mt-1">Fine Reason: Mandatory Event Absence</p>
                               </div>
                               <div className="flex items-center gap-4">
                                   <div className="text-2xl font-bold text-gray-800">₱{event.penaltyAmount.toFixed(2)}</div>
                                   <button 
                                      onClick={() => handlePayFine(record.id)}
                                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
                                   >
                                       Pay Now
                                   </button>
                               </div>
                           </div>
                       );
                   })
               )}
           </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;