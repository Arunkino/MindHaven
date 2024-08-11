import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import authService from '../utils/authService';
import { setTokens, setUser } from '../features/user/userSlice';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useSelector(state => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAndUpdateUser = async () => {
      console.log("Checking and updating user...");
      const storedUser = authService.getCurrentUser();
      if (storedUser && !isAuthenticated) {
        console.log("Stored user found, but not authenticated. Verifying token...");
        try {
          const result = await authService.verifyToken(storedUser.access);
          if (result.success) {
            console.log("Token verification successful. Setting user and tokens in Redux.");
            dispatch(setUser(storedUser));
            dispatch(setTokens({
              access: storedUser.access,
              refresh: storedUser.refresh,
            }));
          } else {
            throw new Error('Token verification failed');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          authService.logout();
        }
      } else {
        console.log("No stored user or already authenticated.");
      }
    };

    checkAndUpdateUser();
  }, [dispatch, isAuthenticated]);

  console.log("isAuthenticated:", isAuthenticated);
  console.log("CurrentRole:", role);
  console.log("AllowedRoles:", allowedRoles);

  if (!isAuthenticated) {
    console.log("User not authenticated. Redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    console.log("User role not authorized. Redirecting to home.");
    return <Navigate to="/" replace />;
  }

  console.log("Rendering Outlet in ProtectedRoute");

  return (
    <>
   
    <Outlet />
    </>
  );
};

export default ProtectedRoute;
