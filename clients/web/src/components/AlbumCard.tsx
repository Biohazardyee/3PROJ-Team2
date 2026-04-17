import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';

type TrendingCardProps = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  rating: number;
  year: number;
  genre: string;
}

export const AlbumCard : React.FC<TrendingCardProps> = ({ 
  id, title, artist, cover, rating, year, genre 
}) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/album/${id}`)}
      className="bg-[#1C1C28] dark:bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group border border-gray-800 dark:border-gray-200 hover:border-indigo-500/50 dark:hover:border-indigo-400 flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-900 dark:bg-gray-100">
        <img 
          src={cover} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        {/* Genre */}
        <div className="absolute top-3 right-3 bg-[#FF1E56] text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider z-10">
          {genre}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-base text-white dark:text-gray-900 truncate mb-1 group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 dark:text-gray-500 text-xs mb-4">{artist}</p>
        
        {/* Bas de la carte */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1 text-[#FF1E56]">
            <Star size={14} fill="currentColor" />
            <span className="font-bold text-sm text-gray-200 dark:text-gray-700">{rating}</span>
          </div>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">{year}</span>
        </div>
      </div>
    </div>
  );
};