import { useState, FC } from 'react';
import ChatRoom from './ChatRoom';

interface ChatOverlayProps {
    jwt: string;
    channelId: string;
    onError: () => void;
}

const ChatOverlay: FC<ChatOverlayProps> = ({ jwt, channelId, onError }) => {
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
                <ChatRoom jwt={jwt} channelId={channelId} onError={onError} />
            </div>
        </>
    );
};

export default ChatOverlay;
