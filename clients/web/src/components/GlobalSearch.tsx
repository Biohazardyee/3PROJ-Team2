import React, {useState, useRef} from "react";
import {Search, Loader2, Disc3} from "lucide-react";
import {NavigateFunction, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import apiClient from "../api/client";
import {AxiosResponse} from "axios";

const GlobalSearch: React.FC = () => {
    const navigate: NavigateFunction = useNavigate();
    const {t} = useTranslation();

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    const searchTimeout = useRef<any>(null);

    const handleChange = (value: string): void => {
        setQuery(value);

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (value.trim().length < 2) {
            setUsers([]);
            return;
        }

        searchTimeout.current = setTimeout(async (): Promise<void> => {
            try {
                setSearching(true);
                const res: AxiosResponse = await apiClient.get(`/users/search?q=${encodeURIComponent(value.trim())}`);
                setUsers(res.data.users || []);
            } catch (e) {
                console.error("Erreur recherche globale:", e);
            } finally {
                setSearching(false);
            }
        }, 300);
    };

    const goToUser = (userId: string): void => {
        setIsOpen(false);
        setQuery("");
        setUsers([]);
        navigate(`/profil/${userId}`);
    };

    const goToAlbumSearch = (): void => {
        const q = query.trim();
        setIsOpen(false);
        if (!q) {
            navigate("/home");
            return;
        }
        setQuery("");
        setUsers([]);
        navigate(`/home?q=${encodeURIComponent(q)}&mode=album`);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="hover:text-white dark:hover:text-gray-900 transition-colors cursor-pointer"
                title={t("global_search_title", "Rechercher")}
            >
                <Search size={22}/>
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-3 w-80 bg-[#1C1C28] dark:bg-white border border-gray-800 dark:border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50"
                >
                    <div className="p-3 border-b border-gray-800 dark:border-gray-200">
                        <div className="flex items-center bg-[#13131A] dark:bg-gray-50 rounded-lg px-3 py-2 border border-gray-800 dark:border-gray-200 focus-within:border-indigo-400 transition-colors">
                            <Search size={16} className="text-gray-500 shrink-0"/>
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={(e) => handleChange(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && goToAlbumSearch()}
                                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                                placeholder={t("global_search_placeholder", "Utilisateurs, albums...")}
                                className="bg-transparent text-white dark:text-gray-900 outline-none w-full text-sm placeholder-gray-500 ml-2"
                            />
                        </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {searching ? (
                            <div className="flex items-center justify-center p-4">
                                <Loader2 className="animate-spin text-indigo-400" size={20}/>
                            </div>
                        ) : users.length > 0 ? (
                            <div className="py-1">
                                <p className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                    {t("global_search_users", "Utilisateurs")}
                                </p>
                                {users.map((u) => (
                                    <button
                                        key={u.id}
                                        type="button"
                                        onMouseDown={() => goToUser(u.id)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 dark:hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-slate-700 dark:bg-slate-200 overflow-hidden flex items-center justify-center text-xs font-bold shrink-0">
                                            {u.profile_picture ? (
                                                <img src={u.profile_picture} alt="" className="w-full h-full object-cover"/>
                                            ) : (
                                                u.pseudo?.substring(0, 1).toUpperCase() || "?"
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-white dark:text-gray-900 truncate">{u.pseudo}</p>
                                            <p className="text-xs text-gray-500 truncate">@{u.username}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : query.trim().length >= 2 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                                {t("no_users_found", "Aucun utilisateur trouvé")}
                            </div>
                        ) : null}

                        <button
                            type="button"
                            onMouseDown={goToAlbumSearch}
                            className="w-full flex items-center gap-3 px-3 py-3 text-left border-t border-gray-800 dark:border-gray-200 hover:bg-white/5 dark:hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <Disc3 size={16} className="text-indigo-400"/>
                            </div>
                            <p className="text-sm font-bold text-indigo-400">
                                {query.trim() ? t("global_search_albums_for", "Chercher des albums pour \"{{query}}\"", {query: query.trim()}) : t("global_search_albums", "Rechercher des albums")}
                            </p>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
