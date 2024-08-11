import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/user/userSlice'
import logo from '../assets/logo.svg';

function Header() {
  const { currentUser, isAuthenticated } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout());
    navigate('/')
    // You might want to add additional logout logic here, such as clearing local storage or redirecting
  };

  return (
    <header className="bg-gray text-black p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center">
          <img src={logo} alt="Mind Haven Logo" className="h-10 w-auto mr-2 animate-pulse" />
        </Link>
        <ul className="flex space-x-6 items-center">
        <li className="text-custom-text text-xl">Mentor</li>
          {isAuthenticated && 
          <Link to='dashboard/'><li className="text-custom-text text-xl">Hi, {currentUser.first_name}</li></Link>}
          <li><Link to="/mentor" className="hover:text-custom-accent transition-colors duration-300">Home</Link></li>
          {isAuthenticated ? (
            <>
              <li><button onClick={handleLogout} className="hover:text-custom-accent transition-colors duration-300">Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="hover:text-custom-accent transition-colors duration-300">Login</Link></li>
              <li><Link to="/mentor/signup" className="bg-white text-custom-bg px-4 py-2 rounded-full hover:bg-custom-accent hover:text-white transition-colors duration-300">Become a Mentor</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;