import { toast } from 'react-toastify';
import { addNotification } from './notifications/notificationSlice';
import { addMessage, updateMessageStatus } from './user/chatSlice';
import { updateCallStatus } from './videoCallSlice';


let socket = null;

export const setupWebSocket = (dispatch, currentUserId) => {
  const wsUrl = `ws://127.0.0.1:8000/ws/chat/${currentUserId}/`;
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('WebSocket connected');
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected');
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
    }else if (data.type === 'video_call_status') {
      // Handle video call status updates
      dispatch(updateCallStatus(data.status));
    }
  };

  return socket;
};

export const sendMessage = (messageData) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(messageData));
  } else {
    console.error('WebSocket is not open. Unable to send message.');
    toast.error("Unable to send message. Please try again.");
  }
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
  }
};