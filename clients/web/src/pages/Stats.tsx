import React, { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlbumCard } from '../components/AlbumCard'; 

type StatCardData = {
  id: string;
  label: string;
  value: number;
  progress: number;
  colorClass: string;
  bgClass: string;
  icon: ReactNode;
}

type AlbumData = {
  id: string; 
  title: string;
  artist: string;
  image: string;
  rating: number;
  year: number;
  description: string;
  status: 'completed' | 'listening' | 'wishlist' | 'dropped'; 
}

const Stats: React.FC = () => {
  const { t } = useTranslation();
  
  // Nouvel état pour gérer l'onglet actif (on utilise les ID techniques maintenant)
  const [activeFilter, setActiveFilter] = useState<string>('completed');

  // Statistiques définies dans le composant pour la traduction
  const STATS_CARDS: StatCardData[] = [
    {
      id: 'completed',
      label: t('status_completed'),
      value: 4,
      progress: 40, 
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'listening',
      label: t('status_listening'),
      value: 2,
      progress: 20, 
      colorClass: 'text-blue-500',
      bgClass: 'bg-blue-500',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'wishlist',
      label: t('status_wishlist'),
      value: 3,
      progress: 30, 
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
    },
    {
      id: 'dropped',
      label: t('status_dropped'),
      value: 1,
      progress: 10,
      colorClass: 'text-rose-500',
      bgClass: 'bg-rose-500',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  const FILTERS = [
    { id: 'completed', label: t('status_completed'), count: 4, icon: '✅' },
    { id: 'listening', label: t('status_listening'), count: 2, icon: '🎧' },
    { id: 'wishlist', label: t('status_wishlist'), count: 3, icon: '⭐' },
    { id: 'dropped', label: t('status_dropped'), count: 1, icon: '❌' },
  ];

  const ALBUMS: AlbumData[] = [
      // ECOUTÉS
      { id: "1", title: "Deux frères", artist: "PNL", image: "https://i.scdn.co/image/ab67616d0000b2736c3966c4dd0eb2273696fe16", rating: 4.8, year: 2019, description: "L'album mythique du duo des Tarterêts.", status: 'completed' },
      { id: "2", title: "Future Nostalgia", artist: "Dua Lipa", image: "https://assets.vogue.com/photos/5e332cc5d392da0008ace994/master/w_1600%2Cc_limit/82935618_1015351858835796_6355507249911876416_n.jpg", rating: 4.5, year: 2020, description: "Un retour aux sources disco et pop des années 80.", status: 'completed' },
      { id: "3", title: "Random Access Memories", artist: "Daft Punk", image: "https://cdn-images.dzcdn.net/images/cover/311bba0fc112d15f72c8b5a65f0456c1/1900x1900-000000-80-0-0.jpg", rating: 4.9, year: 2013,  description: "Le dernier chef-d'oeuvre du duo casqué.", status: 'completed' },
      { id: "4", title: "Ipséité", artist: "Damso", image: "https://cdn-images.dzcdn.net/images/cover/79ba3cd515942d1dc62f49f859a374fd/1900x1900-000000-80-0-0.jpg", rating: 4.7, year: 2017,  description: "L'album de la consécration pour Damso.", status: 'completed' },
      
      // FAVORIS
      { id: "5", title: "After Hours", artist: "The Weeknd", image: "https://upload.wikimedia.org/wikipedia/en/c/c1/The_Weeknd_-_After_Hours.png", rating: 4.9, year: 2020, description: "Une ère sombre et cinématographique.", status: 'wishlist' },
      { id: "6", title: "Dans la légende", artist: "PNL", image: "https://cdn-images.dzcdn.net/images/cover/3722b6f876813ecf4bdf75443bf02da1/0x1900-000000-80-0-0.jpg", rating: 5.0, year: 2016,  description: "L'album de diamant en indépendant.", status: 'wishlist' },
      { id: "7", title: "Discovery", artist: "Daft Punk", image: "https://cdn-images.dzcdn.net/images/cover/5718f7c81c27e0b2417e2a4c45224f8a/0x1900-000000-80-0-0.jpg", rating: 5.0, year: 2001,  description: "L'album qui a redéfini la French Touch.", status: 'wishlist' },

      // A ECOUTER PLUS TARD 
      { id: "8", title: "HIT ME HARD AND SOFT", artist: "Billie Eilish", image: "https://m.media-amazon.com/images/I/71dtYuD2+-L._UF894,1000_QL80_.jpg", rating: 0, year: 2024,  description: "Le dernier projet très attendu de Billie Eilish.", status: 'listening' },
      { id: "9", title: "Et si j'échoue ?", artist: "Bouss", image: "https://cdn-images.dzcdn.net/images/cover/d6d506590b758c871cbf1bd58b47a306/1900x1900-000000-80-0-0.jpg", rating: 0, year: 2024,  description: "Le premier projet très attendu du rappeur Bouss.", status: 'listening' },

      // JE N'AIME PAS 
      { id: "10", title: "Honestly, Nevermind", artist: "Drake", image: "https://m.media-amazon.com/images/I/916lmGL5BrL.jpg", rating: 2.5, year: 2022,  description: "Un virage house inattendu qui a beaucoup divisé.", status: "dropped" },
  ];

  // Filtrage de la liste d'albums en fonction de l'onglet cliqué
  const displayedAlbums = ALBUMS.filter(album => album.status === activeFilter);

  return (
    <div className="p-8 max-w-[2048px] mx-auto w-full space-y-6 min-h-screen bg-transparent dark:bg-slate-50 text-white dark:text-gray-900 transition-colors duration-300">
        
        {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white dark:text-gray-900">{t('stats_title')}</h1>
        <p className="text-gray-400 dark:text-gray-600 text-lg">{t('stats_subtitle')}</p>
      </div>

        {/* Cartes des statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STATS_CARDS.map((stat) => (
            <div key={stat.id} className="bg-slate-900 dark:bg-white border border-slate-800 dark:border-gray-200 rounded-xl p-5 shadow-sm transition-colors">
              <div className="flex justify-between items-start mb-6">
                <div className={stat.colorClass}>{stat.icon}</div>
                <div className="text-3xl font-bold text-white dark:text-gray-900">{stat.value}</div>
              </div>
              <div className="text-sm text-slate-400 dark:text-gray-500 mb-3">{stat.label}</div>
              <div className="w-full bg-slate-800 dark:bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className={`${stat.bgClass} h-full rounded-full`} style={{ width: `${stat.progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Graphique */}
        <div className="bg-slate-900 dark:bg-white border border-slate-800 dark:border-gray-200 rounded-xl p-6 shadow-sm transition-colors">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-8 text-white dark:text-gray-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {t('stats_detail_title')}
          </h2>
          
          <div className="flex flex-col items-center justify-center">
            {/* Camembert */}
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path className="text-slate-800 dark:text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                {/* 40% Ecoutés */}
                <path className="text-emerald-400" strokeDasharray="40, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                {/* 30% Favoris  */}
                <path className="text-amber-400" strokeDasharray="30, 100" strokeDashoffset="-40" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                {/* 20% A écouter plus tard */}
                <path className="text-blue-500" strokeDasharray="20, 100" strokeDashoffset="-70" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                {/* 10% Je n'aime pas */}
                <path className="text-rose-500" strokeDasharray="10, 100" strokeDashoffset="-90" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
              
              {/* Icône de musique au centre du camembert */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-slate-800 dark:bg-gray-100 p-4 rounded-full shadow-lg border border-slate-700 dark:border-gray-200 text-blue-500 dark:text-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Légende */}
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm font-medium">
              {STATS_CARDS.map((stat) => (
                <div key={`legend-${stat.id}`} className={`flex items-center gap-2 ${stat.colorClass}`}>
                  <div className={`w-3 h-3 rounded-sm ${stat.bgClass}`}></div> {stat.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Barre de filtres */}
        <div className="flex flex-col sm:flex-row flex-wrap bg-slate-900 dark:bg-white rounded-xl p-1 border border-slate-800 dark:border-gray-200 shadow-sm transition-colors mb-6">
          {FILTERS.map((filter) => (
            <button 
              key={filter.id} 
              onClick={() => setActiveFilter(filter.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-lg font-semibold text-sm transition-all ${
                activeFilter === filter.id
                  ? 'bg-slate-800 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md'
                  : 'text-slate-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900 hover:bg-slate-800/50 dark:hover:bg-gray-50'
              }`}
            >
              <span>{filter.icon}</span> 
              <span>{filter.label}</span> 
              <span className="opacity-75">({filter.count})</span>
            </button>
          ))}
        </div>

        {/* AlbumCard dynamique */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedAlbums.map((album) => (
            <AlbumCard 
              key={album.id} 
              id={album.id}
              title={album.title}
              artist={album.artist}
              cover={album.image}
              rating={album.rating}
              year={album.year}
            />
          ))}
        </div>
        
        {/* Message affiché si une catégorie est vide */}
        {displayedAlbums.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {t('no_album_category')}
          </div>
        )}

    </div>
  );
};

export default Stats;