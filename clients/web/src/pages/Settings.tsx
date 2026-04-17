import React, { useState } from 'react';
import { User, Bell, Shield, Database, Upload, Trash2, ExternalLink } from 'lucide-react';

type TabType = 'Profile' | 'Notifications' | 'Privacy' | 'Data';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Profile');

  return (
    <div className="min-h-screen bg-[#0f1117] dark:bg-slate-50 text-slate-200 dark:text-gray-900 p-6 md:p-10 lg:p-12 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header de la page */}
        <header>
          <h1 className="text-4xl font-bold text-white dark:text-gray-900 mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            Paramètres
          </h1>
          <p className="text-slate-400 dark:text-gray-600 text-lg">Gérez votre compte et vos préférences</p>
        </header>

        {/* Barre de navigation */}
        <nav className="bg-[#1a1d26]/50 dark:bg-white border border-slate-800 dark:border-gray-200 rounded-2xl p-1.5 flex flex-wrap md:flex-nowrap gap-1 shadow-inner transition-colors">
          <button
            onClick={() => setActiveTab('Profile')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'Profile' ? 'bg-[#2a2e3d] dark:bg-gray-100 text-white dark:text-gray-900 shadow-md' : 'text-slate-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900'
            }`}
          >
            <User size={18} /> Profil
          </button>
          <button
            onClick={() => setActiveTab('Notifications')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'Notifications' ? 'bg-[#2a2e3d] dark:bg-gray-100 text-white dark:text-gray-900 shadow-md' : 'text-slate-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900'
            }`}
          >
            <Bell size={18} /> Notifications
          </button>
          <button
            onClick={() => setActiveTab('Privacy')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'Privacy' ? 'bg-[#2a2e3d] dark:bg-gray-100 text-white dark:text-gray-900 shadow-md' : 'text-slate-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900'
            }`}
          >
            <Shield size={18} /> Confidentialité
          </button>
          <button
            onClick={() => setActiveTab('Data')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'Data' ? 'bg-[#2a2e3d] dark:bg-gray-100 text-white dark:text-gray-900 shadow-md' : 'text-slate-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-900'
            }`}
          >
            <Database size={18} /> Données
          </button>
        </nav>

        {/* Contenu */}
        <main className="bg-[#1a1d26] dark:bg-white border border-slate-800 dark:border-gray-200 rounded-2xl p-6 md:p-8 shadow-xl transition-colors">
          
          {/* Profil */}
          {activeTab === 'Profile' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Photo de profil */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-100 dark:text-gray-900 uppercase tracking-wider">Photo de profil</h3>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-[#2a2e3d] dark:bg-gray-100 border border-slate-700 dark:border-gray-200 flex items-center justify-center text-blue-400 dark:text-blue-600 text-2xl font-bold">
                    ML
                  </div>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-[#2a2e3d] dark:bg-gray-100 hover:bg-slate-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-bold border border-slate-700 dark:border-gray-200 transition-all">
                      <Upload size={16} /> Charger
                    </button>
                    <button className="flex items-center gap-2 bg-transparent hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 px-4 py-2 rounded-lg text-sm font-bold border border-slate-800 dark:border-gray-200 hover:border-rose-500/50 transition-all">
                      <Trash2 size={16} /> Supprimer
                    </button>
                  </div>
                </div>
              </section>

              <hr className="border-slate-800 dark:border-gray-100" />

              {/* Formulaire Profil */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-100 dark:text-gray-700 mb-2">Nom</label>
                  <input 
                    type="text" 
                    defaultValue="Music Lover" 
                    className="w-full bg-[#0f1117] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm dark:text-gray-900 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-100 dark:text-gray-700 mb-2">Nom d'utilisateur</label>
                  <input 
                    type="text" 
                    defaultValue="musiclover" 
                    className="w-full bg-[#0f1117] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm dark:text-gray-900 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-100 dark:text-gray-700 mb-2">Bio</label>
                  <textarea 
                    rows={3}
                    defaultValue="Passionné de musique électronique et de découverte de nouveaux sons. Toujours à la recherche du prochain album exceptionnel. 🎧 ✨" 
                    className="w-full bg-[#0f1117] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm dark:text-gray-900 focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-100 dark:text-gray-700 mb-2">Localisation</label>
                    <input 
                      type="text" 
                      defaultValue="Paris, France" 
                      className="w-full bg-[#0f1117] dark:bg-gray-50 border border-slate-800 dark:border-gray-200 rounded-xl px-4 py-3 text-sm dark:text-gray-900 focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all">
                  Sauvegarder les modifications
                </button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === 'Notifications' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-white dark:text-gray-900 mb-4">Préférences de notification</h3>
              {[
                { title: 'Notifications par e-mail', desc: 'Recevoir des mises à jour sur votre activité par e-mail.' },
                { title: 'Notifications Push', desc: 'Recevoir des alertes en temps réel sur votre navigateur ou mobile.' },
                { title: 'Alertes nouveaux abonnés', desc: 'Me prévenir quand quelqu\'un suit mon profil.' },
                { title: 'Mentions & Commentaires', desc: 'Me prévenir quand je suis mentionné dans une critique.' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-[#0f1117] dark:bg-gray-50 rounded-xl border border-slate-800 dark:border-gray-200">
                  <div>
                    <p className="text-sm font-bold text-white dark:text-gray-900">{item.title}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{item.desc}</p>
                  </div>
                  <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Privacy */}
          {activeTab === 'Privacy' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-white dark:text-gray-900 mb-4">Sécurité & Confidentialité</h3>
              <div className="p-4 bg-blue-500/10 dark:bg-blue-50 border border-blue-500/20 dark:border-blue-100 rounded-xl flex gap-4">
                <Shield className="text-blue-500 shrink-0" />
                <p className="text-xs text-blue-200 dark:text-blue-800 leading-relaxed">
                  Votre profil est actuellement <strong>Public</strong>. Tout le monde sur Melodia peut voir vos albums favoris et vos listes.
                </p>
              </div>
              <button className="w-full text-left p-4 bg-[#0f1117] dark:bg-gray-50 hover:bg-slate-800 dark:hover:bg-gray-100 border border-slate-800 dark:border-gray-200 rounded-xl transition-all">
                <p className="text-sm font-bold text-white dark:text-gray-900">Changer le mot de passe</p>
                <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">Modifié il y a 3 mois</p>
              </button>
              <button className="w-full text-left p-4 bg-[#0f1117] dark:bg-gray-50 hover:bg-slate-800 dark:hover:bg-gray-100 border border-slate-800 dark:border-gray-200 rounded-xl transition-all text-rose-500">
                <p className="text-sm font-bold">Authentification à deux facteurs</p>
                <p className="text-xs text-rose-500/60 mt-1">Fortement recommandé pour la sécurité du compte</p>
              </button>
            </div>
          )}

          {/* Données*/}
          {activeTab === 'Data' && (
            <div className="space-y-6 animate-in fade-in duration-300 text-center py-10">
              <Database size={48} className="mx-auto text-slate-600 dark:text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-white dark:text-gray-900">Gérer vos données</h3>
              <p className="text-sm text-slate-500 dark:text-gray-600 max-w-sm mx-auto">
                Téléchargez une copie de vos données personnelles ou supprimez définitivement votre compte.
              </p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto mt-6">
                <button className="flex items-center justify-center gap-2 bg-[#2a2e3d] dark:bg-gray-100 p-3 rounded-xl text-sm font-bold border border-slate-700 dark:border-gray-200 hover:bg-slate-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 transition-all">
                  <ExternalLink size={16} /> Exporter les données (JSON)
                </button>
                <button className="p-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all">
                  Supprimer le compte
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Settings;