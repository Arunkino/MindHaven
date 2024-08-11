import React, { useEffect, useState } from "react";
import { LoadingSpinner } from "../LoadingSpinner";
import axiosInstance from "../../utils/axiosConfig";
import { toast } from 'react-toastify';
import { Calendar, Clock, AlertCircle, User, Bookmark, CheckCircle } from 'lucide-react';

const SessionHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axiosInstance.get('/api/appointments/');
      console.log("Session History: ", response.data);
      // Sort sessions by date and time
      const sortedSessions = response.data.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.start_time}`);
        const dateB = new Date(`${b.date}T${b.start_time}`);
        return dateA - dateB;
      });
      setSessions(sortedSessions);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error('Failed to fetch session history');
    }
  };

  const handleCancelSession = async (sessionId) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      const sessionDateTime = new Date(`${session.date}T${session.start_time}`);
      const now = new Date();
      const hoursDifference = (sessionDateTime - now) / (1000 * 60 * 60);

      if (hoursDifference < 12) {
        toast.error('Cannot cancel sessions less than 12 hours before the scheduled time');
        return;
      }

      await axiosInstance.post(`/api/appointments/${sessionId}/cancel/`);
      toast.success('Session cancelled successfully');
      fetchSessions();
    } catch (err) {
      toast.error('Failed to cancel session');
    }
  };

  const groupSessionsByType = (sessions) => {
    const now = new Date();
    return sessions.reduce(
      (acc, session) => {
        const sessionDate = new Date(`${session.date}T${session.start_time}`);
        if (sessionDate < now) {
          acc.past.push(session);
        } else {
          acc.upcoming.push(session);
        }
        return acc;
      },
      { past: [], upcoming: [] }
    );
  };

  const { past, upcoming } = groupSessionsByType(sessions);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-green-500';
      case 'cancelled_by_mentor': return 'text-red-500';
      case 'cancelled_by_user': return 'text-orange-500';
      case 'completed': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Bookmark className="mr-1" size={16} />;
      case 'cancelled_by_mentor':
      case 'cancelled_by_user': return <AlertCircle className="mr-1" size={16} />;
      case 'completed': return <CheckCircle className="mr-1" size={16} />;
      default: return null;
    }
  };

  const renderSessionList = (sessions) => (
    <ul className="space-y-4">
      {sessions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No sessions found.</p>
      ) : (
        sessions.map((session) => (
          <li key={session.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <User className="text-blue-500" size={24} />
                </div>
                <div>
                  <p className="font-semibold text-lg text-gray-800">Dr. {session.mentor_name}</p>
                  <p className="text-sm text-gray-600">Specialization: {session.specialization}</p>
                </div>
              </div>
              <div className={`flex items-center ${getStatusColor(session.status)}`}>
                {getStatusIcon(session.status)}
                <span className="text-sm font-medium">
                  {session.status === 'scheduled' ? 'Upcoming' : 
                   session.status === 'cancelled_by_mentor' ? 'Cancelled by Mentor' :
                   session.status === 'cancelled_by_user' ? 'Cancelled by You' : 'Completed'}
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="mr-2" size={16} />
                  <span className="text-sm">
                    {new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="mr-2" size={16} />
                  <span className="text-sm">
                    {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                  </span>
                </div>
              </div>
              {session.status === 'scheduled' && new Date(session.date) > new Date() && (
                <button
                  onClick={() => handleCancelSession(session.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors duration-300"
                >
                  Cancel Session
                </button>
              )}
            </div>
          </li>
        ))
      )}
    </ul>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 text-center py-4">Error: {error}</div>;

  return (
    <div className="bg-gray-50 shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-blue-600 text-white">
        <h3 className="text-2xl font-semibold">Session History</h3>
      </div>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex border-b">
            {['upcoming', 'past'].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 focus:outline-none ${activeTab === tab ? 'border-blue-600 text-blue-600 border-b-2' : 'text-gray-600'} text-lg font-medium transition-colors duration-300`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Sessions
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4">
          {activeTab === 'upcoming' && renderSessionList(upcoming)}
          {activeTab === 'past' && renderSessionList(past)}
        </div>
      </div>
    </div>
  );
};

export default SessionHistory;