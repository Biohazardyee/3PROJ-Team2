import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Home, Library, Bell,
    MessageSquare, User, Settings, LogOut, Music
} from 'lucide-react';

const Navbar: React.FC = () => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 bg-[#13131a] border-b border-gray-800 flex items-center justify-between px-6 z-50">

            {/* 1. Logo à gauche */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Music className="text-white" size={18} />
                </div>
                <span className="text-white font-bold text-xl tracking-tight">
          SUP<span className="text-pink-500">CONTENT</span>
        </span>
            </div>

            {/* 2. Barre de recherche centrale */}
            <div className="grow max-w-2xl mx-8">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search albums, artists, users..."
                        className="w-full bg-white/5 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                    />
                </div>
            </div>

            {/* 3. Actions à droite */}
            <div className="flex items-center gap-2">
                <button onClick={() => navigate('/')} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <Home size={22} />
                </button>
                <button onClick={() => navigate('/library')} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <Library size={22} />
                </button>

                {/* Notifications avec badge */}
                <div className="relative">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <Bell size={22} />
                    </button>
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-pink-600 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-[#13131a]">
            3
          </span>
                </div>

                {/* Messages avec badge */}
                <div className="relative mr-2">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <MessageSquare size={22} />
                    </button>
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-pink-600 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-[#13131a]">
            2
          </span>
                </div>

                {/* 4. Menu Profil */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-transparent hover:border-blue-400 transition-all"
                    >
                        MU
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                            <div className="absolute right-0 mt-3 w-56 bg-[#1a1a24] border border-gray-800 rounded-xl shadow-2xl py-2 z-20">
                                <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                    <User size={18} className="text-gray-500" />
                                    <span className="text-sm font-medium">Profile</span>
                                </button>
                                <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                    <Settings size={18} className="text-gray-500" />
                                    <span className="text-sm font-medium">Settings</span>
                                </button>
                                <div className="h-px bg-gray-800 my-1 mx-2" />
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors">
                                    <LogOut size={18} />
                                    <span className="text-sm font-medium">Logout</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;