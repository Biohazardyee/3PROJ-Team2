export interface ProfileTitleDef {
    id: string; // cosmetic id (catalogue, type "title")
    label: string; // texte affiché du badge (emoji inclus)
    className: string; // classes Tailwind du badge (pastille)
}

/**
 * Titres/badges achetables, affichés à côté du pseudo sur le profil.
 * Pour en ajouter un : une entrée ici + une ligne au catalogue backend.
 */
export const PROFILE_TITLES: ProfileTitleDef[] = [
    {id: "title_melomane", label: "🎧 Mélomane", className: "bg-slate-700/60 text-slate-200 border-slate-600 dark:bg-slate-200 dark:text-slate-700 dark:border-slate-300"},
    {id: "title_critique", label: "✍️ Critique", className: "bg-blue-500/15 text-blue-400 border-blue-500/30"},
    {id: "title_collectionneur", label: "💿 Collectionneur", className: "bg-purple-500/15 text-purple-400 border-purple-500/30"},
    {id: "title_veteran", label: "⭐ Vétéran", className: "bg-amber-500/15 text-amber-400 border-amber-500/30"},
    {id: "title_legende", label: "👑 Légende", className: "bg-gradient-to-r from-amber-500/20 to-pink-500/20 text-amber-300 border-amber-400/40"},
];

export const PROFILE_TITLE_IDS: string[] = PROFILE_TITLES.map((t) => t.id);

export const isValidProfileTitle = (id?: string | null): boolean =>
    !!id && PROFILE_TITLE_IDS.includes(id);

export const getProfileTitle = (id?: string | null): ProfileTitleDef | undefined =>
    PROFILE_TITLES.find((t) => t.id === id);
