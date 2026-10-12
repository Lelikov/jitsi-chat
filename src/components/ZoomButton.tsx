import { FC, useEffect, useRef, useState } from 'react';

// Схема десктоп-клиента Zoom: открывает установленное приложение.
const ZOOM_APP_URL = 'zoommtg://';
const ZOOM_DOWNLOAD_URL = 'https://zoom.us/download';
// Если за это время окно не потеряло фокус — клиент, вероятно, не установлен.
const APP_OPEN_TIMEOUT_MS = 2000;

const ZoomButton: FC = () => {
    const [showInstallHint, setShowInstallHint] = useState(false);
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => () => cleanupRef.current?.(), []);

    const handleClick = () => {
        cleanupRef.current?.();
        setShowInstallHint(false);

        let left = false;
        const onBlur = () => { left = true; };
        const onVisibilityChange = () => { if (document.hidden) left = true; };
        window.addEventListener('blur', onBlur);
        document.addEventListener('visibilitychange', onVisibilityChange);

        const cleanup = () => {
            clearTimeout(timer);
            window.removeEventListener('blur', onBlur);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            cleanupRef.current = null;
        };
        const timer = setTimeout(() => {
            cleanup();
            if (!left) setShowInstallHint(true);
        }, APP_OPEN_TIMEOUT_MS);
        cleanupRef.current = cleanup;
    };

    return (
        <div className="zoom-fallback">
            <span className="zoom-hint">Не работает платформа?</span>
            <a className="zoom-btn" href={ZOOM_APP_URL} onClick={handleClick}>
                Перейти в Zoom
            </a>
            {showInstallHint && (
                <span className="zoom-hint">
                    Ничего не открылось?{' '}
                    <a href={ZOOM_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
                        Установите Zoom
                    </a>
                </span>
            )}
        </div>
    );
};

export default ZoomButton;
