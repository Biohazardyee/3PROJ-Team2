import React from 'react';

// Propriétés acceptées par le composant
type ButtonProps = {
  children: React.ReactNode; // Contenu du bouton (texte, icône, etc.)
  variant?: 'primary' | 'social'; // Type de style (primaire par défaut)
  onClick?: () => void; // Action déclenchée lors du clic
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', onClick }) => {
  // Effet visuel
  const baseStyle = "transition-all active:scale-[0.98]";
  
  // Dictionnaire regroupant les classes Tailwind selon le style choisi
  const styles = {
    primary: `${baseStyle} w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 text-lg`,
    social: `${baseStyle} flex justify-center items-center py-4 bg-[#1c1c27] border border-gray-800 rounded-xl hover:bg-[#272737] hover:border-gray-600 text-xl text-white`
  };

  return (
    // Création du bouton en lui appliquant le style correspondant
    <button onClick={onClick} className={styles[variant]}>
      {children}
    </button>
  );
};