import React, { useState } from 'react';
import { 
  Users, Music, FileText, AlertTriangle, Search, 
  ShieldAlert, Ban, Eye, Activity
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

type AdminTab = 'users' | 'reports' | 'analytics';

type AdminStats = {
  totalUsers: number;
  albums: number;
  reviews: number;
  reports: number;
}

// Données statiques à changer
const STATS: AdminStats = {
  totalUsers: 12847,
  albums: 45621,
  reviews: 89432,
  reports: 23,
};

const REPORTS = [
  {
    id: 1,
    reportedBy: '@user123',
    timeAgo: '2h', // On peut aussi traduire "Il y a 2 heures" via i18n
    target: '@spammer01',
    reasonKey: 'reason_inappropriate_language',
    status: 'pending',
    type: 'review',
  },
  {
    id: 2,
    reportedBy: '@user456',
    timeAgo: '5h',
    target: '@user789',
    reasonKey: 'reason_inappropriate_photo',
    status: 'pending',
    type: 'profile',
  }
];

// Sous composants

const StatCard = ({ icon: Icon, value, label, badge, isUrgent }: any) => (
  <div className={`bg-[#1a1d26] dark:bg-white border ${isUrgent ? 'border-rose-500/50' : 'border-slate-800 dark:border-gray-200'} rounded-xl p-5 relative overflow-hidden transition-all hover:border-slate-700 dark:hover:border-gray-300 shadow-sm`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`${isUrgent ? 'text-rose-500 bg-rose-500/10' : 'text-blue-500 bg-blue-500/10 dark:bg-blue-50'} p-2 rounded-lg`}>
        <Icon size={20} />
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${isUrgent ? 'bg-rose-600 text-white' : 'bg-rose-500 text-white'}`}>
        {badge}
      </span>
    </div>
    <div className="text-3xl font-bold text-white dark:text-gray-900 mb-1">{value.toLocaleString()}</div>
    <div className="text-slate-500 dark:text-gray-500 text-sm font-medium">{label}</div>
  </div>
);

const UserModerationCard = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-gray-200 rounded-2xl overflow-hidden shadow-xl transition-colors">
      <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#2a2e3d] dark:bg-gray-100 border border-slate-700 dark:border-gray-200 flex items-center justify-center text-blue-400 dark:text-blue-600 font-bold text-xl shadow-inner">
            AL
          </div>
          <div>
            <h3 className="text-xl font-bold text-white dark:text-gray-900" style={{ fontFamily: "'Orbitron', sans-serif" }}>@alexdj</h3>
            <p className="text-slate-400 dark:text-gray-600 text-sm mt-1">blablabla</p>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="text-slate-500 dark:text-gray-500"><strong className="text-slate-200 dark:text-gray-900">1247</strong> followers</span>
              <span className="text-slate-500 dark:text-gray-500"><strong className="text-slate-200 dark:text-gray-900">138</strong> albums</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-[#161821] dark:bg-gray-50 border-t border-slate-800 dark:border-gray-200 flex flex-wrap gap-3">
        <button className="flex items-center gap-2 bg-slate-800 dark:bg-white dark:text-gray-700 dark:border dark:border-gray-300 hover:bg-slate-700 dark:hover:bg-gray-100 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
          <Eye size={14} /> {t('view_profile')}
        </button>
        <button className="flex items-center gap-2 bg-slate-800 dark:bg-white dark:text-gray-700 dark:border dark:border-gray-300 hover:bg-slate-700 dark:hover:bg-gray-100 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
          <Activity size={14} /> {t('view_activity')}
        </button>
        <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-rose-500/20 ml-auto">
          <Ban size={14} /> {t('ban_user')}
        </button>
      </div>
    </div>
  );
};


const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  // Onglets pour le mapping
  const tabs = [
    { id: 'users', label: t('tab_users') },
    { id: 'reports', label: t('tab_reports') },
    { id: 'analytics', label: t('tab_analytics') }
  ] as const;

  return (
    <div className="min-h-screen bg-[#0f1117] dark:bg-slate-50 text-slate-200 dark:text-gray-900 p-6 md:p-10 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top section*/}
        <header className="flex items-start gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white dark:text-gray-900 tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {t('admin_dashboard_title')}
            </h1>
            <p className="text-slate-500 dark:text-gray-600 text-lg mt-1 font-medium">{t('admin_subtitle')}</p>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Users} value={STATS.totalUsers} label={t('stat_users')} badge={t('badge_total')} />
          <StatCard icon={Music} value={STATS.albums} label={t('stat_albums')} badge={t('badge_total')} />
          <StatCard icon={FileText} value={STATS.reviews} label={t('stat_reviews')} badge={t('badge_total')} />
          <StatCard icon={AlertTriangle} value={STATS.reports} label={t('stat_reports')} badge={t('badge_urgent')} isUrgent={true} />
        </div>

        {/* Navigation */}
        <nav className="bg-[#1a1d26]/50 dark:bg-white border border-slate-800 dark:border-gray-200 rounded-2xl p-1.5 flex gap-2 shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-[#2a2e3d] dark:bg-gray-100 text-white dark:text-gray-900 shadow-md' 
                  : 'text-slate-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900 hover:bg-slate-800/30 dark:hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.id === 'reports' && (
                <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">23</span>
              )}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="space-y-6">
          {activeTab === 'users' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder={t('search_placeholder')}
                    className="w-full bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white dark:text-gray-900 focus:outline-none focus:border-blue-500/50 transition-all shadow-sm"
                  />
                </div>
                <button className="flex items-center justify-center gap-2 bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-gray-200 hover:border-slate-600 dark:hover:border-gray-400 px-6 py-3.5 rounded-xl text-sm font-bold text-white dark:text-gray-700 transition-all">
                   <Ban size={18} className="text-slate-400 dark:text-gray-400" /> {t('banned_users_btn')}
                </button>
              </div>
              <UserModerationCard />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {REPORTS.map((report) => (
                <div key={report.id} className="bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-gray-200 rounded-2xl p-6 shadow-lg border-l-4 border-l-rose-500">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full">
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white dark:text-gray-900">
                            {t('report_number', { id: report.id })}
                          </h3>
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                            {t(`status_${report.status}`)}
                          </span>
                          <span className="bg-slate-800 dark:bg-gray-100 text-slate-300 dark:text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                            {t(`type_${report.type}`)}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-gray-500 text-xs">
                           {t('reported_by')} <span className="text-slate-300 dark:text-gray-800 font-medium">{report.reportedBy}</span> • {report.timeAgo}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0f1117] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-slate-300 dark:text-gray-700 mb-2 font-medium">
                      <strong className="text-white dark:text-gray-900">{t('target')}:</strong> {report.target}
                    </p>
                    <p className="text-sm text-slate-300 dark:text-gray-700 font-medium">
                      <strong className="text-white dark:text-gray-900">{t('reason')}:</strong> {t(report.reasonKey)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">{t('check_content')}</button>
                    <button className="bg-slate-800 dark:bg-gray-200 dark:text-gray-700 hover:bg-slate-700 dark:hover:bg-gray-300 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">{t('contact_user')}</button>
                    <button className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">{t('take_action')}</button>
                    <button className="text-slate-500 dark:text-gray-400 hover:text-white dark:hover:text-gray-900 px-4 py-2 rounded-lg text-xs font-bold transition-all ml-auto">{t('reject')}</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-gray-200 rounded-2xl p-20 text-center animate-in fade-in duration-300">
              <Activity size={48} className="mx-auto text-slate-700 dark:text-gray-300 mb-4 opacity-50" />
              <h2 className="text-xl font-bold text-slate-500 dark:text-gray-400">{t('analytics_soon')}</h2>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;