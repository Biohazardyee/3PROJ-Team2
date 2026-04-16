import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { AlbumCard } from '../components/AlbumCard'; 

const Home: React.FC = () => {

  const albumsData = [
    { 
        id: "1",
        title: "D&P à vie",
        artist: "Jul",
        cover: "https://lh3.googleusercontent.com/WoVLp__R9eynW29Ptfy8RO_H8ZSEegNeuGSPO4m4wmjkdVMou7u_3Fn52rNOfAEbjI4EO74tFnqPwwH81g=w544-h544-l90-rj", 
        rating: 4.9, 
        year: 2025, 
        genre: "Rap",
        description: "Le nouvel album de l'OVNI marseillais."
      },
      { 
        id: "2",
        title: "Destin",
        artist: "Ninho",
        cover: "https://lh3.googleusercontent.com/d839QAhSoC58LRIEOZXApz5FIlNKtExVa_AHfQ8wGRI24OU3jmDhBBJIi2sFE-hSLJHRLp0h25di4hXg=w544-h544-l90-rj", 
        rating: 4.6, 
        year: 2019, 
        genre: "Rap",
        description: "L'album classique qui a confirmé le statut de N.I."
      },
      { 
        id: "3",
        title: "BDLM",
        artist: "Tiakola",
        cover: "https://yt3.googleusercontent.com/wWRHoBaUQ4cLSIOgtfNLcQFGMHzN_ahh7Bu0vqN6zF3YRrdzUoHhIaBFaRAiQ4uYJ9sHq0IyUj6oKUvAdQ=w544-h544-l90-rj", 
        rating: 4.3, 
        year: 2024, 
        genre: "Rap",
        description: "Le projet attendu de la mélo de Tiakola."
      },
      { 
        id: "4",
        title: "Positions",
        artist: "Ariana Grande",
        cover: "https://yt3.googleusercontent.com/2-_pSt_yjP16a7YPYGAHO4g9HLcNYdnXCfH-wXxNxXTGG7XWdJ93xLaHK92JrXGuVtjA86nbogM3Kx9l=w544-h544-l90-rj", 
        rating: 4.1, 
        year: 2020, 
        genre: "Pop",
        description: "Un mélange parfait de R&B et de Pop."
      },
    ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      
      {/* Header de la page (Titre et sous-titre) */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Explorer</h1>
        <p className="text-gray-400 text-lg">Découvrez votre prochain album favori</p>
      </div>

      {/* Recherche avancée avec filtres */}
      <div className="bg-[#1C1C28] p-6 rounded-2xl mb-6 shadow-lg border border-gray-800">
        <div className="flex flex-col lg:flex-row gap-6 mb-4">
          
          {/* Champ de saisie pour la recherche */}
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2 text-gray-300">Rechercher</label>
            <div className="flex items-center bg-[#2A2A38] rounded-lg px-4 py-2.5 border border-gray-700 focus-within:border-indigo-500 transition-colors">
              <Search size={18} className="text-gray-400 mr-3" />
              <input type="text" placeholder="Rechercher des albums ou des artistes..." className="bg-transparent text-white outline-none w-full text-sm" />
            </div>
          </div>

          {/* Menu déroulant pour filtrer par genre musical */}
          <div className="w-full lg:w-1/4">
            <label className="block text-sm font-semibold mb-2 text-gray-300">Genre</label>
            <select className="w-full bg-[#2A2A38] text-white border border-gray-700 rounded-lg px-4 py-3 outline-none appearance-none text-sm cursor-pointer">
              <option>Tous les genres</option>
              <option>Techno</option>
              <option>House</option>
            </select>
          </div>

          {/* Menu déroulant pour changer l'ordre d'affichage */}
          <div className="w-full lg:w-1/4">
            <label className="block text-sm font-semibold mb-2 text-gray-300">Trier par</label>
            <select className="w-full bg-[#2A2A38] text-white border border-gray-700 rounded-lg px-4 py-3 outline-none appearance-none text-sm cursor-pointer">
              <option>Les plus populaires</option>
              <option>Dernières sorties</option>
              <option>Les mieux notés</option>
            </select>
          </div>
        </div>

        {/* Bouton pour appliquer les filtres avancés */}
        <button className="flex items-center gap-2 bg-[#2A2A38] border border-gray-700 px-5 py-2.5 rounded-lg hover:bg-[#343446] transition-colors text-sm font-semibold text-gray-300 w-fit">
          <SlidersHorizontal size={16} /> Filtrer
        </button>
      </div>

      {/* Compteur dynamique indiquant le nombre de résultats */}
      <p className="text-gray-400 text-sm mb-6">{albumsData.length} albums trouvés</p>

      {/* Affichage des albums */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
        {albumsData.map((album) => (
          <AlbumCard 
            key={album.id} 
            id={album.id}
            title={album.title}
            artist={album.artist}
            cover={album.cover}
            rating={album.rating}
            year={album.year}
            genre={album.genre}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;