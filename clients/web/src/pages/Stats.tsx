import React, { ReactNode } from 'react';
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

type FilterData = {
  label: string;
  count: number;
  icon: string;
}

type AlbumData = {
  id: string; 
  title: string;
  artist: string;
  genre: string;
  image: string;
  rating: number;
  year: number;
  description: string;
}

const STATS_CARDS: StatCardData[] = [
  {
    id: 'completed',
    label: 'Ecoutés',
    value: 87,
    progress: 70,
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
    label: 'A écouter plus tard',
    value: 12,
    progress: 15,
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
    label: 'Favoris',
    value: 34,
    progress: 35,
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
    label: "Je n'aime pas",
    value: 5,
    progress: 5,
    colorClass: 'text-rose-500',
    bgClass: 'bg-rose-500',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const FILTERS: FilterData[] = [
  { label: 'Ecoutés', count: 87, icon: '✅' },
  { label: 'A écouter plus tard', count: 12, icon: '🎧' },
  { label: 'Favoris', count: 34, icon: '⭐' },
  { label: "Je n'aime pas", count: 5, icon: '❌' },
];

const ALBUMS: AlbumData[] = [
    { id: "1", title: "D&P à vie", artist: "Jul", image: "https://lh3.googleusercontent.com/WoVLp__R9eynW29Ptfy8RO_H8ZSEegNeuGSPO4m4wmjkdVMou7u_3Fn52rNOfAEbjI4EO74tFnqPwwH81g=w544-h544-l90-rj", rating: 4.9, year: 2025, genre: "Rap", description: "Le nouvel album de l'OVNI marseillais." },
    { id: "2", title: "Destin", artist: "Ninho", image: "https://lh3.googleusercontent.com/d839QAhSoC58LRIEOZXApz5FIlNKtExVa_AHfQ8wGRI24OU3jmDhBBJIi2sFE-hSLJHRLp0h25di4hXg=w544-h544-l90-rj", rating: 4.6, year: 2019, genre: "Rap", description: "L'album classique qui a confirmé le statut de N.I." },
    { id: "3", title: "BDLM", artist: "Tiakola", image: "https://yt3.googleusercontent.com/wWRHoBaUQ4cLSIOgtfNLcQFGMHzN_ahh7Bu0vqN6zF3YRrdzUoHhIaBFaRAiQ4uYJ9sHq0IyUj6oKUvAdQ=w544-h544-l90-rj", rating: 4.3, year: 2024, genre: "Rap", description: "Le projet attendu de la mélo de Tiakola." },
    { id: "4", title: "Positions", artist: "Ariana Grande", image: "https://yt3.googleusercontent.com/2-_pSt_yjP16a7YPYGAHO4g9HLcNYdnXCfH-wXxNxXTGG7XWdJ93xLaHK92JrXGuVtjA86nbogM3Kx9l=w544-h544-l90-rj", rating: 4.1, year: 2020, genre: "Pop", description: "Un mélange parfait de R&B et de Pop." },
];

const Stats: React.FC = () => {
  return (
    <div className="p-8 max-w-[2048px] mx-auto w-full space-y-6">
        
        {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Statistiques</h1>
        <p className="text-gray-400 text-lg">Votre collection personnel de musique</p>
      </div>

        {/* Cartes des statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STATS_CARDS.map((stat) => (
            <div key={stat.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className={stat.colorClass}>{stat.icon}</div>
                <div className="text-3xl font-bold">{stat.value}</div>
              </div>
              <div className="text-sm text-slate-400 mb-3">{stat.label}</div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className={`${stat.bgClass} h-full rounded-full`} style={{ width: `${stat.progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Graphique */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-8" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Détail des statistiques
          </h2>
          
          <div className="flex flex-col items-center justify-center">
            {/* Camenbert*/}
            <div className="relative w-64 h-64">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className="text-emerald-400" strokeDasharray="61, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className="text-amber-400" strokeDasharray="24, 100" strokeDashoffset="-63" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className="text-blue-500" strokeDasharray="8, 100" strokeDashoffset="-88" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className="text-rose-500" strokeDasharray="2, 100" strokeDashoffset="-97" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
              {/* Infobulle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium shadow-lg border border-slate-700">
                  Ecoutés  : 87
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap justify-around items-center text-sm font-semibold shadow-sm">
          {FILTERS.map((filter) => (
            <button key={filter.label} className="flex items-center gap-2 hover:text-slate-300 transition-colors">
              <span>{filter.icon}</span> {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* AlbumCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {ALBUMS.map((album) => (
            <AlbumCard 
              key={album.id} 
              id={album.id}
              title={album.title}
              artist={album.artist}
              cover={album.image}
              rating={album.rating}
              year={album.year}
              genre={album.genre}
            />
          ))}
        </div>

    </div>
  );
};

export default Stats;