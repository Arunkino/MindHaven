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
      state.notifications.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.notifications = action.payload;
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

export const { addNotification } = notificationSlice.actions;

export default notificationSlice.reducer;