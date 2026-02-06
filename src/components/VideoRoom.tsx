import { JitsiMeeting } from '@jitsi/react-sdk';
import React, { useRef, useCallback, useMemo } from 'react';
import { WEBHOOK_URL, JITSI_DOMAIN } from '../utils/env';

interface VideoRoomProps {
    jwt: string;
    roomName: string;
}

const VideoRoom: React.FC<VideoRoomProps> = React.memo(({ jwt, roomName }) => {
    const apiRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    const sendWebhook = useCallback(async (event: string, payload: object = {}) => {
        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event,
                    jwt,
                    payload
                })
            });
        } catch {
            // ignore error
        }
    }, [jwt]);

    const handleVideoConferenceJoined = useCallback((payload: object) => {
        sendWebhook('videoConferenceJoined', payload);
    }, [sendWebhook]);

    const handleVideoConferenceLeft = useCallback((payload: object) => {
        sendWebhook('videoConferenceLeft', payload);
    }, [sendWebhook]);

    const handleApiReady = useCallback((apiObj: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        apiRef.current = apiObj;
        
        // sendWebhook('handleApiReady', {});

        apiObj.on('videoConferenceJoined', handleVideoConferenceJoined);
        apiObj.on('videoConferenceLeft', handleVideoConferenceLeft);
    }, [handleVideoConferenceJoined, handleVideoConferenceLeft]);

    const renderSpinner = useCallback(() => (
        <div className="loading-spinner">
            Загрузка встречи...
        </div>
    ), []);

    const configOverwrite = useMemo(() => ({
        startWithAudioMuted: false,
        disableThirdPartyRequests: true,
        prejoinPageEnabled: false,
        hideConferenceSubject: true,
        toolbarButtons: ['camera','microphone','fullscreen','select-background','settings','toggle-camera','hangup']
    }), []);

    const handleIFrameRef = useCallback((iframeRef: HTMLDivElement) => {
        iframeRef.style.height = '100%';
        iframeRef.style.width = '100%';
        iframeRef.style.border = 'none';
    }, []);

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
