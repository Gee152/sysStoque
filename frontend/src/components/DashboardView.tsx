/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  Package, 
  Layers, 
  DollarSign, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Briefcase 
} from "lucide-react";
import { DashboardMetrics } from "../types";

interface DashboardViewProps {
  metrics: DashboardMetrics;
  onNavigateToMovements: () => void;
  onNavigateToProducts: () => void;
}

export default function DashboardView({ metrics, onNavigateToMovements, onNavigateToProducts }: DashboardViewProps) {
  // Format price in BRL currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
  };

  // Get total value for calculations
  const totalValue = metrics.totalStockValue || 1;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4 pb-24 lg:pb-0 text-slate-850 dark:text-slate-200"
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Resumo Geral</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Dados consolidados do estoque</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-400 font-mono shadow-xs">
          <Clock className="w-2.5 h-2.5 text-indigo-500 animate-pulse" />
          <span>Atualizado</span>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* KPI: Financial value */}
        <motion.div 
          variants={itemVariants} 
          className="col-span-2 p-3.5 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/40 dark:from-indigo-900/30 dark:to-indigo-800/20 border border-indigo-100 dark:border-indigo-800/50 shadow-xs relative overflow-hidden"
        >
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-[0.06] pointer-events-none">
            <DollarSign className="w-24 h-24 text-indigo-600" />
          </div>
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Valor Total do Estoque</p>
          <p className="text-xl font-black mt-0.5 text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(metrics.totalStockValue)}
          </p>
          <div className="flex items-center gap-1 mt-1 text-[9px] text-indigo-500 dark:text-indigo-400 font-medium">
            <Briefcase className="w-3 h-3" />
            <span>Patrimônio sob custódia</span>
          </div>
        </motion.div>

        {/* KPI: Total products */}
        <motion.div variants={itemVariants} className="p-3 rounded-xl glass-panel card-gradient shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Produtos</span>
            <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">{metrics.totalProducts}</p>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Modelos cadastrados</p>
        </motion.div>

        {/* KPI: Total variants */}
        <motion.div variants={itemVariants} className="p-3 rounded-xl glass-panel card-gradient shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Variantes</span>
            <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">{metrics.totalVariants}</p>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium font-sans">Grade de tamanhos/cores</p>
        </motion.div>

        {/* KPI: Total items in stock */}
        <motion.div variants={itemVariants} className="p-3 rounded-xl glass-panel card-gradient shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Unidades</span>
            <div className="p-1 rounded-md bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">{metrics.totalItemsInStock}</p>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Total de peças estocadas</p>
        </motion.div>

        {/* KPI: Low stock warnings */}
        <motion.div 
          variants={itemVariants} 
          onClick={onNavigateToProducts}
          className={`p-3 rounded-xl border transition-all cursor-pointer shadow-xs ${
            metrics.lowStockItemsCount > 0 
              ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400" 
              : "glass-panel border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-400"
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider">Estoque Crítico</span>
            <div className={`p-1 rounded-md ${
              metrics.lowStockItemsCount > 0 ? "bg-rose-100 dark:bg-rose-800/30 text-rose-600 dark:text-rose-400" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
            }`}>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">{metrics.lowStockItemsCount}</p>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Alerta de falta iminente</p>
        </motion.div>
      </div>

      {/* Critical Stock Alert Banner */}
      {metrics.lowStockItemsCount > 0 && (
        <motion.div
          variants={itemVariants}
          onClick={onNavigateToProducts}
          className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 text-xs cursor-pointer hover:bg-amber-100/60 dark:hover:bg-amber-900/30 transition-all shadow-xs"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-500" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-300">Alerta de reposição necessária</p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400">Algumas variantes possuem menos de 5 unidades.</p>
            </div>
          </div>
          <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-800/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
            Corrigir
          </span>
        </motion.div>
      )}

      {/* Mini Flow Chart (Entries vs Exits) */}
      <motion.div variants={itemVariants} className="p-3.5 rounded-xl glass-panel card-gradient shadow-xs">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">Fluxo de Movimentação</h3>
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Entradas (IN)</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">+{metrics.movementsSummary.entries}</p>
            </div>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">Saídas (OUT)</p>
              <p className="text-base font-bold text-rose-600 dark:text-rose-400 font-mono">-{metrics.movementsSummary.exits}</p>
            </div>
          </div>
        </div>

        {/* Visual progress comparison */}
        <div className="mt-3">
          <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500 mb-1 font-medium">
            <span>Entradas ({Math.round(metrics.movementsSummary.entries / (metrics.movementsSummary.entries + metrics.movementsSummary.exits || 1) * 100)}%)</span>
            <span>Saídas ({Math.round(metrics.movementsSummary.exits / (metrics.movementsSummary.entries + metrics.movementsSummary.exits || 1) * 100)}%)</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div 
              style={{ width: `${(metrics.movementsSummary.entries / (metrics.movementsSummary.entries + metrics.movementsSummary.exits || 1)) * 100}%` }} 
              className="h-full bg-emerald-500" 
            />
            <div 
              style={{ width: `${(metrics.movementsSummary.exits / (metrics.movementsSummary.entries + metrics.movementsSummary.exits || 1)) * 100}%` }} 
              className="h-full bg-rose-500" 
            />
          </div>
        </div>
      </motion.div>

      {/* Stock by Category Visual Block */}
      <motion.div variants={itemVariants} className="p-3.5 rounded-xl glass-panel card-gradient shadow-xs">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">Valores por Categoria</h3>
        <div className="space-y-2.5">
          {metrics.stockByCategory.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">Nenhuma categoria cadastrada</p>
          ) : (
            metrics.stockByCategory.map((item, idx) => {
              const pctOfValue = Math.min(100, Math.round((item.value / totalValue) * 100));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800 dark:text-slate-200">{item.category}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                      {item.count} un <span className="text-slate-300 dark:text-slate-600">•</span> {formatCurrency(item.value)}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-indigo-600"
                      style={{ width: `${pctOfValue || 1}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Recent Movements Feed */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Atividades Recentes</h3>
          <button 
            id="dash-btn-all-movements"
            onClick={onNavigateToMovements}
            className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            Ver todas
          </button>
        </div>

        <div className="space-y-2">
          {metrics.recentMovements.length === 0 ? (
            <div className="p-5 text-center rounded-xl glass-panel text-slate-400 dark:text-slate-500 text-xs">
              Nenhuma movimentação registrada no estoque.
            </div>
          ) : (
            metrics.recentMovements.slice(0, 4).map((mov) => (
              <div 
                key={mov.id} 
                className="flex items-center justify-between p-2.5 rounded-xl glass-panel hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    mov.type === "IN" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                  }`}>
                    {mov.type === "IN" ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[190px]">{mov.productName}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[190px] mt-0.5">
                      {mov.variantName} <span className="text-slate-200 dark:text-slate-700">•</span> {mov.reason}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className={`font-mono font-bold text-xs ${
                    mov.type === "IN" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  }`}>
                    {mov.type === "IN" ? "+" : "-"}{mov.quantity}
                  </span>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                    {new Date(mov.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
