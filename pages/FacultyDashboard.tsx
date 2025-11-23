import React, { useState, useEffect } from 'react';
import { User, Event, AttendanceRecord, AttendanceStatus } from '../types';
import { MockAPI } from '../services/mockBackend';
import { Calendar, Plus, Users, Trash2, QrCode, Download, RefreshCw, Check, X } from 'lucide-react';

interface FacultyDashboardProps {
  user: User;
}

const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ user }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeView, setActiveView] = useState<'list' | 'create' | 'attendance'>('list');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [attendanceList, setAttendanceList] = useState<{record: AttendanceRecord, studentName: string}[]>([]);
  
  // Create Form State
  const [newEvent, setNewEvent] = useState({
      title: '',
      description: '',
      date: '',
      time: '',
      venue: '',
      isRequired: false,
      penaltyAmount: 0
  });

  useEffect(() => {
    loadEvents();
  }, [user.id]);

  const loadEvents = async () => {
    const all = await MockAPI.getEvents();
    // Filter events created by this faculty
    setEvents(all.filter(e => e.createdBy === user.id));
  };

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      await MockAPI.createEvent({
          title: newEvent.title,
          description: newEvent.description,
          date: new Date(`${newEvent.date}T${newEvent.time}`).toISOString(),
          venue: newEvent.venue,
          createdBy: user.id,
          isRequired: newEvent.isRequired,
          penaltyAmount: Number(newEvent.penaltyAmount)
      });
      setNewEvent({ title: '', description: '', date: '', time: '', venue: '', isRequired: false, penaltyAmount: 0 });
      setActiveView('list');
      loadEvents();
  };

  const viewAttendance = async (event: Event) => {
      setSelectedEvent(event);
      const list = await MockAPI.getEventAttendance(event.id);
      setAttendanceList(list);
      setActiveView('attendance');
  };

  const finalizeEvent = async (eventId: string) => {
      await MockAPI.finalizeEvent(eventId);
      loadEvents(); // Status update
      if (selectedEvent && selectedEvent.id === eventId) {
          viewAttendance(selectedEvent); // Refresh list
      }
      alert('Event finalized. Absent students have been penalized.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faculty Dashboard</h1>
          <p className="text-gray-500">Department of {user.details}</p>
        </div>
        <button 
            onClick={() => { setActiveView('create'); setSelectedEvent(null); }}
            className="flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-800 transition shadow-lg"
        >
            <Plus className="h-5 w-5" /> Create Event
        </button>
      </div>

      {/* Main Content Area */}
      {activeView === 'list' && (
        <div className="grid gap-6">
            <h2 className="text-lg font-bold text-gray-800 px-1">My Managed Events</h2>
            {events.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-500">
                    You haven't created any events yet.
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Event Title</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Date & Venue</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Type</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {events.map(event => (
                                <tr key={event.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{event.title}</div>
                                        <div className="text-xs text-gray-500 max-w-xs truncate">{event.description}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div>{new Date(event.date).toLocaleDateString()}</div>
                                        <div className="text-xs">{event.venue}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {event.isRequired ? (
                                            <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded border border-red-100">Mandatory</span>
                                        ) : (
                                            <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-100">Optional</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                                            event.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {event.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => viewAttendance(event)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" 
                                                title="View Attendance / QR"
                                            >
                                                <Users className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      )}

      {activeView === 'create' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Event</h2>
                <button onClick={() => setActiveView('list')} className="text-gray-500 hover:text-gray-700">Cancel</button>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-5">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                      <input 
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newEvent.title}
                        onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea 
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={3}
                        value={newEvent.description}
                        onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                          <input 
                            type="date"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newEvent.date}
                            onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                          <input 
                            type="time"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={newEvent.time}
                            onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                          />
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                      <input 
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newEvent.venue}
                        onChange={e => setNewEvent({...newEvent, venue: e.target.value})}
                      />
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                      <div className="flex items-center gap-3">
                          <input 
                            type="checkbox"
                            id="req"
                            className="w-4 h-4 text-blue-600"
                            checked={newEvent.isRequired}
                            onChange={e => setNewEvent({...newEvent, isRequired: e.target.checked})}
                          />
                          <label htmlFor="req" className="font-medium text-gray-800 select-none">Attendance is Mandatory</label>
                      </div>
                      
                      {newEvent.isRequired && (
                          <div className="ml-7 animate-fade-in">
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Absentee Penalty Amount (PHP)</label>
                              <input 
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-32 border border-gray-300 rounded px-3 py-1 text-sm"
                                value={newEvent.penaltyAmount}
                                onChange={e => setNewEvent({...newEvent, penaltyAmount: e.target.valueAsNumber})}
                              />
                          </div>
                      )}
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition"
                  >
                      Publish Event
                  </button>
              </form>
          </div>
      )}

      {activeView === 'attendance' && selectedEvent && (
          <div className="grid lg:grid-cols-3 gap-6">
              {/* Sidebar: QR & Controls */}
              <div className="lg:col-span-1 space-y-6">
                  <button onClick={() => setActiveView('list')} className="text-sm text-gray-500 hover:text-gray-900 mb-2">&larr; Back to Events</button>
                  
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
                      <h3 className="font-bold text-gray-900 mb-4">Event QR Code</h3>
                      <div className="bg-white p-2 border inline-block rounded-lg mb-4">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedEvent.qrCodeData)}`} 
                          alt="Event QR"
                          className="w-48 h-48"
                        />
                      </div>
                      <p className="text-xs text-gray-400 font-mono break-all">{selectedEvent.qrCodeData}</p>
                      <button className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex justify-center items-center gap-2">
                          <Download className="h-4 w-4" /> Download QR
                      </button>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                      <h3 className="font-bold text-gray-900 mb-2">Controls</h3>
                      <p className="text-sm text-gray-500 mb-4">
                          {selectedEvent.status === 'completed' 
                            ? 'This event has been finalized.' 
                            : 'Once the event is over, click below to mark non-attendees as absent and apply fines.'}
                      </p>
                      <button 
                        onClick={() => finalizeEvent(selectedEvent.id)}
                        disabled={selectedEvent.status === 'completed'}
                        className={`w-full py-2 rounded-lg font-medium transition ${
                            selectedEvent.status === 'completed' 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                          {selectedEvent.status === 'completed' ? 'Event Finalized' : 'Finalize & Apply Fines'}
                      </button>
                  </div>
              </div>

              {/* Main: Attendance List */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
                  <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                      <div>
                          <h2 className="font-bold text-lg">{selectedEvent.title}</h2>
                          <p className="text-sm text-gray-500">Attendance Log</p>
                      </div>
                      <div className="text-right">
                          <div className="text-2xl font-bold text-blue-700">{attendanceList.length}</div>
                          <div className="text-xs text-gray-400 uppercase">Present</div>
                      </div>
                  </div>
                  
                  <div className="flex-grow overflow-auto">
                      <table className="w-full">
                          <thead className="bg-gray-50">
                              <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time In</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {attendanceList.map((item, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 font-medium text-gray-900">{item.studentName}</td>
                                      <td className="px-6 py-4">
                                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center w-fit gap-1">
                                              <Check className="w-3 h-3" /> Present
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-500">
                                          {item.record.timestamp ? new Date(item.record.timestamp).toLocaleTimeString() : '-'}
                                      </td>
                                  </tr>
                              ))}
                              {attendanceList.length === 0 && (
                                  <tr>
                                      <td colSpan={3} className="p-8 text-center text-gray-400">
                                          No attendance recorded yet. Students scan the QR code to appear here.
                                      </td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default FacultyDashboard;