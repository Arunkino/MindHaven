import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';

const VideoCall = () => {
  const { callId } = useParams();
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const client = useRef(null);
  const navigate = useNavigate();
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const handleEndCall = () => {
    if (client.current) {
      client.current.leave();
    }
    if (localVideoTrack) {
      localVideoTrack.close();
    }
    navigate('/dashboard'); // or wherever you want to redirect after the call
  };

  useEffect(() => {
    const initializeAgora = async () => {
      try {
        console.log('Initializing Agora...');
        client.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        
        console.log('Joining channel...');
        await client.current.join('a86d44cf02204cf5940d57988a8bc8f1', callId, null, null);
        console.log('Joined channel successfully');

        console.log('Creating local tracks...');
        const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        
        console.log('Publishing local tracks...');
        await client.current.publish([localAudioTrack, localVideoTrack]);
        console.log('Published local tracks successfully');

        setLocalVideoTrack(localVideoTrack);
        setIsCallActive(true);

        client.current.on('user-published', async (user, mediaType) => {
          console.log('Remote user published:', user.uid, mediaType);
          await client.current.subscribe(user, mediaType);
          if (mediaType === 'video') {
            console.log('Setting remote video track');
            setRemoteVideoTrack(user.videoTrack);
          }
        });
      } catch (error) {
        console.error('Error in initializeAgora:', error);
      }
    };

    initializeAgora();

    return () => {
      if (client.current) {
        client.current.leave();
      }
      if (localVideoTrack) {
        localVideoTrack.close();
      }
    };
  }, [callId]);

  useEffect(() => {
    if (localVideoTrack) {
      console.log('Playing local video track');
      localVideoTrack.play('local-video');
    }
  }, [localVideoTrack]);

  useEffect(() => {
    if (remoteVideoTrack) {
      console.log('Playing remote video track');
      remoteVideoTrack.play('remote-video');
    }
  }, [remoteVideoTrack]);

  // ... rest of the component (handleEndCall, formatTime, etc.)

  return (
    <div className="video-call-container">
      <h2>Video Call</h2>
      <div className="video-streams">
        <div id="local-video" className="video-stream">
          {!localVideoTrack && <p>Loading local video...</p>}
        </div>
        <div id="remote-video" className="video-stream">
          {!remoteVideoTrack && <p>Waiting for remote user...</p>}
        </div>
      </div>
      <div className="call-controls">
        <p>Call duration: {formatTime(elapsedTime)}</p>
        <button onClick={handleEndCall} className="end-call-btn">End Call</button>
      </div>
    </div>
  );
};

export default VideoCall;