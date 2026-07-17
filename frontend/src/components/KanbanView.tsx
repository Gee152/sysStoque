import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Phone, Package, Calendar, X, Check, ChevronRight, Clock, AlertCircle, MessageCircle, Send, ListTodo, TrendingUp, XCircle } from "lucide-react";
import type { ClientFlow, ClientFlowStatus, Product } from "../types";
import { useNotification } from "./Notification";

const COLUMNS: { id: ClientFlowStatus; label: string; icon: any; color: string }[] = [
  { id: "ENVIADO", label: "Enviado", icon: Send, color: "border-t-blue-500 bg-blue-50/50 dark:bg-blue-950/10" },
  { id: "NEGOCIANDO", label: "Negociando", icon: MessageCircle, color: "border-t-amber-500 bg-amber-50/50 dark:bg-amber-950/10" },
  { id: "NOTAS", label: "Notas", icon: ListTodo, color: "border-t-purple-500 bg-purple-50/50 dark:bg-purple-950/10" },
  { id: "FECHADO", label: "Fechado", icon: TrendingUp, color: "border-t-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/10" },
];

interface KanbanViewProps {
  flows: ClientFlow[];
  products: Product[];
  onCreateFlow: (data: { productId: string; clientName: string; clientContact: string; description?: string }) => Promise<void>;
  onUpdateStatus: (id: string, data: { currentStatus: ClientFlowStatus; description?: string; nextFollowUpAt?: string }) => Promise<void>;
}

