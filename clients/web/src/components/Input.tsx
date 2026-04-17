import React from 'react';
import { IconType } from 'react-icons';

type InputProps = {
  label: string;
  type: string;
  placeholder: string;
  icon: IconType;
}

export const Input: React.FC<InputProps> = ({ label, type, placeholder, icon: Icon }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold ml-1 text-gray-300 dark:text-gray-700">{label}</label>
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 group-focus-within:text-blue-500 transition-colors" />
      <input 
        type={type} 
        placeholder={placeholder} 
        className="w-full bg-[#1c1c27] dark:bg-white border border-gray-800 dark:border-gray-200 rounded-xl py-4 px-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600 dark:placeholder:text-gray-400 text-white dark:text-gray-900 shadow-sm" 
      />
    </div>
    
  </div>
);