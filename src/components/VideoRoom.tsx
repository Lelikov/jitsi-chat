import { JitsiMeeting } from '@jitsi/react-sdk';
import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import { WEBHOOK_URL, JITSI_DOMAIN } from '../utils/env';

interface VideoRoomProps {
    jwt: string;
    roomName: string;
}

const VideoRoom: React.FC<VideoRoomProps> = React.memo(({ jwt, roomName }) => {
    const apiRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    const iframeEventNames = useMemo(() => [
        'audioMuteStatusChanged',
        'cameraError',
        'deviceListChanged',
        'dominantSpeakerChanged',
        'errorOccurred',
        'micError',
        'participantJoined',
        'participantLeft',
        'participantMenuButtonClick',
        'participantMuted',
        'peerConnectionFailure',
        'suspendDetected',
        'toolbarButtonClicked',
        'videoConferenceJoined',
        'videoConferenceLeft',
        'videoMuteStatusChanged',
        // 'audioAvailabilityChanged',
        // 'audioOnlyChanged',
        // 'avatarChanged',
        // 'breakoutRoomsUpdated',
        // 'browserSupport',
        // 'chatUpdated',
        // 'conferenceCreatedTimestamp',
        // 'contentSharingParticipantsChanged',
        // 'customNotificationActionTriggered',
        // 'dataChannelOpened',
        // 'displayNameChange',
        // 'emailChange',
        // 'endpointTextMessageReceived',
        // 'faceLandmarkDetected',
        // 'feedbackSubmitted',
        // 'fileDeleted',
        // 'fileUploaded',
        // 'filmstripDisplayChanged',
        // 'incomingMessage',
        // 'knockingParticipant',
        // 'largeVideoChanged',
        // 'log',
        // 'moderationParticipantApproved',
        // 'moderationParticipantRejected',
        // 'moderationStatusChanged',
        // 'nonParticipantMessageReceived',
        // 'notificationTriggered',
        // 'outgoingMessage',
        // 'p2pStatusChanged',
        // 'participantKickedOut',
        // 'participantRoleChanged',
        // 'participantsPaneToggled',
        // 'passwordRequired',
        // 'raiseHandUpdated',
        // 'readyToClose',
        // 'recordingLinkAvailable',
        // 'recordingStatusChanged',
        // 'screenSharingStatusChanged',
        // 'subjectChange',
        // 'tileViewChanged',
        // 'toolbarVisibilityChanged',
        // 'transcribingStatusChanged',
        // 'transcriptionChunkReceived',
        // 'videoAvailabilityChanged',
        // 'videoQualityChanged',
        // 'whiteboardStatusChanged',
    ] as const, []);

    const sendWebhook = useCallback(async (event: string, payload: object = {}) => {
        const time = new Date().toISOString();
        const cloudEvent = {
            specversion: '1.0',
            id: crypto.randomUUID(),
            source: 'jitsi',
            type: `jitsi.events.v1.${event}.create`,
            time: time,
            data: {...payload, time},
        };

        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    Authorization: jwt,
                    'Content-Type': 'application/cloudevents+json',
                },
                body: JSON.stringify(cloudEvent),
            });
        } catch (error) {
            console.error(`Failed to send Jitsi webhook for event: ${event}`, error);
        }
    }, [jwt]);

    const eventHandlers = useMemo(() => {
        return iframeEventNames.reduce((acc, eventName) => {
            acc[eventName] = (payload: object = {}) => {
                sendWebhook(eventName, payload);
            };
            return acc;
        }, {} as Record<string, (payload?: object) => void>);
    }, [iframeEventNames, sendWebhook]);

    const handleApiReady = useCallback((apiObj: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        apiRef.current = apiObj;

        iframeEventNames.forEach((eventName) => {
            apiObj.on(eventName, eventHandlers[eventName]);
        });
    }, [iframeEventNames, eventHandlers]);

    useEffect(() => {
        return () => {
            const apiObj = apiRef.current;
            if (!apiObj) {
                return;
            }

            iframeEventNames.forEach((eventName) => {
                apiObj.removeListener(eventName, eventHandlers[eventName]);
            });
        };
    }, [iframeEventNames, eventHandlers]);

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
