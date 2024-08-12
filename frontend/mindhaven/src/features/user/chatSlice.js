import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosConfig';


export const fetchRecentChats = createAsyncThunk(
  'chat/fetchRecentChats',
  async (_, { getState }) => {
    console.log('fetching recent chats...');
    const response = await axiosInstance.get('/messages/recent-chats');
    const currentUser = getState().user.currentUser;
    console.log('recent chats:', response.data);
    return response.data;
  }
);

export const fetchOnlineUsers = createAsyncThunk(
  'chat/fetchOnlineUsers',
  async () => {
    console.log('fetching online users...');
    const response = await axiosInstance.get('/messages/online-users/');
    console.log('online users:', response.data);
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
      resetChatState: (state) => {
        state.recentChats = [];
        state.onlineUsers = [];
        state.currentChat = null;
        state.messages = [];
        state.status = 'idle';
        state.error = null;
      }
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

export const { setCurrentChat, addMessage, setMessages, updateMessageStatus, resetChatState } = chatSlice.actions;

export default chatSlice.reducer;