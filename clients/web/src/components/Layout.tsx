import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { Footer } from './Footer';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#13131A] dark:bg-slate-50 text-white dark:text-gray-900 overflow-hidden transition-colors duration-300">
      {/* Ouvrir le menu */}
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      {/* Fermer la Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main id="zone-de-scroll" className="flex-1 overflow-y-auto">
        <Outlet />
        <Footer /> 
      </main>
    </div>
  );
};

export default Layout;