import React, {useState, useRef, useEffect} from 'react';
import {Camera, X, Trash2, Loader2} from 'lucide-react';
import {useNavigate, useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {jwtDecode} from "jwt-decode";
import apiClient from "../api/client"; // Votre client Axios configuré

const CreatePlaylist: React.FC = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const state = location.state as any;
    const isEditing = !!state?.id;
    const albumToAdd = state?.albumToAdd;
    const returnTo = state?.returnTo;

    const [name, setName] = useState(state?.title || '');
    const [image, setImage] = useState<string | null>(state?.image || null);
    const [loading, setLoading] = useState(false);
    const [isPublic, setIsPublic] = useState(false); // Exemple d'ajout de BDD

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Charger les données de la playlist si on est en édition (depuis la BDD)
    useEffect(() => {
        if (isEditing) {
            const fetchPlaylist = async () => {
                try {
                    const res = await apiClient.get(`/playlists/${state.id}`);
                    const pl = res.data.playlist;
                    setName(pl.name);
                    setImage(pl.image_url);
                    setIsPublic(pl.is_public);
                } catch (err) {
                    console.error("Erreur chargement playlist:", err);
                }
            };
            fetchPlaylist();
        }
    }, [isEditing, state?.id]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string); // Base64 pour le backend
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) return;
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Non authentifié");
            const decoded: any = jwtDecode(token);
            const userId = decoded.id || decoded.userId;

            // Log pour vérifier ce que vous envoyez
            console.log("Album à ajouter:", albumToAdd);
            const mediaId = albumToAdd?.db_id || albumToAdd?.id;
            console.log("Media ID détecté:", mediaId);

            let newPlaylistId = state?.id;

            // 1. Création (ou mise à jour) de la playlist
            if (isEditing) {
                await apiClient.put(`/playlists/${state.id}`, {
                    name: name.trim(),
                    is_public: isPublic,
                    image_url: image
                });
            } else {
                const playlistPayload = {
                    name: name.trim(),
                    user_id: userId,
                    is_public: isPublic,
                    image_url: image,
                };
                const res = await apiClient.post("/playlists", playlistPayload);
                newPlaylistId = res.data.playlist?.id || res.data.id;
            }

            // 2. Ajout de l'album (seulement si mediaId existe)
            if (albumToAdd && newPlaylistId) {
                if (!mediaId) {
                    console.error("Impossible d'ajouter l'album : Aucun ID trouvé pour cet album.");
                    alert("La playlist a été créée, mais l'album n'a pas pu être ajouté (ID manquant).");
                } else {
                    try {
                        await apiClient.post("/playlist-items", {
                            playlist_id: newPlaylistId,
                            media_id: mediaId
                        });
                    } catch (err: any) {
                        console.error("Erreur API playlist-items:", err.response?.data);
                        // On ne bloque pas la redirection si la playlist est bien créée
                        alert("Playlist créée, mais erreur lors de l'ajout de l'album : " + (err.response?.data?.message || "Erreur serveur"));
                    }
                }
            }

            // Redirection finale
            if (returnTo) navigate(returnTo);
            else navigate('/library');

        } catch (e: any) {
            console.error("Erreur sauvegarde:", e);
            alert(e.response?.data?.message || "Erreur lors de l'enregistrement.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans transition-colors duration-300">
            <div className="flex justify-between items-center p-6 border-b border-slate-800">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-full">
                    <X size={28}/>
                </button>
                <h1 className="text-lg font-bold">{isEditing ? t('edit_playlist') : t('new_playlist')}</h1>
                <div className="w-12"></div>
            </div>

            <div className="flex flex-col items-center flex-grow pt-16 px-6">
                <div
                    className="w-56 h-56 bg-slate-900 border-2 border-slate-800 border-dashed rounded-xl overflow-hidden flex flex-col justify-center items-center cursor-pointer mb-12 shadow-lg"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {image ? (
                        <div className="relative w-full h-full group">
                            <img src={image} alt="Cover" className="w-full h-full object-cover"/>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                setImage(null);
                            }}
                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50">
                                <Trash2 size={32}/>
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <Camera size={48} className="text-slate-500 mb-3"/>
                            <span className="text-slate-400 font-medium">{t('add_cover')}</span>
                        </div>
                    )}
                </div>

                <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden"/>

                <input
                    type="text"
                    placeholder={t('playlist_name_placeholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full max-w-md bg-transparent border-b-2 border-slate-700 focus:border-blue-500 text-white text-3xl text-center py-3 mb-12 outline-none font-bold"
                />

                <button
                    onClick={handleSave}
                    disabled={!name.trim() || loading}
                    className={`px-10 py-4 rounded-full font-bold text-lg transition-all shadow-lg ${
                        name.trim() ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                >
                    {loading ? <Loader2
                        className="animate-spin"/> : (isEditing ? t('save_changes_btn') : t('create_playlist_btn'))}
                </button>
            </div>
        </div>
    );
};

export default CreatePlaylist;