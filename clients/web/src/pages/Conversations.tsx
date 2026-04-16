import React, { useState } from 'react';
import { Search, MoreVertical, Send } from 'lucide-react';

type Conversation = {
  id: number;
  username: string;
  lastMessage: string;
  avatarText: string;
  online: boolean;
  time: string;
}

type Message = {
  id: number;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

const CONVERSATIONS: Conversation[] = [
  { id: 1, username: '@alexdj', lastMessage: 'That album is fire! Have you heard t...', avatarText: 'AL', online: true, time: '10:30' },
  { id: 2, username: '@beatmaster', lastMessage: 'Check out my new list!', avatarText: 'BE', online: true, time: '9:45' },
  { id: 3, username: '@musiclover92', lastMessage: 'Thanks for the recommendation 🎵', avatarText: 'MU', online: false, time: 'Hier' },
  { id: 4, username: '@technohead', lastMessage: 'See you at the festival!', avatarText: 'TE', online: false, time: 'Lundi' },
];

const CHAT_HISTORY: Message[] = [
  { id: 1, sender: 'them', text: 'Hey! Did you listen to the new Neon Dreams album?', time: '10:30' },
  { id: 2, sender: 'me', text: 'Yes! Midnight Pulse is incredible. The production is insane!', time: '10:32' },
  { id: 3, sender: 'them', text: 'Right?! Track 5 is my favorite. The breakdown at 3:20 gives me chills every time.', time: '10:33' },
  { id: 4, sender: 'me', text: 'Same here! I gave it 5 stars. Definitely going in my year-end top 10.', time: '10:34' },
];

const Conversations: React.FC = () => {
  // État stockant l'ID de la conversation actuellement affichée
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);

  // Récupération de la conversation choisie
  const selectedConversation = CONVERSATIONS.find(c => c.id === selectedConvId);

  return (
    // Conteneur principal 
    <div className="flex h-screen bg-[#0f1117] text-slate-200 overflow-hidden font-sans">
      
      {/* Liste des conversations */}
      <aside className={`w-full md:w-80 lg:w-96 border-r border-slate-800 flex flex-col ${selectedConvId ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Titre + barre de recherche des contacts */}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: "'Orbitron', sans-serif" }}>Messages</h1>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher une conversation..." 
              className="w-full bg-[#1a1d26] border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {CONVERSATIONS.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConvId(conv.id)}
              className={`w-full flex items-center gap-4 p-4 transition-all hover:bg-[#1a1d26] ${selectedConvId === conv.id ? 'bg-[#1a1d26] border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#2a2e3d] flex items-center justify-center text-blue-400 font-bold border border-slate-700">{conv.avatarText}</div>
              </div>
              {/* Aperçu du nom et du dernier message reçu */}
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white truncate">{conv.username}</span>
                  <span className="text-[10px] text-slate-500">{conv.time}</span>
                </div>
                <p className="text-xs text-slate-400 truncate">{conv.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Fenêtre de discussion active */}
      <main className={`flex-1 flex flex-col bg-[#0f1117] ${!selectedConvId ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            {/* Header de la discussion affichant le contact actuel */}
            <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#0f1117]/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#2a2e3d] flex items-center justify-center text-blue-400 text-sm font-bold border border-slate-700">{selectedConversation.avatarText}</div>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">{selectedConversation.username}</h2>
                </div>
              </div>
              <button className="p-2 text-slate-500 hover:text-white transition-colors"><MoreVertical size={20} /></button>
            </header>

            {/* Bulles de messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
              {CHAT_HISTORY.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`max-w-[80%] flex flex-col ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    msg.sender === 'me' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-[#1a1d26] text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Barre de saisie pour envoyer un nouveau message */}
            <footer className="p-4 bg-[#0f1117]">
              <div className="flex items-center gap-2 bg-[#1a1d26] border border-slate-800 rounded-xl px-4 py-2 focus-within:border-blue-500/50 transition-all">
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm py-1"
                />
                <button className="text-blue-500 hover:text-blue-400 p-1 transition-transform hover:scale-110"><Send size={18} /></button>
              </div>
            </footer>
          </>
        ) : (
          /* Affichage quand aucune conversation est sélectionnée */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="w-20 h-20 bg-[#1a1d26] rounded-full flex items-center justify-center mb-6 border border-slate-800 shadow-xl">
              <Search size={32} className="text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>Sélectionner une conversation</h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default Conversations;