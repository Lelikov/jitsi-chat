declare global {
  interface Window {
    _env_?: Record<string, string>;
  }
}

export const getEnv = (key: string): string => {
  if (window._env_ && window._env_[key]) {
    return window._env_[key];
  }
  return import.meta.env[key] as string;
};

export const JITSI_DOMAIN = getEnv('VITE_JITSI_DOMAIN');
export const WEBHOOK_URL = getEnv('VITE_WEBHOOK_URL');
export const STREAM_CHAT_API_KEY = getEnv('VITE_STREAM_CHAT_API_KEY');
