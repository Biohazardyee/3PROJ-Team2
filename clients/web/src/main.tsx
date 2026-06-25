import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import './i18n';
import { SocketProvider } from './context/SocketContext';

const rootElement = document.getElementById('root') as HTMLElement;

createRoot(rootElement).render(
    <StrictMode>
        <SocketProvider>
            <App />
        </SocketProvider>
    </StrictMode>,
)