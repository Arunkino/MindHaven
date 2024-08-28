import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCallActive, updateCallDuration, setParticipantJoined, resetCallState } from '../features/videoCall/videoCallSlice';
import AgoraUIKit from 'agora-react-uikit';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { setupWebSocket, closeWebSocket, sendMessage } from '../features/websocketService';
import { toast } from 'react-toastify';

const VideoCall = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { callId } = useParams();
  const { isCallActive, callDuration, participantJoined } = useSelector((state) => state.videoCall);
  const currentUser = useSelector((state) => state.user.currentUser);
  const userRole = useSelector((state) => state.user.role);
  const [token, setToken] = useState(null);
  const [showEndCallConfirmation, setShowEndCallConfirmation] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        console.log("Fetching token for call ID:", callId);
        const response = await axiosInstance.get(`/api/appointments/${callId}/token/`);
        setToken(response.data.token);
        console.log("Token received:", response.data.token);
      } catch (error) {
        console.error('Error fetching token:', error);
        toast.error("Failed to fetch token. Please try again.");
      }
    };
    fetchToken();

    if (currentUser && currentUser.id) {
      console.log("Setting up WebSocket for user:", currentUser.id);
      const socket = setupWebSocket(dispatch, currentUser.id);
      
      setTimeout(() => {
        console.log("Sending user_joined event");
        sendMessage({
          type: 'video_call_event',
          data: {
            event_type: 'user_joined',
            appointment_id: callId,
            user_role: userRole,
          },
        });
      }, 1000);

      return () => {
        console.log("Closing WebSocket connection");
        closeWebSocket();
      };
    }
  }, [callId, currentUser, userRole, dispatch]);

  useEffect(() => {
    let interval;
    if (isCallActive) {
      interval = setInterval(() => {
        dispatch(updateCallDuration());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive, dispatch]);

  const handleCallEnd = useCallback(() => {
    console.log("Call end triggered");
    setShowEndCallConfirmation(true);
  }, []);

  const confirmEndCall = useCallback(() => {
    console.log("Confirming call end");
    sendMessage({
      type: 'video_call_event',
      data: {
        event_type: 'call_ended',
        appointment_id: callId,
        call_duration: callDuration,
        user_role: userRole,
      },
    });
    dispatch(resetCallState());
    navigate(userRole === 'mentor' ? '/mentor/dashboard' : '/dashboard');
  }, [callId, callDuration, userRole, dispatch, navigate]);

  const callbacks = {
    EndCall: handleCallEnd,
  };

  const rtcProps = {
    appId: import.meta.env.VITE_AGORA_APP_ID,
    channel: callId,
    token: token,
  };

  console.log("Rendering VideoCall component. isCallActive:", isCallActive, "participantJoined:", participantJoined);

  if (!token) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100vw", height: "100vh" }}>
      <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
      {isCallActive && (
        <div>
          Call Duration: {Math.floor(callDuration / 3600)}:{Math.floor((callDuration % 3600) / 60)}:{callDuration % 60}
        </div>
      )}
      {!participantJoined && <div>Waiting for other participant to join...</div>}
      {showEndCallConfirmation && (
        <div className="end-call-confirmation">
          <p>Are you sure you want to end the call?</p>
          <button onClick={confirmEndCall}>Yes, end call</button>
          <button onClick={() => setShowEndCallConfirmation(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;