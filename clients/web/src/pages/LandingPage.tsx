import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaBook, FaStar, FaUsers, FaChartLine, FaGlobe, FaMusic, FaArrowRight, FaSearch } from "react-icons/fa";
import { AlbumCard } from "../components/AlbumCard";
import { Footer } from "../components/Footer";

const TRENDING_ALBUMS = [
  { id: "1", title: "D&P à vie", artist: "Jul", cover: "https://lh3.googleusercontent.com/WoVLp__R9eynW29Ptfy8RO_H8ZSEegNeuGSPO4m4wmjkdVMou7u_3Fn52rNOfAEbjI4EO74tFnqPwwH81g=w544-h544-l90-rj", rating: 4.9, year: 2025, genre: "Rap" },
  { id: "2", title: "Destin", artist: "Ninho", cover: "https://lh3.googleusercontent.com/d839QAhSoC58LRIEOZXApz5FIlNKtExVa_AHfQ8wGRI24OU3jmDhBBJIi2sFE-hSLJHRLp0h25di4hXg=w544-h544-l90-rj", rating: 4.6, year: 2019, genre: "Rap" },
  { id: "3", title: "BDLM", artist: "Tiakola", cover: "https://yt3.googleusercontent.com/wWRHoBaUQ4cLSIOgtfNLcQFGMHzN_ahh7Bu0vqN6zF3YRrdzUoHhIaBFaRAiQ4uYJ9sHq0IyUj6oKUvAdQ=w544-h544-l90-rj", rating: 4.3, year: 2024, genre: "Rap" },
  { id: "4", title: "Positions", artist: "Ariana Grande", cover: "https://yt3.googleusercontent.com/2-_pSt_yjP16a7YPYGAHO4g9HLcNYdnXCfH-wXxNxXTGG7XWdJ93xLaHK92JrXGuVtjA86nbogM3Kx9l=w544-h544-l90-rj", rating: 4.1, year: 2020, genre: "Pop" },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Liste des fonctionnalités avec clés de traduction
  const FEATURES = [
    { icon: FaBook, titre: t("feature_1_title"), description: t("feature_1_desc") },
    { icon: FaStar, titre: t("feature_2_title"), description: t("feature_2_desc") },
    { icon: FaUsers, titre: t("feature_3_title"), description: t("feature_3_desc") },
    { icon: FaChartLine, titre: t("feature_4_title"), description: t("feature_4_desc") },
    { icon: FaGlobe, titre: t("feature_5_title"), description: t("feature_5_desc") },
    { icon: FaMusic, titre: t("feature_6_title"), description: t("feature_6_desc") },
  ];

  return (
    <div className="min-h-screen bg-[#13131a] text-white font-sans selection:bg-purple-500/30">
      
      {/* Logo + titre */}
      <section className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
        {/* Effets de lumière en arrière-plan */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-125 h-125 bg-purple-600/10 rounded-full blur-[120px] -top-48 -left-48 animate-pulse" />
          <div className="absolute w-125 h-125 bg-pink-600/10 rounded-full blur-[120px] -bottom-48 -right-48 animate-pulse" />
        </div>

        <div className="relative z-10 max-w-10xl mx-auto px-6 text-center">
          {/* Logo Melodia */}
          <div className="w-25 h-20 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <img src="/logo.png" alt="Logo" className="w-50 h-50 object-contain" />
          </div>
          
          {/* Titre avec effet de texte dégradé */}
          <h1 
            style={{ fontFamily: "'Michroma', sans-serif" }} 
            className="text-5xl md:text-7xl font-black tracking-tighter uppercase bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-8"
          >
            MELODIA
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto">
            {t("landing_hero_subtitle")}
          </p>

          {/* Boutons S'inscrire ou explorer */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button 
              onClick={() => navigate("/register")} 
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-8 py-4 rounded-xl text-lg flex items-center shadow-lg transition-all hover:scale-105"
            >
              {t("landing_btn_register")} <FaArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate("/home")} 
              className="bg-[#1e1e26] border border-gray-800 hover:border-gray-600 text-white px-8 py-4 rounded-xl text-lg flex items-center transition-all"
            >
              {t("landing_btn_discover")} <FaSearch className="ml-2 w-5 h-5" />
            </button>
          </div>

          {/* Bouton Se connecter */}
          <p className="mt-8 text-gray-500">
            {t("landing_already_account")}{" "}
            <span 
              onClick={() => navigate("/login")} 
              className="text-[#3b82f6] hover:underline cursor-pointer font-semibold"
            >
              {t("landing_login_link")}
            </span>
          </p>
        </div>
      </section>

      {/* Tendances actuelles */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col mb-12">
          <h2 className="text-3xl font-bold mb-2">{t("landing_trending_title")}</h2>
          <div className="h-1.5 w-20 bg-gradient-to-r from-[#a855f7] to-[#ec4899] rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {TRENDING_ALBUMS.map((album) => (
            <AlbumCard key={album.id} {...album} />
          ))}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="max-w-7xl mx-auto px-6 py-24 bg-white/[0.02] rounded-[40px] border border-white/[0.05]">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">{t("landing_features_title")}</h2>
          <p className="text-gray-400">{t("landing_features_subtitle")}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-[#1e1e26] rounded-2xl border border-gray-800 p-8 hover:border-[#a855f7]/50 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-[#a855f7]/10 flex items-center justify-center mb-6 group-hover:bg-[#a855f7]/20 transition-colors">
                  <Icon className="w-7 h-7 text-[#a855f7]" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-white">{feature.titre}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Créer un compte en bas de la page */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-gradient-to-b from-[#1e1e2e] to-[#13131a] rounded-[40px] border border-gray-800 p-12 md:p-20 text-center relative overflow-hidden shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 italic uppercase tracking-tighter">
            {t("landing_cta_title")}
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            {t("landing_cta_subtitle")}
          </p>
          <button 
            onClick={() => navigate("/register")} 
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-12 py-5 rounded-2xl font-bold text-xl transition-all hover:scale-105 shadow-xl shadow-blue-500/20"
          >
            {t("landing_cta_btn")}
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
};