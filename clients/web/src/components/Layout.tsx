import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#13131A] text-white overflow-hidden">
      {/* Ouvrir le menu */}
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      {/* Fermer la Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main id="zone-de-scroll" className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};

export default Layout;