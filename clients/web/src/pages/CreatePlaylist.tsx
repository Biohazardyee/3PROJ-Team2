import React, { useState, useRef } from 'react';
import { Camera, X, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const CreatePlaylist: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Récupère les infos de la playlist si on la modifie
    const state = location.state as any;
    const isEditing = !!state?.id;
    
    // États pour stocker le nom de la playlist et l'image de couverture
    const [name, setName] = useState(state?.title || '');
    const [image, setImage] = useState<string | null>(state?.image || null);
    
    // Référence pour cliquer sur l'input de fichier caché
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Transforme l'image choisie sur l'ordinateur en lien lisible (Base64)
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Supprime l'image actuelle et réinitialise l'input
    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation(); // Évite de déclencher l'ajout d'image par erreur
        setImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Enregistre la playlist dans le stockage local du navigateur
    const handleSave = () => {
        try {
            const savedData = localStorage.getItem('user_playlists');
            let playlists = savedData ? JSON.parse(savedData) : [];

            if (isEditing) {
                // Met à jour la playlist existante dans la liste
                playlists = playlists.map((p: any) => 
                    p.id === state.id 
                        ? { ...p, title: name, image: image } 
                        : p
                );
            } else {
                // Crée un nouvel objet playlist avec un ID unique
                const newPlaylist = {
                    id: Date.now().toString(),
                    title: name,
                    description: '',
                    tags: [],
                    count: 0,
                    image: image || undefined,
                    images: []
                };
                playlists.push(newPlaylist);
            }
            
            // Sauvegarde la liste mise à jour et retourne à la bibliothèque
            localStorage.setItem('user_playlists', JSON.stringify(playlists));
            navigate('/library');
        } catch (e) {
            console.error("Erreur lors de la sauvegarde :", e);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 dark:bg-slate-50 text-slate-50 dark:text-gray-900 flex flex-col font-sans transition-colors duration-300">
            
            {/* Titre + bouton fermer */}
            <div className="flex justify-between items-center p-6 border-b border-slate-800 dark:border-gray-200">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 dark:hover:bg-gray-200 rounded-full transition-colors">
                    <X size={28} className="text-white dark:text-gray-900" />
                </button>
                <h1 className="text-lg font-bold text-white dark:text-gray-900 tracking-wide">
                    {isEditing ? "Modifier la playlist" : "Nouvelle playlist"}
                </h1>
                <div className="w-12"></div>
            </div>

            <div className="flex flex-col items-center flex-grow pt-16 px-6">
                
                {/* Ajouter ou modifier la cover de la playlist */}
                <div 
                    className="w-56 h-56 bg-slate-900 dark:bg-white border-2 border-slate-800 dark:border-gray-300 border-dashed rounded-xl overflow-hidden flex flex-col justify-center items-center cursor-pointer hover:border-blue-500 transition-colors mb-12 shadow-lg"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {image ? (
                        /* Affiche la cover avec un bouton de suppression au survol */
                        <div className="relative w-full h-full group">
                            <img src={image} alt="Cover" className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-50" />
                            <button 
                                onClick={handleRemoveImage}
                                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            >
                                <div className="bg-gray-500 dark:bg-gray-900 opacity-75 p-4 rounded-full text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                    <Trash2 size={32} />
                                </div>
                            </button>
                        </div>
                    ) : (
                        /* Affiche l'icône caméra si aucune image n'est choisie */
                        <div className="flex flex-col items-center">
                            <Camera size={48} className="text-slate-500 dark:text-gray-400 mb-3" />
                            <span className="text-slate-400 dark:text-gray-500 font-medium">Ajouter une cover</span>
                        </div>
                    )}
                </div>
                
                {/* Input de type fichier caché */}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    className="hidden" 
                />

                {/* Champ de texte pour saisir le nom de la playlist */}
                <input
                    type="text"
                    placeholder="Nom de la playlist"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus={!isEditing}
                    className="w-full max-w-md bg-transparent border-b-2 border-slate-700 dark:border-gray-300 focus:border-blue-500 dark:focus:border-blue-600 text-white dark:text-gray-900 text-3xl text-center py-3 mb-12 outline-none transition-colors placeholder:text-slate-600 dark:placeholder:text-gray-300 font-bold"
                />

                {/* Bouton pour valider la création ou les modifications */}
                <button 
                    onClick={handleSave}
                    disabled={!name.trim()} 
                    className={`px-10 py-4 rounded-full font-bold text-lg transition-all shadow-lg ${
                        name.trim() 
                        ? 'bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-blue-500/25 hover:scale-105' 
                        : 'bg-slate-800 dark:bg-gray-200 text-slate-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {isEditing ? "ENREGISTRER LES MODIFS" : "CRÉER LA PLAYLIST"}
                </button>
                
            </div>
        </div>
    );
};

export default CreatePlaylist;