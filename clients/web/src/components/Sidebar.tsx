import {useState, useEffect} from 'react';
import {
    Home as HomeIcon, Library, Rocket, BarChart2,
    Shield, Settings, X, Sun, Moon, Globe, ChevronRight, ShoppingBag, Palette
} from 'lucide-react';
import {useNavigate, useLocation, NavigateFunction} from 'react-router-dom';
import {useDarkMode} from '../useDarkMode';
import {useTranslation} from 'react-i18next';
import {jwtDecode} from "jwt-decode";
import apiClient from '../api/client';
import {TokenPayloadDto} from "../../../../backend/types/users/user.dto.ts"

type SidebarProps = {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({isOpen, onClose}: SidebarProps) => {
    const {t, i18n} = useTranslation();
    const navigate: NavigateFunction = useNavigate();
    const location = useLocation();
    const {theme, setTheme} = useDarkMode();

    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const [ownsLpTheme, setOwnsLpTheme] = useState<boolean>(false);

    useEffect((): void => {
        if (!isOpen) {
            setIsLangMenuOpen(false);
            setIsThemeMenuOpen(false);
        }
    }, [isOpen]);

    // Récupère les cosmétiques possédés (pour savoir si le thème LP est débloqué)
    useEffect((): void => {
        if (!isOpen) return;
        const token: string | null = localStorage.getItem('token');
        if (!token) return;
        try {
            const decoded: any = jwtDecode(token);
            const uId: string = decoded.id || decoded.userId;
            apiClient
                .get(`/users/public/${uId}`)
                .then((res) => {
                    const data = res.data.user || res.data;
                    setOwnsLpTheme((data.owned_cosmetics || []).includes('theme_linkinpark'));
                })
                .catch((e) => console.error('Erreur cosmétiques sidebar:', e));
        } catch (e) {
            console.error(e);
        }
    }, [isOpen]);

    const selectTheme = (t: "light" | "dark" | "lp"): void => {
        setTheme(t);
        setIsThemeMenuOpen(false);
    };

    useEffect(():void => {
        const token:string | null = localStorage.getItem('token');
        if (!token) {
            setIsAuthenticated(false);
            setIsAdmin(false);
        } else {
            setIsAuthenticated(true);
            const tokenDecoded: TokenPayloadDto = jwtDecode<TokenPayloadDto>(token);
            setIsAdmin(tokenDecoded.role === 'ADMIN');
        }
    }, []);

    const navItems = [
        {name: t('nav_home'), icon: HomeIcon, path: '/home'},
        {name: t('nav_feed'), icon: Rocket, path: '/feed'},
        {name: t('nav_stats'), icon: BarChart2, path: '/stats'},
        {name: t('nav_library'), icon: Library, path: '/library'},
        {name: t('nav_shop', 'Boutique'), icon: ShoppingBag, path: '/shop'},
    ];

    const languages = [
        {code: 'fr', label: t('lang_fr', 'Français')},
        {code: 'en', label: t('lang_en', 'English')},
        {code: 'es', label: t('lang_es', 'Español')},
        {code: 'de', label: t('lang_de', 'Deutsch')},
        {code: 'it', label: t('lang_it', 'Italiano')}
    ];

    const handleNavigation = (path: string): void => {
        navigate(path);
        onClose();
    };

    const changeLanguage = (code: string): void => {
        i18n.changeLanguage(code);
        setIsLangMenuOpen(false);
    };

    const currentLangCode: string = i18n.language?.substring(0, 2) || 'fr';
    const currentLangLabel: string = languages.find(l => l.code === currentLangCode)?.label || 'Français';

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-full w-64 z-40 transform transition-all duration-300 flex flex-col
          bg-[#1C1C28] border-r border-gray-800 
          dark:bg-white dark:border-gray-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div
                    className="h-16 flex items-center justify-between px-6 border-b border-gray-800 dark:border-gray-200">
                    <span
                        className="text-xl font-bold text-white dark:text-gray-900 tracking-widest">{t('menu_title')}</span>
                    <button onClick={onClose}
                            className="text-gray-400 hover:text-white dark:hover:text-gray-900 transition-colors">
                        <X size={24}/>
                    </button>
                </div>

                <nav className="p-4 space-y-2 mt-2 overflow-y-auto flex-1">
                    {navItems.map((item) => {
                        const isActive:boolean = location.pathname === item.path;
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
                                    <item.icon size={20}
                                               className={isActive ? 'text-indigo-400 dark:text-indigo-600' : ''}/>
                                    <span className="font-semibold text-sm">{item.name}</span>
                                </div>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800/50 dark:border-gray-200 space-y-2">
                    {isAuthenticated && (
                        <button
                            onClick={() => handleNavigation('/settings')}
                            className={`flex items-center gap-4 w-full p-3 rounded-xl transition-colors ${
                                location.pathname === '/settings'
                                    ? 'bg-[#2A2A38] text-white dark:bg-indigo-50 dark:text-indigo-600'
                                    : 'text-gray-400 hover:text-white hover:bg-[#2A2A38]/50 dark:text-gray-500 dark:hover:bg-gray-100 dark:hover:text-gray-900'
                            }`}
                        >
                            <Settings size={20}
                                      className={location.pathname === '/settings' ? 'text-indigo-400 dark:text-indigo-600' : ''}/>
                            <span className="font-semibold text-sm">{t('nav_settings', 'Paramètres')}</span>
                        </button>
                    )}

                    {isAuthenticated && isAdmin && (
                        <button
                            onClick={() => handleNavigation('/admindashboard')}
                            className={`flex items-center gap-4 w-full p-3 rounded-xl transition-colors ${
                                location.pathname === '/admindashboard'
                                    ? 'bg-[#2A2A38] text-white dark:bg-indigo-50 dark:text-indigo-600'
                                    : 'text-gray-400 hover:text-white hover:bg-[#2A2A38]/50 dark:text-gray-500 dark:hover:bg-gray-100 dark:hover:text-gray-900'
                            }`}
                        >
                            <Shield size={20}
                                    className={location.pathname === '/admindashboard' ? 'text-indigo-400 dark:text-indigo-600' : ''}/>
                            <span className="font-semibold text-sm">{t('nav_admin', 'Admin Dashboard')}</span>
                        </button>
                    )}

                    <div className="relative">
                        <button
                            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                            className="flex items-center justify-between w-full p-3 rounded-xl transition-colors text-gray-400 hover:text-white hover:bg-[#2A2A38]/50 dark:text-gray-500 dark:hover:bg-gray-100 dark:hover:text-gray-900"
                        >
                            <div className="flex items-center gap-4">
                                <Globe size={20}/>
                                <span className="font-semibold text-sm">{currentLangLabel}</span>
                            </div>
                            <ChevronRight size={16}
                                          className={`transition-transform duration-200 ${isLangMenuOpen ? 'rotate-90' : ''}`}/>
                        </button>

                        {isLangMenuOpen && (
                            <div
                                className="absolute left-[105%] bottom-0 w-48 bg-[#1C1C28] dark:bg-white border border-gray-800 dark:border-gray-200 rounded-xl p-2 space-y-1 shadow-xl animate-in fade-in slide-in-from-left-2 duration-200 z-50">
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

                    <div className="relative">
                        <button
                            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                            className="flex items-center justify-between w-full p-3 rounded-xl transition-colors text-gray-400 hover:text-white hover:bg-[#2A2A38]/50 dark:text-gray-500 dark:hover:bg-gray-100 dark:hover:text-gray-900"
                        >
                            <div className="flex items-center gap-4">
                                {theme === 'light' ? (
                                    <Sun size={20} className="text-yellow-400"/>
                                ) : theme === 'lp' ? (
                                    <Palette size={20} className="text-red-500"/>
                                ) : (
                                    <Moon size={20} className="text-indigo-600"/>
                                )}
                                <span className="font-semibold text-sm">
                                    {theme === 'light' ? t('light_mode') : theme === 'lp' ? t('theme_crimson', 'Cramoisi') : t('dark_mode')}
                                </span>
                            </div>
                            <ChevronRight size={16}
                                          className={`transition-transform duration-200 ${isThemeMenuOpen ? 'rotate-90' : ''}`}/>
                        </button>

                        {isThemeMenuOpen && (
                            <div
                                className="absolute left-[105%] bottom-0 w-52 bg-[#1C1C28] dark:bg-white border border-gray-800 dark:border-gray-200 rounded-xl p-2 space-y-1 shadow-xl animate-in fade-in slide-in-from-left-2 duration-200 z-50">
                                <button
                                    onClick={() => selectTheme('dark')}
                                    className={`flex items-center gap-3 w-full text-left p-2 rounded-lg text-sm transition-colors ${theme === 'dark' ? 'text-white font-bold bg-[#2A2A38] dark:text-indigo-600 dark:bg-indigo-50' : 'text-gray-400 hover:text-white hover:bg-[#2A2A38]/50 dark:text-gray-500 dark:hover:text-gray-900 dark:hover:bg-gray-100'}`}
                                >
                                    <Moon size={16}/> {t('dark_mode')}
                                </button>
                                <button
                                    onClick={() => selectTheme('light')}
                                    className={`flex items-center gap-3 w-full text-left p-2 rounded-lg text-sm transition-colors ${theme === 'light' ? 'text-white font-bold bg-[#2A2A38] dark:text-indigo-600 dark:bg-indigo-50' : 'text-gray-400 hover:text-white hover:bg-[#2A2A38]/50 dark:text-gray-500 dark:hover:text-gray-900 dark:hover:bg-gray-100'}`}
                                >
                                    <Sun size={16}/> {t('light_mode')}
                                </button>
                                {ownsLpTheme ? (
                                    <button
                                        onClick={() => selectTheme('lp')}
                                        className={`flex items-center gap-3 w-full text-left p-2 rounded-lg text-sm transition-colors ${theme === 'lp' ? 'text-red-500 font-bold bg-red-500/10' : 'text-gray-400 hover:text-white hover:bg-[#2A2A38]/50 dark:text-gray-500 dark:hover:text-gray-900 dark:hover:bg-gray-100'}`}
                                    >
                                        <Palette size={16}/> {t('theme_crimson', 'Cramoisi')}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleNavigation('/shop')}
                                        className="flex items-center gap-3 w-full text-left p-2 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-[#2A2A38]/50 dark:hover:text-gray-900 dark:hover:bg-gray-100 transition-colors"
                                    >
                                        <ShoppingBag size={16}/> {t('unlock_lp_theme', 'Linkin Park (boutique)')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;