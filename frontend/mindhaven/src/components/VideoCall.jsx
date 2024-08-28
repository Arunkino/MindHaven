import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraUIKit from 'agora-react-uikit';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

import AgoraRTC from "agora-rtc-sdk-ng";
import { AgoraRTCProvider } from "agora-rtc-react";

const VideoCall = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const [videoCall, setVideoCall] = useState(true);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [waitingMessage, setWaitingMessage] = useState('');
  const timerRef = useRef(null);
  const userRole = useSelector((state) => state.user.role);
  const [userCount, setUserCount] = useState(0);
  const [rtcInitialized, setRtcInitialized] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axiosInstance.get(`/api/appointments/${callId}/token/`);
        setToken(response.data.token);
        setVideoCall(true);
        setRtcInitialized(true); // Set RTC ready state
      } catch (error) {
        console.error('Error fetching token:', error);
        setError('Failed to fetch token. Please try again.');
        toast.error('Failed to join video call. Please try again.');
      }
    };
    fetchToken();
  }, [callId]);
  const rtcProps = {
    appId: import.meta.env.VITE_AGORA_APP_ID,
    channel: callId,
    token: token,
  };
  const callbacks = {
    EndCall: () => setVideoCall(false),
};

 

  const handleError = (err) => {
    console.error("Error in video call:", err);
    setError(`Error: ${err.message}`);
    toast.error(`Video call error: ${err.message}`);
  };


  const startCallTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };


  return videoCall ? (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <AgoraUIKit rtcProps={rtcProps} callbacks={callbacks} />
    </div>
  ) : (
    <h3 onClick={() => setVideoCall(true)}>Join</h3>
  );
  
};

export default VideoCall;