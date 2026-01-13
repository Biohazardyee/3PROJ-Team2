import React from "react";
import { FaMusic } from "react-icons/fa";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-800 mt-16 bg- py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from- to- rounded-lg flex items-center justify-center">
            <FaMusic className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">SUPCONTENT</span>
        </div>

        {/* Links */}
        <ul className="flex gap-6 text-sm text-gray-400">
          <li className="hover:text-white transition cursor-pointer">About</li>
          <li className="hover:text-white transition cursor-pointer">Privacy</li>
          <li className="hover:text-white transition cursor-pointer">Terms</li>
          <li className="hover:text-white transition cursor-pointer">Contact</li>
        </ul>

        {/* Copyright */}
        <p className="text-sm text-gray-500">
          © 2026 SUPCONTENT. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};
