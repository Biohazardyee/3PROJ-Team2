import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import Layout from './components/Layout';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Feed from './pages/Feed';
import AlbumDetails from './pages/AlbumDetails';
import Stats from './pages/Stats';
import Library from './pages/Library';
import Notifications from './pages/Notifications';
import Conversations from './pages/Conversations';
import Profil from './pages/Profil';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import CreatePlaylist from './pages/CreatePlaylist';
import ScrollToTop from './components/ScrollToTop';
import AuthGuard from './components/AuthGuard'


// On définit le composant avec le type React.FC (Functional Component)
const App: React.FC = () => {
    return (
        <Router>
            <ScrollToTop />
            <Routes>
                {/* Par défaut, on affiche la page d'accueil */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/LandingPage" element={<LandingPage />} />
                {/* Route pour la page Register */}
                <Route path="/register" element={<Register />} />
                {/* Route pour la page Login */}
                <Route path="/login" element={<Login />} />

                <Route element={<Layout />}>
                    {/* Route pour la page Home */}
                    <Route path="/home" element={<Home />} />
                    {/* Route pour la page Feed */}
                    <Route path="/feed" element={<Feed />} />
                    {/* Route pour la page AlbumDetails */}
                    <Route path="/album/:id" element={<AlbumDetails />} />
                    {/* Route pour la page Stats */}
                    <Route path="/stats" element={<Stats />} />
                    {/* Route pour la page Library */}
                    <Route path="/library" element={<Library />} />
                    {/* Route pour la page Notifications */}
                    <Route path="/notifications" element={<Notifications />} />
                    {/* Route pour la page Conversions */}
                    <Route path="/conversations" element={<Conversations />} />
                    {/* Route pour la page Profil */}
                    <Route path="/profil" element={<Profil />} />
                    {/* Route pour la page Settings */}
                    <Route path="/settings" element={<Settings />} />
                    {/* Route pour la page Admin */}
                    <Route path="/admindashboard" element={<AdminDashboard />} />
                    {/* Route pour la page CreatePlaylist */}
                    <Route path="/create-playlist" element={<CreatePlaylist />} />
                    <Route path="/authguard" element={<AuthGuard/>} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;