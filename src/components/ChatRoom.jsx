import { useEffect, useState, useMemo } from 'react';
import {
  Channel,
  Chat,
  MessageInput,
  VirtualizedMessageList,
  Window,
} from 'stream-chat-react';
import { StreamChat } from 'stream-chat';
import 'stream-chat-react/dist/css/v2/index.css';
import { jwtDecode } from 'jwt-decode';
import { STREAM_CHAT_API_KEY } from '../utils/env';

const ChatClientWrapper = ({ jwt, userData, channelId, onError }) => {
    const [client, setClient] = useState(null);
    const [channel, setChannel] = useState(null);

    useEffect(() => {
        let mounted = true;
        // Create a new instance to avoid singleton state issues with React Strict Mode
        const chatClient = new StreamChat(STREAM_CHAT_API_KEY);

        const init = async () => {
            try {
                await chatClient.connectUser(userData, jwt);
                
                if (!mounted) {
                    await chatClient.disconnectUser();
                    return;
                }

                const spaceChannel = chatClient.channel('messaging', channelId);
                
                setClient(chatClient);
                setChannel(spaceChannel);
            } catch (error) {
                console.error("Chat connection failed:", error);
                if (mounted && onError) onError();
            }
        };

        init();

        return () => {
            mounted = false;
            if (chatClient) chatClient.disconnectUser();
        };
    }, [jwt, userData, channelId, onError]);

    if (!client) return <div className="chat-loading">Подключение к чату...</div>;

    return (
        <div className="chat-room-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Chat client={client} theme='str-chat__theme-dark'>
                <Channel channel={channel}>
                    <Window>
                        <VirtualizedMessageList />
                        <MessageInput focus />
                    </Window>
                </Channel>
            </Chat>
        </div>
    );
};

const ChatRoom = ({ jwt, channelId, onError }) => {
  const userData = useMemo(() => {
      if (!jwt) return null;
      
      try {
          const payload = jwtDecode(jwt);
      
          if (payload.user_id) {
            return {
                id: payload.user_id,
                name: payload.name || payload.user_id,
                image: `https://getstream.io/random_png/?name=${payload.user_id}`,
            };
          }
          return null;
      } catch {
          return null;
      }
  }, [jwt]);

  if (!userData) {
      // Should not happen if App.jsx validates, but safety fallback
      return null;
  }

  return <ChatClientWrapper jwt={jwt} userData={userData} channelId={channelId} onError={onError} />;
};

export default ChatRoom;
