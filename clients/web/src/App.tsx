import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import Layout from "./components/Layout";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import AlbumDetails from "./pages/AlbumDetails";
import Stats from "./pages/Stats";
import Library from "./pages/Library";
import Notifications from "./pages/Notifications";
import Conversations from "./pages/Conversations";
import Profil from "./pages/Profil";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import CreatePlaylist from "./pages/CreatePlaylist";
import ScrollToTop from "./components/ScrollToTop";
import AuthGuard from "./components/AuthGuard";
import AuthRequired from "./pages/AuthRequired.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* ROUTES PUBLIQUES (SANS BARRE DE NAVIGATION) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* ROUTES AVEC LAYOUT */}
        <Route element={<Layout />}>
          {/* Page accessible même sans connexion (ex: pour voir le message d'erreur) */}
          <Route path="/auth-required" element={<AuthRequired />} />
          <Route path="/home" element={<Home />} />

          {/* --- DEBUT DES ROUTES PROTEGÉES --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/album/:id" element={<AlbumDetails />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/library" element={<Library />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/profil/:id?" element={<Profil />} />{" "}
            <Route path="/settings" element={<Settings />} />
            <Route path="/admindashboard" element={<AdminDashboard />} />
            <Route path="/create-playlist" element={<CreatePlaylist />} />
            <Route path="/authguard" element={<AuthGuard />} />
          </Route>
          {/* --- FIN DES ROUTES PROTEGÉES --- */}
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
