import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosConfig';

export const fetchToken = createAsyncThunk(
  'videoCall/fetchToken',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/appointments/${appointmentId}/token/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateCallStatus = createAsyncThunk(
  'videoCall/updateCallStatus',
  async ({ appointmentId, action }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/appointments/${appointmentId}/call-status/`, { action });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const videoCallSlice = createSlice({
  name: 'videoCall',
  initialState: {
    token: null,
    isMentorJoined: false,
    isUserJoined: false,
    callStartTime: null,
    callEndTime: null,
    error: null,
    status: 'idle',
  },
  reducers: {
    resetVideoCall: (state) => {
      state.token = null;
      state.isMentorJoined = false;
      state.isUserJoined = false;
      state.callStartTime = null;
      state.callEndTime = null;
      state.error = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchToken.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchToken.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.isMentorJoined = action.payload.is_mentor_joined;
        state.isUserJoined = action.payload.is_user_joined;
      })
      .addCase(fetchToken.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload.error;
      })
      .addCase(updateCallStatus.fulfilled, (state, action) => {
        if (action.meta.arg.action === 'start') {
          state.callStartTime = new Date().toISOString();
        } else if (action.meta.arg.action === 'end') {
          state.callEndTime = new Date().toISOString();
          state.isMentorJoined = false;
          state.isUserJoined = false;
        }
      });
  },
});

export const { resetVideoCall } = videoCallSlice.actions;

export default videoCallSlice.reducer;