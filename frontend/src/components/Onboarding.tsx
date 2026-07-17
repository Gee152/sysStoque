import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, ShieldCheck, Package, MousePointerClick, TrendingUp } from "lucide-react";

interface Step {
  title: string;
  description: string;
  targetId?: string;
  tab?: string;
  /** When true the element is clicked automatically once its position stabilises */
  autoClick?: boolean;
}

const steps: Step[] = [
  { title: "Bem-vindo ao StockFlow", description: "Vamos te guiar pelos principais recursos. Você verá cada tela e os campos que precisa preencher." },
  { targetId: "nav-tab-products", title: "Navegação", description: "Use a barra inferior para alternar entre as telas. Vamos para Produtos.", tab: "products" },
  { targetId: "prod-btn-open-add-modal", title: "Adicionar Produto", description: "Clique no (+) para abrir o formulário de cadastro.", tab: "products" },
  { targetId: "form-product-name", title: "Nome do Produto", description: "Campo obrigatório. Ex: 'Camiseta Básica', 'Tênis Runner Pro'. Seja específico.", tab: "products" },
  { targetId: "form-product-category", title: "Categoria", description: "Classifique o produto. Você poderá filtrar por categoria depois.", tab: "products" },
  { targetId: "form-btn-add-variant-row", autoClick: true, title: "Variantes", description: "Produtos podem ter variações (tamanho, cor). Cada variante tem nome, preço e estoque próprios.", tab: "products" },
  { targetId: "form-variant-name", title: "Nome da Variante", description: "Identifique a variação: ex. 'Azul / M', '110V', 'Grande'. Seja descritivo para facilitar o controle.", tab: "products" },
  { targetId: "form-variant-image", title: "Imagem da Variante", description: "Opcional. Adicione uma foto da variação para facilitar a identificação visual no catálogo.", tab: "products" },
  { targetId: "form-variant-price", title: "Preço da Variante", description: "Cada variação pode ter seu próprio preço de venda. Informe o valor em reais.", tab: "products" },
  { targetId: "form-variant-stock", title: "Estoque da Variante", description: "Quantidade inicial em estoque desta variação. Uma entrada será gerada automaticamente ao salvar.", tab: "products" },
  { targetId: "form-btn-submit", title: "Salvar Produto", description: "Revise e clique em SALVAR. Uma movimentação de entrada será gerada automaticamente.", tab: "products" },
  { targetId: "nav-tab-movements", title: "Movimentações", description: "Acompanhe entradas e saídas do estoque. Filtre por tipo ou busque por produto.", tab: "movements" },
  { targetId: "mov-btn-open-add-modal", title: "Lançar Movimentação", description: "Clique no (+) para registrar uma entrada ou saída manual.", tab: "movements" },
  { targetId: "form-mov-product", title: "Selecionar Produto", description: "Escolha o produto que recebeu ou teve saída do estoque.", tab: "movements" },
  { targetId: "form-mov-variant", title: "Selecionar Variante", description: "Escolha a variação específica (tamanho/cor) que foi movimentada.", tab: "movements" },
  { targetId: "form-flow-in", title: "Tipo de Fluxo", description: "Selecione ENTRADA (reposição) ou SAÍDA (venda/ajuste).", tab: "movements" },
  { targetId: "form-mov-qty", title: "Quantidade", description: "Informe quantas unidades foram movimentadas.", tab: "movements" },
  { targetId: "form-mov-reason", title: "Motivo", description: "Descreva o motivo da movimentação. Há sugestões rápidas abaixo.", tab: "movements" },
  { targetId: "form-mov-btn-submit", title: "Registrar", description: "Confirme os dados e registre a movimentação. O saldo será atualizado.", tab: "movements" },
  { targetId: "nav-tab-vendas", title: "Vendas (Kanban)", description: "Gerencie seus leads em um pipeline visual de vendas. Arraste os cards entre as colunas.", tab: "vendas" },
  { title: "Pipeline de Vendas", description: "Cada coluna representa um estágio: Enviado, Negociando, Notas e Fechado. Você move os cards conforme o lead avança." },
  { targetId: "vendas-btn-open-add-modal", title: "Novo Lead", description: "Clique no (+) para registrar um novo lead no pipeline.", tab: "vendas" },
  { targetId: "form-vendas-product", title: "Selecionar Produto", description: "Escolha o produto que o lead está interessado.", tab: "vendas" },
  { targetId: "form-vendas-name", title: "Nome do Cliente", description: "Informe o nome do contato para acompanhamento.", tab: "vendas" },
  { targetId: "form-vendas-contact", title: "WhatsApp do Cliente", description: "Número para contato. Um link de rastreamento será gerado automaticamente.", tab: "vendas" },
  { targetId: "form-vendas-desc", title: "Observação", description: "Contexto adicional sobre o lead ou a venda.", tab: "vendas" },
  { targetId: "form-vendas-btn-submit", title: "Gerar Link de Venda", description: "Confirme para criar o lead e gerar o link de rastreamento compartilhável.", tab: "vendas" },
  { title: "Cards do Pipeline", description: "Cada lead tem um card com nome, produto e contato. Use o lápis para editar observações. Arraste entre as colunas e adicione informações ao mover." },
  { targetId: "nav-tab-dashboard", title: "Resumo (Dashboard)", description: "Acompanhe KPIs: total de produtos, valor em estoque, estoque crítico e classificação ABC.", tab: "dashboard" },
  { targetId: "btn-toggle-dark", title: "Modo Escuro", description: "Alterne entre tema claro e escuro. Sua preferência fica salva.", tab: "dashboard" },
  { title: "Tudo pronto!", description: "Agora você conhece todos os recursos. Cadastre produtos, movimente o estoque e acompanhe seus leads no pipeline de vendas!" },
]

