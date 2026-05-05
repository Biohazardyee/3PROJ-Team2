import React, { useState } from 'react';
import { MapPin, Link as LinkIcon, Calendar, Settings, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type Album = {
  id: number;
  title: string;
  artist: string;
  year: number;
  rating: number;
  genre: string;
  image: string;
}

const FAVORITE_ALBUMS: Album[] = [
  {
    id: 1,
    title: 'Midnight Pulse',
    artist: 'Neon Dreams',
    year: 2024,
    rating: 4.8,
    genre: 'Techno',
    image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500',
  },
  {
    id: 2,
    title: 'Vinyl Dreams',
    artist: 'Retro Beats',
    year: 2023,
    rating: 4.9,
    genre: 'Electro',
    image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=500',
  },
  {
    id: 3,
    title: 'Synth Wave',
    artist: 'Electric Sky',
    year: 2022,
    rating: 4.5,
    genre: 'Synthwave',
    image: 'https://images.unsplash.com/photo-1514525253361-bee8a187499b?q=80&w=500',
  },
];

const AlbumCard: React.FC<Album> = ({ title, artist, year, rating, genre, image }) => (
  <div className="bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-gray-200 rounded-xl overflow-hidden group hover:border-slate-700 dark:hover:border-gray-300 transition-all shadow-sm">
    {/* Image & Badge */}
    <div className="relative aspect-square overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <span className="absolute top-3 right-3 bg-[#e91e63] text-white text-[10px] font-bold px-2 py-1 rounded-md">
        {genre}
      </span>
    </div>
    
    {/* Info */}
    <div className="p-4">
      <h3 className="font-bold text-white dark:text-gray-900 truncate text-lg leading-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        {title}
      </h3>
      <p className="text-slate-400 dark:text-gray-600 text-sm mb-3">{artist}</p>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 text-[#e91e63]">
          <Star size={14} fill="currentColor" />
          <span className="text-sm font-bold text-slate-200 dark:text-gray-700">{rating}</span>
        </div>
        <span className="text-slate-500 dark:text-gray-400 text-xs font-medium">{year}</span>
      </div>
    </div>
  </div>
);

const Profil: React.FC = () => {
  const navigate = useNavigate(); 
  const { t } = useTranslation();
  
  // Utilisation des clés techniques pour l'état actif
  const [activeTab, setActiveTab] = useState('favorites');

  const tabs = [
    { id: 'favorites', label: t('tab_favorite_albums') },
    { id: 'playlists', label: `${t('tab_playlists')} (3)` },
    { id: 'activity', label: t('tab_recent_activity') },
    { id: 'stats', label: t('tab_stats') }
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] dark:bg-slate-50 text-slate-200 dark:text-gray-900 font-sans transition-colors duration-300">
      
      {/* Header */}
      <div className="relative">
        {/* Banniere */}
        <div className="h-48 md:h-64 w-full bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 opacity-30 pointer-events-none bg-[radial-gradient(circle_at_20%_30%,#ffffff_1px,transparent_1px),radial-gradient(circle_at_50%_70%,#ffffff_1px,transparent_1px),radial-gradient(circle_at_80%_40%,#ffffff_1px,transparent_1px)] bg-[length:40px_40px]"></div>
        </div>

        {/* Zone des infos du profil */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative -mt-12 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-blue-500 border-[6px] border-[#0f1117] dark:border-slate-50 flex items-center justify-center text-white text-4xl font-bold shadow-xl z-10 transition-colors">
                MU
              </div>
              
              {/* Pseudo */}
              <div className="pb-2">
                <h1 className="text-4xl font-bold text-white dark:text-gray-900 tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  Music Lover
                </h1>
                <p className="text-slate-400 dark:text-gray-600 font-medium">@musiclover</p>
              </div>
            </div>

            {/* Bouton modifier avec redirection vers settings */}
            <button 
              onClick={() => navigate('/settings')} 
              className="flex items-center gap-2 bg-slate-800/80 dark:bg-white hover:bg-slate-700 dark:hover:bg-gray-100 text-slate-100 dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-slate-700 dark:border-gray-200 self-start md:self-end mb-2 shadow-sm"
            >
              <Settings size={16} />
              {t('profile_edit_btn')}
            </button>
          </div>

          {/* Bio */}
          <div className="max-w-2xl space-y-4">
            <p className="text-slate-200 dark:text-gray-700 leading-relaxed text-lg">
              {t('profile_bio')}
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-400 dark:text-gray-500 text-sm">
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-slate-500 dark:text-gray-400" />
                {t('profile_location')}
              </div>
              <div className="flex items-center gap-1.5">
                <LinkIcon size={16} className="text-slate-500 dark:text-gray-400" />
                <a href="#" className="text-blue-400 dark:text-blue-600 hover:underline">musiclover.com</a>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={16} className="text-slate-500 dark:text-gray-400" />
                {t('profile_member_since')}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-2">
              <div className="flex items-center gap-1.5">
                <span className="text-white dark:text-gray-900 font-bold text-lg">1247</span>
                <span className="text-slate-500 dark:text-gray-500 text-sm">{t('profile_followers')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-white dark:text-gray-900 font-bold text-lg">342</span>
                <span className="text-slate-500 dark:text-gray-500 text-sm">{t('profile_following')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-white dark:text-gray-900 font-bold text-lg">138</span>
                <span className="text-slate-500 dark:text-gray-500 text-sm">{t('profile_albums')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="bg-slate-900/50 dark:bg-white border border-slate-800 dark:border-gray-200 p-1 rounded-xl flex items-center justify-between shadow-inner transition-colors">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                activeTab === tab.id 
                ? 'bg-slate-800 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md' 
                : 'text-slate-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900 hover:bg-slate-800/40 dark:hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Albums favoris */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {FAVORITE_ALBUMS.map((album) => (
              <AlbumCard key={album.id} {...album} />
            ))}
          </div>
        )}
      </main>

    </div>
  );
};

export default Profil;