import React, {useEffect} from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useNavigate, NavigateFunction,
} from "react-router-dom";
import {LandingPage} from "./pages/LandingPage";
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
import Shop from "./pages/Shop";
import ScrollToTop from "./components/ScrollToTop";
import ThemeGuard from "./components/ThemeGuard";
import AuthGuard from "./components/AuthGuard";
import AuthRequired from "./pages/AuthRequired.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AdminRoute from "./components/AdminRoute.tsx"; // ✅ 1. Importation du nouveau guard admin
import AuthCallback from "./pages/AuthCallback.tsx";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AuthRedirectListener: React.FC = (): null => {
    const navigate: NavigateFunction = useNavigate();

    useEffect(() => {
        const handleUnauthorized = (): void => {
            navigate("/auth-required");
        };
        window.addEventListener("unauthorized", handleUnauthorized);
        return () => window.removeEventListener("unauthorized", handleUnauthorized);
    }, [navigate]);

    return null;
};

const App: React.FC = () => {
    return (
        <Router>
            <AuthRedirectListener></AuthRedirectListener>
            <ThemeGuard/>
            <ScrollToTop/>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                theme="colored"
            />
            <Routes>
                {/* ROUTES PUBLIQUES (SANS BARRE DE NAVIGATION) */}
                <Route path="/" element={<LandingPage/>}/>
                <Route path="/register" element={<Register/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/auth/callback" element={<AuthCallback/>}/>
                <Route path="/album/:id" element={<AlbumDetails/>}/>

                {/* ROUTES AVEC LAYOUT */}
                <Route element={<Layout/>}>
                    {/* Page accessible même sans connexion (ex: pour voir le message d'erreur) */}
                    <Route path="/auth-required" element={<AuthRequired/>}/>
                    <Route path="/home" element={<Home/>}/>

                    {/* --- DEBUT DES ROUTES PROTEGÉES (Utilisateurs connectés) --- */}
                    <Route element={<ProtectedRoute/>}>
                        <Route path="/feed" element={<Feed/>}/>
                        <Route path="/stats" element={<Stats/>}/>
                        <Route path="/library" element={<Library/>}/>
                        <Route path="/notifications" element={<Notifications/>}/>
                        <Route path="/conversations" element={<Conversations/>}/>
                        <Route path="/profil/:id?" element={<Profil/>}/>{" "}
                        <Route path="/settings" element={<Settings/>}/>
                        <Route path="/shop" element={<Shop/>}/>
                        <Route path="/create-playlist" element={<CreatePlaylist/>}/>
                        <Route path="/authguard" element={<AuthGuard/>}/>

                        {/* --- ROUTES RÉSERVÉES UNIQUEMENT AUX ADMINS --- */}
                        <Route element={<AdminRoute />}>
                            <Route path="/admindashboard" element={<AdminDashboard/>}/>
                        </Route>
                    </Route>
                    {/* --- FIN DES ROUTES PROTEGÉES --- */}
                </Route>
            </Routes>
        </Router>
    );
};

export default App;