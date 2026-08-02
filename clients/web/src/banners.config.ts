export interface PremiumBannerDef {
    id: string; // cosmetic id (catalogue, type "banner")
    name: string; // nom affiché
    className: string; // classe CSS animée définie dans index.css
}

/**
 * Bannières de profil premium achetables (dégradés animés en CSS pur),
 * distinctes de la bannière personnelle (upload libre d'image).
 * Quand équipée, elle remplace visuellement la bannière uploadée sans la supprimer.
 */
export const PREMIUM_BANNERS: PremiumBannerDef[] = [
    {id: "banner_midnight", name: "Bannière Minuit", className: "cosmetic-banner_midnight"},
    {id: "banner_sunset", name: "Bannière Coucher de Soleil", className: "cosmetic-banner_sunset"},
    {id: "banner_ocean", name: "Bannière Océan", className: "cosmetic-banner_ocean"},
    {id: "banner_aurora", name: "Bannière Aurore", className: "cosmetic-banner_aurora"},
];

export const PREMIUM_BANNER_IDS: string[] = PREMIUM_BANNERS.map((b) => b.id);

export const isValidPremiumBanner = (id?: string | null): boolean =>
    !!id && PREMIUM_BANNER_IDS.includes(id);

export const getPremiumBanner = (id?: string | null): PremiumBannerDef | undefined =>
    PREMIUM_BANNERS.find((b) => b.id === id);
