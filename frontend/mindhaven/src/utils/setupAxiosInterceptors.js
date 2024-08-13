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
      const originalRequest = error.config;
      const state = store.getState();
      const refreshTokenValue = state.user.refreshToken;

      if (error.response && error.response.status === 401) {
        // Check if this request is a retry attempt and also if it's not the refresh token request itself
        if (originalRequest._retry || originalRequest.url.includes('/api/token/refresh/')) {
          // If it's a retry or a refresh token request itself, then logout
          await store.dispatch(logout());
          // Redirect to login page or show a login modal
          // You might want to use your router to redirect, e.g.:
          // history.push('/login');
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          console.log("Attempting to refresh token...");
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
          return Promise.reject(refreshError);
        }
      }

      // If it's any other error, reject the promise
      return Promise.reject(error);
    }
  );
};
