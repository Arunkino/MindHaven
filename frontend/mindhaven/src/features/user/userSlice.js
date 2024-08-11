import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosConfig';

export const refreshToken = createAsyncThunk(
  'user/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    const { refreshToken } = getState().user;
    try {
      const response = await axiosInstance.post('/api/token/refresh/', { refresh: refreshToken });
      console.log("refresh token response", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'user/logoutUser',
  async (_, { dispatch }) => {
    try {
      // Perform any logout API call if needed
      // await axiosInstance.post('/api/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    role: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
      state.role = action.payload.role;
      state.isAuthenticated = true;
    },
    setTokens: (state, action) => {
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
      localStorage.removeItem('user');
      // Clear any other storage as needed
      sessionStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(refreshToken.fulfilled, (state, action) => {
      state.accessToken = action.payload.access;
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      // The logout action will be called in the logoutUser thunk
    });
  },
});

export const { setUser, setTokens, logout } = userSlice.actions;
export default userSlice.reducer;