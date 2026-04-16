import React from "react";

// Composant principal du footer
export const Footer: React.FC = () => {
  return (
    // Bordures en haut et espacements
    <footer className="border-t border-gray-800 mt-16 bg- py-12">
      {/* Structure responsive : en colonne sur mobile, en ligne sur grand écran */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Logo + nom de l'application */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-tr from- to- rounded-lg flex items-center justify-center">
              <img 
                src="/public/logo.png" 
                alt="Logo Melodia" 
                className="absolute w-13 h-13" 
              />
          </div>
          <span className="font-bold text-xl tracking-tight">Melodia</span>
        </div>

        {/* Menu footer (À propos, Confidentialité, etc.) */}
        <ul className="flex gap-6 text-sm text-gray-400">
          <li className="hover:text-white transition cursor-pointer">À propos</li>
          <li className="hover:text-white transition cursor-pointer">Confidentialité</li>
          <li className="hover:text-white transition cursor-pointer">Termes</li>
          <li className="hover:text-white transition cursor-pointer">Contact</li>
        </ul>

        {/* Mentions légales et droits d'auteur */}
        <p className="text-sm text-gray-500">
          © 2026 Melodia. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};