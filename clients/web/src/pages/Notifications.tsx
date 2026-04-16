import React from 'react';

type Notification = {
  id: number;
  type: 'like' | 'commentaire' | 'follow';
  user: string;
  actionText: string;
  timeAgo: string;
  unread: boolean;
}

const notificationsData: Notification[] = [
  {
    id: 1,
    type: 'like',
    user: '@alexdj',
    actionText: 'a aimé votre avis sur "Midnight Pulse"',
    timeAgo: 'Il y a 5 minutes',
    unread: true,
  },
  {
    id: 2,
    type: 'commentaire',
    user: '@beatmaster',
    actionText: 'a commenté votre avis',
    timeAgo: 'Il y a 1 heure',
    unread: true,
  },
  {
    id: 3,
    type: 'follow',
    user: '@musiclover92',
    actionText: 'a commencé à vous suivre',
    timeAgo: 'Il y a 3 heures',
    unread: true,
  },
];

// Onglets Tout, Non-lues et Mentions
const TabItem: React.FC<{ label: string; count?: number; active?: boolean }> = ({ label, count, active }) => (
  <button
    className={`px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
      active
        ? 'bg-slate-700 text-white shadow-md'
        : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    {label}
    {/* Nombre de notifications */}
    {count !== undefined && <span className={`text-xs opacity-80 ${active ? '' : 'font-medium'}`}>({count})</span>}
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
const NotificationCard: React.FC<{ notification: Notification }> = ({ notification }) => (
  <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm hover:border-slate-600 transition-colors cursor-pointer">
    
    {/* Partie gauche : Icône colorée et texte descriptif */}
    <div className="flex items-center gap-5">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center shadow-inner">
        <StatusIcon type={notification.type} />
      </div>

      <div className="flex flex-col">
        <p className="text-slate-100 text-[15px] leading-relaxed">
          <span className="font-bold text-white tracking-wide">{notification.user}</span>{' '}
          <span className="text-slate-300">{notification.actionText}</span>
        </p>
        <p className="text-slate-500 text-sm mt-1">{notification.timeAgo}</p>
      </div>
    </div>

    {/* Indicateur notifications non-lues */}
    {notification.unread && (
      <div className="flex-shrink-0 w-3 h-3 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
    )}
  </div>
);

const Notifications: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-10 lg:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Titre + bouton Tout marquer comme lu */}
        <header className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Notifications
            </h1>
            <p className="text-slate-400 text-lg mt-1.5 font-medium">3 notifications non lues</p>
          </div>
          <button className="bg-slate-800 text-slate-100 px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-700 transition-colors shadow-sm">
            Tout marquer comme lu
          </button>
        </header>

        {/* Navigation entre Tout, Non-lues et Mentions */}
        <nav className="bg-slate-900 border border-slate-700 rounded-xl p-1.5 flex justify-center gap-1.5 shadow-inner">
          <TabItem label="Tout" active />
          <TabItem label="Non lues" count={3} />
          <TabItem label="Mentions" />
        </nav>

        {/* Liste défilante des notifications */}
        <main className="mt-10 space-y-5">
          {notificationsData.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </main>
        
      </div>
    </div>
  );
};

export default Notifications;