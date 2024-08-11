import axiosInstance from './axiosConfig';
import store from '../app/store';
import { refreshToken, logout } from '../features/user/userSlice';

export const setupAxiosInterceptors = () => {
  axiosInstance.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state.user.accessToken;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      // console.error("Request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      // console.log("Response interceptor caught an error:", error);

      if (error.response) {
        // console.log("Error response status:", error.response.status);
        // console.log("Error response data:", error.response.data);
      } else if (error.request) {
        // console.log("Error request:", error.request);
      } else {
        // console.log("Error message:", error.message);
      }

      const originalRequest = error.config;
      
      if (originalRequest) {
        // console.log("Original request:", originalRequest);
      } else {
        // console.log("Original request is undefined");
        return Promise.reject(error);
      }

      if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          console.log("Attempting to refresh token...");
          const state = store.getState();
          const refreshTokenValue = state.user.refreshToken;
          const response = await axiosInstance.post('/api/token/refresh/', { refresh: refreshTokenValue });
          console.log("Token refresh response:", response.data);
          const { access, refresh } = response.data;
          await store.dispatch(refreshToken({ accessToken: access, refreshToken: refresh }));
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          if (refreshError.response) {
            console.log("Refresh error response:", refreshError.response.data);
          }
          console.log("Logging out due to invalid refresh token...");
          await store.dispatch(logout());
          // Redirect to login page or show a login modal
          // You might want to use your router to redirect, e.g.:
          // history.push('/login');
          return Promise.reject(refreshError);
        }
      }

      // If it's a 401 error and we've already tried to refresh, or if it's any other error, reject the promise
      return Promise.reject(error);
    }
  );
};