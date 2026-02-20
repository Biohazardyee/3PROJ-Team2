import React from 'react';
import { FaEnvelope, FaLock, FaGoogle, FaGithub, FaFacebookF } from 'react-icons/fa';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#13131a] text-white flex flex-col items-center justify-center p-6 font-sans">
      
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-linear-to-tr from-[#a855f7] to-[#ec4899] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/20">
          <span className="text-4xl">♪</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">Bon retour !</h1>
        <p className="text-gray-400 text-lg">Connectez-vous pour accéder à votre musique</p>
      </div>

      <div className="w-full max-w-110 space-y-7">
        <form className="space-y-5">
          <Input label="E-mail" type="email" placeholder="votre@email.com" icon={FaEnvelope} />
          
          <div className="space-y-1">
            <Input label="Mot de passe" type="password" placeholder="••••••••" icon={FaLock} />
            <div className="text-right">
              <span className="text-sm text-blue-500 hover:underline cursor-pointer">Mot de passe oublié ?</span>
            </div>
          </div>

          <Button>Se connecter</Button>
        </form>

        <div className="relative flex items-center py-2">
          <div className="grow border-t border-gray-800"></div>
          <span className="mx-4 text-gray-500 text-sm uppercase tracking-wider">Ou continuer avec</span>
          <div className="grow border-t border-gray-800"></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Button variant="social"><FaGoogle /></Button>
          <Button variant="social"><FaGithub /></Button>
          <Button variant="social"><FaFacebookF /></Button>
        </div>

        <p className="text-center text-gray-400 text-base pt-2">
          Pas encore de compte ?{' '}
          <span 
            onClick={() => navigate('/register')} 
            className="text-blue-500 font-bold cursor-pointer hover:underline ml-1">
            S'inscrire
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;