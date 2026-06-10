import React from "react";
import { useTranslation } from "react-i18next";

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-gray-800 dark:border-gray-200 mt-16 bg-transparent dark:bg-white py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        
        <div className="flex items-center gap-3">
          <div className="w-15 bg-linear-to-tr from-transparent to-transparent rounded-lg flex items-center justify-center relative">
              <img 
                src="/public/logo.png" 
                alt="Logo Melodia" 
                className="absolute w-13 h-13" 
              />
          </div>
          <span className="font-bold text-xl tracking-tight text-white dark:text-gray-900">Melodia</span>
        </div>

        <ul className="flex gap-6 text-sm text-gray-400 dark:text-gray-500">
            <li className="hover:text-white dark:hover:text-gray-900 transition cursor-pointer">
              {t('about')}
            </li>
            <li className="hover:text-white dark:hover:text-gray-900 transition cursor-pointer">
              {t('privacy')}
            </li>
            <li className="hover:text-white dark:hover:text-gray-900 transition cursor-pointer">
              {t('terms')}
            </li>
            <li className="hover:text-white dark:hover:text-gray-900 transition cursor-pointer">
              {t('contact')}
            </li>
        </ul>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          © 2026 Melodia. {t('rights')}
        </p>
      </div>
    </footer>
  );
};