import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainRoutes from './routes/MainRoutes';
import MentorRoutes from './routes/MentorRoutes';
import AdminRoutes from './routes/AdminRoutes';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { setupAxiosInterceptors } from './utils/setupAxiosInterceptors';
import authService from './utils/authService';
import { setTokens, setUser } from './features/user/userSlice';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { closeWebSocket, setupWebSocket } from './features/websocketService';
import VideoCall from './components/VideoCall';
import ErrorBoundary from './components/ErrorBoundary';



function App() {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.user.currentUser);

  useEffect(() => {
    setupAxiosInterceptors();
    const user = authService.getCurrentUser();
    if (user) {
      dispatch(setUser(user.user));
      dispatch(setTokens({ access: user.access, refresh: user.refresh }));
    }
  }, [dispatch]);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      const socket = setupWebSocket(dispatch, currentUser.id);

      return () => {
        closeWebSocket();
      };
    }
  }, [dispatch, currentUser]);

  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/*" element={<MainRoutes />} />
        <Route path="/mentor/*" element={<MentorRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/video-call/:callId" element={
          <ErrorBoundary>
           <VideoCall />
          </ErrorBoundary>
          } />
      </Routes>
    </Router>
  );
}

export default App;
