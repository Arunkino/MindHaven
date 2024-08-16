import React, { useState } from 'react';
import { User, Wallet, Clock, MessagesSquare, LogOut, Settings , Calendar, HeartPulse} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/user/userSlice';
import UpcomingSessions from '../components/user/UpcomingSessions';
import SessionHistory from '../components/user/SessionHistory';
import Chat from '../components/user/Chat';
import ErrorBoundary from '../components/ErrorBoundary';
import { resetChatState } from '../features/user/chatSlice';


const UserDashboard = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const dispatch = useDispatch();
  const navigate = useNavigate();

//handling logout from navbar
  const handleLogout = (e) => {
    e.preventDefault();
    console.log("logout");
    dispatch(logout());
    dispatch(resetChatState());
    navigate('/');
  };

  const NavItem = ({ icon: Icon, label, section, onClick, isLogout = false }) => {
    const baseClasses = "flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200";
    const activeClasses = "bg-gray-200";
    const logoutClasses = "text-red-600 hover:bg-red-100";

    const handleClick = (e) => {
      if (isLogout) {
        onClick(e);
      } else {
        e.preventDefault();
        setActiveSection(section);
      }
    };

    return (
      <a
        href={`#${section}`}
        className={`${baseClasses} ${activeSection === section ? activeClasses : ''} ${isLogout ? logoutClasses : ''}`}
        onClick={handleClick}
      >
        <Icon className="mr-3" size={20} />
        {label}
      </a>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <Profile />;
      case 'wallet':
        return <WalletComponent />;
      case 'history':
        return <SessionHistory />;
      case 'chats':
        return (
          <ErrorBoundary>
            <Chat />
          </ErrorBoundary>
        );
      case 'services':
        return <Services />;
      case 'upcoming':
        return <UpcomingSessions />;
      default:
        return <Profile />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          {/* <h2 className="text-2xl font-semibold text-gray-800">MindHaven</h2> */}
        </div>
        <nav className="mt-6">
          <NavItem icon={User} label="My Profile" section="profile" />
          <NavItem icon={HeartPulse} label="Connect with Mentor" section="upcoming" />
          <NavItem icon={MessagesSquare} label="Connect with Buddies" section="chats" />
          <NavItem icon={Clock} label="Session History" section="history" />
          <NavItem icon={Wallet} label="Wallet" section="wallet" />
          <NavItem icon={Settings} label="Services" section="services" />
          <NavItem icon={LogOut} label="Logout" section="logout" onClick={handleLogout} isLogout />
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <h1 className="text-3xl font-semibold text-gray-600 mb-8">Welcome to MindHaven</h1>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};




const Profile = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">My Profile</h2>
      <div className="space-y-2">
        <div className="flex items-center">
          <span className="font-medium w-32">Full Name:</span>
          <input type="text" className="flex-1 px-2 py-1 border rounded" placeholder="John Doe" />
        </div>
        <div className="flex items-center">
          <span className="font-medium w-32">Email Address:</span>
          <input type="email" className="flex-1 px-2 py-1 border rounded" placeholder="john@example.com" />
        </div>
        <div className="flex items-center">
          <span className="font-medium w-32">Phone Number:</span>
          <input type="tel" className="flex-1 px-2 py-1 border rounded" placeholder="+1 234 567 8900" />
        </div>
        <div className="flex items-center">
          <span className="font-medium w-32">Date of Birth:</span>
          <input type="date" className="flex-1 px-2 py-1 border rounded" />
        </div>
      </div>
    </div>
  );
};

const WalletComponent = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Wallet</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Balance:</span>
          <span className="text-2xl font-bold">$250.00</span>
        </div>
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Add Funds</button>
        <div className="text-sm text-gray-600">
          Last transaction: $50.00 added on July 20, 2024
        </div>
      </div>
    </div>
  );
};



const Services = () => {
  const services = [
    { title: 'Free Consultations', description: 'Get your thirty minutes free consultation with our Professionals 24x7', icon: '👩‍⚕️' },
    { title: 'Connect with Buddies', description: 'Talk and share without judgement, make connections', icon: '👥' },
    { title: 'Donate today', description: 'Help us provide free mental health consultations. Your donation can change someone\'s life.', icon: '🎁' },
    { title: 'Mindful and Stress free', description: 'Follow the daily activities to be mindful', icon: '🧘' },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Our Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-md">
            <div className="text-3xl mb-2">{service.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
            <p className="text-sm text-gray-600">{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};


 

export default UserDashboard;
