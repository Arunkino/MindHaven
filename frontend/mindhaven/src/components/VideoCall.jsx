import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setCallActive, 
  updateCallDuration, 
  setParticipantJoined, 
  showCallSummary, 
  resetCallState 
} from '../features/videoCall/videoCallSlice';
import AgoraUIKit from 'agora-react-uikit';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { setupWebSocket, closeWebSocket, sendMessage } from '../features/websocketService';
import { toast } from 'react-toastify';
import Modal from './Modal';

const VideoCall = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { callId } = useParams();
  const { 
    isCallActive, 
    callDuration, 
    participantJoined, 
    showCallSummary: showSummary, 
    finalCallDuration 
  } = useSelector((state) => state.videoCall);
  const {currentUser} = useSelector((state) => state.user);
  const [token, setToken] = useState(null);
  const [showEndCallConfirmation, setShowEndCallConfirmation] = useState(false);


  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axiosInstance.get(`/api/appointments/${callId}/token/`);
        setToken(response.data.token);
      } catch (error) {
        console.error('Error fetching token:', error);
        toast.error("Failed to fetch token. Please try again.");
      }
    };
    fetchToken();

    const socket = setupWebSocket(dispatch, currentUser.id);
    
    setTimeout(() => {
      sendMessage({
        type: 'video_call_event',
        data: {
          event_type: 'user_joined',
          appointment_id: callId,
          user_role: currentUser.role,
        },
      });
    }, 1000);

    return () => {
      closeWebSocket();
    };
  }, [callId, currentUser, dispatch]);

  useEffect(() => {
    let interval;
    if (isCallActive) {
      interval = setInterval(() => {
        dispatch(updateCallDuration());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive, dispatch]);

  useEffect(() => {
    const handleCallEnd = (action) => {
      if (action.type === 'SHOW_CALL_SUMMARY') {
        console.log('Showing call summary:', action.payload);
        setFinalCallDuration(action.payload.duration);
        setShowCallSummary(true);
      }
    };

    dispatch(handleCallEnd);

    return () => {
      // Clean up the dispatch subscription
      dispatch({ type: 'REMOVE_CALL_END_HANDLER' });
    };
  }, [dispatch]);

  const handleCallEnd = useCallback(() => {
    setShowEndCallConfirmation(true);
  }, []);

  const confirmEndCall = useCallback(() => {
    sendMessage({
      type: 'video_call_event',
      data: {
        event_type: 'call_ended',
        appointment_id: callId,
        call_duration: callDuration,
        user_role: currentUser.role,
      },
    });
    setShowEndCallConfirmation(false);
    dispatch(showCallSummary({ duration: callDuration }));
  }, [callId, callDuration, currentUser.role, dispatch]);

  const goToDashboard = useCallback(() => {
    dispatch(resetCallState());
    const redirectPath = currentUser.role === 'mentor' ? '/mentor/dashboard' : '/dashboard';
    navigate(redirectPath);
    window.location.reload();
  }, [dispatch, navigate, currentUser.role]);

  // Placeholder function for payment processing
  const proceedToPayment = useCallback(() => {
    console.log("Proceeding to payment...");
    // TODO: Implement payment logic here
    // For now, we'll just redirect to the dashboard
    goToDashboard();
  }, [goToDashboard]);

  const callbacks = {
    EndCall: handleCallEnd,
  };

  const rtcProps = {
    appId: import.meta.env.VITE_AGORA_APP_ID,
    channel: callId,
    token: token,
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!token) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative h-screen">
      <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
      {isCallActive && (
        <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white p-4 flex justify-between items-center">
          <div>Call Duration: {formatDuration(callDuration)}</div>
          <button 
            onClick={handleCallEnd}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            End Call
          </button>
        </div>
      )}
      {!participantJoined && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-400 text-black p-4 text-center">
          Waiting for other participant to join...
        </div>
      )}
      <Modal isOpen={showEndCallConfirmation} onClose={() => setShowEndCallConfirmation(false)}>
        {/* ... (keep the end call confirmation modal content) */}
        <h2 className="text-xl font-bold mb-4">End Call Confirmation</h2>
        <p className="mb-4">Are you sure you want to end the call?</p>
        <div className="flex justify-end space-x-4">
          <button 
            onClick={() => setShowEndCallConfirmation(false)}
            className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button 
            onClick={confirmEndCall}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            End Call
          </button>
        </div>
      </Modal>
      <Modal isOpen={showSummary} onClose={() => {}}>
        <h2 className="text-xl font-bold mb-4">Call Summary</h2>
        <p className="mb-4">Your session has ended.</p>
        <p className="mb-4">Call Duration: {formatDuration(finalCallDuration)}</p>
        {currentUser.role === 'mentor' ? (
          <button 
            onClick={goToDashboard}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Go to Dashboard
          </button>
        ) : (
          <button 
            onClick={proceedToPayment}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Proceed to Payment
          </button>
        )}
      </Modal>
    </div>
  );
};

export default VideoCall;