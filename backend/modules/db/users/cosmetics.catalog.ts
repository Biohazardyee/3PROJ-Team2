export interface CosmeticItem {
    id: string;
    name: string;
    price: number;
    type: "avatar_border" | "theme" | "font";
}

/**
 * Catalogue des cosmétiques achetables avec les points boutique.
 * Source de vérité pour les prix (le front mappe l'id vers le rendu visuel).
 */
export const COSMETICS: CosmeticItem[] = [
    {id: "border_aurora", name: "Aurore", price: 150, type: "avatar_border"},
    {id: "border_gold", name: "Or royal", price: 250, type: "avatar_border"},
    {id: "border_neon", name: "Néon", price: 200, type: "avatar_border"},
    {id: "border_fire", name: "Brasier", price: 300, type: "avatar_border"},
    {id: "border_emerald", name: "Émeraude", price: 180, type: "avatar_border"},
    {id: "border_ice", name: "Glace", price: 220, type: "avatar_border"},
    {id: "border_flame", name: "Flammes", price: 600, type: "avatar_border"},
    {id: "border_galaxy", name: "Galaxie", price: 350, type: "avatar_border"},
    {id: "border_toxic", name: "Toxique", price: 200, type: "avatar_border"},
    {id: "theme_crimson", name: "Thème Cramoisi", price: 500, type: "theme"},
    {id: "theme_cyan", name: "Thème Givre", price: 500, type: "theme"},
    {id: "font_michroma", name: "Police Michroma", price: 90, type: "font"},
    {id: "font_orbitron", name: "Police Orbitron", price: 90, type: "font"},
    {id: "font_bebas", name: "Police Bebas", price: 110, type: "font"},
    {id: "font_cinzel", name: "Police Cinzel", price: 130, type: "font"},
    {id: "font_pacifico", name: "Police Pacifico", price: 150, type: "font"},
];

export function getCosmeticById(id: string): CosmeticItem | undefined {
    return COSMETICS.find((c) => c.id === id);
}
