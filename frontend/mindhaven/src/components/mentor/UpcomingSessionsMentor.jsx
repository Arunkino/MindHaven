import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosConfig";
import { Calendar, Clock, AlertCircle } from 'lucide-react';

const UpcomingSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await axiosInstance.get('/api/appointments/upcoming/');
      console.log("Upcoming Sessions: ", response.data)
      setSessions(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
      toast.error('Failed to fetch upcoming sessions');
      setLoading(false);
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
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error('Failed to cancel session');
    }
  };

  const isSessionNow = (date, time) => {
    const sessionDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const diffMinutes = Math.abs(sessionDateTime - now) / 60000;
    return diffMinutes <= 5;
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {sessions.length === 0 ? (
        <p>No upcoming sessions scheduled.</p>
      ) : (
        sessions.map((session) => (
          <div key={session.id} className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 mb-2 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
              <div>
                <p className="font-semibold">{session.user_name}</p>
                <p className="text-sm text-gray-500">{formatDate(session.date)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <p className={`text-sm ${isSessionNow(session.date, session.start_time) ? 'text-green-500 font-semibold' : 'text-gray-500'}`}>
                {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
              </p>
              {session.status === 'cancelled_by_user' && (
                <div className="flex items-center text-orange-500 ml-4">
                  <AlertCircle className="mr-1" size={16} />
                  <span className="text-sm">Cancelled by User</span>
                </div>
              )}
              {session.status === 'cancelled_by_mentor' && (
                <div className="flex items-center text-red-500 ml-4">
                  <AlertCircle className="mr-1" size={16} />
                  <span className="text-sm">Cancelled by You</span>
                </div>
              )}
              {session.status === 'scheduled' && isSessionNow(session.date, session.start_time) && (
                <button className="ml-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs hover:bg-green-600 transition-colors">
                  Start Live
                </button>
              )}
              {session.status === 'scheduled' && !isSessionNow(session.date, session.start_time) && (
                <button
                  onClick={() => handleCancelSession(session.id)}
                  className="ml-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs hover:bg-red-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UpcomingSessions;