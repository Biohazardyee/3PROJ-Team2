export interface CosmeticItem {
    id: string;
    name: string;
    price: number;
    type: "avatar_border" | "theme";
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
    {id: "theme_linkinpark", name: "Thème Cramoisi", price: 500, type: "theme"},
];

export function getCosmeticById(id: string): CosmeticItem | undefined {
    return COSMETICS.find((c) => c.id === id);
}
