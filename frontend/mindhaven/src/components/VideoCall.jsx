import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraUIKit from 'agora-react-uikit';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-toastify';

const VideoCall = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const [videoCall, setVideoCall] = useState(false);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axiosInstance.get(`/api/appointments/${callId}/token/`);
        setToken(response.data.token);
        setVideoCall(true);
      } catch (error) {
        console.error('Error fetching token:', error);
        setError('Failed to fetch token. Please try again.');
        toast.error('Failed to join video call. Please try again.');
      }
    };

    fetchToken();
  }, [callId]);

  const handleError = (err) => {
    console.error("Error in video call:", err);
    setError(`Error: ${err.message}`);
    toast.error(`Video call error: ${err.message}`);
  };

  const callbacks = {
    EndCall: () => {
      setVideoCall(false);
      navigate('/dashboard');
    },
  };

  const rtcProps = {
    appId: import.meta.env.VITE_AGORA_APP_ID,
    channel: callId,
    token: token,
  };

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Joining Call</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
      </div>
    );
  }

  if (!token) {
    return <div className="loading">Loading video call...</div>;
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
    </div>
  );
};

export default VideoCall;