const ONBOARDING_DONE_KEY = "stockflow_onboarding_done"

export function isOnboardingDone(): boolean {
  return localStorage.getItem(ONBOARDING_DONE_KEY) === "true"
}

export function markOnboardingDone(): void {
  localStorage.setItem(ONBOARDING_DONE_KEY, "true")
}

interface OnboardingProps {
  onComplete: () => void
  activeTab: string
  onNavigateTab: (tab: string) => void
}

function findEl(id: string): HTMLElement | null {
  if (id === "btn-toggle-dark") {
    const desktop = document.getElementById("btn-toggle-dark-desktop") as HTMLElement
    if (desktop && desktop.offsetParent !== null) return desktop
  }
  return document.getElementById(id) as HTMLElement | null
}

/** Scroll the nearest scrollable ancestor so the element is visible within it. */
function scrollIntoScrollableParent(el: HTMLElement): void {
  let parent = el.parentElement
  while (parent) {
    const style = window.getComputedStyle(parent)
    const overflow = style.overflow + style.overflowY
    if (/auto|scroll/.test(overflow) && parent.scrollHeight > parent.clientHeight) {
      const elRect = el.getBoundingClientRect()
      const parentRect = parent.getBoundingClientRect()
      const offset = elRect.top - parentRect.top - parent.clientHeight / 2 + el.offsetHeight / 2
      parent.scrollBy({ top: offset, behavior: "smooth" })
      return
    }
    parent = parent.parentElement
  }
  // Fallback: no scrollable ancestor found, do nothing (don't scroll the page)
}

function useElementRect(targetId?: string): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const prevId = useRef(targetId)

  useEffect(() => {
    prevId.current = targetId

    if (!targetId) {
      setRect(null)
      return
    }

    const update = () => {
      if (prevId.current !== targetId) return
      const el = findEl(targetId)
      if (el) {
        setRect(el.getBoundingClientRect())
      }
    }

    update()

    const onResize = () => update()
    const onScroll = () => update()
    window.addEventListener("resize", onResize)
    window.addEventListener("scroll", onScroll, true)
    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onScroll, true)
    }
  }, [targetId])

  return rect
}

