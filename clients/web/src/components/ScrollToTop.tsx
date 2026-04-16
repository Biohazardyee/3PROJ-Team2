import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // Récupère le chemin de l'URL actuelle (ex: /home, /feed)
  const { pathname } = useLocation();

  // Déclenche l'effet à chaque fois que le chemin de la page change
  useEffect(() => {
    
    // Cherche le conteneur spécifique qui possède le scroll
    const mainContent = document.getElementById('zone-de-scroll');

    if (mainContent) {
      // Remonte le défilement du conteneur tout en haut instantanément
      mainContent.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } else {
      // Remonte la fenêtre globale par défaut si le conteneur n'est pas trouvé
      window.scrollTo(0, 0); 
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;