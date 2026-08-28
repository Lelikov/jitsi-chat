import { FC } from 'react';

const TELEMOST_URL = 'https://telemost.yandex.ru/';

const TelemostButton: FC = () => (
    <div className="telemost-fallback">
        <span className="telemost-hint">Не работает платформа?</span>
        <a
            className="telemost-btn"
            href={TELEMOST_URL}
            target="_blank"
            rel="noopener noreferrer"
        >
            Перейти на Яндекс.Телемост
        </a>
    </div>
);

export default TelemostButton;
