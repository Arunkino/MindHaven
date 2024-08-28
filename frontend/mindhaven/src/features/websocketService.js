import { toast } from 'react-toastify';
import { addNotification } from './notifications/notificationSlice';
import { addMessage, updateMessageStatus } from './user/chatSlice';
import { 
  setCallActive, 
  setParticipantJoined, 
  updateCallDuration, 
  showCallSummary, 
  resetCallState 
} from './videoCall/videoCallSlice';

let socket = null;
let reconnectInterval = null;
let dispatch = null;
let currentUserId = null;

const connectWebSocket = () => {
  const wsUrl = `ws://127.0.0.1:8000/ws/chat/${currentUserId}/`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('WebSocket connected');
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected');
    reconnectInterval = setInterval(() => {
      console.log('Attempting to reconnect WebSocket');
      connectWebSocket();
    }, 5000);
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Received WebSocket message:', data);

    if (data.type === 'ai_moderation') {
      toast.warning(data.message);
      dispatch(updateMessageStatus({ messageId: data.message_id, status: 'blocked' }));
    } else if (data.type === 'chat_message') {
      dispatch(addMessage(data.message));
    } else if (data.type === 'new_notification') {
      dispatch(addNotification(data.notification));
    } else if (data.type === 'video_call_update') {
      console.log('Received video call update:', data.data);
      handleVideoCallUpdate(data.data);
    }
  };
};

export const setupWebSocket = (dispatchFunction, userId) => {
  dispatch = dispatchFunction;
  currentUserId = userId;
  connectWebSocket();
  return socket;
};

const handleVideoCallUpdate = (data) => {
  console.log('Handling video call update:', data);
  if (data.user_joined && data.mentor_joined) {
    dispatch(setCallActive(true));
    dispatch(setParticipantJoined(true));
  } else if (data.user_joined || data.mentor_joined) {
    toast.info('Waiting for other participant to join...');
  }

  if (data.call_started) {
    dispatch(setCallActive(true));
    dispatch(setParticipantJoined(true));
    // Start the call duration timer
    setInterval(() => {
      dispatch(updateCallDuration());
    }, 1000);
  }

  if (data.call_ended) {
    console.log('Call ended');
    dispatch(showCallSummary({ duration: data.call_duration }));
  }
};
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};


export const sendMessage = (messageData) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log('Sending WebSocket message:', messageData);
    socket.send(JSON.stringify(messageData));
  } else {
    console.error('WebSocket is not open. Unable to send message.');
    toast.error("Unable to send message. Please try again.");
    // Attempt to reconnect
    if (!reconnectInterval) {
      connectWebSocket();
    }
  }
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
  }
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }
};