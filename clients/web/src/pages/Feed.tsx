import React, { useState } from 'react';
import { Sparkles, Users, TrendingUp, Star, Heart, MessageCircle,Search } from 'lucide-react';

const Feed: React.FC = () => {
  // État pour savoir quel onglet est sélectionné (Activités, Suivis ou Découverte)
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const feedItems = [
    {
      id: 1,
      user: { handle: "@alexdj", initials: "AL", color: "bg-indigo-900/50 text-indigo-400" },
      action: "a écrit un avis",
      timeAgo: "Il y a 2 heures",
      album: {
        title: "Midnight Pulse",
        artist: "Neon Dreams",
        rating: 5,
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=150"
      },
      content: "An absolute masterpiece of modern techno...",
      likes: 124,
      comments: 32,
      isLiked: false
    },
    {
      id: 2,
      user: { handle: "@beatmaster", initials: "BE", color: "bg-blue-900/50 text-blue-400" },
      action: "a écrit un avis",
      timeAgo: "Il y a 1 jour",
      album: {
        title: "Vinyl Dreams",
        artist: "Retro Beats",
        rating: 5,
        cover: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&q=80&w=150"
      },
      content: "A perfect blend of old-school vibes and modern production...",
      likes: 45,
      comments: 15,
      isLiked: true
    }
  ];

  return (
    <div className="p-8 max-w-[2048px] mx-auto w-full">
      
      {/* Header de la page avec titre et description */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Votre fil</h1>
        <p className="text-gray-400 text-lg">Restez informé(e) des tendances musicales de la communauté.</p>
      </div>

      <div className="relative mb-8 max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-500" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un utilisateur (ex: @alexdj)..."
          className="w-full bg-[#1C1C28] text-white text-sm rounded-xl py-3.5 pl-11 pr-4 border border-gray-800 outline-none focus:border-[#FF1E56] focus:ring-1 focus:ring-[#FF1E56]/20 transition-all shadow-lg"
        />
        {/* Petit indicateur visuel si la recherche est active */}
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Barre de navigation par onglets pour filtrer le contenu */}
      <div className="flex bg-[#1C1C28] rounded-xl p-1 mb-8 border border-gray-800">
        <button 
          onClick={() => setActiveTab('all')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
            activeTab === 'all' ? 'bg-[#2A2A38] text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles size={18} /> Activités
        </button>
        
        <button 
          onClick={() => setActiveTab('following')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
            activeTab === 'following' ? 'bg-[#2A2A38] text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users size={18} /> Suivis
        </button>
        
        <button 
          onClick={() => setActiveTab('trending')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
            activeTab === 'trending' ? 'bg-[#2A2A38] text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp size={18} /> Découverte
        </button>
      </div>

      {/* Affichage des publications */}
      <div className="space-y-6 pb-10">
        {feedItems.map((item) => (
          <div key={item.id} className="bg-[#1C1C28] rounded-xl p-6 border border-gray-800 shadow-sm">
            
            {/* Avatar, nom et temps */}
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${item.user.color}`}>
                {item.user.initials}
              </div>
              <div>
                <p className="text-white font-bold">
                  {item.user.handle} <span className="text-gray-400 font-normal text-sm">{item.action}</span>
                </p>
                <p className="text-gray-500 text-sm">{item.timeAgo}</p>
              </div>
            </div>

            {/* Album */}
            <div className="flex items-center gap-5 mb-5 bg-[#13131A] p-4 rounded-xl border border-gray-800/50 w-fit pr-8">
              <img src={item.album.cover} alt={item.album.title} className="w-20 h-20 rounded-md object-cover shadow-md" />
              <div>
                <h3 className="font-bold text-lg text-white mb-1">{item.album.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{item.album.artist}</p>
                {/* Note */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      className={i < item.album.rating ? "text-[#FF1E56] fill-[#FF1E56]" : "text-gray-600"} 
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Texte avis utilisateur */}
            <p className="text-gray-200 leading-relaxed text-[15px] mb-6">{item.content}</p>

            <div className="h-px w-full bg-gray-800 mb-4"></div>

            {/* Boutons Like et Commentaires */}
            <div className="flex items-center gap-6">
              <button className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                item.isLiked ? 'text-[#FF1E56]' : 'text-gray-400 hover:text-[#FF1E56]'
              }`}>
                <Heart size={18} className={item.isLiked ? 'fill-[#FF1E56]' : ''} />
                {item.likes}
              </button>
              
              <button className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors">
                <MessageCircle size={18} />
                {item.comments}
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default Feed;