export default function KanbanView({ flows, products, onCreateFlow, onUpdateStatus }: KanbanViewProps) {
  const { notify } = useNotification();
  const [localFlows, setLocalFlows] = useState<ClientFlow[]>(() =>
    Array.isArray(flows) ? flows : []
  );

  useEffect(() => {
    if (Array.isArray(flows)) setLocalFlows(flows);
  }, [flows]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [pendingFlow, setPendingFlow] = useState<ClientFlow | null>(null);
  const [noteDescription, setNoteDescription] = useState("");
  const [noteFollowUp, setNoteFollowUp] = useState("");

  // Form state
  const [formProduct, setFormProduct] = useState("");
  const [formName, setFormName] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const draggedItem = useRef<{ id: string; status: ClientFlowStatus } | null>(null);

  const flowsArray = Array.isArray(localFlows) ? localFlows : [];
  const grouped = flowsArray.reduce((acc, f) => {
    if (!acc[f.currentStatus]) acc[f.currentStatus] = [];
    acc[f.currentStatus].push(f);
    return acc;
  }, {} as Record<string, ClientFlow[]>);

  COLUMNS.forEach(c => { if (!grouped[c.id]) grouped[c.id] = []; });

  const formatPhone = (contact: string) => {
    const ddi = contact.slice(0, 2);
    const ddd = contact.slice(2, 4);
    const num = contact.slice(4);
    return `+${ddi} (${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`;
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  const formatDateTime = (d: string) => {
    return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  const handleDragStart = (flow: ClientFlow) => {
    draggedItem.current = { id: flow.id, status: flow.currentStatus as ClientFlowStatus };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetStatus: ClientFlowStatus) => {
    const item = draggedItem.current;
    if (!item || item.status === targetStatus) {
      draggedItem.current = null;
      return;
    }

    // RN-001: NOTAS requires follow-up date + description
    if (targetStatus === "NOTAS") {
      const flow = localFlows.find(f => f.id === item.id);
      if (flow) {
        setPendingFlow(flow);
        setNoteDescription(flow.description || "");
        setNoteFollowUp("");
        setShowNoteModal(true);
      }
      draggedItem.current = null;
      return;
    }

    // Optimistic update
    setLocalFlows(prev => prev.map(f =>
      f.id === item.id ? { ...f, currentStatus: targetStatus } : f
    ));

    try {
      await onUpdateStatus(item.id, { currentStatus: targetStatus });
    } catch {
      setLocalFlows(prev => prev.map(f =>
        f.id === item.id ? { ...f, currentStatus: item.status } : f
      ));
    }
    draggedItem.current = null;
  };

  const handleNoteSubmit = async () => {
    if (!pendingFlow || !noteFollowUp) {
      setFormError("Data de retorno obrigatória.");
      return;
    }
    if (!noteDescription.trim()) {
      setFormError("Descrição da objeção obrigatória.");
      return;
    }

    const followUpDate = new Date(noteFollowUp);
    if (followUpDate <= new Date()) {
      setFormError("A data de retorno não pode estar no passado.");
      return;
    }

    setLocalFlows(prev => prev.map(f =>
      f.id === pendingFlow.id ? { ...f, currentStatus: "NOTAS" as ClientFlowStatus, description: noteDescription, nextFollowUpAt: noteFollowUp } : f
    ));

    try {
      await onUpdateStatus(pendingFlow.id, { currentStatus: "NOTAS", description: noteDescription, nextFollowUpAt: noteFollowUp });
      setShowNoteModal(false);
      setPendingFlow(null);
      setNoteDescription("");
      setNoteFollowUp("");
      setFormError(null);
      notify.success("Card movido para Notas.");
    } catch {
      setLocalFlows(prev => prev.map(f =>
        f.id === pendingFlow.id ? { ...f, currentStatus: pendingFlow.currentStatus as ClientFlowStatus, description: pendingFlow.description, nextFollowUpAt: pendingFlow.nextFollowUpAt } : f
      ));
    }
  };

  const handleCreateFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formProduct || !formName || !formContact) {
      setFormError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (!/^\+[1-9]\d{1,14}$/.test(formContact)) {
      setFormError("Contato deve estar no formato E.164 (+5511999999999).");
      return;
    }

    setFormLoading(true);
    try {
      await onCreateFlow({ productId: formProduct, clientName: formName, clientContact: formContact, description: formDesc });
      setShowCreateModal(false);
      setFormProduct("");
      setFormName("");
      setFormContact("");
      setFormDesc("");
      notify.success("Lead criado com sucesso!");
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-24 lg:pb-0 text-slate-850 dark:text-slate-200 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Vendas</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Rastreamento de leads em tempo real</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-1 shadow-xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Lead</span>
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {COLUMNS.map(col => {
          const items = grouped[col.id] || [];
          const totalCards = items.length;

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.id)}
              className={`rounded-xl border border-slate-200 dark:border-slate-700 border-t-4 ${col.color} min-h-[300px] flex flex-col`}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <col.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{col.label}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                  {totalCards}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-2 p-2 overflow-y-auto max-h-[60vh]">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-slate-600">
                    <Package className="w-8 h-8 mb-1" />
                    <p className="text-[10px] font-medium">Nenhum lead</p>
                  </div>
                ) : items.map(flow => {
                  const product = products.find(p => p.id === flow.productId);
                  return (
                    <motion.div
                      key={flow.id}
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      draggable
                      onDragStart={() => handleDragStart(flow)}
                      className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-3xs hover:shadow-xs transition-shadow cursor-grab active:cursor-grabbing space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{flow.clientName}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono truncate">{formatPhone(flow.clientContact)}</span>
                          </div>
                        </div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{formatDate(flow.createdAt)}</span>
                      </div>

                      {product && (
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3 h-3 text-indigo-500" />
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{product.name}</span>
                        </div>
                      )}

                      {flow.nextFollowUpAt && (
                        <div className="flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-700">
                          <Calendar className="w-3 h-3 text-purple-500" />
                          <span className="text-[9px] text-purple-600 dark:text-purple-400 font-medium">Retorno: {formatDateTime(flow.nextFollowUpAt)}</span>
                        </div>
                      )}

                      {flow.description && (
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{flow.description}</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE LEAD MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end justify-center"
          >
            <div className="absolute inset-0" onClick={() => setShowCreateModal(false)} />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-t-2xl p-5 pb-32 max-h-[85vh] overflow-y-auto z-10 space-y-3.5 shadow-xl"
            >
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-1.5 mb-1.5" />
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Novo Lead</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-xs text-slate-400 dark:text-slate-500 font-semibold hover:text-slate-600 dark:hover:text-slate-300">
                  Cancelar
                </button>
              </div>

              {formError && (
                <div className="flex items-start gap-1.5 p-2.5 text-[10px] rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-150 text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateFlow} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Produto *</label>
                  <select
                    required
                    value={formProduct}
                    onChange={e => setFormProduct(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="">Selecione...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Nome do Cliente *</label>
                  <input
                    required
                    placeholder="Ex: João Silva"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Contato (WhatsApp) *</label>
                  <input
                    required
                    placeholder="+5511999999999"
                    value={formContact}
                    onChange={e => setFormContact(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 font-mono"
                  />
                  <p className="text-[9px] text-slate-400">Formato internacional: +5511999999999</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Observação</label>
                  <textarea
                    placeholder="Contexto da venda..."
                    rows={2}
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1 shadow-md disabled:opacity-50"
                >
                  {formLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Gerar Link de Rastreamento</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTE MODAL (for NOTAS status) */}
      <AnimatePresence>
        {showNoteModal && pendingFlow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 max-w-xs w-full space-y-3 shadow-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20">
                  <ListTodo className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mover para Notas</h3>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Lead: <strong className="text-slate-700 dark:text-slate-300">{pendingFlow.clientName}</strong>
              </p>

              {formError && (
                <div className="flex items-start gap-1.5 p-2 text-[10px] rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Descrição da Objeção *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Por que o lead não fechou? Qual objeção?"
                    value={noteDescription}
                    onChange={e => setNoteDescription(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Data de Retorno *</label>
                  <input
                    type="datetime-local"
                    required
                    value={noteFollowUp}
                    onChange={e => setNoteFollowUp(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[9px] text-slate-400">Não pode ser no passado.</p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => { setShowNoteModal(false); setPendingFlow(null); setNoteDescription(""); setNoteFollowUp(""); setFormError(null); }}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleNoteSubmit}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
