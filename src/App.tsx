import { useMemo, useState, useEffect, FC } from 'react';
import { jwtDecode } from 'jwt-decode';
import VideoRoom from './components/VideoRoom';
import ChatOverlay from './components/ChatOverlay';
import './layout.css';

interface MyJwtPayload {
    user_id?: string;
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const validateToken = (token: string | null, checkUserId: boolean = false): boolean => {
    if (!token) return false;

    try {
        const payload = jwtDecode<MyJwtPayload>(token);
        
        if (checkUserId && !payload.user_id) return false;
        
        return true;
    } catch {
        return false;
    }
};

interface ToastProps {
    message: string;
    onClose: () => void;
}

const Toast: FC<ToastProps> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="toast-notification">
            {message}
        </div>
    );
};

const App: FC = () => {
    const { channelId, jwtVideo, jwtChat } = useMemo(() => {
        const path = window.location.pathname;
        const rawChannelId = path.split('/')[1];
        const channelId = rawChannelId ? decodeURIComponent(rawChannelId) : null;

        const searchParams = new URLSearchParams(window.location.search);
        const jwtVideo = searchParams.get('jwt_video');
        const jwtChat = searchParams.get('jwt_chat');

        return { channelId, jwtVideo, jwtChat };
    }, []);

    const [dismissedToast, setDismissedToast] = useState<boolean>(false);
    const [chatConnectionError, setChatConnectionError] = useState<boolean>(false);
    const [prevJwtChat, setPrevJwtChat] = useState<string | null>(jwtChat);

    if (jwtChat !== prevJwtChat) {
        setPrevJwtChat(jwtChat);
        setDismissedToast(false);
        setChatConnectionError(false);
    }

    const isVideoValid = useMemo(() => validateToken(jwtVideo), [jwtVideo]);
    const isChatValid = useMemo(() => validateToken(jwtChat, true), [jwtChat]);

    const showInvalidChatToast = (jwtChat && !isChatValid && !dismissedToast) || (chatConnectionError && !dismissedToast);

    if (!channelId) {
        return (
            <div className="stub-container">
                <h1>Неверная ссылка</h1>
                <p>Отсутствует ID канала.</p>
            </div>
        );
    }

    if (!jwtVideo || !isVideoValid) {
        return (
            <div className="stub-container">
                <h1>Нет доступа к встрече</h1>
                <p>Пожалуйста, предоставьте действительный видео-токен для входа.</p>
                {jwtVideo && !isVideoValid && <p style={{color: '#ff4444', marginTop: '10px'}}>Предоставленный видео-токен недействителен.</p>}
            </div>
        );
    }

    return (
        <div className="app-container">
            <div className="video-section">
                <VideoRoom jwt={jwtVideo} roomName={channelId} />
            </div>
            {jwtChat && isChatValid && !chatConnectionError && (
                <ChatOverlay jwt={jwtChat} channelId={channelId} onError={() => setChatConnectionError(true)} />
            )}
            {showInvalidChatToast && <Toast message="Неверный токен чата - Чат отключен" onClose={() => setDismissedToast(true)} />}
        </div>
    );
};

export default App;
