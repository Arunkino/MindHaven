import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isCallActive: false,
  callStartTime: null,
  callDuration: 0,
  participantJoined: false,
};

const videoCallSlice = createSlice({
  name: 'videoCall',
  initialState,
  reducers: {
    setCallActive: (state, action) => {
      state.isCallActive = action.payload;
      if (action.payload) {
        state.callStartTime = Date.now();
      } else {
        state.callStartTime = null;
        state.callDuration = 0;
      }
    },
    updateCallDuration: (state) => {
      if (state.isCallActive && state.callStartTime) {
        state.callDuration = Math.floor((Date.now() - state.callStartTime) / 1000);
      }
    },
    setParticipantJoined: (state, action) => {
      state.participantJoined = action.payload;
    },
    resetCallState: (state) => {
      return initialState;
    },
  },
});

export const { setCallActive, updateCallDuration, setParticipantJoined, resetCallState } = videoCallSlice.actions;

export default videoCallSlice.reducer;