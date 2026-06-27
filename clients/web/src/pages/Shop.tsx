import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {jwtDecode} from "jwt-decode";
import {toast} from "react-toastify";
import {Coins, Sparkles, Check, Music, Palette} from "lucide-react";
import apiClient from "../api/client";
import {AxiosResponse} from "axios";
import AvatarBorder from "../components/AvatarBorder";
import {useConfirm} from "../context/ConfirmContext";
import {useDarkMode, setOwnedThemes} from "../useDarkMode";
import {PREMIUM_THEMES} from "../themes.config";

type CatalogItem = {
    id: string;
    name: string;
    price: number;
    type: string;
};

const Shop: React.FC = () => {
    const {t} = useTranslation();
    const confirm = useConfirm();
    const {theme, setTheme} = useDarkMode();
    const [userId, setUserId] = useState<string>("");
    const [points, setPoints] = useState<number>(0);
    const [owned, setOwned] = useState<string[]>([]);
    const [equipped, setEquipped] = useState<string | null>(null);
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [catalog, setCatalog] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [busyId, setBusyId] = useState<string | null>(null);

    useEffect(() => {
        const load = async (): Promise<void> => {
            try {
                const token: string | null = localStorage.getItem("token");
                if (!token) return;
                const decoded: any = jwtDecode(token);
                const uId: string = decoded.id || decoded.userId;
                setUserId(uId);

                const [profileRes, catalogRes]: AxiosResponse[] = await Promise.all([
                    apiClient.get(`/users/public/${uId}`),
                    apiClient.get(`/users/cosmetics/catalog`),
                ]);
                const data = profileRes.data.user || profileRes.data;
                setPoints(data.shop_points ?? 0);
                setOwned(data.owned_cosmetics ?? []);
                setEquipped(data.equipped_avatar_border ?? null);

                if (data.profile_picture) {
                    setProfilePic(
                        data.profile_picture.startsWith("data") || data.profile_picture.startsWith("http")
                            ? data.profile_picture
                            : `data:image/jpeg;base64,${data.profile_picture}`,
                    );
                }
                setCatalog(catalogRes.data.catalog || []);
            } catch (err) {
                console.error("Erreur chargement boutique :", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleBuy = async (item: CatalogItem): Promise<void> => {
        if (points < item.price) {
            toast.error(t("not_enough_points", "Points insuffisants."));
            return;
        }
        const ok = await confirm({
            title: t("confirm_purchase_title", "Confirmer l'achat"),
            message: t("confirm_purchase", {
                name: item.name,
                price: item.price,
                defaultValue: 'Acheter "{{name}}" pour {{price}} points ?',
            }),
            confirmText: t("buy", "Acheter"),
        });
        if (!ok) return;

        setBusyId(item.id);
        try {
            const res: AxiosResponse = await apiClient.post("/users/cosmetics/buy", {
                cosmetic_id: item.id,
            });
            setPoints(res.data.shop_points);
            setOwned(res.data.owned_cosmetics);
            setOwnedThemes(res.data.owned_cosmetics);
            window.dispatchEvent(new Event("profileUpdated"));
            toast.success(t("cosmetic_bought", "Cosmétique débloqué ! 🎉"));
        } catch (e: any) {
            toast.error(e.response?.data?.message || t("cosmetic_buy_error", "Achat impossible."));
        } finally {
            setBusyId(null);
        }
    };

    const handleEquip = async (cosmeticId: string | null): Promise<void> => {
        setBusyId(cosmeticId || "none");
        try {
            const res: AxiosResponse = await apiClient.post("/users/cosmetics/equip", {
                cosmetic_id: cosmeticId,
            });
            setEquipped(res.data.equipped_avatar_border);
            window.dispatchEvent(new Event("profileUpdated"));
            toast.success(
                cosmeticId
                    ? t("cosmetic_equipped", "Contour équipé !")
                    : t("cosmetic_unequipped", "Contour retiré."),
            );
        } catch (e: any) {
            toast.error(e.response?.data?.message || t("cosmetic_equip_error", "Action impossible."));
        } finally {
            setBusyId(null);
        }
    };

    const Preview: React.FC<{ borderId: string }> = ({borderId}) => (
        <AvatarBorder borderId={borderId}>
            <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-800 dark:bg-gray-100 flex items-center justify-center">
                {profilePic ? (
                    <img src={profilePic} alt="" className="w-full h-full object-cover"/>
                ) : (
                    <Music size={28} className="text-purple-400 dark:text-purple-500"/>
                )}
            </div>
        </AvatarBorder>
    );

    return (
        <div className="min-h-screen bg-transparent dark:bg-slate-50 text-white dark:text-gray-900 p-6 md:p-10 transition-colors duration-300">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 text-white dark:text-gray-900">
                            {t("shop_title", "Boutique")}
                        </h1>
                        <p className="text-gray-400 dark:text-gray-600 text-lg">
                            {t("shop_subtitle", "Dépensez vos points pour personnaliser votre profil")}
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500/15 to-yellow-500/10 dark:from-amber-100 dark:to-yellow-50 border border-amber-500/30 dark:border-amber-300 px-5 py-3 rounded-2xl shadow-sm self-start">
                        <Coins size={24} className="text-amber-400 dark:text-amber-500"/>
                        <span className="text-amber-300 dark:text-amber-700 font-bold text-2xl">
                            {loading ? "…" : points}
                        </span>
                        <span className="text-amber-400/80 dark:text-amber-600 text-sm font-medium">
                            {t("shop_points_label", "points boutique")}
                        </span>
                    </div>
                </div>

                {/* Info */}
                <div className="mb-8 flex items-center gap-3 bg-blue-500/10 dark:bg-blue-50 border border-blue-500/20 dark:border-blue-200 rounded-xl px-5 py-4">
                    <Sparkles size={20} className="text-blue-400 dark:text-blue-500 shrink-0"/>
                    <p className="text-sm text-blue-200 dark:text-blue-700">
                        {t("shop_earn_hint", "Gagnez 10 points à chaque critique d'album publiée !")}
                    </p>
                </div>

                <h2 className="text-xl font-bold mb-5 text-white dark:text-gray-900">
                    {t("shop_section_borders", "Contours de photo de profil")}
                </h2>

                {/* Grille des contours */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {catalog.filter((c) => c.type === "avatar_border").map((item) => {
                        const isOwned: boolean = owned.includes(item.id);
                        const isEquipped: boolean = equipped === item.id;
                        const busy: boolean = busyId === item.id;

                        return (
                            <div
                                key={item.id}
                                className={`relative bg-[#1a1d26] dark:bg-white border rounded-2xl p-6 flex flex-col items-center text-center shadow-sm transition-all ${
                                    isEquipped
                                        ? "border-purple-500 dark:border-purple-400"
                                        : "border-slate-800 dark:border-gray-200"
                                }`}
                            >
                                {isEquipped && (
                                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-purple-500/15 text-purple-400 dark:text-purple-500 text-[11px] font-bold px-2.5 py-1 rounded-full">
                                        <Check size={12}/>
                                        {t("equipped", "Équipé")}
                                    </div>
                                )}

                                <div className="mb-4 mt-2">
                                    <Preview borderId={item.id}/>
                                </div>

                                <h3 className="font-bold text-white dark:text-gray-900 mb-2">
                                    {item.name}
                                </h3>

                                <div className="flex items-center gap-1.5 text-amber-400 dark:text-amber-500 font-bold mb-4">
                                    <Coins size={16}/>
                                    {item.price}
                                </div>

                                {/* Action */}
                                {!isOwned ? (
                                    <button
                                        onClick={() => handleBuy(item)}
                                        disabled={busy || points < item.price}
                                        className="w-full py-2.5 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-400 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {busy
                                            ? "…"
                                            : points < item.price
                                                ? t("not_enough_points_short", "Trop cher")
                                                : t("buy", "Acheter")}
                                    </button>
                                ) : isEquipped ? (
                                    <button
                                        onClick={() => handleEquip(null)}
                                        disabled={busy}
                                        className="w-full py-2.5 rounded-xl font-semibold text-sm bg-slate-800 dark:bg-gray-100 text-slate-300 dark:text-gray-700 hover:bg-slate-700 dark:hover:bg-gray-200 transition-colors disabled:opacity-40"
                                    >
                                        {busy ? "…" : t("unequip", "Retirer")}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleEquip(item.id)}
                                        disabled={busy}
                                        className="w-full py-2.5 rounded-xl font-semibold text-sm bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-40"
                                    >
                                        {busy ? "…" : t("equip", "Équiper")}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Section thèmes */}
                {catalog.some((c) => c.type === "theme") && (
                    <>
                        <h2 className="text-xl font-bold mt-12 mb-5 text-white dark:text-gray-900">
                            {t("shop_section_themes", "Thèmes du site")}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {catalog.filter((c) => c.type === "theme").map((item) => {
                                const def = PREMIUM_THEMES.find((p) => p.cosmeticId === item.id);
                                const isOwned: boolean = owned.includes(item.id);
                                const isActive: boolean = !!def && theme === def.value;
                                const busy: boolean = busyId === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        className={`relative bg-[#1a1d26] dark:bg-white border rounded-2xl p-6 shadow-sm transition-all ${
                                            isActive ? "border-blue-500" : "border-slate-800 dark:border-gray-200"
                                        }`}
                                    >
                                        {/* Aperçu du thème */}
                                        <div className="h-28 rounded-xl overflow-hidden mb-4 flex items-end p-3 relative"
                                             style={{background: def?.previewGradient || "#1a1d26"}}>
                                            <div className="flex gap-1.5 relative z-10">
                                                {(def?.swatches || []).map((c, i) => (
                                                    <span key={i} className="w-5 h-5 rounded-full border border-white/10" style={{backgroundColor: c}}/>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-white dark:text-gray-900 flex items-center gap-2">
                                                <Palette size={16} className={def?.accentClass || "text-purple-500"}/>
                                                {item.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-amber-400 dark:text-amber-500 font-bold">
                                                <Coins size={16}/>
                                                {item.price}
                                            </div>
                                        </div>

                                        {!isOwned ? (
                                            <button
                                                onClick={() => handleBuy(item)}
                                                disabled={busy || points < item.price}
                                                className="w-full py-2.5 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-400 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                {busy ? "…" : points < item.price ? t("not_enough_points_short", "Trop cher") : t("buy", "Acheter")}
                                            </button>
                                        ) : isActive ? (
                                            <button
                                                onClick={() => setTheme("dark")}
                                                className="w-full py-2.5 rounded-xl font-semibold text-sm bg-slate-800 dark:bg-gray-100 text-slate-300 dark:text-gray-700 hover:bg-slate-700 dark:hover:bg-gray-200 transition-colors"
                                            >
                                                {t("deactivate_theme", "Revenir au thème sombre")}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => def && setTheme(def.value)}
                                                className="w-full py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                                            >
                                                {t("activate_theme", "Activer le thème")}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {!loading && catalog.length === 0 && (
                    <p className="text-center text-slate-500 py-12">
                        {t("shop_empty", "Aucun cosmétique disponible pour le moment.")}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Shop;
