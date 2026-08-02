export interface TextEffectDef {
    id: string; // cosmetic id (catalogue, type "text_effect")
    name: string; // nom affiché
    className: string; // classe CSS définie dans index.css
}

/**
 * Effets de texte achetables, appliqués sur le pseudo (indépendants de la police).
 * Pour en ajouter un : une entrée ici + les règles CSS correspondantes dans index.css
 * + une ligne au catalogue backend.
 */
export const TEXT_EFFECTS: TextEffectDef[] = [
    {id: "effect_glow_blue", name: "Lueur Bleue", className: "cosmetic-text-effect_glow_blue"},
    {id: "effect_glow_pink", name: "Lueur Rose", className: "cosmetic-text-effect_glow_pink"},
    {id: "effect_shadow_gold", name: "Ombre Dorée", className: "cosmetic-text-effect_shadow_gold"},
    {id: "effect_gradient_sunset", name: "Dégradé Coucher de Soleil", className: "cosmetic-text-effect_gradient_sunset"},
    {id: "effect_gradient_ocean", name: "Dégradé Océan", className: "cosmetic-text-effect_gradient_ocean"},
];

export const TEXT_EFFECT_IDS: string[] = TEXT_EFFECTS.map((e) => e.id);

export const isValidTextEffect = (id?: string | null): boolean =>
    !!id && TEXT_EFFECT_IDS.includes(id);

export const getTextEffectClassName = (id?: string | null): string =>
    TEXT_EFFECTS.find((e) => e.id === id)?.className || "";
