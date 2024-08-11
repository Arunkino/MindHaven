import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Users, MessageSquare, ChevronRight,MonitorPlay } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link, Outlet, useLocation } from 'react-router-dom';
import PendingVerificationMessage from '../../components/PendingVerification';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';
import UpcomingSessions from '../../components/mentor/UpcomingSessionsMentor';

const DashboardCard = ({ icon, title, value, color }) => (
  <div className={`bg-white rounded-lg shadow-md p-4 flex items-center ${color}`}>
    <div className="mr-4">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

const ActionButton = ({ icon, text, isActive }) => (
  <button className={`flex items-center justify-between w-full rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow ${isActive ? 'bg-blue-100' : 'bg-white'}`}>
    <div className="flex items-center">
      {icon}
      <span className={`ml-3 font-semibold ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>{text}</span>
    </div>
    <ChevronRight className={isActive ? 'text-blue-600' : 'text-gray-400'} />
  </button>
);

// const UpcomingSessions = () => (
//   <div className="bg-white rounded-lg shadow-md p-6">
//     <SessionItem name="Jane Doe" date="Today" time="2:00 PM" isToday={true} />
//     <SessionItem name="John Smith" date="Tomorrow" time="10:00 AM" isToday={false} />
//     <SessionItem name="Alice Johnson" date="Jul 6, 2024" time="3:30 PM" isToday={false} />
//   </div>
// );


const SessionItem = ({ name, date, time, isToday }) => (
  <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 mb-2 hover:shadow-md transition-shadow">
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-gray-500">{date}</p>
      </div>
    </div>
    <div className="flex items-center">
      <p className={`text-sm ${isToday ? 'text-green-500 font-semibold' : 'text-gray-500'}`}>{time}</p>
      {isToday && (
        <button className="ml-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs hover:bg-green-600 transition-colors">
          Start Live
        </button>
      )}
    </div>
  </div>
);

const MentorDashboard = () => {
  const { currentUser } = useSelector(state => state.user);
  const location = useLocation();

  // Check if the mentor is verified
  if (!currentUser || !currentUser.is_verified) {
    return <PendingVerificationMessage />;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome back, Dr. {currentUser.first_name}</h1>
          <div className="flex space-x-4">
            <button className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
              <Calendar className="text-gray-600" />
            </button>
            <button className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
              <MessageSquare className="text-gray-600" />
            </button>
            <div className="w-10 h-10 bg-blue-500 rounded-full"></div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard icon={<Users size={24} className="text-blue-500" />} title="Total Clients" value="42" color="text-blue-500" />
          <DashboardCard icon={<Calendar size={24} className="text-purple-500" />} title="Sessions This Week" value="15" color="text-purple-500" />
          <DashboardCard icon={<Clock size={24} className="text-green-500" />} title="Hours Mentored" value="120" color="text-green-500" />
          <DashboardCard icon={<MessageSquare size={24} className="text-red-500" />} title="Unread Messages" value="3" color="text-red-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              {location.pathname === '/mentor/dashboard/' || location.pathname === '/mentor/dashboard' ? 'Upcoming Sessions' : 'Dashboard Content'}
            </h2>
            {location.pathname === '/mentor/dashboard/' || location.pathname === '/mentor/dashboard' ? <UpcomingSessions /> : <Outlet />}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <Link to="/mentor/dashboard">
                <ActionButton 
                  icon={<MonitorPlay className="text-orange-500" />} 
                  text="Upcoming Sessions" 
                  isActive={location.pathname === '/mentor' || location.pathname === '/mentor/'}
                />
              </Link>
              <Link to="schedule_availability">
                <ActionButton 
                  icon={<Calendar className="text-purple-500" />} 
                  text="Manage Schedule" 
                  isActive={location.pathname === '/mentor/dashboard/schedule_availability'}
                />
              </Link>
              <Link to="view_clients">
                <ActionButton 
                  icon={<Users className="text-blue-500" />} 
                  text="View Clients" 
                  isActive={location.pathname === '/mentor/view_clients'}
                />
              </Link>
              <Link to="messages">
                <ActionButton 
                  icon={<MessageSquare className="text-green-500" />} 
                  text="Messages" 
                  isActive={location.pathname === '/mentor/messages'}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;