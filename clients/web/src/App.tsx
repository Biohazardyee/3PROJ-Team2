import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import Register from './pages/Register';
import Login from './pages/Login';
import Navbar from './components/Navbar';

// On définit le composant avec le type React.FC (Functional Component)
const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Par défaut, on affiche la page d'accueil */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/LandingPage" element={<LandingPage />} />

                {/* Route pour la page Register */}
                <Route path="/register" element={<Register />} />

                {/* Route pour la page Login */}
                <Route path="/login" element={<Login />} />
            </Routes>
        </Router>
    );
};

export default App;