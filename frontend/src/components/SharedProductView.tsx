import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { getPublicProduct, type PublicProductData } from "../services/api";
import { 
  ShoppingBag, 
  Package, 
  Minus, 
  Plus, 
  Loader2, 
  AlertCircle, 
  Check, 
  Share2,
  ArrowLeft 
} from "lucide-react";

interface SharedProductViewProps {
  productId: string;
  onBack?: () => void;
}

export default function SharedProductView({ productId, onBack }: SharedProductViewProps) {
  const [product, setProduct] = useState<PublicProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicProduct(productId);
      setProduct(data);
      if (data.variants.length > 0) {
        setSelectedVariantId(data.variants[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Produto não encontrado.");
    } finally {
      setLoading(false);
    }
  };

  const selectedVariant = product?.variants.find((v) => v.id === selectedVariantId);

  const handleWhatsApp = () => {
    if (!product || !selectedVariant) return;

    const phone = product.sellerPhone || "5511999999999";
    const message = encodeURIComponent(
      `Olá! Gostaria de comprar:\n\n` +
      `*${product.name}*\n` +
      `Variante: ${selectedVariant.name}\n` +
      `Quantidade: ${quantity}\n` +
      `Valor unitário: R$ ${selectedVariant.price.toFixed(2)}\n` +
      `Total: R$ ${(selectedVariant.price * quantity).toFixed(2)}\n\n` +
      `Poderia confirmar a disponibilidade e o prazo de entrega?`
    );

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Carregando produto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Produto não encontrado</h2>
          <p className="text-sm text-slate-500 mb-6">{error || "O link pode estar expirado ou o produto foi removido."}</p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Voltar
            </button>
          )}
        </div>
      </div>
    );
  }

  const mainImage = product.imageUrl || selectedVariant?.imageUrl || null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 z-20">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-slate-800">Produto</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
            title="Copiar link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
        {/* Product Image */}
        {mainImage ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200"
          >
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="aspect-square rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center"
          >
            <Package className="w-16 h-16 text-slate-300" />
          </motion.div>
        )}

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          {product.category && (
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {product.category}
            </span>
          )}

          <h1 className="text-xl font-bold text-slate-900 leading-tight">{product.name}</h1>

          <p className="text-2xl font-black text-emerald-600">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
              selectedVariant?.price || product.salePrice
            )}
          </p>
        </motion.div>

        {/* Variant Selection */}
        {product.variants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Opções disponíveis
            </span>
            <div className="grid grid-cols-2 gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  disabled={v.stock === 0}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`relative p-3 rounded-xl border-2 text-left transition-all ${
                    selectedVariantId === v.id
                      ? "border-emerald-500 bg-emerald-50"
                      : v.stock === 0
                        ? "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  {v.imageUrl && (
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100 mb-2">
                      <img
                        src={v.imageUrl}
                        alt={v.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                  <p className={`text-xs font-bold ${selectedVariantId === v.id ? "text-emerald-800" : "text-slate-800"}`}>
                    {v.name}
                  </p>
                  <p className={`text-[11px] font-mono mt-0.5 ${selectedVariantId === v.id ? "text-emerald-600" : "text-slate-500"}`}>
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v.price)}
                  </p>
                  {v.stock <= 5 && v.stock > 0 && (
                    <span className="text-[9px] text-amber-600 font-medium">Apenas {v.stock} un</span>
                  )}
                  {v.stock === 0 && (
                    <span className="text-[9px] text-rose-500 font-medium">Indisponível</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quantity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-200"
        >
          <span className="text-xs font-bold text-slate-600">Quantidade</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-slate-800">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              disabled={selectedVariant ? quantity >= selectedVariant.stock : false}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Total */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-right"
        >
          <p className="text-xs text-slate-500">Total do pedido</p>
          <p className="text-xl font-black text-slate-900">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
              (selectedVariant?.price || product.salePrice) * quantity
            )}
          </p>
        </motion.div>

        {/* WhatsApp CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleWhatsApp}
          disabled={!selectedVariant || selectedVariant.stock === 0}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>Comprar via WhatsApp</span>
        </motion.button>

        {/* Payment info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[10px] text-slate-400 text-center"
        >
          Ao clicar em "Comprar via WhatsApp", você será redirecionado para conversar com o vendedor e finalizar seu pedido.
        </motion.p>
      </div>
    </div>
  );
}
