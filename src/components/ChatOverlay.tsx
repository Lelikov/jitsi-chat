import { useState, FC } from 'react';
import ChatRoom from './ChatRoom';
import TelemostButton from './TelemostButton';

interface ChatOverlayProps {
    jwt: string;
    channelId: string;
    isOrganizer: boolean;
    onError: () => void;
}

const ChatOverlay: FC<ChatOverlayProps> = ({ jwt, channelId, isOrganizer, onError }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            <button
                className={`chat-toggle-btn ${isOpen ? 'chat-open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? 'Закрыть чат' : 'Открыть чат'}
            </button>

            <div className="chat-section" style={{ display: isOpen ? 'flex' : 'none' }}>
                {isOrganizer && <TelemostButton />}
                <ChatRoom jwt={jwt} channelId={channelId} onError={onError} />
            </div>
        </>
    );
};

export default ChatOverlay;
