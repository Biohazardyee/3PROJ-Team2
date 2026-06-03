import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import apiClient from '../api/client';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchCount = async () => {
      try {
        const decoded: any = jwtDecode(token);
        const userId = decoded.id || decoded.userId;
        
        const res = await apiClient.get(`/notifications/user/${userId}`);
        const list = res.data.notifications || [];
        const count = list.filter((n: any) => !n.is_read).length;
        setUnreadCount(count);
      } catch (e) {
        console.error("Impossible de charger le compteur de notifications", e);
      }
    };

    fetchCount();
    
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button 
      onClick={() => navigate('/notifications')}
      className="relative p-2 text-slate-400 hover:text-white transition-colors focus:outline-none"
    >
      <Bell size={24} />

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(244,63,94,0.6)] border border-slate-950 animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};