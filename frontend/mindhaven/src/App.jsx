import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainRoutes from './routes/MainRoutes';
import MentorRoutes from './routes/MentorRoutes';
import AdminRoutes from './routes/AdminRoutes';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { setupAxiosInterceptors } from './utils/setupAxiosInterceptors';
import authService from './utils/authService';
import { setTokens, setUser } from './features/user/userSlice';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    setupAxiosInterceptors();
    const user = authService.getCurrentUser();
    if (user) {
      dispatch(setUser(user.user));
      dispatch(setTokens({ access: user.access, refresh: user.refresh }));
    }
  }, [dispatch]);

  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/*" element={<MainRoutes />} />
        <Route path="/mentor/*" element={<MentorRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </Router>
  );
}

export default App;
