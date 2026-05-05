import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaStar, FaRegClock, FaRegCalendarAlt, FaPlus, 
  FaChevronLeft, FaPaperPlane, FaChevronDown,
  FaCheckCircle, FaHeadphones, FaTimesCircle
} from "react-icons/fa";
import { Send, CornerDownRight, Heart, MessageCircle, MoreVertical, Trash2, Edit3 } from 'lucide-react';

type Reply = {
  id: number;
  user: string;
  text: string;
};

type Comment = {
  id: number;
  user: string;
  title?: string;
  text: string;
  rating: number; 
  likes: number;
  isLiked: boolean;
  replies: Reply[];
};

const Albums = [
    { id: "1", title: "D&P à vie", artist: "Jul", cover: "https://lh3.googleusercontent.com/WoVLp__R9eynW29Ptfy8RO_H8ZSEegNeuGSPO4m4wmjkdVMou7u_3Fn52rNOfAEbjI4EO74tFnqPwwH81g=w544-h544-l90-rj", rating: 4.9, year: 2025, description: "Le nouvel album de l'OVNI marseillais." },
    { id: "2", title: "Destin", artist: "Ninho", cover: "https://lh3.googleusercontent.com/d839QAhSoC58LRIEOZXApz5FIlNKtExVa_AHfQ8wGRI24OU3jmDhBBJIi2sFE-hSLJHRLp0h25di4hXg=w544-h544-l90-rj", rating: 4.6, year: 2019, description: "L'album classique qui a confirmé le statut de N.I." },
    { id: "3", title: "BDLM", artist: "Tiakola", cover: "https://yt3.googleusercontent.com/wWRHoBaUQ4cLSIOgtfNLcQFGMHzN_ahh7Bu0vqN6zF3YRrdzUoHhIaBFaRAiQ4uYJ9sHq0IyUj6oKUvAdQ=w544-h544-l90-rj", rating: 4.3, year: 2024, description: "Le projet attendu de la mélo de Tiakola." },
    { id: "4", title: "Positions", artist: "Ariana Grande", cover: "https://yt3.googleusercontent.com/2-_pSt_yjP16a7YPYGAHO4g9HLcNYdnXCfH-wXxNxXTGG7XWdJ93xLaHK92JrXGuVtjA86nbogM3Kx9l=w544-h544-l90-rj", rating: 4.1, year: 2020, description: "Un mélange parfait de R&B et de Pop." },
];

const STATUT_OPTIONS = [
  { id: 'completed', label: 'Écoutés', icon: <FaCheckCircle />, color: 'text-emerald-400' },
  { id: 'listening', label: 'A écouter plus tard', icon: <FaHeadphones />, color: 'text-blue-500' },
  { id: 'wishlist', label: 'Favoris', icon: <FaStar />, color: 'text-amber-400' },
  { id: 'dropped', label: "Je n'aime pas", icon: <FaTimesCircle />, color: 'text-rose-500' },
];

const AlbumDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // États locaux globaux
  const [activeTab, setActiveTab] = useState('Commentaires'); // Onglet commentaires par défaut
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("Changer le statut");
  
  // État pour la modale d'ajout aux playlists
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  // États pour publier un avis
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentTitle, setCommentTitle] = useState(""); 
  const [commentText, setCommentText] = useState("");

  // États pour modifier un avis
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [editHoverRating, setEditHoverRating] = useState(0);

  // États pour gérer les réponses et les menus
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [replyInputs, setReplyInputs] = useState<{ [key: number]: string }>({});
  const [expandedReplies, setExpandedReplies] = useState<number[]>([]);

  // Simulation d'une base de données d'avis 
  const [commentsList, setCommentsList] = useState<Comment[]>([
    {
      id: 101,
      user: "@alexdj",
      title: "MASTERCLASS",
      text: "Jul est un album incroyable. Une pure masterclass !",
      rating: 5,
      likes: 42,
      isLiked: false,
      replies: [
        { id: 1011, user: "@technofan", text: "Totalement d'accord avec toi !" }
      ]
    }
  ]);

  const album = Albums.find((a) => a.id === id);

  if (!album) {
    return (
      <div className="min-h-screen bg-[#0f111a] dark:bg-slate-50 flex items-center justify-center text-white dark:text-gray-900 transition-colors">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Album non trouvé</h1>
          <button onClick={() => navigate('/home')} className="bg-blue-600 px-6 py-2 rounded-lg text-white">Retour</button>
        </div>
      </div>
    );
  }

  // Permet de trouver l'objet complet du statut actuellement sélectionné
  const selectedStatusOption = STATUT_OPTIONS.find(opt => opt.label === currentStatus);

  // On vérifie si le bouton publier fonctionne 
  const isFormInvalid = userRating === 0 || commentTitle.trim() === "" || commentText.trim() === "";
  
  // On vérifie si le bouton modifier fonctionne
  const isEditInvalid = editRating === 0 || editTitle.trim() === "" || editText.trim() === "";

  // Publier un avis
  const submitMainComment = () => {
    if (isFormInvalid) return;

    const newComment: Comment = {
      id: Date.now(),
      user: "@moi",
      title: commentTitle.trim(), 
      text: commentText.trim(),
      rating: userRating,
      likes: 0,
      isLiked: false,
      replies: []
    };

    setCommentsList([newComment, ...commentsList]); 
    setCommentTitle(""); 
    setCommentText(""); 
    setUserRating(0); 
  };

  // Modifier un avis
  const startEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditTitle(comment.title || "");
    setEditText(comment.text);
    setEditRating(comment.rating);
    setActiveMenuId(null);
  };

  // Annuler la modification
  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditTitle("");
    setEditText("");
    setEditRating(0);
  };

  // Enregistrer la modification
  const saveEdit = (commentId: number) => {
    if (isEditInvalid) return;

    setCommentsList(prevList => prevList.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          title: editTitle.trim(),
          text: editText.trim(),
          rating: editRating
        };
      }
      return comment;
    }));
    cancelEditing(); 
  };

  // Supprimer son propre commentaire
  const deleteComment = (commentId: number) => {
    if(window.confirm("Voulez-vous vraiment supprimer cet avis ?")) {
        setCommentsList(commentsList.filter(c => c.id !== commentId));
        setActiveMenuId(null);
    }
  };

  // Liker un avis
  const toggleLike = (commentId: number) => {
    setCommentsList(prevList => prevList.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
        };
      }
      return comment;
    }));
  };

  // Déplier / Replier les réponses d'un avis
  const toggleReplies = (commentId: number) => {
    setExpandedReplies(prev => 
      prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId]
    );
  };

  // Envoyer une réponse à un avis existant
  const submitReply = (commentId: number) => {
    const text = replyInputs[commentId];
    if (!text || text.trim() === '') return;

    setCommentsList(prevList => prevList.map(comment => {
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
    }));

    setReplyInputs(prev => ({ ...prev, [commentId]: "" }));
    setActiveReplyId(null);
    
    // Déplier automatiquement si on vient de répondre
    if (!expandedReplies.includes(commentId)) {
      setExpandedReplies(prev => [...prev, commentId]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111a] dark:bg-slate-50 text-white dark:text-gray-900 font-sans pb-20 transition-colors duration-300">
      
      {/* Modale d'ajout aux playlists */}
      {isPlaylistModalOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setIsPlaylistModalOpen(false)}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <div className="bg-[#1a1b26] dark:bg-white border border-gray-800 dark:border-gray-200 rounded-2xl p-6 w-full max-w-sm shadow-2xl pointer-events-auto animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold mb-4 text-white dark:text-gray-900">Ajouter à une playlist</h3>
              
              <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-sm text-gray-500 text-center py-4">Aucune playlist disponible.</p>
              </div>

              <div className="space-y-3">
                {/* On envoie l'état à la page /create-playlist */}
                <button 
                  onClick={() => navigate('/create-playlist', { state: { returnTo: `/album/${id}`, albumToAdd: album } })} 
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
                >
                  <FaPlus size={14} /> Créer une playlist
                </button>
                <button 
                  onClick={() => setIsPlaylistModalOpen(false)} 
                  className="w-full py-3 text-gray-400 hover:text-white dark:hover:text-gray-900 font-bold transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <main className="max-w-6xl mx-auto px-6 pt-8">
        
        {/* Bouton retour */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 dark:text-gray-600 hover:text-white dark:hover:text-gray-900 mb-8 group transition-colors">
          <FaChevronLeft className="group-hover:-translate-x-1 transition-transform" /> Retour
        </button>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Cover */}
          <div className="w-full md:w-[380px] shrink-0">
            <div className="sticky top-24">
              <img src={album.cover} alt={album.title} className="w-full aspect-square rounded-2xl shadow-2xl border border-gray-800 dark:border-gray-200 object-cover" />
            </div>
          </div>

          {/* Infos */}
          <div className="flex-1 flex flex-col gap-8">
            <section>
              <div className="flex gap-2 mb-4">
                <span className="bg-gray-800 dark:bg-gray-200 text-gray-300 dark:text-gray-600 text-[10px] font-bold px-3 py-1 rounded">{album.year}</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-2 italic uppercase text-white dark:text-gray-900">{album.title}</h1>
              <h2 className="text-2xl text-blue-400 dark:text-blue-600 font-medium">{album.artist}</h2>
            </section>

            <div className="flex items-center gap-3">
              <FaStar className="text-[#FF1E56] text-2xl" />
              <span className="text-3xl font-bold text-white dark:text-gray-900">{album.rating}</span>
              <span className="text-gray-500 dark:text-gray-400 font-medium">(Note des fans)</span>
            </div>

            <div className="flex flex-wrap gap-y-4 gap-x-8 py-6 border-y border-gray-800/50 dark:border-gray-200 text-gray-400 dark:text-gray-600 text-sm">
              <div className="flex items-center gap-2 text-white dark:text-gray-900"><span className="text-blue-500 dark:text-blue-600 font-bold text-lg">12</span> morceaux</div>
              <div className="flex items-center gap-2"><FaRegClock className="text-gray-500 dark:text-gray-400" /> 42:15</div>
              <div className="flex items-center gap-2"><FaRegCalendarAlt className="text-gray-500 dark:text-gray-400" /> Sorti en {album.year}</div>
            </div>

            {/* Actions et Menu Déroulant */}
            <div className="flex flex-wrap gap-3 items-center">
              <button onClick={() => setIsPlaylistModalOpen(true)} className="bg-[#1a1b26] dark:bg-white border border-gray-700 dark:border-gray-200 p-4 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-50 transition-all text-white dark:text-gray-900">
                <FaPlus />
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-[#1a1b26] dark:bg-white border border-gray-700 dark:border-gray-200 px-5 py-3.5 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-50 transition-all text-white dark:text-gray-900 flex items-center gap-4 min-w-[220px] justify-between shadow-lg"
                >
                  <span className="text-sm font-bold tracking-wide uppercase flex items-center gap-2">
                    {selectedStatusOption && (
                      <span className={selectedStatusOption.color}>{selectedStatusOption.icon}</span>
                    )}
                    {currentStatus}
                  </span>
                  <FaChevronDown className={`text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} size={12} />
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-full bg-[#1a1b26] dark:bg-white border border-gray-800 dark:border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      {STATUT_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => { setCurrentStatus(option.label); setIsDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-left border-b border-gray-800 dark:border-gray-200 last:border-0"
                        >
                          <span className={`${option.color}`}>{option.icon}</span>
                          <span className="text-sm font-bold text-gray-200 dark:text-gray-700 uppercase tracking-tight">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <section>
              <h3 className="text-xl font-bold mb-4 border-b border-gray-800 dark:border-gray-200 pb-2 w-fit text-white dark:text-gray-900">Description</h3>
              <p className="text-gray-400 dark:text-gray-600 leading-relaxed max-w-2xl">{album.description}</p>
            </section>

            {/* Onglets Navigation */}
            <div className="mt-4">
              <div className="flex gap-2 mb-8 bg-[#1a1b26] dark:bg-white p-1.5 rounded-xl w-fit border border-gray-800 dark:border-gray-200 shadow-sm transition-colors">
                {[`Commentaires (${commentsList.length})`, 'Albums similaires'].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab.startsWith('Commentaires') ? 'Commentaires' : 'Albums')} 
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                      (activeTab === 'Commentaires' && tab.startsWith('Commentaires')) || (activeTab === 'Albums' && tab === 'Albums similaires')
                      ? 'bg-gray-700 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md' 
                      : 'text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Onglets commentaires et albums similaires */}
              {activeTab === 'Commentaires' ? (
                <>
                  {/* Formulaire nouvel avis */}
                  <div className="mb-10 bg-[#1a1b26] dark:bg-white p-6 rounded-2xl border border-gray-800 dark:border-gray-200 transition-colors shadow-sm">
                    <h4 className="text-lg font-bold mb-6 italic text-white dark:text-gray-900">Ecrire un commentaire</h4>
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-400 dark:text-gray-500 mr-2 font-medium">Note <span className="text-[#FF1E56]">*</span> :</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                              key={star}
                              className={`cursor-pointer transition-colors ${ (hoverRating || userRating) >= star ? 'text-[#FF1E56]' : 'text-gray-700 dark:text-gray-300' }`}
                              size={20}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setUserRating(star)}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold mb-2 text-gray-200 dark:text-gray-800">
                          Titre <span className="text-[#FF1E56]">*</span>
                        </label>
                        <input
                          type="text"
                          value={commentTitle}
                          onChange={(e) => setCommentTitle(e.target.value)}
                          placeholder="Ex: Masterclass !"
                          className="w-full bg-[#161b2c] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 rounded-xl p-4 text-sm text-gray-200 dark:text-gray-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold mb-2 text-gray-200 dark:text-gray-800">
                          Commentaires <span className="text-[#FF1E56]">*</span>
                        </label>
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Écrivez votre avis sur cet album..."
                          className="w-full bg-[#161b2c] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 rounded-xl p-4 text-sm text-gray-200 dark:text-gray-900 focus:outline-none focus:border-blue-500 transition-all min-h-[100px] resize-none placeholder:text-gray-500"
                        />
                      </div>

                      <div className="flex justify-end mt-2">
                        <button 
                          onClick={submitMainComment}
                          disabled={isFormInvalid}
                          className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg ${
                            isFormInvalid 
                            ? 'bg-gray-600 cursor-not-allowed opacity-50 text-gray-300' 
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                          }`}
                        >
                          <FaPaperPlane size={12} /> Publier le commentaire
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Liste des commentaires et des réponses */}
                  <div className="space-y-6">
                    {commentsList.map(comment => (
                      <div key={comment.id} className="bg-[#161b2c] dark:bg-white p-8 rounded-2xl border border-gray-800/50 dark:border-gray-200 transition-colors shadow-sm relative">
                        
                        {editingCommentId === comment.id ? (
                          /* Modification */
                          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                            <h4 className="text-lg font-bold italic text-white dark:text-gray-900">Modifier votre avis</h4>
                            
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-400 dark:text-gray-500 mr-2 font-medium">Note <span className="text-[#FF1E56]">*</span> :</p>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <FaStar
                                    key={star}
                                    className={`cursor-pointer transition-colors ${ (editHoverRating || editRating) >= star ? 'text-[#FF1E56]' : 'text-gray-700 dark:text-gray-300' }`}
                                    size={20}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setEditHoverRating(0)}
                                    onClick={() => setEditRating(star)}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-bold mb-2 text-gray-200 dark:text-gray-800">
                                Titre <span className="text-[#FF1E56]">*</span>
                              </label>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Ex: Masterclass !"
                                className="w-full bg-[#1a1b26] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 rounded-xl p-4 text-sm text-gray-200 dark:text-gray-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-bold mb-2 text-gray-200 dark:text-gray-800">
                                Commentaires <span className="text-[#FF1E56]">*</span>
                              </label>
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                placeholder="Écrivez votre avis..."
                                className="w-full bg-[#1a1b26] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 rounded-xl p-4 text-sm text-gray-200 dark:text-gray-900 focus:outline-none focus:border-blue-500 transition-all min-h-[100px] resize-none placeholder:text-gray-500"
                              />
                            </div>

                            <div className="flex justify-end gap-3 mt-2">
                              <button 
                                onClick={cancelEditing} 
                                className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white dark:hover:text-gray-900 transition-colors"
                              >
                                Annuler
                              </button>
                              <button 
                                onClick={() => saveEdit(comment.id)}
                                disabled={isEditInvalid}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                                  isEditInvalid 
                                  ? 'bg-gray-600 cursor-not-allowed opacity-50 text-gray-300' 
                                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                }`}
                              >
                                Enregistrer
                              </button>
                            </div>
                          </div>

                        ) : (
                          
                          <>
                            {/* Menu modification ou suppression  */}
                            {comment.user === "@moi" && (
                              <div className="absolute top-6 right-6">
                                  <button 
                                      onClick={() => setActiveMenuId(activeMenuId === comment.id ? null : comment.id)}
                                      className="p-2 text-gray-500 hover:text-white dark:hover:text-gray-900 transition-colors"
                                  >
                                      <MoreVertical size={20} />
                                  </button>

                                  {activeMenuId === comment.id && (
                                      <>
                                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)}></div>
                                        <div className="absolute right-0 mt-2 w-40 bg-[#1a1b26] dark:bg-white border border-gray-800 dark:border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                            <button 
                                                onClick={() => startEditing(comment)}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-left border-b border-gray-800 dark:border-gray-200 text-gray-200 dark:text-gray-900 font-medium"
                                            >
                                                <Edit3 size={14} /> Modifier
                                            </button>
                                            <button 
                                                onClick={() => deleteComment(comment.id)}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors text-left font-medium"
                                            >
                                                <Trash2 size={14} /> Supprimer
                                            </button>
                                        </div>
                                      </>
                                  )}
                              </div>
                            )}

                            <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-900/30 dark:bg-blue-100 flex items-center justify-center text-blue-400 dark:text-blue-600 font-bold border border-blue-800/50 dark:border-blue-200 text-sm">
                                  {comment.user.substring(1, 3).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-100 dark:text-gray-900">{comment.user}</h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Aujourd'hui</p>
                                </div>
                              </div>
                              <div className={`flex text-[#FF1E56] gap-0.5 ${comment.user === "@moi" ? "mr-10" : ""}`}>
                                {[...Array(5)].map((_, i) => (
                                  <FaStar key={i} size={14} className={i < comment.rating ? "text-[#FF1E56]" : "text-gray-700 dark:text-gray-300"} />
                                ))}
                              </div>
                            </div>
                            
                            {comment.title && <h5 className="text-lg font-bold mb-3 italic tracking-wide uppercase font-sans text-white dark:text-gray-900">{comment.title}</h5>}
                            <p className="text-gray-400 dark:text-gray-600 text-sm leading-relaxed mb-6 italic">{comment.text}</p>
                            
                            <div className="flex gap-6 text-gray-500 dark:text-gray-400 text-sm items-center">
                              <button 
                                onClick={() => toggleLike(comment.id)}
                                className={`flex items-center gap-2 transition-colors ${comment.isLiked ? 'text-[#FF1E56] font-bold' : 'hover:text-[#FF1E56] dark:hover:text-[#FF1E56]'}`}
                              >
                                <Heart size={14} className={comment.isLiked ? 'fill-[#FF1E56]' : ''} /> {comment.likes}
                              </button>
                              
                              <button 
                                onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                                className="flex items-center gap-2 hover:text-white dark:hover:text-gray-900 transition-colors"
                              >
                                <MessageCircle size={14} /> {comment.replies.length} Répondre
                              </button>

                              {comment.replies.length > 0 && (
                                <button 
                                  onClick={() => toggleReplies(comment.id)}
                                  className="text-xs text-blue-500 hover:text-blue-400 font-medium ml-auto transition-colors"
                                >
                                  {expandedReplies.includes(comment.id) ? 'Masquer les réponses' : `Voir les réponses (${comment.replies.length})`}
                                </button>
                              )}
                            </div>

                            {/* Champ de réponse */}
                            {activeReplyId === comment.id && (
                              <div className="mt-4 pt-4 border-t border-gray-800/50 dark:border-gray-200 animate-in fade-in duration-200">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 relative">
                                    <input
                                      type="text"
                                      autoFocus
                                      placeholder={`Répondre à ${comment.user}...`}
                                      value={replyInputs[comment.id] || ''}
                                      onChange={(e) => setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })}
                                      onKeyDown={(e) => e.key === 'Enter' && submitReply(comment.id)}
                                      className="w-full bg-[#1a1b26] dark:bg-gray-50 border border-gray-800 dark:border-gray-200 rounded-full py-2 pl-4 pr-10 text-sm text-white dark:text-gray-900 focus:outline-none focus:border-blue-500/50 transition-colors"
                                    />
                                    <button 
                                      onClick={() => submitReply(comment.id)}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors p-1"
                                    >
                                      <Send size={16} />
                                    </button>
                                  </div>
                                  <button onClick={() => setActiveReplyId(null)} className="text-xs text-gray-500 hover:text-white dark:hover:text-gray-900 px-2">
                                    Annuler
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Liste des réponses */}
                            {expandedReplies.includes(comment.id) && comment.replies.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-800/50 dark:border-gray-200 space-y-3 pl-4 animate-in fade-in duration-200">
                                {comment.replies.map(reply => (
                                  <div key={reply.id} className="flex gap-3 bg-[#1a1b26] dark:bg-gray-50 p-3 rounded-lg border border-gray-800/30 dark:border-gray-200">
                                    <CornerDownRight size={14} className="text-gray-600 dark:text-gray-400 mt-1 shrink-0" />
                                    <div className="w-6 h-6 rounded-full bg-blue-900/50 dark:bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-300 dark:text-blue-600 shrink-0">
                                      {reply.user.substring(1, 3).toUpperCase()}
                                    </div>
                                    <div>
                                      <span className="font-bold text-white dark:text-gray-900 text-xs block">{reply.user}</span>
                                      <span className="text-gray-300 dark:text-gray-600 text-sm">{reply.text}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Onglets albums similaires */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 animate-in fade-in duration-300">
                  {Albums.filter(a => a.id !== id).map(sim => (
                    <div key={sim.id} onClick={() => navigate(`/album/${sim.id}`)} className="cursor-pointer group">
                      <div className="overflow-hidden rounded-xl mb-3 border border-gray-800 dark:border-gray-200 shadow-sm aspect-square">
                        <img src={sim.cover} alt={sim.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <h4 className="font-bold text-white dark:text-gray-900 truncate">{sim.title}</h4>
                      <p className="text-sm text-gray-500 truncate">{sim.artist}</p>
                    </div>
                  ))}
                  {Albums.filter(a => a.id !== id).length === 0 && (
                     <p className="col-span-full text-center text-gray-500 py-10">Aucun album similaire trouvé.</p>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AlbumDetails;