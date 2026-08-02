export interface PseudoFontDef {
    id: string; // cosmetic id (catalogue, type "font")
    name: string; // nom affiché (fallback ; le nom officiel vient du catalogue backend)
    fontFamily: string; // CSS font-family
}

/**
 * Polices achetables pour le pseudo (affiché sur le profil).
 * Pour en ajouter une : charger la police dans index.html + une entrée ici + une ligne au catalogue.
 */
export const PSEUDO_FONTS: PseudoFontDef[] = [
    {id: "font_michroma", name: "Michroma", fontFamily: "'Michroma', sans-serif"},
    {id: "font_pixel", name: "Press Start 2P", fontFamily: "'Press Start 2P', monospace"},
    {id: "font_bebas", name: "Bebas Neue", fontFamily: "'Bebas Neue', sans-serif"},
    {id: "font_cinzel", name: "Cinzel", fontFamily: "'Cinzel', serif"},
    {id: "font_pacifico", name: "Pacifico", fontFamily: "'Pacifico', cursive"},
];

export const PSEUDO_FONT_IDS: string[] = PSEUDO_FONTS.map((f) => f.id);

export const isValidPseudoFont = (id?: string | null): boolean =>
    !!id && PSEUDO_FONT_IDS.includes(id);

export const getPseudoFontFamily = (id?: string | null): string | undefined =>
    PSEUDO_FONTS.find((f) => f.id === id)?.fontFamily;
