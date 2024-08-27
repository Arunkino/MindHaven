import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosConfig';

export const fetchToken = createAsyncThunk(
  'videoCall/fetchToken',
  async (appointmentId, { getState, rejectWithValue }) => {
    const { videoCall } = getState();
    if (videoCall.isFetching) {
      return rejectWithValue('Token fetch already in progress');
    }
    try {
        console.log('Fetching token... appointmentId:',appointmentId);
      const response = await axiosInstance.get(`/api/appointments/${appointmentId}/token/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch token');
    }
  },
  {
    condition: (_, { getState }) => {
      const { videoCall } = getState();
      return !videoCall.isFetching; // Prevent fetching if already in progress
    },
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
    isFetching: false,
  },
  reducers: {
    resetVideoCall: (state) => {
      state.token = null;
      state.isMentorJoined = false;
      state.isUserJoined = false;
      state.callStartTime = null;
      state.callEndTime = null;
      state.error = null;
      state.isFetching = false;
    },
    updateCallStatus: (state, action) => {
      // Update the call status based on action
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchToken.pending, (state) => {
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isMentorJoined = action.payload.is_mentor_joined;
        state.isUserJoined = action.payload.is_user_joined;
        state.isFetching = false;
        state.error = null;
      })
      .addCase(fetchToken.rejected, (state, action) => {
        state.isFetching = false;
        state.error = action.payload || 'An error occurred while fetching the token';
        state.token = null;
      });
  },
});

export const { resetVideoCall, updateCallStatus } = videoCallSlice.actions;
export default videoCallSlice.reducer;