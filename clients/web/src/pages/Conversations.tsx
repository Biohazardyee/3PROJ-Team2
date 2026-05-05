import React, { useState, useRef, useEffect } from 'react';
import { Search, MoreVertical, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Conversation = {
  id: number;
  username: string;
  lastMessage: string;
  avatarText: string;
  time: string;
}

type Message = {
  id: number;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

// Les données initiales passées dans des constantes pour initialiser nos états
const INITIAL_CONVERSATIONS: Conversation[] = [
  { id: 1, username: '@alexdj', lastMessage: 'That album is fire! Have you heard t...', avatarText: 'AL', time: '10:30' },
  { id: 2, username: '@beatmaster', lastMessage: 'Check out my new list!', avatarText: 'BE', time: '9:45' },
  { id: 3, username: '@musiclover92', lastMessage: 'Thanks for the recommendation 🎵', avatarText: 'MU', time: 'Hier' },
  { id: 4, username: '@technohead', lastMessage: 'See you at the festival!', avatarText: 'TE', time: 'Lundi' },
];

// Un dictionnaire contenant l'historique de CHAQUE conversation (lié par l'ID)
const INITIAL_CHAT_HISTORIES: Record<number, Message[]> = {
  1: [
    { id: 1, sender: 'them', text: 'Hey! Did you listen to the new Neon Dreams album?', time: '10:30' },
    { id: 2, sender: 'me', text: 'Yes! Midnight Pulse is incredible. The production is insane!', time: '10:32' },
    { id: 3, sender: 'them', text: 'Right?! Track 5 is my favorite. The breakdown at 3:20 gives me chills every time.', time: '10:33' },
    { id: 4, sender: 'me', text: 'Same here! I gave it 5 stars. Definitely going in my year-end top 10.', time: '10:34' },
  ],
  2: [
    { id: 1, sender: 'them', text: 'Check out my new list!', time: '9:45' }
  ],
  3: [
    { id: 1, sender: 'them', text: 'Thanks for the recommendation 🎵', time: 'Hier' }
  ],
  4: [
    { id: 1, sender: 'them', text: 'See you at the festival!', time: 'Lundi' }
  ]
};

const Conversations: React.FC = () => {
  const { t } = useTranslation();
  // État stockant l'ID de la conversation actuellement affichée
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);

  // Etats pour la messagerie et les messages
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [chatHistories, setChatHistories] = useState<Record<number, Message[]>>(INITIAL_CHAT_HISTORIES);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Récupération de la conversation choisie
  const selectedConversation = conversations.find(c => c.id === selectedConvId);
  
  // Récupération de l'historique de la conversation active
  const currentHistory = selectedConvId ? (chatHistories[selectedConvId] || []) : [];

  // Auto-scroll vers le bas lors de l'envoi d'un message ou changement de conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentHistory]);

  // Filtrer les conversations selon la recherche (nom ou contenu des messages)
  const filteredConversations = conversations.filter(conv => {
    const lowerQuery = searchQuery.toLowerCase();
    const matchUsername = conv.username.toLowerCase().includes(lowerQuery);
    const matchLastMessage = conv.lastMessage.toLowerCase().includes(lowerQuery);
    // Vérifie si la recherche correspond à n'importe quel message à l'intérieur de l'historique
    const matchInsideMessages = chatHistories[conv.id]?.some(msg => msg.text.toLowerCase().includes(lowerQuery));
    
    return matchUsername || matchLastMessage || matchInsideMessages;
  });

  // Fonction pour envoyer le message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConvId) return;

    // Récupération de l'heure actuelle formatée
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg: Message = {
      id: Date.now(),
      sender: 'me',
      text: newMessage.trim(),
      time: timeString,
    };

    // Ajoute le message dans la conversation
    setChatHistories(prev => ({
      ...prev,
      [selectedConvId]: [...(prev[selectedConvId] || []), newMsg]
    }));

    // Met à jour le texte du dernier message affiché dans la barre latérale gauche
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConvId 
        ? { ...conv, lastMessage: newMsg.text, time: timeString } 
        : conv
    ));

    setNewMessage(""); 
  };

  // Helper pour traduire les dates statiques des conversations initiales
  const translateTime = (time: string) => {
    if (time === 'Hier') return t('yesterday');
    if (time === 'Lundi') return t('monday');
    return time;
  };

  return (
    <div className="flex h-screen bg-[#0f1117] dark:bg-slate-50 text-slate-200 dark:text-slate-900 overflow-hidden font-sans transition-colors duration-300">
      
      {/* Liste des conversations */}
      <aside className={`w-full md:w-80 lg:w-96 border-r border-slate-800 dark:border-slate-200 flex flex-col ${selectedConvId ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Titre + barre de recherche des contacts */}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-white dark:text-gray-900 mb-6" style={{ fontFamily: "'Orbitron', sans-serif" }}>{t('messages_title')}</h1>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={t('search_conv_placeholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm dark:text-gray-900 focus:outline-none focus:border-blue-500/50 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedConvId(conv.id)}
              className={`w-full flex items-center gap-4 p-4 transition-all hover:bg-[#1a1d26] dark:hover:bg-slate-100 ${selectedConvId === conv.id ? 'bg-[#1a1d26] dark:bg-slate-100 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#2a2e3d] dark:bg-indigo-100 flex items-center justify-center text-blue-400 dark:text-blue-600 font-bold border border-slate-700 dark:border-indigo-200">{conv.avatarText}</div>
              </div>
              {/* Aperçu du nom et du dernier message reçu */}
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white dark:text-gray-900 truncate">{conv.username}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{translateTime(conv.time)}</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-600 truncate">{conv.lastMessage}</p>
              </div>
            </button>
          ))}
          {/* Message si la recherche ne donne rien */}
          {filteredConversations.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {t('no_conv_found')}
            </div>
          )}
        </div>
      </aside>

      {/* Fenêtre de discussion active */}
      <main className={`flex-1 flex flex-col bg-[#0f1117] dark:bg-white ${!selectedConvId ? 'hidden md:flex' : 'flex'}`}>
        {selectedConversation ? (
          <>
            {/* Header de la discussion affichant le contact actuel */}
            <header className="p-4 border-b border-slate-800 dark:border-slate-200 flex justify-between items-center bg-[#0f1117]/50 dark:bg-white/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedConvId(null)} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-white dark:hover:text-gray-900">
                  {/* Bouton retour pour version mobile */}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#2a2e3d] dark:bg-indigo-100 flex items-center justify-center text-blue-400 dark:text-blue-600 text-sm font-bold border border-slate-700 dark:border-indigo-200">{selectedConversation.avatarText}</div>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white dark:text-gray-900">{selectedConversation.username}</h2>
                </div>
              </div>
              <button className="p-2 text-slate-500 hover:text-white dark:hover:text-gray-900 transition-colors"><MoreVertical size={20} /></button>
            </header>

            {/* Bulles de messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
              {currentHistory.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`max-w-[80%] flex flex-col ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                    msg.sender === 'me' 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                      : 'bg-[#1a1d26] dark:bg-slate-100 text-slate-200 dark:text-gray-800 border border-slate-800 dark:border-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
              {/* Repère pour le scroll automatique */}
              <div ref={messagesEndRef} />
            </div>

            {/* Barre de saisie pour envoyer un nouveau message */}
            <footer className="p-4 bg-[#0f1117] dark:bg-white">
              <div className="flex items-center gap-2 bg-[#1a1d26] dark:bg-slate-100 border border-slate-800 dark:border-slate-200 rounded-xl px-4 py-2 focus-within:border-blue-500/50 transition-all">
                <input 
                  type="text" 
                  placeholder={t('type_message_placeholder')} 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm py-1 dark:text-gray-900"
                />
                <button 
                  onClick={handleSendMessage}
                  className="text-blue-500 hover:text-blue-400 p-1 transition-transform hover:scale-110"
                >
                  <Send size={18} />
                </button>
              </div>
            </footer>
          </>
        ) : (
          /* Affichage quand aucune conversation est sélectionnée */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="w-20 h-20 bg-[#1a1d26] dark:bg-slate-100 rounded-full flex items-center justify-center mb-6 border border-slate-800 dark:border-slate-200 shadow-xl">
              <Search size={32} className="text-slate-600" />
            </div>
            <h2 className="text-2xl font-bold text-white dark:text-gray-900 mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>{t('select_conv_title')}</h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default Conversations;