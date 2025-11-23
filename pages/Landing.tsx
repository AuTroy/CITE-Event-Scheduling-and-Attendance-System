import React from 'react';
import { Calendar, QrCode, DollarSign, CheckCircle, ArrowRight } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Section */}
      <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full w-fit">
              Project Launch: June 2025
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Streamlining Campus <span className="text-blue-600">Events</span> & <span className="text-blue-600">Attendance</span>
            </h1>
            <p className="text-lg text-gray-600">
              The official automated system for NVSU CITE to manage events, track attendance via QR Codes, and automatically calculate absentee fines.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={onGetStarted}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg flex items-center gap-2"
              >
                Access Portal <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="bg-gray-100 relative h-64 md:h-auto">
            <img 
              src="https://picsum.photos/seed/nvsu/800/600" 
              alt="University Campus" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply"></div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Event Scheduling</h3>
          <p className="text-gray-600">Centralized platform for faculty to announce events, seminars, and assemblies with instant student notification.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <QrCode className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">QR Attendance</h3>
          <p className="text-gray-600">Fast and contactless attendance checking. Students simply scan a dynamic QR code generated for each event.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <DollarSign className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Automated Fines</h3>
          <p className="text-gray-600">Automatically identifies absentees for mandatory events and calculates penalties to ensure compliance.</p>
        </div>
      </div>

      {/* Objectives Section */}
      <div className="bg-blue-900 text-white rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl font-bold mb-8 text-center">System Objectives</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            "Determine current efficient methods for event scheduling.",
            "Assess efficiency of attendance tracking.",
            "Identify absentee monitoring issues.",
            "Evaluate administrative workload reduction."
          ].map((obj, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-yellow-400 flex-shrink-0" />
              <p className="text-blue-100">{obj}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;