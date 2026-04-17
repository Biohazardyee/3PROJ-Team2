import React, { useState } from 'react';
import { Sparkles, Users, TrendingUp, Star, Heart, MessageCircle, Search, Send, CornerDownRight } from 'lucide-react';

type Reply = {
  id: number;
  user: string;
  text: string;
};

type Comment = {
  id: number;
  user: string;
  text: string;
  replies: Reply[];
};

type FeedItem = {
  id: number;
  user: { handle: string; initials: string; color: string };
  action: string;
  timeAgo: string;
  album: { title: string; artist: string; rating: number; cover: string };
  content: string;
  likes: number;
  isLiked: boolean;
  commentsList: Comment[];
};

const Feed: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [feedItems, setFeedItems] = useState<FeedItem[]>([
    {
      id: 1,
      user: { handle: "@alexdj", initials: "AL", color: "bg-indigo-900/50 text-indigo-400 dark:bg-indigo-100 dark:text-indigo-600" },
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
      isLiked: false,
      commentsList: [
        { 
          id: 101, 
          user: "@technofan", 
          text: "Totalement d'accord, masterclass !", 
          replies: [{ id: 1011, user: "@vinyljunkie", text: "Je confirme, la prod est dingue." }] 
        }
      ]
    },
    {
      id: 2,
      user: { handle: "@beatmaster", initials: "BE", color: "bg-blue-900/50 text-blue-400 dark:bg-blue-100 dark:text-blue-600" },
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
      isLiked: true,
      commentsList: [
        { id: 201, user: "@vinyljunkie", text: "J'adore ce style rétro.", replies: [] },
        { id: 202, user: "@musiclover92", text: "Il me le faut en physique !", replies: [] }
      ]
    }
  ]);

  // États pour les commentaires principaux
  const [openComments, setOpenComments] = useState<number[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});

  // États pour les réponses aux commentaires
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyInputs, setReplyInputs] = useState<{ [key: number]: string }>({});
  
  // Etat pour savoir quels commentaires ont leurs réponses dépliées
  const [expandedReplies, setExpandedReplies] = useState<number[]>([]);

  const toggleLike = (postId: number) => {
    setFeedItems(prevItems => prevItems.map(item => {
      if (item.id === postId) {
        return {
          ...item,
          isLiked: !item.isLiked,
          likes: item.isLiked ? item.likes - 1 : item.likes + 1
        };
      }
      return item;
    }));
  };

  const toggleCommentSection = (postId: number) => {
    setOpenComments(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  // Fonction Déplier / Replier les réponses d'un commentaire
  const toggleReplies = (commentId: number) => {
    setExpandedReplies(prev => 
      prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId]
    );
  };

  const submitComment = (postId: number) => {
    const text = commentInputs[postId];
    if (!text || text.trim() === '') return;

    setFeedItems(prevItems => prevItems.map(item => {
      if (item.id === postId) {
        return {
          ...item,
          commentsList: [...item.commentsList, {
            id: Date.now(), 
            user: "@moi", 
            text: text.trim(),
            replies: []
          }]
        };
      }
      return item;
    }));
    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

  const submitReply = (postId: number, commentId: number) => {
    const text = replyInputs[commentId];
    if (!text || text.trim() === '') return;

    setFeedItems(prevItems => prevItems.map(item => {
      if (item.id === postId) {
        return {
          ...item,
          commentsList: item.commentsList.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), {
                  id: Date.now(),
                  user: "@moi",
                  text: text.trim()
                }]
              };
            }
            return comment;
          })
        };
      }
      return item;
    }));

    setReplyInputs(prev => ({ ...prev, [commentId]: "" }));
    setActiveReplyId(null);
    
    // Ouvre automatiquement les réponses si on vient d'en publier une
    if (!expandedReplies.includes(commentId)) {
      setExpandedReplies(prev => [...prev, commentId]);
    }
  };

  return (
    <div className="p-8 max-w-[2048px] mx-auto w-full font-sans min-h-screen bg-transparent dark:bg-slate-50 text-white dark:text-gray-900 transition-colors duration-300">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white dark:text-gray-900">Votre fil</h1>
        <p className="text-gray-400 dark:text-gray-600 text-lg">Restez informé(e) des tendances musicales de la communauté.</p>
      </div>

      {/* Barre de recherche */}
      <div className="relative mb-8 max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-500" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un utilisateur (ex: @alexdj)..."
          className="w-full bg-[#1C1C28] dark:bg-white text-white dark:text-gray-900 text-sm rounded-xl py-3.5 pl-11 pr-4 border border-gray-800 dark:border-gray-200 outline-none transition-all shadow-lg"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#FF1E56] transition-colors">
            Effacer
          </button>
        )}
      </div>

      {/* Barre de navigation */}
      <div className="flex bg-[#1C1C28] dark:bg-white rounded-xl p-1 mb-8 border border-gray-800 dark:border-gray-200 shadow-sm">
        {['all', 'following', 'trending'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all ${
              activeTab === tab 
                ? 'bg-[#2A2A38] dark:bg-gray-100 text-white dark:text-gray-900 shadow' 
                : 'text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900'
            }`}
          >
            {tab === 'all' && <Sparkles size={18} />}
            {tab === 'following' && <Users size={18} />}
            {tab === 'trending' && <TrendingUp size={18} />}
            {tab === 'all' ? 'Activités' : tab === 'following' ? 'Suivis' : 'Découverte'}
          </button>
        ))}
      </div>

      {/* Affichage des publications */}
      <div className="space-y-6 pb-10">
        {feedItems.map((item) => (
          <div key={item.id} className="bg-[#1C1C28] dark:bg-white rounded-xl p-6 border border-gray-800 dark:border-gray-200 shadow-sm transition-colors">
            
            {/* Avatar, nom et temps */}
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${item.user.color}`}>
                {item.user.initials}
              </div>
              <div>
                <p className="text-white dark:text-gray-900 font-bold">
                  {item.user.handle} <span className="text-gray-400 dark:text-gray-500 font-normal text-sm">{item.action}</span>
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{item.timeAgo}</p>
              </div>
            </div>

            {/* Album */}
            <div className="flex items-center gap-5 mb-5 bg-[#13131A] dark:bg-gray-50 p-4 rounded-xl border border-gray-800/50 dark:border-gray-200 w-fit pr-8 transition-colors">
              <img src={item.album.cover} alt={item.album.title} className="w-20 h-20 rounded-md object-cover shadow-md" />
              <div>
                <h3 className="font-bold text-lg text-white dark:text-gray-900 mb-1">{item.album.title}</h3>
                <p className="text-gray-400 dark:text-gray-600 text-sm mb-2">{item.album.artist}</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < item.album.rating ? "text-[#FF1E56] fill-[#FF1E56]" : "text-gray-600 dark:text-gray-300"} />
                  ))}
                </div>
              </div>
            </div>

            {/* Texte avis utilisateur */}
            <p className="text-gray-200 dark:text-gray-700 leading-relaxed text-[15px] mb-6">{item.content}</p>
            <div className="h-px w-full bg-gray-800 dark:bg-gray-200 mb-4"></div>

            {/* Boutons Like et Commentaires */}
            <div className="flex items-center gap-6">
              <button 
                onClick={() => toggleLike(item.id)}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                  item.isLiked ? 'text-[#FF1E56]' : 'text-gray-400 dark:text-gray-500 hover:text-[#FF1E56]'
                }`}
              >
                <Heart size={18} className={item.isLiked ? 'fill-[#FF1E56]' : ''} />
                {item.likes}
              </button>
              
              <button 
                onClick={() => toggleCommentSection(item.id)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900 transition-colors"
              >
                <MessageCircle size={18} />
                {item.commentsList.length}
              </button>
            </div>

            {/* Espace commentaires */}
            {openComments.includes(item.id) && (
              <div className="mt-6 pt-4 border-t border-gray-800/50 dark:border-gray-200 animate-in fade-in duration-200">
                
                {/* Liste des commentaires existants */}
                <div className="space-y-4 mb-4">
                  {item.commentsList.map(comment => (
                    <div key={comment.id} className="flex flex-col gap-2">
                      
                      {/* Commentaire principal */}
                      <div className="flex gap-3 bg-[#13131A] dark:bg-gray-50 p-3 rounded-lg border border-gray-800/50 dark:border-gray-200 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-slate-800 dark:bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-300 dark:text-slate-600 shrink-0">
                          {comment.user.substring(1, 3).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-white dark:text-gray-900 text-sm block">{comment.user}</span>
                          <span className="text-gray-300 dark:text-gray-600 text-sm block mb-1">{comment.text}</span>
                          
                          {/* Ligne d'actions sous le commentaire */}
                          <div className="flex items-center gap-4 mt-1">
                            <button 
                              onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                              className="text-xs text-gray-500 hover:text-white dark:hover:text-gray-900 font-medium transition-colors"
                            >
                              Répondre
                            </button>

                            {/* Bouton Voir les réponses */}
                            {comment.replies && comment.replies.length > 0 && (
                              <button 
                                onClick={() => toggleReplies(comment.id)}
                                className="text-xs text-blue-500 hover:text-blue-400 font-medium transition-colors flex items-center gap-1"
                              >
                                {expandedReplies.includes(comment.id) 
                                  ? 'Masquer les réponses' 
                                  : `Voir les réponses (${comment.replies.length})`
                                }
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Sous-commentaires (Réponses) */}
                      {expandedReplies.includes(comment.id) && comment.replies && comment.replies.length > 0 && (
                        <div className="pl-10 space-y-2 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                          {comment.replies.map((reply: Reply) => (
                            <div key={reply.id} className="flex gap-3 bg-[#1C1C28] dark:bg-white p-2.5 rounded-lg border border-gray-800/30 dark:border-gray-200">
                              <CornerDownRight size={14} className="text-gray-600 dark:text-gray-400 mt-1 shrink-0" />
                              <div className="w-6 h-6 rounded-full bg-blue-900/50 dark:bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-300 dark:text-blue-600 shrink-0">
                                {reply.user.substring(1, 3).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-white dark:text-gray-900 text-xs block">{reply.user}</span>
                                <span className="text-gray-300 dark:text-gray-600 text-xs">{reply.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Input pour répondre spécifiquement à CE commentaire */}
                      {activeReplyId === comment.id && (
                        <div className="pl-10 mt-1 flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              autoFocus
                              placeholder={`Répondre à ${comment.user}...`}
                              value={replyInputs[comment.id] || ''}
                              onChange={(e) => setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && submitReply(item.id, comment.id)}
                              className="w-full bg-[#13131A] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 rounded-full py-1.5 pl-3 pr-10 text-xs text-white dark:text-gray-900 focus:outline-none transition-colors"
                            />
                            <button 
                              onClick={() => submitReply(item.id, comment.id)}
                              className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF1E56] transition-colors p-1"
                            >
                              <Send size={12} />
                            </button>
                          </div>
                          <button onClick={() => setActiveReplyId(null)} className="text-xs text-gray-500 hover:text-white dark:hover:text-gray-900">
                            Annuler
                          </button>
                        </div>
                      )}

                    </div>
                  ))}
                </div>

                {/* Input pour répondre à un avis */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    MO
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Commenter cet avis..."
                      value={commentInputs[item.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [item.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && submitComment(item.id)}
                      className="w-full bg-[#13131A] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 rounded-full py-2 pl-4 pr-10 text-sm text-white dark:text-gray-900 focus:outline-none transition-colors"
                    />
                    <button 
                      onClick={() => submitComment(item.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF1E56] transition-colors p-1"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>

              </div>
            )}
            
          </div>
        ))}
      </div>

    </div>
  );
};

export default Feed;