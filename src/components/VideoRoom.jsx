import { JitsiMeeting } from '@jitsi/react-sdk';
import React, { useRef, useCallback, useMemo } from 'react';
import { WEBHOOK_URL, JITSI_DOMAIN } from '../utils/env';

const VideoRoom = React.memo(({ jwt, roomName }) => {
    const apiRef = useRef();

    const sendWebhook = useCallback(async (event, payload = {}) => {
        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event,
                    jwt_video: jwt,
                    payload
                })
            });
        } catch {
            // ignore error
        }
    }, [jwt]);

    const handleVideoConferenceJoined = useCallback((payload) => {
        sendWebhook('videoConferenceJoined', payload);
    }, [sendWebhook]);

    const handleVideoConferenceLeft = useCallback((payload) => {
        sendWebhook('videoConferenceLeft', payload);
    }, [sendWebhook]);

    const handleApiReady = useCallback((apiObj) => {
        apiRef.current = apiObj;
        
        // Send initial ready webhook
        sendWebhook('handleApiReady', {});

        apiObj.on('videoConferenceJoined', handleVideoConferenceJoined);
        apiObj.on('videoConferenceLeft', handleVideoConferenceLeft);
    }, [handleVideoConferenceJoined, handleVideoConferenceLeft, sendWebhook]);

    const renderSpinner = useCallback(() => (
        <div className="loading-spinner">
            Загрузка встречи...
        </div>
    ), []);

    const configOverwrite = useMemo(() => ({
        startWithAudioMuted: true,
        disableThirdPartyRequests: true,
        prejoinPageEnabled: false,
        hideConferenceSubject: false
    }), []);

    const handleIFrameRef = useCallback((iframeRef) => {
        iframeRef.style.height = '100%';
        iframeRef.style.width = '100%';
        iframeRef.style.border = 'none';
    }, []);

    // Validate JWT format basic check
    if (!jwt || jwt.split('.').length !== 3) {
        return (
            <div className="video-room-container" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
                Неверный видео-токен
            </div>
        );
    }

    return (
        <div className="video-room-container" style={{ width: '100%', height: '100%' }}>
            <JitsiMeeting
                domain={JITSI_DOMAIN}
                jwt={jwt}
                roomName={roomName}
                spinner={renderSpinner}
                configOverwrite={configOverwrite}
                lang='ru'
                onApiReady={handleApiReady}
                getIFrameRef={handleIFrameRef}
            />
        </div>
    );
});

export default VideoRoom;
