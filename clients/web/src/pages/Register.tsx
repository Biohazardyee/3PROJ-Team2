import * as React from 'react';
import { FaEnvelope, FaUser, FaLock, FaGoogle, FaGithub, FaFacebookF } from 'react-icons/fa';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#13131a] text-white flex flex-col items-center justify-center p-6 font-sans">
      
      {/* HEADER */}
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-linear-to-tr from-[#a855f7] to-[#ec4899] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/20">
          <span className="text-4xl">♪</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">Créer votre compte</h1>
        <p className="text-gray-400 text-lg">Rejoignez la communauté musicale</p>
      </div>

      <div className="w-full max-w-110 space-y-7">
        <form className="space-y-5">
          <Input label="E-mail" type="email" placeholder="votre@email.com" icon={FaEnvelope} />
          <Input label="Nom d'utilisateur" type="text" placeholder="mélomane" icon={FaUser} />
          <Input label="Mot de passe" type="password" placeholder="••••••••" icon={FaLock} />
          <Input label="Confirmer le mot de passe" type="password" placeholder="••••••••" icon={FaLock} />

          <div className="flex items-center space-x-3 py-1">
            <input type="checkbox" className="w-5 h-5 rounded-md border-gray-700 bg-gray-800 text-blue-500 cursor-pointer focus:ring-0" />
            <p className="text-sm text-gray-400">
              J'accepte les <span className="text-blue-500 font-medium hover:underline cursor-pointer">Conditions d'utilisation</span> et la <span className="text-blue-500 font-medium hover:underline cursor-pointer">Politique de confidentialité</span>
            </p>
          </div>

          <Button>Créer le compte</Button>
        </form>

        <div className="relative flex items-center py-2">
          <div className="grow border-t border-gray-800"></div>
          <span className="mx-4 text-gray-500 text-sm uppercase tracking-wider">Ou s'inscrire avec</span>
          <div className="grow border-t border-gray-800"></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Button variant="social"><FaGoogle /></Button>
          <Button variant="social"><FaGithub /></Button>
          <Button variant="social"><FaFacebookF /></Button>
        </div>

        <p className="text-center text-gray-400 text-base pt-2">
          Vous avez déjà un compte ?{' '}
          <span 
            onClick={() => navigate('/login')} 
            className="text-blue-500 font-bold cursor-pointer hover:underline ml-1">
            Se connecter
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;