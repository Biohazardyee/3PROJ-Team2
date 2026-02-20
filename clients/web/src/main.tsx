import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// On utilise "as HTMLElement" pour garantir à TypeScript que l'élément 'root' existe
const rootElement = document.getElementById('root') as HTMLElement;

createRoot(rootElement).render(
    <StrictMode>
        <App />
    </StrictMode>,
)