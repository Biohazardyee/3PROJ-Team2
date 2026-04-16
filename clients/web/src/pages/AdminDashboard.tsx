import React, { useState } from 'react';
import { 
  Users, Music, FileText, AlertTriangle, Search, 
  ShieldAlert, Ban, Eye, Activity
} from 'lucide-react';

type AdminTab = 'Gérer les utilisateurs' | 'Signalements' | 'Analyses';

type AdminStats = {
  totalUsers: number;
  albums: number;
  reviews: number;
  reports: number;
}

type UserReport = {
  id: number;
  reportedBy: string;
  timeAgo: string;
  target: string;
  reason: string;
  status: 'En attente' | 'Traité';
  type: 'Avis' | 'Profil';
}

const STATS: AdminStats = {
  totalUsers: 12847,
  albums: 45621,
  reviews: 89432,
  reports: 23,
};

const REPORTS: UserReport[] = [
  {
    id: 1,
    reportedBy: '@user123',
    timeAgo: 'Il y a 2 heures',
    target: '@spammer01',
    reason: 'Langage inapproprié sur un avis',
    status: 'En attente',
    type: 'Avis',
  },
  {
    id: 2,
    reportedBy: '@user456',
    timeAgo: 'Il y a 5 heures',
    target: '@user789',
    reason: 'Photo de profil inappropriée',
    status: 'En attente',
    type: 'Profil',
  }
];

// Cartes statistiques
const StatCard = ({ icon: Icon, value, label, badge, isUrgent }: any) => (
  <div className={`bg-[#1a1d26] border ${isUrgent ? 'border-rose-500/50' : 'border-slate-800'} rounded-xl p-5 relative overflow-hidden transition-all hover:border-slate-700`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`${isUrgent ? 'text-rose-500 bg-rose-500/10' : 'text-blue-500 bg-blue-500/10'} p-2 rounded-lg`}>
        <Icon size={20} />
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${isUrgent ? 'bg-rose-600 text-white' : 'bg-rose-500 text-white'}`}>
        {badge}
      </span>
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</div>
    <div className="text-slate-500 text-sm font-medium">{label}</div>
  </div>
);

// Carte Utilisateur avec options de modération
const UserModerationCard = () => (
  <div className="bg-[#1a1d26] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
    <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[#2a2e3d] border border-slate-700 flex items-center justify-center text-blue-400 font-bold text-xl shadow-inner">
          AL
        </div>
        <div>
          <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>@alexdj</h3>
          <p className="text-slate-400 text-sm mt-1">blablabla</p>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="text-slate-500"><strong className="text-slate-200">1247</strong> followers</span>
            <span className="text-slate-500"><strong className="text-slate-200">138</strong> albums</span>
          </div>
        </div>
      </div>
    </div>
    
    <div className="px-6 py-4 bg-[#161821] border-t border-slate-800 flex flex-wrap gap-3">
      <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
        <Eye size={14} /> Voir le profil
      </button>
      <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">
        <Activity size={14} /> Voir l'activité
      </button>
      <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-rose-500/20 ml-auto">
        <Ban size={14} /> Bannir l'utilisateur
      </button>
    </div>
  </div>
);

// Page principale du Dashboard Admin
const AdminDashboard: React.FC = () => {
  // État local pour savoir quel onglet est actuellement affiché
  const [activeTab, setActiveTab] = useState<AdminTab>('Gérer les utilisateurs');

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Titre et header de la page d'administration */}
        <header className="flex items-start gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              Admin Dashboard
            </h1>
            <p className="text-slate-500 text-lg mt-1 font-medium">Gérer les utilisateurs et le contenu</p>
          </div>
        </header>

        {/* Section regroupant les 4 cartes de statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Users} value={STATS.totalUsers} label="Utilisateurs" badge="Total" />
          <StatCard icon={Music} value={STATS.albums} label="Albums" badge="Total" />
          <StatCard icon={FileText} value={STATS.reviews} label="Avis" badge="Total" />
          <StatCard icon={AlertTriangle} value={STATS.reports} label="Signalements" badge="Urgent" isUrgent={true} />
        </div>

        {/* Barre de navigation entre les différents onglets de gestion */}
        <nav className="bg-[#1a1d26]/50 border border-slate-800 rounded-2xl p-1.5 flex gap-2 shadow-inner">
          {(['Gérer les utilisateurs', 'Signalements', 'Analyses'] as AdminTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab ? 'bg-[#2a2e3d] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              {tab}
              {tab === 'Signalements' && (
                <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">23</span>
              )}
            </button>
          ))}
        </nav>

        {/* Contenu affiché dynamiquement selon l'onglet sélectionné */}
        <div className="space-y-6">
          {/* Contenu de l'onglet Gestion des utilisateurs */}
          {activeTab === 'Gérer les utilisateurs' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    placeholder="Rechercher des utilisateurs par nom d'utilisateur ou email..." 
                    className="w-full bg-[#1a1d26] border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all shadow-sm"
                  />
                </div>
                <button className="flex items-center justify-center gap-2 bg-[#1a1d26] border border-slate-800 hover:border-slate-600 px-6 py-3.5 rounded-xl text-sm font-bold text-white transition-all">
                   <Ban size={18} className="text-slate-400" /> Utilisateurs Bannis
                </button>
              </div>
              <UserModerationCard />
            </div>
          )}

          {/* Contenu de l'onglet Signalements */}
          {activeTab === 'Signalements' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {REPORTS.map((report) => (
                <div key={report.id} className="bg-[#1a1d26] border border-slate-800 rounded-2xl p-6 shadow-lg border-l-4 border-l-rose-500">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full">
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">Signalement #{report.id}</h3>
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">{report.status}</span>
                          <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{report.type}</span>
                        </div>
                        <p className="text-slate-500 text-xs">Signalé par <span className="text-slate-300 font-medium">{report.reportedBy}</span> • {report.timeAgo}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0f1117] border border-slate-800 rounded-xl p-4 mb-6">
                    <p className="text-sm text-slate-300 mb-2 font-medium"><strong className="text-white">Utilisateur:</strong> {report.target}</p>
                    <p className="text-sm text-slate-300 font-medium"><strong className="text-white">Raison:</strong> {report.reason}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">Vérifier le contenu</button>
                    <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all">Contacter l'utilisateur</button>
                    <button className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm">Effectuer une action</button>
                    <button className="text-slate-500 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all ml-auto">Rejeter</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section Analyses */}
          {activeTab === 'Analyses' && (
            <div className="bg-[#1a1d26] border border-slate-800 rounded-2xl p-20 text-center animate-in fade-in duration-300">
              <Activity size={48} className="mx-auto text-slate-700 mb-4 opacity-50" />
              <h2 className="text-xl font-bold text-slate-500">Analyses sera bientôt disponible...</h2>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;