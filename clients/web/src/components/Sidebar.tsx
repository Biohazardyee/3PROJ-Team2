import { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, Library, Rocket, BarChart2, 
  Shield, Settings, X, Sun, Moon, Globe, ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDarkMode } from '../useDarkMode';
import { useTranslation } from 'react-i18next';

type SidebarProps = {
  isOpen: boolean; 
  onClose: () => void; 
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { t, i18n } = useTranslation(); 
  const navigate = useNavigate(); 
  const location = useLocation(); 
  const { theme, toggleTheme } = useDarkMode();

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Si la sidebar se ferme, on force la fermeture du menu des langues
  useEffect(() => {
    if (!isOpen) {
      setIsLangMenuOpen(false);
    }
  }, [isOpen]);

  // Liste des chemins des pages pour accéder à leur contenu
  const navItems = [
      { name: t('nav_home'), icon: HomeIcon, path: '/home' },
      { name: t('nav_feed'), icon: Rocket, path: '/feed' },
      { name: t('nav_stats'), icon: BarChart2, path: '/stats' },
      { name: t('nav_library'), icon: Library, path: '/library' },
  ];

  // Liste des langues disponibles 
  const languages = [
    { code: 'fr', label: t('lang_fr', 'Français') },
    { code: 'en', label: t('lang_en', 'Anglais') },
    { code: 'es', label: t('lang_es', 'Espagnol') },
    { code: 'de', label: t('lang_de', 'Allemand') },
    { code: 'it', label: t('lang_it', 'Italien') }
  ];

  // Gère le clic sur un lien, navigue vers la page et ferme la sidebar
  const handleNavigation = (path: string) => {
    navigate(path);
    onClose(); 
  };

  // Change la langue et ferme le menu déroulant
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsLangMenuOpen(false);
  };

  // Récupère le nom de la langue actuellement active
  const currentLangCode = i18n.language?.substring(0, 2) || 'fr';
  const currentLangLabel = languages.find(l => l.code === currentLangCode)?.label || t('lang_fr', 'Français');

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
          <span className="text-xl font-bold text-white dark:text-gray-900 tracking-widest">{t('menu_title')}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-white dark:hover:text-gray-900 transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 mt-2 overflow-y-auto flex-1">
          {navItems.map((item) => {
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
            <span className="font-semibold text-sm">{t('nav_settings', 'Paramètres')}</span>
          </button>

          {/* Menu déroulant des langues */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="flex items-center justify-between w-full p-3 rounded-xl transition-colors text-gray-400 hover:text-white hover:bg-[#2A2A38]/50 dark:text-gray-500 dark:hover:bg-gray-100 dark:hover:text-gray-900"
            >
              <div className="flex items-center gap-4">
                <Globe size={20} />
                <span className="font-semibold text-sm">{currentLangLabel}</span>
              </div>
              <ChevronRight size={16} className={`transition-transform duration-200`} />
            </button>

            {/* Liste des langues */}
            {isLangMenuOpen && (
              <div className="absolute left-[105%] bottom-0 w-48 bg-[#1C1C28] dark:bg-white border border-gray-800 dark:border-gray-200 rounded-xl p-2 space-y-1 shadow-xl animate-in fade-in slide-in-from-left-2 duration-200 z-50">
                {languages.map((lng) => (
                  <button
                    key={lng.code}
                    onClick={() => changeLanguage(lng.code)}
                    className={`block w-full text-left p-2 rounded-lg text-sm transition-colors ${
                      currentLangCode === lng.code
                        ? 'text-white font-bold bg-[#2A2A38] dark:text-indigo-600 dark:bg-indigo-50'
                        : 'text-gray-400 hover:text-white hover:bg-[#2A2A38]/50 dark:text-gray-500 dark:hover:text-gray-900 dark:hover:bg-gray-100'
                    }`}
                  >
                    {lng.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-4 w-full p-3 rounded-xl transition-colors text-gray-400 hover:text-white hover:bg-[#2A2A38]/50 dark:text-gray-500 dark:hover:bg-gray-100 dark:hover:text-gray-900"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={20} className="text-yellow-400" />
                <span className="font-semibold text-sm">{t('light_mode')}</span>
              </>
            ) : (
              <>
                <Moon size={20} className="text-indigo-600" />
                <span className="font-semibold text-sm">{t('dark_mode')}</span>
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
            <span className="font-semibold text-sm">{t('nav_admin')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;