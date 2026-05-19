import React from 'react';
import { Lock, Music, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import de i18n

const AuthRequired: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#13131a] dark:bg-slate-50 p-6 transition-colors duration-300">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">

                {/* Icône centrale avec lueur */}
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                    <div className="relative bg-[#1c1c28] dark:bg-white border border-gray-800 dark:border-gray-200 rounded-3xl w-24 h-24 flex items-center justify-center shadow-2xl">
                        <Lock size={40} className="text-blue-500"/>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#FF1E56] rounded-xl p-2 shadow-lg border-4 border-[#13131a] dark:border-white">
                        <Music size={18} className="text-white"/>
                    </div>
                </div>

                {/* Texte de présentation */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-white dark:text-gray-900 tracking-tight">
                        {t('exclusive_content')}
                    </h1>
                    <p className="text-gray-400 dark:text-gray-600 text-base leading-relaxed px-4">
                        {t('join_melodia')}
                    </p>
                </div>

                {/* Boutons d'action */}
                <div className="flex flex-col gap-4 pt-4 px-6">
                    <button
                        onClick={() => navigate('/login')}
                        className="group relative flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <span>{t('login')}</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                    </button>

                    <button
                        onClick={() => navigate('/register')}
                        className="text-sm font-medium text-gray-500 hover:text-white dark:hover:text-gray-900 transition-colors py-2"
                    >
                        {t('no_account')}{' '}
                        <span className="text-blue-500 hover:underline">
                            {t('create_account')}
                        </span>
                    </button>
                </div>

                {/* Avatars décoratifs */}
                <div className="pt-12 flex justify-center gap-3 opacity-40">
                    {['AL', 'BE', 'MO'].map((initials) => (
                        <div key={initials} className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold bg-gray-800 text-gray-400 dark:bg-gray-200 dark:text-gray-600">
                            {initials}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AuthRequired;