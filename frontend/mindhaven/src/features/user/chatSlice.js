import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosConfig';


export const fetchRecentChats = createAsyncThunk(
  'chat/fetchRecentChats',
  async (_, { getState }) => {
    const response = await axiosInstance.get('/messages/');
    const currentUser = getState().user.currentUser;
    return response.data.map(chat => ({
      id: chat.id,
      name: chat.sender_name === currentUser.first_name ? chat.receiver_name : chat.sender_name,
      last_message: chat.last_message,
      timestamp: chat.timestamp
    }));
  }
);

export const fetchOnlineUsers = createAsyncThunk(
  'chat/fetchOnlineUsers',
  async () => {
    const response = await axiosInstance.get('/messages/online-users/');
    return response.data;
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ message, sender, receiver }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/messages/', { message, sender, receiver });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
      recentChats: [],
      onlineUsers: [],
      currentChat: null,
      messages: [],
      status: 'idle',
      error: null,
    },
    reducers: {
      setCurrentChat: (state, action) => {
        state.currentChat = action.payload;
      },
      addMessage: (state, action) => {
        const existingMessage = state.messages.find(m => m.id === action.payload.id);
        if (!existingMessage) {
          state.messages.push(action.payload);
        }
      },
      setMessages: (state, action) => {
        state.messages = action.payload;
      },
      updateMessageStatus: (state, action) => {
        const { messageId, status } = action.payload;
        const message = state.messages.find(m => m.id === messageId);
        if (message) {
          message.status = status;
        }
      },
    },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentChats.fulfilled, (state, action) => {
        state.recentChats = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchOnlineUsers.fulfilled, (state, action) => {
        state.onlineUsers = action.payload;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      });
  },
});

export const { setCurrentChat, addMessage, setMessages, updateMessageStatus } = chatSlice.actions;

export default chatSlice.reducer;