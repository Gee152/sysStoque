import React, { useState, useEffect, useRef } from "react";
import { Download, X, Share2 } from "lucide-react";

const DISMISSED_KEY = "stockflow_pwa_dismissed";

function isMobile() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isStandalone() {
  try {
    return window.matchMedia("(display-mode: standalone)").matches;
  } catch {
    return false;
  }
}

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function PwaInstallBanner() {
  const deferredPrompt = useRef<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - Number(dismissedAt)) / 86400000;
      if (daysSinceDismiss < 7) return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (isMobile()) {
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    const prompt = deferredPrompt.current;
    if (!prompt) return;
    prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
    } else {
      deferredPrompt.current = null;
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  };

  if (!visible) return null;

  const ios = isIOS();
  const hasPrompt = !!deferredPrompt.current;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 max-w-md mx-auto animate-slide-up">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 flex items-start gap-3">
        <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
          {ios ? <Share2 className="w-5 h-5 text-white" /> : <Download className="w-5 h-5 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            Instale o StockFlow
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {hasPrompt
              ? "Adicione à tela inicial para acesso rápido e offline."
              : ios
                ? "Toque em Compartilhar e depois em \"Adicionar à Tela de Início\"."
                : "Instale o aplicativo para acesso rápido e offline."}
          </p>
          {hasPrompt && (
            <button
              onClick={handleInstall}
              className="mt-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Instalar
            </button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
