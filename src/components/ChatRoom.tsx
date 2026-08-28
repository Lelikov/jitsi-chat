import { useEffect, useState, useMemo } from 'react';
import {
  Channel as StreamChannelComponent,
  Chat,
  MessageInput,
  VirtualizedMessageList,
  Window,
} from 'stream-chat-react';
import { StreamChat, Channel } from 'stream-chat';
import 'stream-chat-react/dist/css/v2/index.css';
import { jwtDecode } from 'jwt-decode';
import { STREAM_CHAT_API_KEY, STREAM_CHAT_BASE_URL, DEV_BYPASS_AUTH } from '../utils/env';

interface UserData {
    id: string;
    name: string;
    image: string;
}

interface ChatClientWrapperProps {
    jwt: string;
    userData: UserData;
    channelId: string;
    onError: () => void;
}

const ChatClientWrapper: React.FC<ChatClientWrapperProps> = ({ jwt, userData, channelId, onError }) => {
    const [client, setClient] = useState<StreamChat | null>(null);
    const [channel, setChannel] = useState<Channel | null>(null);

    useEffect(() => {
        let mounted = true;
        const chatClient = StreamChat.getInstance(STREAM_CHAT_API_KEY, {
            timeout: 10000,
            baseURL: STREAM_CHAT_BASE_URL,
        });


        // В bypass-режиме настоящего Stream-токена нет — берём dev-токен,
        // подписанный на клиенте (работает, если в приложении Stream включены dev tokens).
        const token = jwt || (DEV_BYPASS_AUTH ? chatClient.devToken(userData.id) : jwt);

        const init = async () => {
            try {
                if (!chatClient.userID) {
                    await chatClient.connectUser(userData, token);
                } else if (chatClient.userID !== userData.id) {
                    if (chatClient.userID) {
                        await chatClient.disconnectUser();
                    }
                    await chatClient.connectUser(userData, token);
                } else {
                    await chatClient.openConnection();
                }
                
                if (!mounted) {
                    return;
                }

                const spaceChannel = chatClient.channel('messaging', channelId);
                
                setClient(chatClient);
                setChannel(spaceChannel);
            } catch (error) {
                console.error("Chat connection failed:", error);
                // В bypass-режиме не прячем панель чата — иначе окно не увидеть.
                if (mounted && onError && !DEV_BYPASS_AUTH) onError();
            }
        };

        init();

        return () => {
            mounted = false;
        };
    }, [jwt, userData, channelId, onError]);

    if (!client) return <div className="chat-loading">Подключение к чату...</div>;

    return (
        <div className="chat-room-container" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Chat client={client} theme='str-chat__theme-dark'>
                <StreamChannelComponent channel={channel as Channel}>
                    <Window>
                        <VirtualizedMessageList />
                        <MessageInput focus />
                    </Window>
                </StreamChannelComponent>
            </Chat>
        </div>
    );
};

interface ChatRoomProps {
    jwt: string;
    channelId: string;
    onError: () => void;
}

interface MyJwtPayload {
    user_id?: string;
    name?: string;
    [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const ChatRoom: React.FC<ChatRoomProps> = ({ jwt, channelId, onError }) => {
  const userData = useMemo<UserData | null>(() => {
      const devUser = DEV_BYPASS_AUTH
          ? { id: 'dev-user', name: 'Dev User', image: 'https://getstream.io/random_png/?name=dev-user' }
          : null;

      if (!jwt) return devUser;

      try {
          const payload = jwtDecode<MyJwtPayload>(jwt);

          if (payload.user_id) {
            return {
                id: payload.user_id,
                name: payload.name || payload.user_id,
                image: `https://getstream.io/random_png/?name=${payload.user_id}`,
            };
          }
          return devUser;
      } catch {
          return devUser;
      }
  }, [jwt]);

  if (!userData) {
      return null;
  }

  return <ChatClientWrapper jwt={jwt} userData={userData} channelId={channelId} onError={onError} />;
};

export default ChatRoom;
