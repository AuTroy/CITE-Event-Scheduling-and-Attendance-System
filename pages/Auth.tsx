import React, { useState } from 'react';
import { UserType, User } from '../types';
import { MockAPI } from '../services/mockBackend';
import { UserCircle, Briefcase, GraduationCap } from 'lucide-react';

interface AuthProps {
  onLoginSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<UserType>(UserType.STUDENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState(''); // ID Number
  const [details, setDetails] = useState(''); // Course or Dept

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const user = await MockAPI.login(email, userType);
        onLoginSuccess(user);
      } else {
        const newUser = await MockAPI.signup({
          name: fullName,
          email,
          role: userType,
          identifier,
          details
        });
        onLoginSuccess(newUser);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-center text-white">
          <h2 className="text-2xl font-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-blue-200 text-sm mt-1">NVSU CITE Portal</p>
        </div>

        {/* User Type Toggles */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 transition ${
              userType === UserType.STUDENT ? 'text-blue-700 border-b-2 border-blue-700 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setUserType(UserType.STUDENT)}
          >
            <GraduationCap className="w-5 h-5" /> Student
          </button>
          <button
            className={`flex-1 py-4 text-sm font-medium flex justify-center items-center gap-2 transition ${
              userType === UserType.FACULTY ? 'text-blue-700 border-b-2 border-blue-700 bg-blue-50' : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setUserType(UserType.FACULTY)}
          >
            <Briefcase className="w-5 h-5" /> Faculty
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Juan Dela Cruz"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {userType === UserType.STUDENT ? 'Student ID' : 'Faculty ID'}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={userType === UserType.STUDENT ? '20-00123' : 'F-1001'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {userType === UserType.STUDENT ? 'Course/Year' : 'Department'}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder={userType === UserType.STUDENT ? 'BSIT-3' : 'IT Dept'}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@nvsu.edu.ph"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;