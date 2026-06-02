    import React, {useState, useEffect} from 'react';
    import {Edit2, Trash2, Plus, ArrowLeft, Loader2, MoreVertical} from 'lucide-react';
    import {useNavigate} from 'react-router-dom';
    import {useTranslation} from 'react-i18next';
    import apiClient from "../api/client";
    import {jwtDecode} from "jwt-decode";

    const ListCard: React.FC<any> = ({id, title, count, image, onClick, onEdit, onDelete}) => {
        const {t} = useTranslation();
        return (
            <div className="flex flex-col gap-3 group">
                <div
                    onClick={() => onClick(id)}
                    className="aspect-square bg-slate-900 dark:bg-white rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-slate-800 dark:border-slate-200 relative"
                >
                    {image ? (
                        <img src={image} alt=""
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-bold uppercase tracking-widest bg-slate-900 dark:bg-slate-100">
                            {t('no_cover')}
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-start px-1">
                    <div className="overflow-hidden cursor-pointer flex-grow" onClick={() => onClick(id)}>
                        <h3 className="text-white dark:text-gray-900 font-bold text-lg truncate">{title}</h3>
                        <p className="text-slate-400 dark:text-slate-500 text-sm truncate">
                            {count > 1 ? t('albums_count_plural', {count}) : t('albums_count', {count: count || 0})}
                        </p>
                    </div>
                    <div className="flex items-center opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => {
                            e.stopPropagation();
                            onEdit(id);
                        }} className="text-slate-500 hover:text-white dark:hover:text-gray-900 p-1.5 transition-colors">
                            <Edit2 size={18}/></button>
                        <button onClick={(e) => {
                            e.stopPropagation();
                            onDelete(id);
                        }} className="text-slate-500 hover:text-rose-500 p-1.5 transition-colors"><Trash2 size={18}/>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const LibraryPage: React.FC = () => {
        const navigate = useNavigate();
        const {t} = useTranslation();
        const [playlists, setPlaylists] = useState<any[]>([]);
        const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const fetchPlaylists = async () => {
                try {
                    setLoading(true);
                    const token = localStorage.getItem("token");
                    if (!token) throw new Error("Non authentifié");
                    const decoded: any = jwtDecode(token);
                    const userId = decoded.id || decoded.userId;
                    const res = await apiClient.get(`/playlists/user/${userId}`);
                    setPlaylists(res.data.playlists || []);
                } catch (e) {
                    console.error("Erreur chargement playlists:", e);
                } finally {
                    setLoading(false);
                }
            };
            fetchPlaylists();
        }, []);

        const fetchPlaylistDetails = async (id: string) => {
            setLoading(true);
            try {
                const res = await apiClient.get(`/playlists/${id}`);
                setSelectedPlaylist(res.data.playlist);
            } catch (e) {
                console.error("Erreur chargement détails playlist:", e);
                alert("Impossible de charger le contenu de la playlist.");
            } finally {
                setLoading(false);
            }
        };

        const handleDelete = async (id: string) => {
            if (window.confirm(t('delete_playlist_confirm'))) {
                try {
                    await apiClient.delete(`/playlists/${id}`);
                    setPlaylists(prev => prev.filter(p => p.id !== id));
                } catch (e) {
                    console.error("Erreur suppression:", e);
                    alert("Impossible de supprimer la playlist.");
                }
            }
        };

        // Fonction pour supprimer un item spécifique de la playlist
        const removeItem = async (e: React.MouseEvent, playlistItemId: string, mediaTitle: string) => {
            e.stopPropagation(); // Empêche la redirection vers l'album
            if (window.confirm(`Retirer "${mediaTitle}" de la playlist ?`)) {
                try {
                    await apiClient.delete(`/playlist-items/${playlistItemId}`);
                    setSelectedPlaylist((prev: any) => ({
                        ...prev,
                        items: prev.items.filter((i: any) => i.id !== playlistItemId)
                    }));
                } catch (e) {
                    console.error("Erreur suppression:", e);
                    alert("Impossible de retirer l'élément.");
                }
            }
        };

        // --- Rendu conditionnel ---

        if (loading) {
            return (
                <div className="min-h-screen flex items-center justify-center text-white">
                    <Loader2 className="animate-spin" size={48}/>
                </div>
            );
        }

        if (selectedPlaylist) {
            const currentAlbums = selectedPlaylist.items || [];

            return (
                <div className="min-h-screen bg-[#0f1117] p-6 md:p-10 text-white font-sans">
                    <div className="max-w-7xl mx-auto space-y-8">
                        <button
                            onClick={() => setSelectedPlaylist(null)}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                        >
                            <ArrowLeft size={20}/> {t('back')}
                        </button>

                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-48 h-48 md:w-56 md:h-56 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                                {selectedPlaylist.image_url ?
                                    <img src={selectedPlaylist.image_url} alt="" className="w-full h-full object-cover"/> :
                                    <div
                                        className="w-full h-full flex items-center justify-center text-slate-600">{t('no_cover')}</div>}
                            </div>
                            <div className="flex flex-col gap-4 mt-2">
                                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">{selectedPlaylist.name}</h1>
                                <p className="text-slate-500 font-medium">
                                    {currentAlbums.length} {t('albums_count', {count: currentAlbums.length})}
                                </p>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-800">
                            <h2 className="text-2xl font-bold mb-6 text-white">Albums</h2>
                            {currentAlbums.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-12 max-w-[800px]">
                                    {currentAlbums.map((item: any) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-col gap-3 group cursor-pointer relative"
                                            onClick={() => navigate(`/album/${item.media_id}`)}
                                        >
                                            {/* Bouton supprimer */}
                                            <button
                                                onClick={(e) => removeItem(e, item.id, item.media?.title || "Album")}
                                                className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-rose-500/80 backdrop-blur-md p-1.5 rounded-lg text-white transition-colors"
                                            >
                                                <MoreVertical size={16}/>
                                            </button>

                                            <div
                                                className="aspect-square bg-slate-900 rounded-2xl overflow-hidden shadow-lg relative">
                                                <img src={item.media?.cover || item.image} alt=""
                                                     className="w-full h-full object-cover"/>

                                                {/* LOGIQUE MOBILE : Affichage de la note issue du media */}
                                                {(item.media?.rating > 0) && (
                                                    <div
                                                        className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                                                        <span className="text-yellow-400">★</span>
                                                        <span
                                                            className="text-white text-xs font-bold">{item.media.rating}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="px-1">
                                                <h4 className="font-bold text-white text-lg truncate">
                                                    {item.media?.title || item.title}
                                                </h4>
                                            </div>
                                        </div>
                                    ))}                            </div>
                            ) : (
                                <p className="text-slate-500 font-medium py-12">{t('no_albums_in_playlist')}</p>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div
                className="min-h-screen bg-[#0f1117] dark:bg-slate-50 text-slate-50 dark:text-gray-900 p-6 md:p-10 font-sans transition-colors duration-300">
                <div className="max-w-7xl mx-auto space-y-10">
                    <header>
                        <h1 className="text-4xl font-bold text-white mb-2">{t('my_playlists_title')}</h1>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-12 max-w-[1050px] mx-auto">
                        {playlists.map((list) => (
                            <ListCard
                                key={list.id}
                                id={list.id}
                                title={list.name}
                                count={list.items?.length || 0}
                                image={list.image_url}
                                onClick={(id: string) => fetchPlaylistDetails(id)}
                                onEdit={(id: string) => navigate('/create-playlist', {state: playlists.find(p => p.id === id)})}
                                onDelete={handleDelete}
                            />
                        ))}

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => navigate('/create-playlist')}
                                className="aspect-square w-full bg-[#1e2230] border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4 transition-colors shadow-lg group"
                            >
                                <Plus size={48} className="text-slate-300"/>
                                <span className="text-slate-300 font-bold text-lg">{t('create_playlist_card')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    export default LibraryPage;