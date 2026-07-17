/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Package, 
  History, 
  User, 
  LogOut, 
  ShieldCheck, 
  AlertCircle, 
  UserCheck, 
  FileSpreadsheet, 
  RefreshCw,
  SunMoon
} from "lucide-react";

import { Product, Movement, DashboardMetrics } from "./types";
import AuthScreen from "./components/AuthScreen";
import DashboardView from "./components/DashboardView";
import ProductsView from "./components/ProductsView";
import MovementsView from "./components/MovementsView";
import SharedProductView from "./components/SharedProductView";
import PwaInstallBanner from "./components/PwaInstallBanner";
import { NotificationProvider } from "./components/Notification";
import { getProducts, getDashboard, createProduct, updateProduct, deleteProduct, createMovement, setOnUnauthorized } from "./services/api";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("stockflow_token"));
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem("stockflow_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("stockflow_dark");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("stockflow_dark", String(darkMode));
  }, [darkMode]);

  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "movements" | "profile">("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Detect public share route
  const [isShareRoute, setShareRoute] = useState(false);
  const [shareProductId, setShareProductId] = useState<string | null>(null);

  useEffect(() => {
    const match = window.location.pathname.match(/^\/compartilhar\/([a-f0-9-]+)$/i);
    if (match) {
      setShareRoute(true);
      setShareProductId(match[1]);
    } else {
      setShareRoute(false);
      setShareProductId(null);
    }
  }, []);

  // Auto load data on auth success
  useEffect(() => {
    if (token) {
      loadAllData();
    }
  }, [token]);

  const handleAuthSuccess = (newToken: string, user: { id: string; name: string; email: string }) => {
    localStorage.setItem("stockflow_token", newToken);
    localStorage.setItem("stockflow_user", JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
    setGlobalError(null);
  };

  // Register the unauthorized handler once
  useEffect(() => {
    setOnUnauthorized(() => {
      setToken(null);
      setCurrentUser(null);
      setProducts([]);
      setMovements([]);
      setMetrics(null);
      setActiveTab("dashboard");
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("stockflow_token");
    localStorage.removeItem("stockflow_user");
    setToken(null);
    setCurrentUser(null);
    setProducts([]);
    setMovements([]);
    setMetrics(null);
    setActiveTab("dashboard");
  };

  const loadAllData = async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      const productsData = await getProducts();
      const dashboardData = await getDashboard(productsData);

      setProducts(productsData);
      setMetrics(dashboardData);
      setMovements(dashboardData.recentMovements || []);
    } catch (err: any) {
      setGlobalError(err.message || "Erro ao conectar com a API.");
    } finally {
      setLoading(false);
    }
  };

  // Create Product handler
  const handleAddProduct = async (productData: any) => {
    try {
      await createProduct(productData);
      await loadAllData();
    } catch (err: any) {
      throw new Error(err.message || "Erro ao criar produto.");
    }
  };

  // Create Movement handler
  const handleAddMovement = async (movementData: any) => {
    try {
      await createMovement(movementData);
      await loadAllData();
    } catch (err: any) {
      throw new Error(err.message || "Erro ao registrar movimentação.");
    }
  };

  // Update Product handler
  const handleUpdateProduct = async (productId: string, productData: any) => {
    try {
      await updateProduct(productId, productData);
      await loadAllData();
    } catch (err: any) {
      throw new Error(err.message || "Erro ao atualizar produto.");
    }
  };

  // Delete Product handler
  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      await loadAllData();
    } catch (err: any) {
      throw new Error(err.message || "Erro ao excluir produto.");
    }
  };

  // Quick Adjustment handler (inside variant view)
  const handleQuickMovement = async (variantId: string, type: "IN" | "OUT", quantity: number, reason: string) => {
    try {
      await createMovement({ variantId, type, quantity });
      await loadAllData();
    } catch (err: any) {
      throw new Error(err.message || "Erro ao processar movimentação rápida.");
    }
  };

  // Render correct panel view
  const renderActiveView = () => {
    if (loading && !metrics) {
      return (
        <div className="flex flex-col items-center justify-center h-96 space-y-3">
          <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Carregando dados...</p>
        </div>
      );
    }

    switch (activeTab) {
      case "dashboard":
        return metrics ? (
          <DashboardView 
            metrics={metrics} 
            onNavigateToMovements={() => setActiveTab("movements")}
            onNavigateToProducts={() => setActiveTab("products")}
          />
        ) : null;
      case "products":
        return (
          <ProductsView 
            products={products} 
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onRegisterQuickMovement={handleQuickMovement}
          />
        );
      case "movements":
        return (
          <MovementsView 
            movements={movements} 
            products={products} 
            onAddMovement={handleAddMovement}
          />
        );
      case "profile":
        return (
          <div className="space-y-4 pb-24 lg:pb-0 text-slate-850 dark:text-slate-200">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Configurações</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Detalhes do operador e sistema</p>
            </div>
            
            <div className="p-3.5 rounded-xl glass-panel card-gradient flex items-center gap-3.5 shadow-3xs">
              <div className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-base text-white shadow-xs">
                {currentUser?.name?.substring(0, 2).toUpperCase() || "OP"}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                  <span className="truncate">{currentUser?.name || "Operador"}</span>
                  <span className="text-[9px] font-black bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 border border-indigo-100 dark:border-indigo-800">
                    <UserCheck className="w-2.5 h-2.5" /> Ativo
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">{currentUser?.email}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">ID: {currentUser?.id}</p>
              </div>
            </div>

            {/* Appearance */}
            <div className="p-3.5 rounded-xl glass-panel card-gradient space-y-2.5 shadow-3xs">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Aparência</h4>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <SunMoon className="w-4 h-4" />
                  Tema
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {darkMode ? "Escuro" : "Claro"}
                </span>
              </button>
            </div>

            {/* Quick stats panel */}
            <div className="p-3.5 rounded-xl glass-panel card-gradient space-y-2.5 shadow-3xs">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sessão Operacional</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700 font-medium">
                  <span className="text-slate-500 dark:text-slate-400">Servidor API</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">ONLINE (PostgreSQL)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700 font-medium">
                  <span className="text-slate-500 dark:text-slate-400">Persistência</span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono">PostgreSQL (TypeORM)</span>
                </div>
                <div className="flex justify-between py-1 font-medium">
                  <span className="text-slate-500 dark:text-slate-400">Operador Atual</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">{currentUser?.name}</span>
                </div>
              </div>
            </div>

            <button
              id="profile-btn-logout"
              onClick={handleLogout}
              className="w-full py-2.5 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-rose-150 dark:border-rose-800 active:scale-98 shadow-3xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da Conta</span>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const navItems = [
    { id: "dashboard" as const, label: "Resumo", icon: LayoutDashboard },
    { id: "products" as const, label: "Produtos", icon: Package },
    { id: "movements" as const, label: "Histórico", icon: History },
    { id: "profile" as const, label: "Ajustes", icon: User },
  ];

  const content = (
    <div className="space-y-3">
      {globalError && (
        <div className="flex items-start gap-2 p-2.5 text-xs rounded-xl bg-rose-50 border border-rose-200 text-rose-700 shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-rose-800">Erro de sincronização</p>
            <p className="text-[10px] text-rose-600 mt-0.5 truncate">{globalError}</p>
          </div>
          <button 
            onClick={loadAllData} 
            className="px-1.5 py-0.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded text-[10px] font-bold"
          >
            Repetir
          </button>
        </div>
      )}
      {renderActiveView()}
    </div>
  );

  // Public share route
  if (isShareRoute && shareProductId) {
    return <SharedProductView productId={shareProductId} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 transition-colors">
      <NotificationProvider>
      {!token ? (
        <div className="min-h-dynamic flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <AuthScreen onAuthSuccess={handleAuthSuccess} darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Desktop sidebar */}
          <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-bold text-sm text-slate-900 dark:text-white">StockFlow</h1>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Controle de Estoque</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-3 space-y-0.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    activeTab === item.id
                      ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
              >
                <SunMoon className="w-5 h-5" />
                {darkMode ? "Modo Claro" : "Modo Escuro"}
              </button>
            </nav>

            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
              <div className="px-3 py-2 mb-1">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{currentUser?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                Sair
              </button>
            </div>
          </aside>

          {/* Mobile layout (lg:hidden) */}
          <div className="lg:hidden mobile-frame w-full h-dynamic bg-slate-50 dark:bg-slate-950 overflow-y-auto shadow-lg transition-colors">
            <div className="px-4 pt-5 pb-24">
              {content}
            </div>
          </div>

          {/* Mobile bottom nav (fixed) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 py-1.5 px-2 flex justify-between items-center shadow-xs pb-safe">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer select-none min-w-[56px] min-h-[44px] rounded-lg px-2 ${
                  activeTab === item.id ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] tracking-wide font-medium">{item.label}</span>
              </button>
            ))}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer select-none min-w-[56px] min-h-[44px] rounded-lg px-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <SunMoon className="w-5 h-5" />
              <span className="text-[10px] tracking-wide font-medium">{darkMode ? "Claro" : "Escuro"}</span>
            </button>
          </div>

          {/* Desktop layout (hidden < lg) */}
          <main className="hidden lg:flex lg:flex-col lg:flex-1 lg:min-h-0">
            <div className="flex-1 overflow-y-auto p-6">
              {content}
            </div>
          </main>
        </div>
      )}
      <PwaInstallBanner />
      </NotificationProvider>
    </div>
  );
}
