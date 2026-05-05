import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Notification = {
  id: number;
  type: 'like' | 'commentaire' | 'follow';
  user: string;
  actionKey: string; // Utilisation d'une clé pour la traduction
  albumName?: string; // Optionnel, pour le contexte du like
  timeAgo: string;
  unread: boolean;
}

const notificationsData: Notification[] = [
  {
    id: 1,
    type: 'like',
    user: '@alexdj',
    actionKey: 'action_liked_review',
    albumName: 'Midnight Pulse',
    timeAgo: 'Il y a 5 minutes',
    unread: true,
  },
  {
    id: 2,
    type: 'commentaire',
    user: '@beatmaster',
    actionKey: 'action_commented_review',
    timeAgo: 'Il y a 1 heure',
    unread: true,
  },
  {
    id: 3,
    type: 'follow',
    user: '@musiclover92',
    actionKey: 'action_started_following',
    timeAgo: 'Il y a 3 heures',
    unread: true,
  },
];

// Onglets Tout, Non-lues et Mentions
const TabItem: React.FC<{ label: string; count?: number; active?: boolean; onClick?: () => void }> = ({ label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
      active
        ? 'bg-slate-700 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md'
        : 'text-slate-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900 hover:bg-slate-800 dark:hover:bg-gray-100'
    }`}
  >
    {label}
    {/* Nombre de notifications */}
    {count !== undefined && count > 0 && <span className={`text-xs opacity-80 ${active ? '' : 'font-medium'}`}>({count})</span>}
  </button>
);

// Afficher la bonne icône selon l'action (like, commentaire ou suivi)
const StatusIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
  const iconSize = "w-5 h-5";
  switch (type) {
    case 'like': 
      return (
        <svg className={`${iconSize} text-red-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      );
    case 'commentaire': 
      return (
        <svg className={`${iconSize} text-blue-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      );
    case 'follow': 
      return (
        <svg className={`${iconSize} text-green-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
      );
    default:
      return null;
  }
};

// Détails d'une notification
const NotificationCard: React.FC<{ notification: Notification }> = ({ notification }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-slate-900 dark:bg-white border border-slate-700 dark:border-gray-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm hover:border-slate-600 dark:hover:border-gray-300 transition-colors cursor-pointer">
      
      <div className="flex items-center gap-5">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-800 dark:bg-gray-50 flex items-center justify-center shadow-inner">
          <StatusIcon type={notification.type} />
        </div>

        <div className="flex flex-col">
          <div className="text-slate-100 dark:text-gray-900 text-[15px] leading-relaxed">
            <span className="font-bold text-white dark:text-gray-900 tracking-wide">{notification.user}</span>{' '}
            <span className="text-slate-300 dark:text-gray-600">
              {t(notification.actionKey, { album: notification.albumName })}
            </span>
          </div>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">{notification.timeAgo}</p>
        </div>
      </div>

      {/* Indicateur notifications non-lues */}
      {notification.unread && (
        <div className="flex-shrink-0 w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
      )}
    </div>
  );
};

const Notifications: React.FC = () => {
  const { t } = useTranslation();
  // Etats pour gérer les données et les onglets
  const [notifications, setNotifications] = useState<Notification[]>(notificationsData);
  const [activeTab, setActiveTab] = useState<'Tout' | 'Non lues' | 'Mentions'>('Tout');

  // Calcul dynamique du nombre de notifications non lues
  const unreadCount = notifications.filter(n => n.unread).length;

  // Fonction pour tout marquer comme lu
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Filtrage des notifications selon l'onglet actif
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'Non lues') return n.unread;
    if (activeTab === 'Mentions') return n.type === 'commentaire';
    return true; 
  });

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-50 text-slate-50 dark:text-gray-900 p-6 md:p-10 lg:p-12 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Titre + bouton Tout marquer comme lu */}
        <header className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-white dark:text-gray-900 tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {t('notifications_title')}
            </h1>
            <p className="text-slate-400 dark:text-gray-600 text-lg mt-1.5 font-medium">
              {unreadCount === 1 
                ? t('unread_count_one', { count: unreadCount }) 
                : t('unread_count_other', { count: unreadCount })}
            </p>
          </div>
          <button 
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className={`border px-6 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm ${
              unreadCount > 0 
                ? 'bg-slate-800 dark:bg-white dark:text-gray-900 dark:border-gray-200 text-slate-100 hover:bg-slate-700 dark:hover:bg-gray-100'
                : 'bg-slate-900 dark:bg-gray-100 dark:text-gray-400 border-slate-800 dark:border-gray-200 text-slate-600 cursor-not-allowed'
            }`}
          >
            {t('mark_all_read')}
          </button>
        </header>

        {/* Navigation entre Tout, Non-lues et Mentions */}
        <nav className="bg-slate-900 dark:bg-white border border-slate-700 dark:border-gray-200 rounded-xl p-1.5 flex justify-center gap-1.5 shadow-inner">
          <TabItem label={t('tab_all')} active={activeTab === 'Tout'} onClick={() => setActiveTab('Tout')} />
          <TabItem label={t('tab_unread')} count={unreadCount} active={activeTab === 'Non lues'} onClick={() => setActiveTab('Non lues')} />
          <TabItem label={t('tab_mentions')} active={activeTab === 'Mentions'} onClick={() => setActiveTab('Mentions')} />
        </nav>

        {/* Liste défilante des notifications */}
        <main className="mt-10 space-y-5">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))
          ) : (
            <div className="text-center py-10 text-slate-500 dark:text-gray-400">
              {t('no_notifications')}
            </div>
          )}
        </main>
        
      </div>
    </div>
  );
};

export default Notifications;