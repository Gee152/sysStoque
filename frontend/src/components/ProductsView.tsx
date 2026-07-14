/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  FileText, 
  DollarSign, 
  AlertCircle, 
  Tag, 
  Check, 
  Trash2, 
  BarChart, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Upload, 
  Share2, 
  Image as ImageIcon, 
  Copy, 
  X 
} from "lucide-react";
import { Product, ProductVariant } from "../types";
import { uploadImage } from "../services/api";

interface ProductsViewProps {
  products: Product[];
  onAddProduct: (productData: any) => Promise<void>;
  onRegisterQuickMovement: (variantId: string, type: "IN" | "OUT", quantity: number, reason: string) => Promise<void>;
}

export default function ProductsView({ products, onAddProduct, onRegisterQuickMovement }: ProductsViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODAS");
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Vestuário");
  const [sku, setSku] = useState("");
  const [variantsForm, setVariantsForm] = useState<any[]>([
    { name: "Padrão", sku: "", price: "", stock: "", image: null, imagePreview: "" }
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Quick movement panel inside variant accordion
  const [quickMoveQty, setQuickMoveQty] = useState<Record<string, number>>({});
  const [quickMoveReason, setQuickMoveReason] = useState<Record<string, string>>({});
  const [quickMoveLoading, setQuickMoveLoading] = useState<Record<string, boolean>>({});

  // Unique categories list
  const categories = ["TODAS", ...Array.from(new Set(products.map(p => p.category)))];

  // Filters
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.variants.some(v => v.sku.toLowerCase().includes(search.toLowerCase()) || v.name.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === "TODAS" || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (productId: string) => {
    setExpandedProductId(expandedProductId === productId ? null : productId);
  };

  const handleAddVariantRow = () => {
    setVariantsForm([...variantsForm, { name: "", sku: "", price: "", stock: "", image: null, imagePreview: "" }]);
  };

  const handleRemoveVariantRow = (idx: number) => {
    if (variantsForm.length === 1) return;
    setVariantsForm(variantsForm.filter((_, i) => i !== idx));
  };

  const handleVariantChange = (idx: number, field: string, value: string) => {
    const updated = [...variantsForm];
    updated[idx][field] = value;
    setVariantsForm(updated);
  };

  const handleVariantImage = (idx: number, file: File | null) => {
    const updated = [...variantsForm];
    if (file) {
      updated[idx].image = file;
      updated[idx].imagePreview = URL.createObjectURL(file);
    } else {
      if (updated[idx].imagePreview) {
        URL.revokeObjectURL(updated[idx].imagePreview);
      }
      updated[idx].image = null;
      updated[idx].imagePreview = "";
    }
    setVariantsForm(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    // Validation
    if (!name || !category || !sku) {
      setFormError("Nome, Categoria e SKU base são obrigatórios.");
      setLoading(false);
      return;
    }

    // Upload images first, then create product
    const formattedVariants = await Promise.all(variantsForm.map(async (v) => {
      let imageUrl: string | null = null;
      if (v.image) {
        try {
          imageUrl = await uploadImage(v.image);
        } catch (err: any) {
          setFormError(`Erro ao enviar imagem da variante "${v.name}": ${err.message}`);
          setLoading(false);
          return null;
        }
      }

      return {
        name: v.name || "Padrão",
        sku: v.sku || `${sku}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        price: Number(v.price) || 0,
        stock: Number(v.stock) || 0,
        imageUrl,
      };
    }));

    if (formattedVariants.some(v => v === null)) return;

    try {
      await onAddProduct({
        name,
        description,
        category,
        sku: sku.toUpperCase(),
        variants: formattedVariants,
      });

      // Clear form
      setName("");
      setDescription("");
      setCategory("Vestuário");
      setSku("");
      setVariantsForm([{ name: "Padrão", sku: "", price: "", stock: "", image: null, imagePreview: "" }]);
      setShowAddModal(false);
    } catch (err: any) {
      setFormError(err.message || "Erro ao adicionar produto.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMovement = async (variantId: string, type: "IN" | "OUT") => {
    const qty = quickMoveQty[variantId] || 1;
    const reason = quickMoveReason[variantId] || (type === "IN" ? "Ajuste de entrada" : "Ajuste de saída");
    
    setQuickMoveLoading(prev => ({ ...prev, [variantId]: true }));
    try {
      await onRegisterQuickMovement(variantId, type, qty, reason);
      // reset quick movement inputs for this variant
      setQuickMoveQty(prev => ({ ...prev, [variantId]: 1 }));
      setQuickMoveReason(prev => ({ ...prev, [variantId]: "" }));
    } catch (err: any) {
      alert(err.message || "Erro ao realizar movimentação.");
    } finally {
      setQuickMoveLoading(prev => ({ ...prev, [variantId]: false }));
    }
  };

  return (
    <div className="space-y-4.5 pb-24 lg:pb-0 text-slate-850 dark:text-slate-200 transition-colors">
      {/* Search and Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Produtos</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Gestão e controle de itens</p>
        </div>
        <button
          id="prod-btn-open-add-modal"
          onClick={() => setShowAddModal(true)}
          className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-all flex items-center gap-1 shadow-xs active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Cadastrar</span>
        </button>
      </div>

      {/* Filter Segment */}
      <div className="space-y-2">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            id="prod-input-search"
            type="text"
            placeholder="Buscar por nome, SKU, variante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 shadow-3xs"
          />
        </div>

        {/* Categories Horizontal Scroller */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? "bg-indigo-600 border-indigo-600 dark:border-slate-600 text-white shadow-3xs"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 shadow-3xs"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products list */}
      <div className="space-y-2">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-xs mt-4">
            Nenhum produto encontrado para os filtros selecionados.
          </div>
        ) : (
          filteredProducts.map((product) => {
            const isExpanded = expandedProductId === product.id;
            const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);
            const hasLowStock = product.variants.some(v => v.stock <= 5);

            return (
              <div 
                key={product.id} 
                className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:border-slate-300 transition-all shadow-3xs"
              >
                {/* Accordion Trigger */}
                <div 
                  onClick={() => toggleExpand(product.id)}
                  className="p-3 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-indigo-600 dark:text-indigo-400 shrink-0 border border-slate-100 dark:border-slate-800">
                      <Layers className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                        {product.category}
                      </span>
                      <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[190px]">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        SKU: {product.sku}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Share button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const link = `${window.location.origin}/compartilhar/${product.id}`;
                        navigator.clipboard.writeText(link);
                        setCopiedId(product.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                      title="Copiar link de compartilhamento"
                    >
                      {copiedId === product.id ? (
                        <Copy className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Stock status indicator */}
                    <div className="text-right">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        totalStock === 0 
                          ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100" 
                          : hasLowStock 
                            ? "bg-amber-50 text-amber-600 border border-amber-100" 
                            : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100"
                      }`}>
                        {totalStock} un
                      </span>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                        {product.variants.length} var.
                      </p>
                    </div>

                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />}
                  </div>
                </div>

                {/* Accordion Content */}
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-3 py-3 space-y-3.5"
                  >
                    {product.description && (
                      <div className="px-1">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                          <FileText className="w-3 h-3 text-indigo-500" />
                          Descrição do Produto
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 leading-relaxed pl-4">
                          {product.description}
                        </p>
                      </div>
                    )}

                    {/* Variants grid listing */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 px-1 uppercase tracking-wider">
                        <Tag className="w-3 h-3 text-indigo-500" />
                        Variantes Cadastradas
                      </span>
                      
                      <div className="space-y-1.5 pl-1">
                        {product.variants.map((v) => (
                          <div 
                            key={v.id} 
                            className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 shadow-3xs space-y-2.5"
                          >
                            <div className="flex items-center gap-3">
                              {v.imageUrl ? (
                                <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                                  <img
                                    src={v.imageUrl}
                                    alt={v.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                  />
                                </div>
                              ) : null}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{v.name}</p>
                                <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">SKU: {v.sku}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v.price)}
                                </p>
                                <span className={`inline-block text-[9px] font-bold mt-0.5 px-1 rounded ${
                                  v.stock === 0 
                                    ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400" 
                                    : v.stock <= 5 
                                      ? "bg-amber-50 text-amber-600" 
                                      : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400"
                                }`}>
                                  Estoque: {v.stock} un
                                </span>
                              </div>
                            </div>

                            {/* Quick stock adjustment tool */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
                              <div className="flex items-center bg-slate-50 dark:bg-slate-800/50 border border-slate-150 rounded h-7">
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold px-1">Qtd:</span>
                                <div className="flex flex-col items-center justify-center -ml-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setQuickMoveQty(prev => ({ ...prev, [v.id]: (prev[v.id] || 1) + 1 }))}
                                    className="leading-none text-[8px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 active:scale-90"
                                  >
                                    ▲
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    value={quickMoveQty[v.id] || 1}
                                    onChange={(e) => setQuickMoveQty(prev => ({ ...prev, [v.id]: Math.max(1, parseInt(e.target.value) || 1) }))}
                                    className="w-6 text-center bg-transparent border-none text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-0 font-mono font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none leading-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setQuickMoveQty(prev => ({ ...prev, [v.id]: Math.max(1, (prev[v.id] || 1) - 1) }))}
                                    className="leading-none text-[8px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 active:scale-90"
                                  >
                                    ▼
                                  </button>
                                </div>
                              </div>

                              <input
                                type="text"
                                placeholder="Motivo (opcional)"
                                value={quickMoveReason[v.id] || ""}
                                onChange={(e) => setQuickMoveReason(prev => ({ ...prev, [v.id]: e.target.value }))}
                                className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-150 rounded text-[10px] px-2 h-7 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                              />

                              <div className="flex gap-1 shrink-0">
                                <button
                                  id={`prod-btn-quick-out-${v.id}`}
                                  disabled={quickMoveLoading[v.id] || v.stock === 0}
                                  onClick={() => handleQuickMovement(v.id, "OUT")}
                                  className="h-7 px-2 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 disabled:opacity-30 border border-rose-100 text-rose-600 dark:text-rose-400 rounded text-[10px] font-bold flex items-center gap-0.5 active:scale-95"
                                >
                                  <ArrowUpRight className="w-3 h-3" />
                                  <span>Saída</span>
                                </button>
                                <button
                                  id={`prod-btn-quick-in-${v.id}`}
                                  disabled={quickMoveLoading[v.id]}
                                  onClick={() => handleQuickMovement(v.id, "IN")}
                                  className="h-7 px-2 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 border border-emerald-100 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-bold flex items-center gap-0.5 active:scale-95"
                                >
                                  <ArrowDownLeft className="w-3 h-3" />
                                  <span>Entrada</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CADASTRAR PRODUTO MODAL / FULL SHEET */}
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
              className="relative w-full max-w-sm bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto z-10 space-y-3.5 shadow-xl"
            >
              {/* Header drag bar indicator */}
              <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto -mt-1.5 mb-1.5" />

              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cadastrar Novo Produto</h3>
                <button 
                  id="prod-btn-close-modal"
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

              <form onSubmit={handleFormSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Nome do Produto *</label>
                  <input
                    id="form-product-name"
                    type="text"
                    required
                    placeholder="Ex: Caneca de Cerâmica"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Categoria *</label>
                    <select
                      id="form-product-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
                    >
                      <option value="Vestuário">Vestuário</option>
                      <option value="Periféricos">Periféricos</option>
                      <option value="Utensílios">Utensílios</option>
                      <option value="Eletrônicos">Eletrônicos</option>
                      <option value="Papelaria">Papelaria</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">SKU Base *</label>
                    <input
                      id="form-product-sku"
                      type="text"
                      required
                      placeholder="Ex: CAN-CER"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600 uppercase font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Descrição (Opcional)</label>
                  <textarea
                    id="form-product-desc"
                    placeholder="Breve descrição do item..."
                    value={description}
                    rows={2}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                {/* Dynamic Variants form section */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2.5">
                    <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      Grade de Variantes
                    </span>
                    <button
                      id="form-btn-add-variant-row"
                      type="button"
                      onClick={handleAddVariantRow}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-0.5 scrollbar-thin">
                    {variantsForm.map((v, idx) => (
                      <div 
                        key={idx} 
                        className="relative p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-2"
                      >
                        {variantsForm.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveVariantRow(idx)}
                            className="absolute -top-1.5 -right-1.5 p-1 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-full border border-rose-100 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}

                        <div className="col-span-2 space-y-1">
                          <input
                            type="text"
                            required
                            placeholder="Especificação (ex: Azul / M, 110V)"
                            value={v.name}
                            onChange={(e) => handleVariantChange(idx, "name", e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
                          />
                        </div>

                        {/* Image upload */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            {v.imagePreview ? (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                                <img
                                  src={v.imagePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleVariantImage(idx, null)}
                                  className="absolute -top-1 -right-1 p-0.5 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-full border border-rose-100"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : null}
                            <label className="flex-1 flex items-center gap-1.5 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 cursor-pointer transition-colors font-medium">
                              <Upload className="w-3 h-3" />
                              {v.imagePreview ? "Trocar imagem" : "Adicionar imagem"}
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleVariantImage(idx, file);
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <input
                            type="text"
                            placeholder="SKU específico (vazio p/ auto)"
                            value={v.sku}
                            onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600 font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-1">
                          <input
                            type="number"
                            step="0.01"
                            required
                            placeholder="Preço R$"
                            value={v.price}
                            onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1.5 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
                          />
                          <input
                            type="number"
                            required
                            placeholder="Estoque"
                            value={v.stock}
                            onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1.5 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  id="form-btn-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold rounded-lg text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-indigo-100 dark:shadow-indigo-900/30 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Concluir Cadastro</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
