import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraUIKit from 'agora-react-uikit';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { fetchToken, resetVideoCall, updateCallStatus } from '../features/videoCallSlice';


const VideoCall = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [videoCall, setVideoCall] = useState(false);
  const [error, setError] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [showEndCallConfirmation, setShowEndCallConfirmation] = useState(false);
  const { currentUser, role } = useSelector(state => state.user);
  const { token, isMentorJoined, isUserJoined, callStartTime, callEndTime } = useSelector(state => state.videoCall);
  const rtcProps = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    dispatch(fetchToken(callId));

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      dispatch(resetVideoCall());
    };
  }, [dispatch, callId]);

  useEffect(() => {
    if (isMentorJoined && isUserJoined && !callStartTime) {
      dispatch(updateCallStatus({ appointmentId: callId, action: 'start' }));
    }
  }, [isMentorJoined, isUserJoined, callStartTime, dispatch, callId]);

  useEffect(() => {
    if (callStartTime && !callEndTime) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callStartTime, callEndTime]);

  const handleError = useCallback((err) => {
    console.error("Error in video call:", err);
    setError(`Error: ${err.message}`);
    toast.error(`Video call error: ${err.message}`);
  }, []);

  const navigateToDashboard = useCallback(() => {
    const dashboardPath = role === 'mentor' ? '/mentor/dashboard' : '/dashboard';
    navigate(dashboardPath);
  }, [navigate, role]);

  const handleEndCall = useCallback(() => {
    setShowEndCallConfirmation(true);
  }, []);

  const confirmEndCall = useCallback(() => {
    dispatch(updateCallStatus({ appointmentId: callId, action: 'end' }));
    setVideoCall(false);
    setShowEndCallConfirmation(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    navigateToDashboard();
  }, [dispatch, callId, navigateToDashboard]);

  const callbacks = {
    EndCall: handleEndCall,
  };

  useEffect(() => {
    if (token) {
      rtcProps.current = {
        appId: import.meta.env.VITE_AGORA_APP_ID,
        channel: callId,
        token: token,
        uid: currentUser.id,
        role: 'host',
      };
      setVideoCall(true);
    }
  }, [token, callId, currentUser.id]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error Joining Call</h2>
          <p className="mb-4 text-gray-700">{error}</p>
          <button 
            onClick={navigateToDashboard} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-2xl font-semibold text-gray-700">
          Loading video call...
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      <div className="absolute top-0 left-0 z-10 m-4 p-2 bg-black bg-opacity-50 text-white rounded">
        {!isMentorJoined || !isUserJoined ? (
          <p>{role === 'mentor' ? "Waiting for user to join..." : "Waiting for mentor to join..."}</p>
        ) : (
          <p>Call Duration: {formatTime(callDuration)}</p>
        )}
      </div>
      {videoCall && rtcProps.current && (
        <AgoraUIKit
          rtcProps={rtcProps.current}
          callbacks={callbacks}
          styleProps={{
            localBtnContainer: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
            remoteBtnContainer: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
          }}
        />
      )}
      {showEndCallConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">End Call</h3>
            <p className="mb-4">Are you sure you want to end the call?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowEndCallConfirmation(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmEndCall}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;