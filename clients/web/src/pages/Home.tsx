import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AlbumCard } from '../components/AlbumCard'; 

const Home: React.FC = () => {
  const { t } = useTranslation();

  const albumsData = [
    { 
        id: "1",
        title: "D&P à vie",
        artist: "Jul",
        cover: "https://lh3.googleusercontent.com/WoVLp__R9eynW29Ptfy8RO_H8ZSEegNeuGSPO4m4wmjkdVMou7u_3Fn52rNOfAEbjI4EO74tFnqPwwH81g=w544-h544-l90-rj", 
        rating: 4.9, 
        year: 2025, 
        description: "Le nouvel album de l'OVNI marseillais."
      },
      { 
        id: "2",
        title: "Destin",
        artist: "Ninho",
        cover: "https://lh3.googleusercontent.com/d839QAhSoC58LRIEOZXApz5FIlNKtExVa_AHfQ8wGRI24OU3jmDhBBJIi2sFE-hSLJHRLp0h25di4hXg=w544-h544-l90-rj", 
        rating: 4.6, 
        year: 2019, 
        description: "L'album classique qui a confirmé le statut de N.I."
      },
      { 
        id: "3",
        title: "BDLM",
        artist: "Tiakola",
        cover: "https://yt3.googleusercontent.com/wWRHoBaUQ4cLSIOgtfNLcQFGMHzN_ahh7Bu0vqN6zF3YRrdzUoHhIaBFaRAiQ4uYJ9sHq0IyUj6oKUvAdQ=w544-h544-l90-rj", 
        rating: 4.3, 
        year: 2024, 
        description: "Le projet attendu de la mélo de Tiakola."
      },
      { 
        id: "4",
        title: "Positions",
        artist: "Ariana Grande",
        cover: "https://yt3.googleusercontent.com/2-_pSt_yjP16a7YPYGAHO4g9HLcNYdnXCfH-wXxNxXTGG7XWdJ93xLaHK92JrXGuVtjA86nbogM3Kx9l=w544-h544-l90-rj", 
        rating: 4.1, 
        year: 2020, 
        description: "Un mélange parfait de R&B et de Pop."
      },
    ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full min-h-screen bg-transparent dark:bg-slate-50 text-white dark:text-gray-900 transition-colors duration-300">
      
      {/* Header de la page (Titre et sous-titre) */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-white dark:text-gray-900">{t('explore_title')}</h1>
        <p className="text-gray-400 dark:text-gray-600 text-lg">{t('explore_subtitle')}</p>
      </div>

      {/* Recherche avancée avec filtres */}
      <div className="bg-[#1C1C28] dark:bg-white p-6 rounded-2xl mb-6 shadow-lg border border-gray-800 dark:border-gray-200 transition-colors">
        <div className="flex flex-col lg:flex-row gap-6 mb-4">
          
          {/* Champ de saisie pour la recherche */}
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2 text-gray-300 dark:text-gray-600">{t('search_label')}</label>
            <div className="flex items-center bg-[#2A2A38] dark:bg-gray-100 rounded-lg px-4 py-2.5 border border-gray-700 dark:border-gray-200 focus-within:border-indigo-500 transition-colors">
              <Search size={18} className="text-gray-400" />
              <input type="text" placeholder={t('search_placeholder')} className="bg-transparent text-white dark:text-gray-900 outline-none w-full text-sm placeholder-gray-500 ml-3" />
            </div>
          </div>

          {/* Menu déroulant pour changer l'ordre d'affichage */}
          <div className="w-full lg:w-1/4">
            <label className="block text-sm font-semibold mb-2 text-gray-300 dark:text-gray-600">{t('sort_label')}</label>
            <select className="w-full bg-[#2A2A38] dark:bg-gray-100 text-white dark:text-gray-900 border border-gray-700 dark:border-gray-200 rounded-lg px-4 py-3 outline-none appearance-none text-sm cursor-pointer focus:border-indigo-500 transition-colors">
              <option className="bg-[#2A2A38] dark:bg-white">{t('sort_popular')}</option>
              <option className="bg-[#2A2A38] dark:bg-white">{t('sort_recent')}</option>
              <option className="bg-[#2A2A38] dark:bg-white">{t('sort_rating')}</option>
            </select>
          </div>
        </div>

        {/* Bouton pour appliquer les filtres avancés */}
        <button className="flex items-center gap-2 bg-[#2A2A38] dark:bg-gray-100 border border-gray-700 dark:border-gray-200 px-5 py-2.5 rounded-lg hover:bg-[#343446] dark:hover:bg-gray-200 transition-colors text-sm font-semibold text-gray-300 dark:text-gray-600 w-fit">
          <SlidersHorizontal size={16} /> {t('filter_btn')}
        </button>
      </div>

      {/* Compteur dynamique indiquant le nombre de résultats */}
      <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
        {albumsData.length > 1 
          ? t('results_count_plural', { count: albumsData.length }) 
          : t('results_count', { count: albumsData.length })
        }
      </p>

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
          />
        ))}
      </div>
    </div>
  );
};

export default Home;