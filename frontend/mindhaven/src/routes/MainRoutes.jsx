import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import UserDashboard from '../pages/UserDashboard';
import ProtectedRoute from './ProtectedRoute';
// import NotificationList from '../components/NotificationList';

function MainRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        {/* <Route path="/notifications" element={<NotificationList />} /> */}
        <Route 
          path="dashboard" 
          element={
            // <ProtectedRoute allowedRoles={"normal"}>
              <UserDashboard />
            // </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  );
}

export default MainRoutes;