/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle, Sparkles, SunMoon } from "lucide-react";
import { login, register } from "../services/api";

interface AuthScreenProps {
  onAuthSuccess: (token: string, user: { id: string; name: string; email: string }) => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function AuthScreen({ onAuthSuccess, darkMode, onToggleDark }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = isLogin
        ? await login(email, password)
        : await register(name, email, password);

      onAuthSuccess(result.token, result.user);
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between h-full px-6 py-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Dark mode toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <SunMoon className="w-5 h-5" />
        </button>
      </div>

      {/* Top Header Logo */}
      <div className="flex flex-col items-center mt-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-md shadow-indigo-200 dark:shadow-indigo-900/50 mb-3"
        >
          <ShieldCheck className="w-8 h-8 text-white" />
        </motion.div>
        
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          StockFlow
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Controle de Estoque Inteligente
        </p>
      </div>

      {/* Main Card */}
      <motion.div
        layout
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-sm px-5 py-6 mx-auto rounded-2xl glass-panel card-gradient my-auto shadow-sm"
      >
        {/* Tab Selector */}
        <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg mb-5 border border-slate-200/60 dark:border-slate-700">
          <button
            id="auth-tab-login"
            type="button"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              isLogin 
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/50 dark:border-slate-600" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Acessar
          </button>
          <button
            id="auth-tab-register"
            type="button"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
              !isLogin 
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/50 dark:border-slate-600" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            Criar Conta
          </button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 p-2.5 text-xs rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 mb-4"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Seu Nome</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="auth-input-name"
                  type="text"
                  required
                  placeholder="Ex: Gabriel Victor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[16px] text-slate-850 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-xs"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">E-mail</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="auth-input-email"
                type="email"
                required
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[16px] text-slate-850 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Senha</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="auth-input-password"
                type="password"
                required
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[16px] text-slate-850 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-xs"
              />
            </div>
          </div>

          <button
            id="auth-btn-submit"
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 dark:shadow-indigo-900/30 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <span>{isLogin ? "Entrar no Painel" : "Cadastrar Conta"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {isLogin && (
          <div className="mt-4 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500/80" />
              <span>Use seu email e senha cadastrados</span>
            </p>
          </div>
        )}
      </motion.div>

      {/* Footer Details */}
      <div className="text-center mt-4">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          StockFlow Mobile v2.0 • PostgreSQL / TypeORM
        </p>
      </div>
    </div>
  );
}
