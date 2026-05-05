import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {
      "exclusive_content": "Contenu Exclusif",
      "join_melodia": "Rejoignez Melodia pour accéder à ce contenu.",
      "login": "Se connecter",
      "create_account": "Créer un compte",
      "later": "Plus tard",
      "about": "À propos",
      "privacy": "Confidentialité",
      "terms": "Conditions",
      "contact": "Contact",
      "rights": "Tous droits réservés.",
      "nav_home": "Accueil",
      "nav_feed": "Votre fil",
      "nav_stats": "Statistiques",
      "nav_library": "Mes playlists",
      "nav_settings": "Paramètres",
      "nav_admin": "Admin Dashboard",
      "light_mode": "Mode Clair",
      "dark_mode": "Mode Sombre",
      "menu_title": "MENU"
    }
  },
  en: {
    translation: {
      "exclusive_content": "Exclusive Content",
      "join_melodia": "Join Melodia to access this content.",
      "login": "Login",
      "create_account": "Create account",
      "later": "Later",
      "about": "About",
      "privacy": "Privacy",
      "terms": "Terms",
      "contact": "Contact",
      "rights": "All rights reserved.",
      "nav_home": "Home",
      "nav_feed": "Feed",
      "nav_stats": "Statistics",
      "nav_library": "Library",
      "nav_settings": "Settings",
      "nav_admin": "Admin Dashboard",
      "light_mode": "Light Mode",
      "dark_mode": "Dark Mode",
      "menu_title": "MENU"
    }
  }
};

i18n
  .use(LanguageDetector) 
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr', 
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;