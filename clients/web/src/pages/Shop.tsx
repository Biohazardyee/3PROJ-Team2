import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {jwtDecode} from "jwt-decode";
import {Coins, Lock, Image as ImageIcon, Palette, BadgeCheck, Sparkles} from "lucide-react";
import apiClient from "../api/client";
import {AxiosResponse} from "axios";

type ShopItem = {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: React.ReactNode;
};

const Shop: React.FC = () => {
    const {t} = useTranslation();
    const [points, setPoints] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPoints = async (): Promise<void> => {
            try {
                const token: string | null = localStorage.getItem("token");
                if (!token) return;
                const decoded: any = jwtDecode(token);
                const userId: string = decoded.id || decoded.userId;
                const res: AxiosResponse = await apiClient.get(`/users/public/${userId}`);
                const data = res.data.user || res.data;
                setPoints(data.shop_points ?? 0);
            } catch (err) {
                console.error("Erreur chargement des points :", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPoints();
    }, []);

    const items: ShopItem[] = [
        {
            id: "banner",
            name: t("shop_item_banner", "Bannières exclusives"),
            description: t("shop_item_banner_desc", "Des bannières animées pour votre profil"),
            price: 150,
            icon: <ImageIcon size={26}/>,
        },
        {
            id: "theme",
            name: t("shop_item_theme", "Thèmes de profil"),
            description: t("shop_item_theme_desc", "Personnalisez les couleurs de votre page"),
            price: 200,
            icon: <Palette size={26}/>,
        },
        {
            id: "badge",
            name: t("shop_item_badge", "Badges de prestige"),
            description: t("shop_item_badge_desc", "Affichez votre statut de mélomane"),
            price: 100,
            icon: <BadgeCheck size={26}/>,
        },
        {
            id: "effect",
            name: t("shop_item_effect", "Effets spéciaux"),
            description: t("shop_item_effect_desc", "Des animations uniques sur votre avatar"),
            price: 300,
            icon: <Sparkles size={26}/>,
        },
    ];

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

                {/* Info comment gagner des points */}
                <div className="mb-8 flex items-center gap-3 bg-blue-500/10 dark:bg-blue-50 border border-blue-500/20 dark:border-blue-200 rounded-xl px-5 py-4">
                    <Sparkles size={20} className="text-blue-400 dark:text-blue-500 shrink-0"/>
                    <p className="text-sm text-blue-200 dark:text-blue-700">
                        {t("shop_earn_hint", "Gagnez 10 points à chaque critique d'album publiée !")}
                    </p>
                </div>

                {/* Grille des cosmétiques */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="relative bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-sm overflow-hidden"
                        >
                            <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-800/80 dark:bg-gray-100 text-slate-400 dark:text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">
                                <Lock size={11}/>
                                {t("shop_coming_soon", "Bientôt")}
                            </div>

                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 dark:from-purple-100 dark:to-blue-100 flex items-center justify-center text-purple-400 dark:text-purple-500 mb-4">
                                {item.icon}
                            </div>

                            <h3 className="font-bold text-white dark:text-gray-900 mb-1">
                                {item.name}
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-gray-500 mb-4 grow">
                                {item.description}
                            </p>

                            <div className="flex items-center gap-1.5 text-amber-400 dark:text-amber-500 font-bold">
                                <Coins size={16}/>
                                {item.price}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Shop;
