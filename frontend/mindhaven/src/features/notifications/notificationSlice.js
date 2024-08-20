import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosConfig';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/notifications/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await axiosInstance.post(`/notifications/${notificationId}/mark-read/`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAll',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post('/notifications/clear-all/');
      return;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    addNotification: (state, action) => {
      const newNotification = action.payload;
      if (newNotification.content.includes('Join here:')) {
        newNotification.type = 'video_call';
        const linkStart = newNotification.content.indexOf('http');
        const linkEnd = newNotification.content.indexOf(' ', linkStart);
        newNotification.callLink = newNotification.content.slice(linkStart, linkEnd > -1 ? linkEnd : undefined);
      }
      state.notifications.unshift(newNotification);
    },
    updateNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        state.notifications[index] = { ...state.notifications[index], ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notifications = action.payload.map(notification => {
          if (notification.content.includes('Join here:')) {
            notification.type = 'video_call';
            const linkStart = notification.content.indexOf('http');
            const linkEnd = notification.content.indexOf(' ', linkStart);
            notification.callLink = notification.content.slice(linkStart, linkEnd > -1 ? linkEnd : undefined);
          }
          return notification;
        });
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(
          (notification) => notification.id !== action.payload
        );
      })
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.notifications = [];
      });
  },
});

export const { addNotification, updateNotification } = notificationSlice.actions;

export default notificationSlice.reducer;