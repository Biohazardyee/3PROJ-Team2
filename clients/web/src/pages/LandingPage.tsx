import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaStar, FaUsers, FaChartLine, FaGlobe, FaMusic, FaArrowRight, FaSearch } from "react-icons/fa";
import { AlbumCard } from "../components/AlbumCard"; 
import { Footer } from "../components/Footer";


const FamousAlbums = [
  { id: "1",
    title: "D&P à vie",
    artist: "Jul",
    cover: "https://lh3.googleusercontent.com/WoVLp__R9eynW29Ptfy8RO_H8ZSEegNeuGSPO4m4wmjkdVMou7u_3Fn52rNOfAEbjI4EO74tFnqPwwH81g=w544-h544-l90-rj", rating: 4.9, year: 2025, genre: "Rap"
  },
  { id: "2",
    title: "Destin",
    artist: "Ninho",
    cover: "https://lh3.googleusercontent.com/d839QAhSoC58LRIEOZXApz5FIlNKtExVa_AHfQ8wGRI24OU3jmDhBBJIi2sFE-hSLJHRLp0h25di4hXg=w544-h544-l90-rj", rating: 4.6, year: 2019, genre: "Rap"
   },
  { id: "3",
    title: "BDLM",
    artist: "Tiakola",
    cover: "https://lh3.googleusercontent.com/wWRHoBaUQ4cLSIOgtfNLcQFGMHzN_ahh7Bu0vqN6zF3YRrdzUoHhIaBFaRAiQ4uYJ9sHq0IyUj6oKUvAdQ=w544-h544-l90-rj", rating: 4.3, year: 2024, genre: "Rap"
   },
  { id: "4",
    title: "Positions",
    artist: "Ariana Grande",
    cover: "https://lh3.googleusercontent.com/2-_pSt_yjP16a7YPYGAHO4g9HLcNYdnXCfH-wXxNxXTGG7XWdJ93xLaHK92JrXGuVtjA86nbogM3Kx9l=w544-h544-l90-rj", rating: 4.1, year: 2020, genre: "Pop"
  },
];

const functionality = [
  { icon: FaBook,
    titre: "Bibliothèque musicale",
    description: "Suivez vos albums avec des statuts personnalisés."
  },
  { icon: FaStar,
    titre: "Évaluer et donner un avis",
    description: "Partagez votre opinion sur les albums et découvrez ce que les autres en pensent."
  },
  { icon: FaUsers,
    titre: "Connectez-vous avec les fans",
    description: "Suivez des utilisateurs ayant des goûts similaires et construisez votre communauté musicale."
  },
  { icon: FaChartLine,
    titre: "Découvrez de la nouvelle musique",
    description: "Recevez des recommandations personnalisées basées sur vos habitudes d'écoute."
  },
  { icon: FaGlobe,
    titre: "Scène musicale mondiale",
    description: "Explorez des albums et des artistes du monde entier."
  },
  { icon: FaMusic,
    titre: "Listes personnalisées",
    description: "Créez des playlists thématiques et partagez-les avec vos abonnés."
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#13131a] text-white font-sans">
      {/* SECTION 1 : Logo + boutons */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-125 h-125 bg-purple-600/10 rounded-full blur-[120px] -top-48 -left-48 animate-pulse" />
          <div className="absolute w-125 h-125 bg-pink-600/10 rounded-full blur-[120px] -bottom-48 -right-48 animate-pulse" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="w-20 h-20 bg-linear-to-tr from-[#a855f7] to-[#ec4899] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-purple-500/20">
            <FaMusic className="text-4xl text-white" />
          </div>
          {/*TODO : Changer la police d'ecriture*/}
          <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tighter bg-linear-to-r from-[#a855f7] via-[#ec4899] to-[#a855f7] bg-clip-text text-transparent">
            SUPCONTENT 
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-2xl mx-auto ">
            Le réseau social ultime pour les passionnés de musique
          </p>

          {/*Bouton Commencer*/}          
          <div className="flex items-center justify-center gap-4 flex-wrap mt-10">
            <button
              onClick={() => navigate("/register")}
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-8 py-4 rounded-xl text-lg flex items-center shadow-lg hover:shadow-blue-600 "
            >
              Commencer
              <FaArrowRight className="ml-2 w-5 h-5" />
            </button>
            
            {/*Bouton Se connecter*/}    
            <button
              onClick={() => navigate("/feed")}
              className="bg-[#1e1e26] border border-gray-800 hover:border-gray-600 text-white px-8 py-4 rounded-xl text-lg flex items-center shadow-lg hover:shadow-purple-700 "
            >
              Découvrir
              <FaSearch className="ml-2 w-5 h-5" />
            </button>
          </div>

          {/* Texte sous les boutons */}
          <p className="mt-7 text-gray-400 text-xl">
            Déjà un compte ?{" "}
            <span onClick={() => navigate("/login")} className="text-[#3b82f6] hover:text-[#2563eb] cursor-pointer font-semibold">
              Se connecter
            </span>
          </p>
        </div>
      </section>

      {/* SECTION : 2 Les albums en tendances */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col mb-12">
          <h2 className="text-3xl font-bold mb-2">Tendances actuelles</h2>
          <div className="h-1 w-20 bg-linear-to-r from-[#a855f7] to-[#ec4899] rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FamousAlbums.map((album) => (
            <AlbumCard key={album.id} {...album} />
          ))}
        </div>
      </section>


      {/* SECTION 3 : La grille des fonctionalités */}
      <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Tout ce dont vous avez besoin</h2>
            <p className="">Tous les outils pour améliorer votre expérience musicale</p>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {functionality.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-[#1e1e26] rounded-2xl border border-gray-800 p-8 hover:border-[#a855f7]/50 transition-all group">
                <div className="w-14 h-14 rounded-xl bg-[#a855f7]/10 flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-[#a855f7]" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-white">{feature.titre}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION : 4 CTA*/}       {/* TODO : Trouver une police Orbotron */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-[#1e1e2e]/50 rounded-[20px] border border-gray-800 p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-tr from-purple-500/5 to-transparent pointer-events-none" />
          {/* Titre */}
          <h2 className="text-4xl md:text-3xl  font-bold mb-6 tracking-tight text-white uppercase italic">
            Prêt à commencer votre aventure ?
          </h2>
          {/* Texte */}
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto  tracking-wider">
            Rejoignez des milliers de fans et commencez dès aujourd'hui à suivre vos albums préférés.
          </p>
          {/* Boutton */}
          <button
            onClick={() => navigate("/register")}
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-12 py-4 rounded-lg  font-bold text-xl transition-all shadow-xl shadow-blue-500/20 active:scale-95"
          >
            Créez votre compte gratuit
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
};