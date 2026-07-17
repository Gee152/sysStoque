/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  User, 
  Clock, 
  FileText, 
  Check, 
  AlertCircle 
} from "lucide-react";
import { Movement, Product } from "../types";
import { useNotification } from "./Notification";

interface MovementsViewProps {
  movements: Movement[];
  products: Product[];
  onAddMovement: (movementData: any) => Promise<void>;
}

export default function MovementsView({ movements, products, onAddMovement }: MovementsViewProps) {
  const { notify } = useNotification();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "IN" | "OUT">("ALL");

  // Add Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [movementType, setMovementType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("Reposição de Estoque");
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter movements
  const filteredMovements = movements.filter(m => {
    const matchesSearch = m.productName.toLowerCase().includes(search.toLowerCase()) ||
      m.variantName.toLowerCase().includes(search.toLowerCase()) ||
      m.reason.toLowerCase().includes(search.toLowerCase()) ||
      m.userName.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === "ALL" || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Load variants of selected product
  const currentProduct = products.find(p => p.id === selectedProductId);
  const variants = currentProduct ? currentProduct.variants : [];

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find(p => p.id === productId);
    if (prod && prod.variants.length > 0) {
      setSelectedVariantId(prod.variants[0].id);
    } else {
      setSelectedVariantId("");
    }
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitMovement(reason.trim());
  };

  const submitMovement = async (finalReason: string) => {
    setFormError(null);
    setLoading(true);

    const numQty = Number(quantity);
    console.log('QUANTIDADE', finalReason);
    if (!selectedVariantId || !movementType || isNaN(numQty) || numQty <= 0) {
      setFormError("Todos os campos marcados com * são obrigatórios.");
      setLoading(false);
      //setReason(reason)
      return
    }

    // Check stock bounds for exits
    if (movementType === "OUT") {
      const selectedVariant = variants.find(v => v.id === selectedVariantId);
      if (selectedVariant && selectedVariant.stock < numQty) {
        setFormError(`Quantidade indisponível em estoque. Estoque atual: ${selectedVariant.stock} un.`);
        setLoading(false);
        //setReason(finalReason)
        return;
      }
    }

    try {
      await onAddMovement({
        variantId: selectedVariantId,
        type: movementType,
        quantity: numQty,
        reason: finalReason
      });
      // Reset
      setSelectedProductId("");
      setSelectedVariantId("");
      setQuantity("1");
      setReason("Reposição de Estoque");
      setShowAddModal(false);
      notify.success("Movimentação registrada com sucesso!");
    } catch (err: any) {
      setFormError(err.message || "Erro ao registrar movimentação.");
    } finally {
      setLoading(false);
    }
  };

  // Pre-configured typical reasons
  const presetReasons = {
    IN: ["Reposição de Estoque", "Compra de Lote", "Devolução do Cliente", "Ajuste de Balanço"],
    OUT: ["Venda", "Avaria / Defeito", "Retirada para Teste", "Ajuste de Balanço"]
  };

  return (
    <div className="space-y-4.5 pb-24 lg:pb-0 text-slate-850 dark:text-slate-200 transition-colors">
      {/* Header and trigger */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Movimentações</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Histórico de entradas e saídas</p>
        </div>
        <button
          id="mov-btn-open-add-modal"
          onClick={() => {
            setShowAddModal(true);
            if (products.length > 0) {
              handleProductChange(products[0].id);
            }
          }}
          className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-1 shadow-xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Lançar Movimento</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="relative col-span-3">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            id="mov-input-search"
            type="text"
            placeholder="Buscar por produto, motivo, operador..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 shadow-3xs"
          />
        </div>

        {/* Filter buttons */}
        <button
          id="mov-filter-all"
          onClick={() => setTypeFilter("ALL")}
          className={`py-1.5 rounded-lg text-[10px] tracking-wider uppercase transition-all border flex items-center justify-center font-bold ${
            typeFilter === "ALL"
              ? "bg-slate-100 dark:bg-slate-700 border-slate-350 text-slate-800 dark:text-indigo-400 shadow-3xs"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 shadow-3xs"
          }`}
        >
          Todas
        </button>
        <button
          id="mov-filter-in"
          onClick={() => setTypeFilter("IN")}
          className={`py-1.5 rounded-lg text-[10px] tracking-wider uppercase transition-all border flex items-center justify-center gap-0.5 font-bold ${
            typeFilter === "IN"
              ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 text-emerald-600 dark:text-emerald-400 shadow-3xs"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 shadow-3xs"
          }`}
        >
          <ArrowDownLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Entradas
        </button>
        <button
          id="mov-filter-out"
          onClick={() => setTypeFilter("OUT")}
          className={`py-1.5 rounded-lg text-[10px] tracking-wider uppercase transition-all border flex items-center justify-center gap-0.5 font-bold ${
            typeFilter === "OUT"
              ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 text-rose-600 dark:text-rose-400 shadow-3xs"
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 shadow-3xs"
          }`}
        >
          <ArrowUpRight className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          Saídas
        </button>
      </div>

      {/* History chronological log */}
      <div className="space-y-2">
        {filteredMovements.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs mt-4">
            Nenhum registro de movimentação encontrado.
          </div>
        ) : (
          filteredMovements.map((mov) => {
            console.log(mov.reason);
            const dateObj = new Date(mov.date);
            const dateStr = dateObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
            const timeStr = dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

            return (
              <div 
                key={mov.id} 
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 transition-all shadow-3xs text-xs space-y-2.5"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex gap-2 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${
                      mov.type === "IN" ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                    }`}>
                      {mov.type === "IN" ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{mov.productName}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{mov.variantName}</p>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className={`font-mono font-black text-sm ${
                      mov.type === "IN" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    }`}>
                      {mov.type === "IN" ? "+" : "-"}{mov.quantity} un
                    </span>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 flex items-center justify-end gap-1 font-medium">
                      <Clock className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" />
                      {dateStr}, {timeStr}
                    </p>
                  </div>
                </div>

                {/* Sub Metadata rows */}
                <div className="grid grid-cols-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  <span className="flex items-center gap-1 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">Motivo: <span className="text-slate-600 dark:text-slate-400 font-semibold">{mov.reason || "Sem motivo cadastrado!"}</span></span>
                  </span>
                  <span className="flex items-center gap-1 justify-end min-w-0">
                    <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">Operador: <span className="text-slate-600 dark:text-slate-400 font-semibold">{mov.userName}</span></span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* REGISTRAR MOVIMENTO MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end justify-center"
          >
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={() => setShowAddModal(false)} />

            {/* Sheet */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-t-2xl p-5 mb-32 max-h-[85vh] overflow-y-auto z-10 space-y-3.5 shadow-xl"
            >
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-1.5 mb-1.5" />

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Lançar Movimentação</h3>
                <button 
                  id="mov-btn-close-modal"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs text-slate-400 dark:text-slate-500 font-semibold hover:text-slate-600 dark:hover:text-slate-300"
                >
                  Cancelar
                </button>
              </div>

              {formError && (
                <div className="flex items-start gap-1.5 p-2.5 text-[10px] rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-150 text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {products.length === 0 ? (
                <div className="text-center p-4 text-xs text-slate-500 dark:text-slate-400">
                  Nenhum produto cadastrado no estoque para movimentar.
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-3">
                  {/* Select Product */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Produto *</label>
                    <select
                      id="form-mov-product"
                      required
                      value={selectedProductId}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="" disabled>Selecione o produto...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Variant */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Variante / Especificação *</label>
                    <select
                      id="form-mov-variant"
                      required
                      disabled={!selectedProductId}
                      value={selectedVariantId}
                      onChange={(e) => setSelectedVariantId(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 disabled:opacity-40"
                    >
                      {variants.map(v => (
                        <option key={v.id} value={v.id}>{v.name} (Estoque: {v.stock} un)</option>
                      ))}
                    </select>
                  </div>

                  {/* Flow selection (IN / OUT) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Tipo de Fluxo *</label>
                    <div className="grid grid-cols-2 p-0.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <button
                        id="form-flow-in"
                        type="button"
                        onClick={() => { setMovementType("IN"); setReason("Reposição de Estoque"); }}
                        className={`py-1.5 text-[11px] font-bold rounded flex items-center justify-center gap-1 transition-all ${
                          movementType === "IN" 
                            ? "bg-emerald-500 text-white shadow-3xs" 
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                        }`}
                      >
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                        Entrada (IN)
                      </button>
                      <button
                        id="form-flow-out"
                        type="button"
                        onClick={() => { setMovementType("OUT"); setReason("Venda"); }}
                        className={`py-1.5 text-[11px] font-bold rounded flex items-center justify-center gap-1 transition-all ${
                          movementType === "OUT" 
                            ? "bg-rose-500 text-white shadow-3xs" 
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                        }`}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        Saída (OUT)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Quantidade de Peças *</label>
                    <input
                      id="form-mov-qty"
                      type="number"
                      min="1"
                      required
                      placeholder="Ex: 5"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 font-mono"
                    />
                  </div>

                  {/* Reason text or selection */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Motivo / Justificativa *</label>
                    <input
                      id="form-mov-reason"
                      type="text"
                      required
                      placeholder="Ex: Reposição ou Pedido #123"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600"
                    />
                    
                    {/* Presets suggestions tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {presetReasons[movementType].map((pres, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {setReason(pres)}}
                          className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-medium transition-colors cursor-pointer"
                        >
                          {pres}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    id="form-mov-btn-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-indigo-100 dark:shadow-indigo-900/30 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirmar Movimentação</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
