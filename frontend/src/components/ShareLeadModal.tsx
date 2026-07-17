import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Phone, User, Check, Share2, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { findClientFlowByContact } from "../services/api";
import type { Product, ClientFlow } from "../types";
import { useNotification } from "./Notification";

interface ShareLeadModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onCreateFlow: (data: { productId: string; clientName: string; clientContact: string; description?: string }) => Promise<ClientFlow>;
}

export default function ShareLeadModal({ open, product, onClose, onCreateFlow }: ShareLeadModalProps) {
  const { notify } = useNotification();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [existingFlow, setExistingFlow] = useState<any | null>(null);
  const [checking, setChecking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [done, setDone] = useState(false);
  const [trackingLink, setTrackingLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setPhone("");
    setName("");
    setExistingFlow(null);
    setChecking(false);
    setCreating(false);
    setDone(false);
    setTrackingLink("");
    setError(null);
    setCopied(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return `${digits}`;
    if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length > 13) return;
    setPhone(`${digits}`);
    if (existingFlow) setExistingFlow(null);
    if (done) setDone(false);
    setError(null);
  };

  const checkContact = async () => {
    if (phone.length < 8) return;
    setChecking(true);
    setError(null);
    try {
      const flow = await findClientFlowByContact(phone);
      if (flow) {
        setExistingFlow(flow);
        setName(flow.clientName);
      } else {
        setExistingFlow(null);
      }
    } catch {
      // silent
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!product || !phone) return;

    if (!/^\d{10,13}$/.test(phone)) {
      setError("Telefone inválido. Use DDD + número (ex: 81999999999).");
      return;
    }

    if (!existingFlow && !name.trim()) {
      setError("Informe o nome do cliente.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const flow = await onCreateFlow({
        productId: product.id,
        clientName: existingFlow ? existingFlow.clientName : name.trim(),
        clientContact: phone,
      });

      const link = `${window.location.origin}/compartilhar/${product.id}?track=${flow.trackingToken}`;
      setTrackingLink(link);
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setDone(true);
      notify.success("Link de rastreamento copiado!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const openWhatsApp = () => {
    if (!trackingLink) return;
    const msg = encodeURIComponent(`Olá! Veja este produto: ${trackingLink}`);
    const targetPhone = existingFlow?.clientContact || phone;
    window.open(`https://wa.me/${targetPhone.replace(/\D/g, "")}?text=${msg}`, "_blank");
  };

  return (
    <AnimatePresence>
      {open && product && (
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
            className="bg-white dark:bg-slate-800 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-slate-200 dark:border-slate-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                  <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {done ? "Link Gerado" : "Compartilhar Produto"}
                </h3>
              </div>
              <button onClick={handleClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!done ? (
              <>
                {/* Product info */}
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Produto</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">{product.name}</p>
                </div>

                {error && (
                  <div className="flex items-start gap-1.5 p-2 text-[10px] rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100">
                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Phone input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">WhatsApp do Cliente *</label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="tel"
                        placeholder="+55 11 99999-9999"
                        value={formatPhone(phone)}
                        onChange={e => handlePhoneChange(e.target.value)}
                        onBlur={checkContact}
                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-600 font-mono"
                        autoFocus
                      />
                      {checking && (
                        <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-500 animate-spin" />
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400">Digite o número com DDI e DDD</p>
                  </div>

                  {/* Checking contact */}
                  {checking && (
                    <div className="flex items-center justify-center gap-2 py-3">
                      <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Verificando contato...</span>
                    </div>
                  )}

                  {/* Found existing client */}
                  {!checking && existingFlow && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Cliente encontrado</p>
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{existingFlow.clientName}</p>
                      </div>
                    </div>
                  )}

                  {/* Name input (only for new clients, after check completes) */}
                  {!checking && !existingFlow && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Nome do Cliente *</label>
                      <div className="relative">
                        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Ex: João Silva"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={creating || !phone}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Gerar Link de Venda</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* Success state */}
                <div className="flex flex-col items-center py-3 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs">
                    Link de rastreamento copiado para {existingFlow?.clientName || name}!
                  </p>

                  <div className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate font-mono">{trackingLink}</p>
                  </div>

                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(trackingLink);
                        setCopied(true);
                        notify.success("Link copiado!");
                      }}
                      className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      {copied ? "Copiado" : "Copiar"}
                    </button>
                    <button
                      onClick={openWhatsApp}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      WhatsApp
                    </button>
                  </div>

                  <button
                    onClick={handleClose}
                    className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
