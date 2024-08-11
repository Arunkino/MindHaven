import { useNavigate } from 'react-router-dom';
import axiosInstance from './axiosConfig';

const authService = {
    
    verifyToken: async (token) => {
        try {
            console.log("TOKENN::",token)
          const response = await axiosInstance.post('/api/token/verify/', { token });
          return response.data;
        } catch (error) {
          throw error;
        }
      },

  login: async (credentials) => {
    const response = await axiosInstance.post('/login/', credentials);
    if (response.data.access) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  signup: async (userData) => {
    const response = await axiosInstance.post('/register/user/', userData);
    if (response.data.access) {
               // Store token in localStorage
               localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('user');
    
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },
};

export default authService;