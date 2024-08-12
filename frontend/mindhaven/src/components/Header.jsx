import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/user/userSlice'
import logo from '../assets/logo.svg';
import { resetChatState } from '../features/user/chatSlice';
import { fetchNotifications } from '../features/notifications/notificationSlice';
import { Bell } from 'lucide-react';



function Header() {
  const { currentUser, isAuthenticated, role } = useSelector(state => state.user);
  const { notifications } = useSelector(state => state.notifications);
  const dispatch = useDispatch();
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetChatState());
    navigate('/')
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
              <li className="relative">
                <Link to="/notifications" className="hover:text-custom-accent transition-colors duration-300">
                  <Bell />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {notifications.length}
                    </span>
                  )}
                </Link>
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