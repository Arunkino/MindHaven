import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import chatReducer from '../features/user/chatSlice';
import notificationReducer from '../features/notifications/notificationSlice';



const store = configureStore({
  reducer: {
    user: userReducer,
    chat : chatReducer,
    notifications: notificationReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;