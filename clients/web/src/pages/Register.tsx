import React from 'react';
import { FaEnvelope, FaUser, FaLock, FaGoogle, FaDiscord } from 'react-icons/fa';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen w-full bg-[#13131a] dark:bg-slate-50 text-white dark:text-gray-900 flex flex-col items-center justify-center p-6 font-sans transition-colors duration-300">
      
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-linear-to-tr from-[#a855f7] to-[#ec4899] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/20">
          <span className="text-4xl text-white">♪</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-white dark:text-gray-900">
          {t('register_title')}
        </h1>
        <p className="text-gray-400 dark:text-gray-600 text-lg">
          {t('register_subtitle')}
        </p>
      </div>

      <div className="w-full max-w-110 space-y-7">
        <form className="space-y-5">
          <Input 
            label={t('register_email_label')} 
            type="email" 
            placeholder="votre@email.com" 
            icon={FaEnvelope} 
          />
          <Input 
            label={t('register_username_label')} 
            type="text" 
            placeholder="mélomane" 
            icon={FaUser} 
          />
          <Input 
            label={t('register_password_label')} 
            type="password" 
            placeholder="••••••••" 
            icon={FaLock} 
          />
          <Input 
            label={t('register_confirm_password_label')} 
            type="password" 
            placeholder="••••••••" 
            icon={FaLock} 
          />

          <div className="flex items-center space-x-3 py-1">
            <input type="checkbox" className="w-5 h-5 rounded-md border-gray-700 dark:border-gray-300 bg-gray-800 dark:bg-white text-blue-500 cursor-pointer focus:ring-0" />
            <p className="text-sm text-gray-400 dark:text-gray-600">
              {t('register_terms_text')}{' '}
              <span className="text-blue-500 font-medium hover:underline cursor-pointer">
                {t('register_terms_link')}
              </span>{' '}
              {t('register_and')}{' '}
              <span className="text-blue-500 font-medium hover:underline cursor-pointer">
                {t('register_privacy_link')}
              </span>
            </p>
          </div>

          <Button>{t('register_submit_btn')}</Button>
        </form>

        <div className="relative flex items-center py-2">
          <div className="grow border-t border-gray-800 dark:border-gray-200"></div>
          <span className="mx-4 text-gray-500 text-sm uppercase tracking-wider">
            {t('register_separator')}
          </span>
          <div className="grow border-t border-gray-800 dark:border-gray-200"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="social"><FaGoogle /></Button>
          <Button variant="social"><FaDiscord /></Button>
        </div>

        <p className="text-center text-gray-400 dark:text-gray-600 text-base pt-2">
          {t('register_already_account')}{' '}
          <span 
            onClick={() => navigate('/login')} 
            className="text-blue-500 font-bold cursor-pointer hover:underline ml-1">
            {t('register_login_link')}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;