import { FaStar, FaPlus, FaHeart } from "react-icons/fa";
import { Button } from './ButtonForAlbumCard';

type AlbumCardProps = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  rating?: number;
  year?: number;
  genre?: string;
  onClick?: () => void;
}

export function AlbumCard({
  title,
  artist,
  cover,
  rating,
  year,
  genre,
  onClick,
}: AlbumCardProps) {
  const fallbackImage = "https://via.placeholder.com/500x500?text=No+Image";

  return (
    <div
      className="group relative bg-[#1a1b26] rounded-xl overflow-hidden border border-transparent hover:border-blue-500/50 transition-all duration-300 cursor-pointer w-64"
      onClick={onClick}
    >
      {/* Container de l'image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={cover}
          alt={`${title} par ${artist}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => (e.currentTarget.src = fallbackImage)}
        />

        {/* Overlay qui apparaît au Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex gap-2 items-center">
            {/* Bouton Ajouter style bleu */}
            <Button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white border-none h-10 py-0 flex items-center justify-center gap-2">
              <FaPlus className="text-sm" />
              <span className="font-bold">Add</span>
            </Button>
            
            {/* Bouton Coeur */}
            <button className="bg-[#1a1b26]/80 p-2.5 rounded-lg border border-gray-700 text-white hover:text-red-400 transition-colors">
              <FaHeart size={18} />
            </button>
          </div>
        </div>

        {/* Badge Genre  */}
        {genre && (
          <div className="absolute top-3 right-3 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-lg">
            {genre}
          </div>
        )}
      </div>

      {/* Infos sous l'image */}
      <div className="p-4 space-y-1">
        <h3 className="font-bold text-blue-400 text-lg leading-tight truncate">
          {title}
        </h3>
        <p className="text-gray-400 text-sm truncate font-medium">{artist}</p>

        <div className="flex items-center justify-between mt-3">
          {rating && (
            <div className="flex items-center gap-1.5">
              <FaStar className="text-pink-600 w-4 h-4" />
              <span className="text-white font-bold">{rating.toFixed(1)}</span>
            </div>
          )}
          {year && <span className="text-gray-500 text-sm">{year}</span>}
        </div>
      </div>
    </div>
  );
}