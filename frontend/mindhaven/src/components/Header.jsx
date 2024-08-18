import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/user/userSlice';
import { resetChatState } from '../features/user/chatSlice';
import { fetchNotifications, markNotificationAsRead, clearAllNotifications } from '../features/notifications/notificationSlice';
import { Bell, X, ChevronDown, ChevronUp } from 'lucide-react';
import logo from '../assets/logo.svg';

function Header() {
  const { currentUser, isAuthenticated, role } = useSelector(state => state.user);
  const { notifications } = useSelector(state => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedNotifications, setExpandedNotifications] = useState({});
  const notificationRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetChatState());
    navigate('/');
  };

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };

  const toggleNotificationExpansion = (notificationId) => {
    setExpandedNotifications(prev => ({
      ...prev,
      [notificationId]: !prev[notificationId]
    }));
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <header className={`bg-${role === 'mentor' ? 'custom-mentor' : 'custom-bg'} text-white p-4 shadow-md`}>
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center">
          <img src={logo} alt="Mind Haven Logo" className="h-10 w-auto mr-2 animate-pulse" />
        </Link>
        <ul className="flex space-x-6 items-center">
          {isAuthenticated && (
            <>
              <Link to='dashboard'>
                <li className="text-custom-text text-xl">
                  Hi, {currentUser.role === 'admin' ? 'Admin' : currentUser.first_name}
                </li>
              </Link>
              <li className="relative" ref={notificationRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="hover:text-custom-accent transition-colors duration-300"
                >
                  <Bell />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl overflow-hidden z-20">
                    <div className="py-2">
                      <div className="flex justify-between items-center px-4 py-2 bg-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                        <button
                          onClick={handleClearAll}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Clear All
                        </button>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-gray-500">No new notifications</p>
                      ) : (
                        <ul className="max-h-96 overflow-y-auto">
                          {notifications.map(notification => (
                            <li key={notification.id} className="border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-150">
                              <div className="px-4 py-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 pr-4">
                                    <p 
                                      className={`text-sm text-gray-800 ${expandedNotifications[notification.id] ? '' : 'cursor-pointer'}`}
                                      onClick={() => toggleNotificationExpansion(notification.id)}
                                    >
                                      {expandedNotifications[notification.id] 
                                        ? notification.content
                                        : truncateText(notification.content, 48)}
                                    </p>
                                    {notification.content.length > 48 && (
                                      <button 
                                        onClick={() => toggleNotificationExpansion(notification.id)}
                                        className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center"
                                      >
                                        {expandedNotifications[notification.id] ? (
                                          <>
                                            Show less <ChevronUp size={14} className="ml-1" />
                                          </>
                                        ) : (
                                          <>
                                            Read more <ChevronDown size={14} className="ml-1" />
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(notification.created_at).toLocaleString()}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </li>
            </>
          )}
          <li><Link to="" className="hover:text-custom-accent transition-colors duration-300">Home</Link></li>
          {isAuthenticated ? (
            <li><button onClick={handleLogout} className="hover:text-custom-accent transition-colors duration-300">Logout</button></li>
          ) : (
            <>
              <li><Link to="/login" className="hover:text-custom-accent transition-colors duration-300">Login</Link></li>
              <li><Link to="/signup" className="bg-white text-custom-bg px-4 py-2 rounded-full hover:bg-custom-accent hover:text-white transition-colors duration-300">Sign Up</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;