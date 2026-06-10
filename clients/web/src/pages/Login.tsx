import React, { useState } from "react";
import { FaEnvelope, FaLock, FaGoogle, FaDiscord } from "react-icons/fa";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import apiClient from "../api/client";
import {AxiosResponse} from "axios";

const Login: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const navigate: NavigateFunction = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response: AxiosResponse<any, any> = await apiClient.post("/users/login", {
        email: formData.email,
        password: formData.password,
      });

      const token: string = response.data.token;
      localStorage.setItem("token", token);

      navigate("/home");
    } catch (err: any) {
      if (err.response && err.response.data) {
        const serverMessage = err.response.data.message;
        setError(t(serverMessage));
        if (err.response.status === 401) {
          setFormData((prev) => ({ ...prev, password: "" }));
        }
      } else {
        setError(t("login_error_network"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: "google" | "discord"): void => {
    window.location.href = `${API_URL}/api/oauth/auth/${provider}?platform=web`;
  };

  return (
    <div className="min-h-screen bg-[#13131a] dark:bg-slate-50 text-white dark:text-gray-900 flex flex-col items-center justify-center p-6 font-sans transition-colors duration-300">
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-linear-to-tr from-[#a855f7] to-[#ec4899] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/20">
          <span className="text-4xl text-white">♪</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-white dark:text-gray-900">
          {t("login_welcome")}
        </h1>
        <p className="text-gray-400 dark:text-gray-600 text-lg">
          {t("login_subtitle")}
        </p>
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
            label={t("login_email_label")}
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
              label={t("login_password_label")}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={FaLock}
              required
            />
            <div className="text-right">
              <span className="text-sm text-blue-500 hover:underline cursor-pointer">
                {t("login_forgot_password")}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t("login_loading") : t("login_submit_btn")}
          </button>
        </form>

        <div className="relative flex items-center py-2">
          <div className="grow border-t border-gray-800 dark:border-gray-200"></div>
          <span className="mx-4 text-gray-500 text-sm uppercase tracking-wider">
            {t("login_separator")}
          </span>
          <div className="grow border-t border-gray-800 dark:border-gray-200"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="social"
            type="button"
            onClick={() => handleOAuthLogin("google")}
          >
            <FaGoogle />
          </Button>
          <Button
            variant="social"
            type="button"
            onClick={() => handleOAuthLogin("discord")}
          >
            <FaDiscord />
          </Button>
        </div>

        <p className="text-center text-gray-400 dark:text-gray-600 text-base pt-2">
          {t("login_no_account")}{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-500 font-bold cursor-pointer hover:underline ml-1"
          >
            {t("login_register_link")}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
