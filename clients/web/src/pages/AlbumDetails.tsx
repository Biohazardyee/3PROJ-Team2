import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaStar, FaRegClock, FaRegCalendarAlt, FaPlus, 
  FaChevronLeft, FaThumbsUp, FaCommentAlt, FaPaperPlane, FaChevronDown,
  FaCheckCircle, FaHeadphones, FaTimesCircle
} from "react-icons/fa";


const Albums = [
    { id: "1", title: "D&P à vie", artist: "Jul", cover: "https://lh3.googleusercontent.com/WoVLp__R9eynW29Ptfy8RO_H8ZSEegNeuGSPO4m4wmjkdVMou7u_3Fn52rNOfAEbjI4EO74tFnqPwwH81g=w544-h544-l90-rj", rating: 4.9, year: 2025, genre: "Rap", description: "Le nouvel album de l'OVNI marseillais." },
    { id: "2", title: "Destin", artist: "Ninho", cover: "https://lh3.googleusercontent.com/d839QAhSoC58LRIEOZXApz5FIlNKtExVa_AHfQ8wGRI24OU3jmDhBBJIi2sFE-hSLJHRLp0h25di4hXg=w544-h544-l90-rj", rating: 4.6, year: 2019, genre: "Rap", description: "L'album classique qui a confirmé le statut de N.I." },
    { id: "3", title: "BDLM", artist: "Tiakola", cover: "https://yt3.googleusercontent.com/wWRHoBaUQ4cLSIOgtfNLcQFGMHzN_ahh7Bu0vqN6zF3YRrdzUoHhIaBFaRAiQ4uYJ9sHq0IyUj6oKUvAdQ=w544-h544-l90-rj", rating: 4.3, year: 2024, genre: "Rap", description: "Le projet attendu de la mélo de Tiakola." },
    { id: "4", title: "Positions", artist: "Ariana Grande", cover: "https://yt3.googleusercontent.com/2-_pSt_yjP16a7YPYGAHO4g9HLcNYdnXCfH-wXxNxXTGG7XWdJ93xLaHK92JrXGuVtjA86nbogM3Kx9l=w544-h544-l90-rj", rating: 4.1, year: 2020, genre: "Pop", description: "Un mélange parfait de R&B et de Pop." },
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

  // États locaux
  const [activeTab, setActiveTab] = useState('Reviews');
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  
  // États pour le menu déroulant
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("Changer le statut");

  const album = Albums.find((a) => a.id === id);

  if (!album) {
    return (
      <div className="min-h-screen bg-[#0f111a] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Album non trouvé</h1>
          <button onClick={() => navigate('/home')} className="bg-blue-600 px-6 py-2 rounded-lg">Retour</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f111a] text-white font-sans pb-20">
      <main className="max-w-6xl mx-auto px-6 pt-8">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 group transition-colors">
          <FaChevronLeft className="group-hover:-translate-x-1 transition-transform" /> Retour
        </button>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Cover */}
          <div className="w-full md:w-[380px] shrink-0">
            <div className="sticky top-24">
              <img src={album.cover} alt={album.title} className="w-full aspect-square rounded-2xl shadow-2xl border border-gray-800 object-cover" />
            </div>
          </div>

          {/* Infos */}
          <div className="flex-1 flex flex-col gap-8">
            <section>
              <div className="flex gap-2 mb-4">
                <span className="bg-[#FF1E56] text-white text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded">{album.genre}</span>
                <span className="bg-gray-800 text-gray-300 text-[10px] font-bold px-3 py-1 rounded">{album.year}</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-2 italic uppercase">{album.title}</h1>
              <h2 className="text-2xl text-blue-400 font-medium">{album.artist}</h2>
            </section>

            <div className="flex items-center gap-3">
              <FaStar className="text-[#FF1E56] text-2xl" />
              <span className="text-3xl font-bold">{album.rating}</span>
              <span className="text-gray-500 font-medium">(Note des fans)</span>
            </div>

            <div className="flex flex-wrap gap-y-4 gap-x-8 py-6 border-y border-gray-800/50 text-gray-400 text-sm">
              <div className="flex items-center gap-2 text-white"><span className="text-blue-500 font-bold text-lg">12</span> morceaux</div>
              <div className="flex items-center gap-2"><FaRegClock className="text-gray-500" /> 42:15</div>
              <div className="flex items-center gap-2"><FaRegCalendarAlt className="text-gray-500" /> Sorti en {album.year}</div>
            </div>

            {/* Actions et Menu Déroulant */}
            <div className="flex flex-wrap gap-3 items-center">
              <button className="bg-[#1a1b26] border border-gray-700 p-4 rounded-xl hover:bg-gray-800 transition-all text-white">
                <FaPlus />
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="bg-[#1a1b26] border border-gray-700 px-5 py-3.5 rounded-xl hover:bg-gray-800 transition-all text-white flex items-center gap-4 min-w-[220px] justify-between shadow-lg"
                >
                  <span className="text-sm font-bold tracking-wide uppercase">{currentStatus}</span>
                  <FaChevronDown className={`text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} size={12} />
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-full bg-[#1a1b26] border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                      {STATUT_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setCurrentStatus(option.label);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-800 transition-colors text-left border-b border-gray-800 last:border-0"
                        >
                          <span className={`${option.color}`}>{option.icon}</span>
                          <span className="text-sm font-bold text-gray-200 uppercase tracking-tight">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>


            </div>

            <section>
              <h3 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2 w-fit">Description</h3>
              <p className="text-gray-400 leading-relaxed max-w-2xl">{album.description}</p>
            </section>

            {/* Onglets et Commentaires */}
            <div className="mt-4">
              <div className="flex gap-2 mb-8 bg-[#1a1b26] p-1.5 rounded-xl w-fit border border-gray-800">
                {['Commentaires (3)', 'Albums similaires'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab.split(' ')[0])} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.split(' ')[0] ? 'bg-gray-700 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}>{tab}</button>
                ))}
              </div>

              <div className="mb-10 bg-[#1a1b26] p-6 rounded-2xl border border-gray-800">
                <h4 className="text-lg font-bold mb-4 italic">Ecrire un commentaire</h4>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-400 mr-2 font-medium">Note:</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`cursor-pointer transition-colors ${ (hoverRating || userRating) >= star ? 'text-[#FF1E56]' : 'text-gray-700' }`}
                          size={20}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setUserRating(star)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Ecrivez votre avis sur cet album..."
                      className="w-full bg-[#161b2c] border border-gray-800 rounded-xl p-4 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-all min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20">
                      <FaPaperPlane size={12} /> Publier le commentaire
                    </button>
                  </div>
                </div>
              </div>

              {/* Commentaires */}
              <div className="space-y-6">
                <div className="bg-[#161b2c] p-8 rounded-2xl border border-gray-800/50">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-900/30 flex items-center justify-center text-blue-400 font-bold border border-blue-800/50 text-sm">AL</div>
                      <div>
                        <h4 className="font-bold text-gray-100">@alexdj</h4>
                        <p className="text-xs text-gray-500 font-medium">2 weeks ago</p>
                      </div>
                    </div>
                    <div className="flex text-[#FF1E56] gap-0.5">
                      {[...Array(5)].map((_, i) => <FaStar key={i} size={14} />)}
                    </div>
                  </div>
                  <h5 className="text-lg font-bold mb-3 italic tracking-wide uppercase font-sans">Masterclass</h5>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 italic">{album.artist} est un album incroyable.</p>
                  
                  <div className="flex gap-6 text-gray-500 text-sm">
                    <button className="flex items-center gap-2 hover:text-white transition-colors"><FaThumbsUp size={14} /> 42</button>
                    <button className="flex items-center gap-2 hover:text-white transition-colors"><FaCommentAlt size={14} /> 8</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AlbumDetails;