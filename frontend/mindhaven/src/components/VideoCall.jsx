import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { useSelector, useDispatch } from 'react-redux';
import { fetchToken, resetVideoCall, updateCallStatus } from '../features/videoCallSlice';
import axiosInstance from '../utils/axiosConfig';

const VideoCall = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const timerRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState(null);
  const [remoteAudioTrack, setRemoteAudioTrack] = useState(null);
  const [error, setError] = useState(null);
  const [fetchInProgress, setFetchInProgress] = useState(false);

  const { currentUser, role } = useSelector(state => state.user);
  const { token, isFetching, error: reduxError } = useSelector(state => state.videoCall);
  
  const clientRef = useRef(null);

  const initializeAgora = useCallback(async () => {

    if (!token || hasInitialized.current) return;

    try {
      console.log("Initializing Agora with token:", token);
      clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current.on('user-published', handleUserPublished);
      clientRef.current.on('user-unpublished', handleUserUnpublished);

      await clientRef.current.join(import.meta.env.VITE_AGORA_APP_ID, callId, token, currentUser.id);
      console.log('Successfully joined the channel');

      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();

      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      await clientRef.current.publish([audioTrack, videoTrack]);
      console.log('Local tracks published successfully');
      
      dispatch(updateCallStatus({ appointmentId: callId, action: 'localJoined' }));
      hasInitialized.current = true;
    } catch (error) {
      console.error("Error in initializeAgora:", error);
      setError(`Error initializing Agora: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [token, callId, currentUser.id, dispatch]);

  useEffect(() => {
    const fetchTokenAndInitialize = async () => {
      if (isFetching || fetchInProgress) {
        console.log("Fetch already in progress or isFetching is true");
        return; // Prevent fetching if already in progress
      }

      setFetchInProgress(true); // Set the fetch flag
      console.log("Fetching token...");

      try {
        if (!token) {
          console.log("Dispatching fetchToken for callId:", callId);
          await dispatch(fetchToken(callId)).unwrap();
          console.log("Token dispatched.");
        }

        if (token) {
          console.log("Token received:", token);
          await initializeAgora();
        }
      } catch (error) {
        console.error("Failed to fetch token:", error);
        setError(`Error fetching token: ${error.message || 'Unknown error'}`);
      } finally {
        setFetchInProgress(false); // Reset the fetch flag
        console.log("Fetch completed.");
      }
    };

    fetchTokenAndInitialize();
  }, [dispatch, callId, token, isFetching, initializeAgora, fetchInProgress]);

  useEffect(() => {
    if (reduxError) {
      console.error("Redux error:", reduxError);
      setError(reduxError);
      setIsLoading(false);
    }
  }, [reduxError]);

  // Direct API call for troubleshooting
  useEffect(() => {
    const fetchTokenDirectly = async () => {
      console.log("Making direct API call to fetch token...");
      try {
        const response = await axiosInstance.get(`/api/appointments/${callId}/token/`);
        console.log("Direct API call response:", response.data);
      } catch (error) {
        console.error("Error fetching token directly:", error);
      }
    };

    fetchTokenDirectly(); // Call this function for troubleshooting
  }, [callId]);

  useEffect(() => {
    if (reduxError) {
      console.error("Redux error:", reduxError);
      setError(reduxError);
      setIsLoading(false);
    }
  }, [reduxError]);

  const handleUserPublished = async (user, mediaType) => {
    await clientRef.current.subscribe(user, mediaType);
    if (mediaType === 'video') {
      setRemoteVideoTrack(user.videoTrack);
      if (remoteVideoRef.current) {
        user.videoTrack.play(remoteVideoRef.current);
      }
    }
    if (mediaType === 'audio') {
      setRemoteAudioTrack(user.audioTrack);
      user.audioTrack.play();
    }
    dispatch(updateCallStatus({ appointmentId: callId, action: 'remoteJoined' }));
    startTimer();
  };

  const handleUserUnpublished = (user, mediaType) => {
    if (mediaType === 'video') {
      setRemoteVideoTrack(null);
    }
    if (mediaType === 'audio') {
      if (remoteAudioTrack) {
        remoteAudioTrack.stop();
      }
      setRemoteAudioTrack(null);
    }
  };

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const handleEndCall = useCallback(() => {
    setShowEndCallConfirmation(true);
  }, []);

  const confirmEndCall = useCallback(async () => {
    try {
      if (clientRef.current) {
        await clientRef.current.leave();
      }
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      if (localVideoTrack) {
        localVideoTrack.close();
      }
      dispatch(updateCallStatus({ appointmentId: callId, action: 'end' }));
      setShowEndCallConfirmation(false);
      if (timerRef.current) clearInterval(timerRef.current);
      navigate(role === 'mentor' ? '/mentor/dashboard' : '/dashboard');
    } catch (error) {
      console.error("Error ending call:", error);
      setError(`Failed to end call: ${error.message}`);
    }
  }, [dispatch, callId, role, navigate, localAudioTrack, localVideoTrack]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      dispatch(resetVideoCall());
      if (clientRef.current) {
        clientRef.current.leave().catch(console.error);
      }
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      if (localVideoTrack) {
        localVideoTrack.close();
      }
    };
  }, [dispatch, localAudioTrack, localVideoTrack]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Error Joining Call</h2>
          <p className="mb-4 text-gray-700">{error}</p>
          <button 
            onClick={() => navigate(role === 'mentor' ? '/mentor/dashboard' : '/dashboard')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-gray-100">
      <div className="absolute top-0 left-0 z-10 m-4 p-2 bg-black bg-opacity-50 text-white rounded">
        {!remoteVideoTrack ? (
          <p>{role === 'mentor' ? "Waiting for user to join..." : "Waiting for mentor to join..."}</p>
        ) : (
          <p>Call Duration: {formatTime(callDuration)}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 h-full p-4">
        <div className="relative">
          <div ref={localVideoRef} className="w-full h-full bg-black rounded-lg overflow-hidden"></div>
          <p className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-1 rounded">You</p>
        </div>
        <div className="relative">
          {remoteVideoTrack ? (
            <>
              <div ref={remoteVideoRef} className="w-full h-full bg-black rounded-lg overflow-hidden"></div>
              <p className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-1 rounded">
                {role === 'mentor' ? 'User' : 'Mentor'}
              </p>
            </>
          ) : (
            <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
              <p className="text-gray-600">Waiting for other participant...</p>
            </div>
          )}
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={handleEndCall}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          End Call
        </button>
      </div>
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