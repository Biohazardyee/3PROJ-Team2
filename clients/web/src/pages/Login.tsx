import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaGoogle, FaDiscord } from 'react-icons/fa';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import {NavigateFunction, useNavigate} from 'react-router-dom';
import apiClient from "../api/client.js";

const Login: React.FC = () => {
  const navigate: NavigateFunction = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/users/login", {
        email: formData.email,
        password: formData.password,
      });

      const token: string = response.data.token;
      localStorage.setItem('token', token);
      navigate('/home');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-[#13131a] dark:bg-slate-50 text-white dark:text-gray-900 flex flex-col items-center justify-center p-6 font-sans transition-colors duration-300">

        <div className="mb-10 text-center">
          <div className="w-20 h-20 bg-linear-to-tr from-[#a855f7] to-[#ec4899] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/20">
            <span className="text-4xl text-white">♪</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-white dark:text-gray-900">Bon retour !</h1>
          <p className="text-gray-400 dark:text-gray-600 text-lg">Connectez-vous pour accéder à votre musique</p>
        </div>

        <div className="w-full max-w-110 space-y-7">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Message d'erreur */}
            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                  {error}
                </div>
            )}

            <Input
                label="E-mail"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                icon={FaEnvelope}
                required
            />

            <div className="space-y-1">
              <Input
                  label="Mot de passe"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  icon={FaLock}
                  required
              />
              <div className="text-right">
                <span className="text-sm text-blue-500 hover:underline cursor-pointer">Mot de passe oublié ?</span>
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="grow border-t border-gray-800 dark:border-gray-200"></div>
            <span className="mx-4 text-gray-500 text-sm uppercase tracking-wider">Ou continuer avec</span>
            <div className="grow border-t border-gray-800 dark:border-gray-200"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Ici tu pourras lier tes fonctions findOrCreateOAuthUser du backend */}
            <Button variant="social" type="button"><FaGoogle /></Button>
            <Button variant="social" type="button"><FaDiscord /></Button>
          </div>

          <p className="text-center text-gray-400 dark:text-gray-600 text-base pt-2">
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