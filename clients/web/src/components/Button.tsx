import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'social';
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', onClick }) => {
  const baseStyle = "transition-all active:scale-[0.98]";
  const styles = {
    primary: `${baseStyle} w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 text-lg`,
    social: `${baseStyle} flex justify-center items-center py-4 bg-[#1c1c27] border border-gray-800 rounded-xl hover:bg-[#272737] hover:border-gray-600 text-xl text-white`
  };

  return (
    <button onClick={onClick} className={styles[variant]}>
      {children}
    </button>
  );
};