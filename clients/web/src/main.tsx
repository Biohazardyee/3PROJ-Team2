import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import './i18n';
import { SocketProvider } from './context/SocketContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { applyTheme, readTheme } from './useDarkMode';

// Applique le thème enregistré dès le chargement (évite le flash sur toutes les pages)
applyTheme(readTheme());

const rootElement = document.getElementById('root') as HTMLElement;

createRoot(rootElement).render(
    <StrictMode>
        <SocketProvider>
            <ConfirmProvider>
                <App />
            </ConfirmProvider>
        </SocketProvider>
    </StrictMode>,
)