import { Bell, Menu, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type HeaderProps = {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  // Hook pour gérer la navigation entre les pages
  const navigate = useNavigate();

  return (
    // Centre le logo
    <header className="h-16 bg-[#1C1C28] border-b border-gray-800 flex items-center justify-between px-6 shrink-0 z-20 relative">
      
      {/* Menu burger */}
      <div className="flex items-center z-10">
        <button 
          onClick={onMenuClick} 
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Logo cliquable */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 cursor-pointer group z-10" 
        onClick={() => navigate('/home')}
      >
        {/* Agrandissement au survol logo */}
        <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl">
          <img 
            src="/logo.png"
            alt="Melodia Logo" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        
        {/* Nom de l'application avec un dégradé de texte */}
        <span className="text-2xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500 hidden sm:block">
          Melodia
        </span>
      </div>

      {/* Boutons messages + notifications */}
      <div className="flex items-center gap-6 text-gray-300 z-10">
        
        <button 
          onClick={() => navigate('/conversations')} 
          className="relative hover:text-white transition-colors cursor-pointer"
        >
          <MessageSquare size={22} />
          <span className="absolute -top-1.5 -right-1.5 bg-[#FF1E56] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#1C1C28]">
            2
          </span>
        </button>

        <button 
          onClick={() => navigate('/notifications')} 
          className="relative hover:text-white transition-colors cursor-pointer"
        >
          <Bell size={22} />
          <span className="absolute -top-1.5 -right-1.5 bg-[#FF1E56] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#1C1C28]">
            3
          </span>
        </button>
        
        {/* Avatar du profil utilisateur cliquable */}
        <button 
          onClick={() => navigate('/profil')} 
          className="w-10 h-10 rounded-full bg-[#1A234A] text-indigo-300 flex items-center justify-center font-bold text-sm border-2 border-indigo-500/30 hover:border-indigo-500 transition-colors cursor-pointer"
        >
          MU
        </button>
      </div>
      
    </header>
  );
};

export default Header;