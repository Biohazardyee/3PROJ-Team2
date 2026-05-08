import React, { useState, useEffect } from 'react';
import {Edit2, Trash2, Plus, ArrowLeft} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ListCard: React.FC<any> = ({ id, title, count, image, onClick, onEdit, onDelete }) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-3 group">
            {/* Zone cliquable de l'image */}
            <div 
                onClick={() => onClick(id)}
                className="aspect-square bg-slate-900 dark:bg-white rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-slate-800 dark:border-slate-200 relative"
            >
                {/* Affiche l'image ou un texte par défaut si vide */}
                {image ? (
                     <img src={image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-bold uppercase tracking-widest bg-slate-900 dark:bg-slate-100">
                        {t('no_cover')}
                    </div>
                )}
            </div>
            
            {/* Titre et boutons Editer/Supprimer sous l'image */}
            <div className="flex justify-between items-start px-1">
                <div className="overflow-hidden cursor-pointer flex-grow" onClick={() => onClick(id)}>
                    <h3 className="text-white dark:text-gray-900 font-bold text-lg truncate">{title}</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-sm truncate">
                        {count > 1 ? t('albums_count_plural', { count }) : t('albums_count', { count: count || 0 })}
                    </p>
                </div>
                {/* Boutons visibles uniquement au survol de la carte */}
                <div className="flex items-center opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(id); }} className="text-slate-500 hover:text-white dark:hover:text-gray-900 p-1.5 transition-colors"><Edit2 size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(id); }} className="text-slate-500 hover:text-rose-500 p-1.5 transition-colors"><Trash2 size={18} /></button>
                </div>
            </div>
        </div>
    );
};

const LibraryPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [playlists, setPlaylists] = useState<any[]>([]); // État pour la liste des playlists
    const [selectedPlaylist, setSelectedPlaylist] = useState<any | null>(null); // État pour la playlist ouverte

    // Charge les playlists stockées dans le navigateur
    useEffect(() => {
        const savedData = localStorage.getItem('user_playlists');
        if (savedData) setPlaylists(JSON.parse(savedData));
    }, []);

    // Supprime une playlist après confirmation et met à jour le stockage
    const handleDelete = (id: string) => {
        if (window.confirm(t('delete_playlist_confirm'))) {
            const updated = playlists.filter(p => p.id !== id);
            localStorage.setItem('user_playlists', JSON.stringify(updated));
            setPlaylists(updated);
        }
    };

    // Vue quand on clique sur une playlist (liste des albums)
    if (selectedPlaylist) {
        const currentAlbums = selectedPlaylist.albums || [];

        return (
            <div className="min-h-screen bg-[#0f1117] dark:bg-slate-50 text-slate-50 dark:text-gray-900 p-6 md:p-10 font-sans transition-colors duration-300">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Bouton pour fermer la playlist et revenir à la liste */}
                    <button onClick={() => setSelectedPlaylist(null)} className="flex items-center gap-2 text-slate-400 dark:text-slate-600 hover:text-white dark:hover:text-gray-900 transition-colors mb-4">
                        <ArrowLeft size={20} /> {t('back')}
                    </button>

                    {/* Header de la playlist : Image, Titre et Description */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-48 h-48 md:w-56 md:h-56 bg-slate-900 dark:bg-white rounded-2xl overflow-hidden flex-shrink-0 border border-slate-800 dark:border-slate-200 shadow-2xl">
                            {selectedPlaylist.image ? <img src={selectedPlaylist.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold uppercase text-xs">{t('no_cover')}</div>}
                        </div>
                        <div className="flex flex-col gap-4 mt-2">
                            <h1 className="text-4xl md:text-5xl font-bold text-white dark:text-gray-900 tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>{selectedPlaylist.title}</h1>
                            <p className="text-slate-400 dark:text-slate-600 text-lg">{selectedPlaylist.description || t('playlist_default_desc')}</p>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                {currentAlbums.length > 1 ? t('albums_count_plural', { count: currentAlbums.length }) : t('albums_count', { count: currentAlbums.length })}
                            </p>
                        </div>
                    </div>

                    {/* Liste des albums dans la playlist */}
                    <div className="mt-12 pt-8 border-t border-slate-800/50 dark:border-slate-200">
                        <h2 className="text-2xl font-bold mb-6 text-white dark:text-gray-900">Albums</h2>
                        {currentAlbums.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-12 max-w-[800px]">
                                {currentAlbums.map((album: any) => (
                                    <div key={album.id} className="flex flex-col gap-3 group cursor-pointer">
                                        <div className="aspect-square bg-slate-900 dark:bg-white rounded-2xl overflow-hidden border border-slate-800 dark:border-slate-200 shadow-lg">
                                            <img src={album.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="px-1">
                                            <h4 className="font-bold text-white dark:text-gray-900 text-lg truncate">{album.title}</h4>
                                            <p className="text-slate-400 dark:text-slate-500 text-sm truncate">{album.artist}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 dark:text-slate-400 font-medium py-12">{t('no_albums_in_playlist')}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Affichage de toutes les playlists de l'utilisateur
    return (
        <div className="min-h-screen bg-[#0f1117] dark:bg-slate-50 text-slate-50 dark:text-gray-900 p-6 md:p-10 font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-10">
                <header>
                    <h1 className="text-4xl font-bold text-white dark:text-gray-900 mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>{t('my_playlists_title')}</h1>
                    <p className="text-slate-400 dark:text-slate-600 text-lg">{t('my_playlists_subtitle')}</p>
                </header>
                
                {/* Grille des playlists */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-12 max-w-[1050px] mx-auto">
                    {/* Affiche chaque playlist */}
                    {playlists.map((list) => (
                        <ListCard key={list.id} {...list} 
                            onClick={(id: string) => setSelectedPlaylist(playlists.find(p => p.id === id))}
                            onEdit={(id: string) => navigate('/create-playlist', { state: playlists.find(p => p.id === id) })}
                            onDelete={handleDelete} 
                        />
                    ))}
                    
                    {/* Bouton créer une nouvelle playlist  */}
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => navigate('/create-playlist')} 
                            className="aspect-square w-full bg-[#1e2230] dark:bg-white hover:bg-[#252a3b] dark:hover:bg-slate-50 border border-slate-800/50 dark:border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-4 transition-colors shadow-lg group"
                        >
                            <Plus size={48} className="text-slate-300 dark:text-slate-400 group-hover:text-white dark:group-hover:text-gray-900 transition-colors" />
                            <span className="text-slate-300 dark:text-slate-400 group-hover:text-white dark:group-hover:text-gray-900 font-bold text-lg">{t('create_playlist_card')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LibraryPage;