export default function Onboarding({ onComplete, activeTab, onNavigateTab }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [exit, setExit] = useState(false)
  const [phase, setPhase] = useState<"navigate" | "act" | "ready">("navigate")
  const current = steps[step]

  const isProductForm = step >= 3 && step <= 10
  const isMovementForm = step >= 13 && step <= 18
  const isVendasForm = step >= 22 && step <= 26
  const isFormField = isProductForm || isMovementForm || isVendasForm

  // Navigate to required tab
  useEffect(() => {
    if (exit) return
    setPhase("navigate")

    if (current.tab && current.tab !== activeTab) {
      onNavigateTab(current.tab)
    }

    const t1 = setTimeout(() => {
      if (exit) return

      const needsModal = isProductForm || isMovementForm || isVendasForm
      if (needsModal) {
        const productModalOpen = !!document.getElementById("form-product-name")
        const movementModalOpen = !!document.getElementById("form-mov-product")
        const vendasModalOpen = !!document.getElementById("form-vendas-product")

        if (isProductForm && !productModalOpen) {
          document.getElementById("prod-btn-open-add-modal")?.click()
        }
        if (isMovementForm && !movementModalOpen) {
          document.getElementById("mov-btn-open-add-modal")?.click()
        }
        if (isVendasForm && !vendasModalOpen) {
          document.getElementById("vendas-btn-open-add-modal")?.click()
        }
        requestAnimationFrame(() => {
          if (!exit) setPhase("act")
        })
      } else {
        setPhase("act")
      }
    }, 400)

    return () => clearTimeout(t1)
  }, [step, exit])

  // Poll for target element until found AND its position is stable (animation done)
  useEffect(() => {
    if (exit || phase !== "act" || !current.targetId) {
      if (!current.targetId && phase === "act") setPhase("ready")
      return
    }

    let cancelled = false
    let attempts = 0
    let lastTop: number | null = null
    let clicked = false

    const poll = () => {
      if (cancelled) return
      attempts++
      const el = findEl(current.targetId!)
      if (el) {
        const currentTop = el.getBoundingClientRect().top
        // Wait until position is stable across two consecutive frames
        if (lastTop !== null && Math.abs(currentTop - lastTop) < 0.5) {
          if (current.autoClick && !clicked) {
            // Click the element and keep polling until DOM settles
            clicked = true
            lastTop = null
            el.click()
            requestAnimationFrame(poll)
          } else {
            scrollIntoScrollableParent(el)
            setPhase("ready")
          }
        } else {
          lastTop = currentTop
          requestAnimationFrame(poll)
        }
      } else if (attempts < 300) {
        requestAnimationFrame(poll)
      } else {
        setPhase("ready")
      }
    }
    requestAnimationFrame(poll)
    return () => { cancelled = true }
  }, [phase, current.targetId, exit])

  const rect = useElementRect(phase === "ready" ? current.targetId : undefined)

  const closeModals = () => {
    ["prod-btn-close-modal", "mov-btn-close-modal", "vendas-btn-close-modal"].forEach(id => {
      document.getElementById(id)?.click()
    })
  }

  const goTo = (next: number) => {
    const prevProductForm = step >= 3 && step <= 10
    const nextProductForm = next >= 3 && next <= 10
    const prevMovementForm = step >= 13 && step <= 18
    const nextMovementForm = next >= 13 && next <= 18
    const prevVendasForm = step >= 22 && step <= 26
    const nextVendasForm = next >= 22 && next <= 26

    if (prevProductForm && !nextProductForm) {
      document.getElementById("prod-btn-close-modal")?.click()
    }
    if (prevMovementForm && !nextMovementForm) {
      document.getElementById("mov-btn-close-modal")?.click()
    }
    if (prevVendasForm && !nextVendasForm) {
      document.getElementById("vendas-btn-close-modal")?.click()
    }

    setStep(next)
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      goTo(step + 1)
    } else {
      finish()
    }
  }

  const handlePrev = () => {
    if (step > 0) goTo(step - 1)
  }

  const finish = () => {
    closeModals()
    setExit(true)
    setTimeout(() => {
      markOnboardingDone()
      onComplete()
    }, 300)
  }

  const isLast = step === steps.length - 1
  const isFirst = step === 0
  const hasTarget = !!current.targetId
  const phaseReady = phase === "ready"
  const isInfo = step === 0 || step === 20 || step === 27 || step === steps.length - 1

  const gap = 6

  return (
    <AnimatePresence>
      {!exit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9998]"
        >
          {/* Blur cutout: 4 sections around target */}
          {hasTarget && phaseReady && rect && !isInfo && (
            <>
              {/* Top */}
              <div
                className="fixed bg-black/15 backdrop-blur-[3px] pointer-events-none"
                style={{ top: 0, left: 0, right: 0, height: Math.max(0, rect.top - gap) }}
              />
              {/* Bottom */}
              <div
                className="fixed bg-black/15 backdrop-blur-[3px] pointer-events-none"
                style={{ top: rect.bottom + gap, left: 0, right: 0, bottom: 0 }}
              />
              {/* Left (between top and bottom) */}
              <div
                className="fixed bg-black/15 backdrop-blur-[3px] pointer-events-none"
                style={{ top: Math.max(0, rect.top - gap), left: 0, width: Math.max(0, rect.left - gap), height: rect.height + gap * 2 }}
              />
              {/* Right (between top and bottom) */}
              <div
                className="fixed bg-black/15 backdrop-blur-[3px] pointer-events-none"
                style={{ top: Math.max(0, rect.top - gap), left: rect.right + gap, right: 0, height: rect.height + gap * 2 }}
              />
            </>
          )}

          {/* Simple overlay for info steps */}
          {isInfo && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-none" />
          )}

          {/* Highlight ring */}
          {hasTarget && phaseReady && rect && (
            <div
              className="absolute pointer-events-none z-10"
              style={{
                left: rect.left - 4,
                top: rect.top - 4,
                width: rect.width + 8,
                height: rect.height + 8,
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full rounded-lg border-2 border-indigo-500 shadow-[0_0_0_3px_rgba(99,102,241,0.25),0_0_24px_rgba(99,102,241,0.2)]"
              />
            </div>
          )}

          {/* Tooltip / Card */}
          <div className={`absolute inset-0 flex p-4 pointer-events-none ${isFormField ? 'items-start pt-14 lg:pt-20 justify-center' : 'items-center justify-center'}`}>
            <motion.div
              key={step}
              initial={isInfo ? { scale: 0.92, opacity: 0, y: 20 } : { opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={isInfo ? { scale: 0.92, opacity: 0, y: 20 } : { opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative w-full max-w-sm lg:max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden pointer-events-auto"
            >
              {/* Close button */}
              <button
                onClick={finish}
                className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10 cursor-pointer"
                tabIndex={-1}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className={`flex flex-col ${isInfo ? 'items-center text-center px-6 pt-10 pb-6 min-h-[260px]' : 'px-5 pt-5 pb-4'}`}>
                {isInfo ? (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-800">
                      {step === 0 ? (
                        <ShieldCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                      ) : step === 20 ? (
                        <TrendingUp className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                      ) : step === 27 ? (
                        <MousePointerClick className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Package className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                    <h2 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-2">{current.title}</h2>
                    <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs lg:max-w-sm">{current.description}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800 shrink-0 mt-0.5">
                        <MousePointerClick className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-sm lg:text-base font-bold text-slate-900 dark:text-white mb-1">{current.title}</h2>
                        <p className="text-[11px] lg:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{current.description}</p>
                      </div>
                    </div>

                    {!phaseReady && (
                      <div className="flex items-center gap-2 py-1">
                        <div className="w-3 h-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                        <span className="text-[10px] text-slate-400">Preparando tela...</span>
                      </div>
                    )}
                  </>
                )}

                <div className={`flex flex-col items-center gap-3 ${isInfo ? 'mt-6' : 'mt-3'}`}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === 1
                              ? "w-5 bg-indigo-600 dark:bg-indigo-400"
                              : "w-1.5 bg-slate-300 dark:bg-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
                      {step + 1}/{steps.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between w-full gap-2">
                    <button
                      onClick={finish}
                      className="px-3 py-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                      tabIndex={-1}
                    >
                      Pular
                    </button>

                    <div className="flex gap-2">
                      {!isFirst && (
                        <button
                          onClick={handlePrev}
                          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          tabIndex={-1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={handleNext}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          isLast
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30"
                            : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                        }`}
                        tabIndex={-1}
                      >
                        <span>{isLast ? "Começar" : "Próximo"}</span>
                        {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
