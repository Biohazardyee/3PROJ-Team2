import React from "react";
import {NavigateFunction, useNavigate} from "react-router-dom";
import { Star } from "lucide-react";

const PLACEHOLDER_IMAGE = "/melodia_placeholder.png";

type TrendingCardProps = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  rating: number;
  genre?: string;
};

export const AlbumCard: React.FC<TrendingCardProps> = ({
  id,
  title,
  artist,
  cover,
  rating,
}) => {
  const navigate: NavigateFunction = useNavigate();

  return (
    <div
      onClick={() => navigate(`/album/${id}`)}
      className="bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-gray-200 rounded-xl overflow-hidden group hover:border-slate-700 dark:hover:border-gray-300 transition-all shadow-sm cursor-pointer"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-900 dark:bg-gray-100">
        <img
          src={cover || PLACEHOLDER_IMAGE}
          alt={title}
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src !== window.location.origin + PLACEHOLDER_IMAGE) {
              img.src = PLACEHOLDER_IMAGE;
            }
          }}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <div className="p-4 flex flex-col grow">
        <h3 className="font-bold text-base text-white dark:text-gray-900 truncate mb-1 group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 dark:text-gray-500 text-xs mb-4">
          {artist}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1 text-[#FF1E56]">
            <Star size={14} fill="currentColor" />
            <span className="font-bold text-sm text-gray-200 dark:text-gray-700">
              {rating}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
