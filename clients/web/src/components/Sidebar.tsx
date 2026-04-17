import { 
  Home as HomeIcon, Library, Rocket, BarChart2, 
  Shield, Settings, X, Sun, Moon 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDarkMode } from '../useDarkMode';

type SidebarProps = {
  isOpen: boolean; 
  onClose: () => void; 
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate(); 
  const location = useLocation(); 
  const { theme, toggleTheme } = useDarkMode();

  // Liste des chemins des pages pour accéder à leur contenu
  const navItems = [
    { name: 'Accueil', icon: HomeIcon, path: '/home' },
    { name: 'Votre fil', icon: Rocket, path: '/feed' },
    { name: 'Statistiques', icon: BarChart2, path: '/stats' },
    { name: 'Mes playlists', icon: Library, path: '/library' },
  ];

  // Gère le clic sur un lien, navigue vers la page et ferme la sidebar
  const handleNavigation = (path: string) => {
    navigate(path);
    onClose(); 
  };

  return (
    <>
      {/* Arrière-plan sombre cliquable pour fermer le menu */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Structure menu latéral */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 z-40 transform transition-all duration-300 flex flex-col
          bg-[#1C1C28] border-r border-gray-800 
          dark:bg-white dark:border-gray-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header du menu avec titre + bouton de fermeture */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 dark:border-gray-200">
          <span className="text-xl font-bold text-white dark:text-gray-900 tracking-widest">MENU</span>
          <button onClick={onClose} className="text-gray-400 hover:text-white dark:hover:text-gray-900 transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 mt-2 overflow-y-auto flex-1">
          {navItems.map((item) => {
            // Détermine si le lien correspond à la page actuelle
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center justify-between w-full p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-[#2A2A38] text-white dark:bg-indigo-50 dark:text-indigo-600' 
                    : 'text-gray-400 hover:text-white hover:bg-[#2A2A38]/50 dark:text-gray-500 dark:hover:bg-gray-100 dark:hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} className={isActive ? 'text-indigo-400 dark:text-indigo-600' : ''} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Paramètres + Admin Dashboard */}
        <div className="p-4 border-t border-gray-800/50 dark:border-gray-200 space-y-2">
          <button
            onClick={() => handleNavigation('/settings')}
            className={`flex items-center gap-4 w-full p-3 rounded-xl transition-colors ${
              location.pathname === '/settings' 
                ? 'bg-[#2A2A38] text-white dark:bg-indigo-50 dark:text-indigo-600' 
                : 'text-gray-400 hover:text-white hover:bg-[#2A2A38]/50 dark:text-gray-500 dark:hover:bg-gray-100 dark:hover:text-gray-900'
            }`}
          >
            <Settings size={20} className={location.pathname === '/settings' ? 'text-indigo-400 dark:text-indigo-600' : ''} />
            <span className="font-semibold text-sm">Paramètres</span>
          </button>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-4 w-full p-3 rounded-xl transition-colors text-gray-400 hover:text-white hover:bg-[#2A2A38]/50 dark:text-gray-500 dark:hover:bg-gray-100 dark:hover:text-gray-900"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={20} className="text-yellow-400" />
                <span className="font-semibold text-sm">Mode Clair</span>
              </>
            ) : (
              <>
                <Moon size={20} className="text-indigo-600" />
                <span className="font-semibold text-sm">Mode Sombre</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleNavigation('/admindashboard')}
            className={`flex items-center gap-4 w-full p-3 rounded-xl transition-colors ${
              location.pathname === '/admindashboard' 
                ? 'bg-[#2A2A38] text-white dark:bg-indigo-50 dark:text-indigo-600' 
                : 'text-gray-400 hover:text-white hover:bg-[#2A2A38]/50 dark:text-gray-500 dark:hover:bg-gray-100 dark:hover:text-gray-900'
            }`}
          >
            <Shield size={20} className={location.pathname === '/admindashboard' ? 'text-indigo-400 dark:text-indigo-600' : ''} />
            <span className="font-semibold text-sm">Admin Dashboard</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;