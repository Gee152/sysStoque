import type { Movement, DashboardMetrics, ClientFlow, ClientFlowStatus } from "../types";

const API_BASE = "/api";

let onUnauthorized: (() => void) | null = null;

export function setOnUnauthorized(cb: () => void) {
  onUnauthorized = cb;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("stockflow_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  const result = await response.json();

  if (!response.ok || result.ok === false) {
    const msg =
      typeof result.error === "string"
        ? result.error
        : result.error?.message || "Erro na requisição.";
    if (response.status === 401) {
      localStorage.removeItem("stockflow_token");
      localStorage.removeItem("stockflow_user");
      if (onUnauthorized) onUnauthorized();
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    throw new Error(msg);
  }

  return result.data as T;
}

async function requestBlob(url: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}${url}`);
  if (!response.ok) throw new Error("Erro ao carregar imagem.");
  return response.blob();
}

// --- Auth ---
export async function login(email: string, password: string) {
  return request<{ token: string; user: { id: string; name: string; email: string; phone?: string | null } }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, passwordHash: password }),
    }
  );
}

export async function register(name: string, email: string, password: string, phone?: string) {
  return request<{ token: string; user: { id: string; name: string; email: string; phone?: string | null } }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ name, email, passwordHash: password, phone: phone || undefined }),
    }
  );
}

// --- Upload ---
export async function uploadImage(file: File): Promise<string> {
  const token = localStorage.getItem("stockflow_token");
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok || result.ok === false) {
    const msg =
      typeof result.error === "string"
        ? result.error
        : result.error?.message || "Erro ao enviar imagem.";
    if (response.status === 401) {
      localStorage.removeItem("stockflow_token");
      localStorage.removeItem("stockflow_user");
      if (onUnauthorized) onUnauthorized();
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    throw new Error(msg);
  }

  return result.data.url as string;
}

// --- Products ---
function extractProductList(data: any): any[] {
  if (Array.isArray(data)) return data;
  const products = data.products ?? [];
  const variants = data.variants ?? [];
  return products.map((p: any, i: number) => ({
    ...p,
    variants: variants[i] || [],
  }));
}

function transformProduct(p: any) {
  const variants = (p.variants || []).map((v: any) => ({
    id: v.id,
    productId: v.productId || p.id,
    name:
      v.name ||
      (v.size
        ? v.color && v.color !== "default"
          ? `${v.size} / ${v.color}`
          : v.size
        : "Padrão"),
    price: v.price ?? p.salePrice ?? 0,
    stock: v.stock ?? 0,
    imageUrl: v.imageUrl || null,
    createdAt: v.createdAt || new Date().toISOString(),
    updatedAt: v.updatedAt || v.createdAt || new Date().toISOString(),
  }));

  return {
    id: p.id,
    name: p.name,
    description: p.description || "",
    category: p.category || "",
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || p.createdAt || new Date().toISOString(),
    variants,
  };
}

export async function getProducts() {
  const data = await request<any>("/products");
  return extractProductList(data).map(transformProduct);
}

export async function createProduct(productData: {
  name: string;
  description?: string;
  category: string;
  variants: { name: string; price: number; stock: number; imageUrl?: string | null }[];
}) {
  const body = {
    name: productData.name,
    category: productData.category || "",
    costPrice: 0,
    salePrice: productData.variants?.[0]?.price || 0,
    variants: (productData.variants || []).map((v) => ({
      size: v.name || "Padrão",
      color: "default",
      stock: v.stock || 0,
      imageUrl: v.imageUrl || undefined,
    })),
  };

  const data = await request<any>("/products", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return transformProduct(data);
}

export async function updateProduct(productId: string, productData: {
  name?: string;
  category?: string;
  costPrice?: number;
  salePrice?: number;
  imageUrl?: string;
}) {
  const data = await request<any>(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
  return transformProduct(data);
}

export async function deleteProduct(productId: string) {
  await request<void>(`/products/${productId}`, {
    method: "DELETE",
  });
}

// --- Movements ---
function transformMovement(m: any): Movement {
  return {
    id: m.id,
    variantId: m.variantId,
    productId: m.productId,
    type: m.type === "IN" || m.type === "OUT" ? m.type : "IN",
    quantity: m.quantity,
    reason: m.reason || "",
    userId: m.userId || "",
    userName: m.userName || "",
    date: m.createdAt || m.date || new Date().toISOString(),
    productName: m.productName || "",
    variantName:
      m.variantName ||
      (m.variantSize
        ? `${m.variantSize}${m.variantColor ? ` / ${m.variantColor}` : ""}`
        : ""),
  };
}

export async function getMovements() {
  const data = await request<any[]>("/movements");
  return data.map(transformMovement);
}

export async function createMovement(data: {
  variantId: string;
  type: "IN" | "OUT";
  quantity: number;
  reason?: string;
}) {
  const result = await request<any>("/movements", {
    method: "POST",
    body: JSON.stringify({
      variantId: data.variantId,
      type: data.type,
      quantity: data.quantity,
      reason: data.reason || "",
    }),
  });

  return transformMovement(result);
}

// --- Dashboard ---
export async function getDashboard(existingProducts?: any[]): Promise<DashboardMetrics> {
  const rawProducts = existingProducts ?? await request<any>("/products");
  const list = existingProducts ? rawProducts : extractProductList(rawProducts);
  const movements = await request<any[]>("/movements");

  const typedProducts = list.map(transformProduct);
  const typedMovements = movements.map(transformMovement);

  let totalVariants = 0;
  let totalItemsInStock = 0;
  let totalStockValue = 0;
  let lowStockItemsCount = 0;
  const stockByCategoryMap: Record<string, { count: number; value: number }> = {};

  for (const p of typedProducts) {
    for (const v of p.variants) {
      totalVariants++;
      totalItemsInStock += v.stock;
      totalStockValue += v.price * v.stock;
      if (v.stock <= 5) lowStockItemsCount++;
      const cat = p.category || "Sem categoria";
      if (!stockByCategoryMap[cat])
        stockByCategoryMap[cat] = { count: 0, value: 0 };
      stockByCategoryMap[cat].count += v.stock;
      stockByCategoryMap[cat].value += v.price * v.stock;
    }
  }

  let entriesQty = 0;
  let exitsQty = 0;
  for (const m of typedMovements) {
    if (m.type === "IN") entriesQty += m.quantity;
    else exitsQty += m.quantity;
  }

  return {
    totalProducts: typedProducts.length,
    totalVariants,
    totalStockValue: Math.round(totalStockValue * 100) / 100,
    totalItemsInStock,
    lowStockItemsCount,
    recentMovements: typedMovements.slice(0, 15),
    stockByCategory: Object.entries(stockByCategoryMap).map(
      ([category, data]) => ({
        category,
        count: data.count,
        value: Math.round(data.value * 100) / 100,
      })
    ),
    movementsSummary: {
      entries: entriesQty,
      exits: exitsQty,
    },
  };
}

// --- Public Product (no auth) ---
export interface PublicProductData {
  id: string;
  name: string;
  category: string | null;
  salePrice: number;
  imageUrl: string | null;
  sellerPhone: string | null;
  variants: {
    id: string;
    name: string;
    stock: number;
    price: number;
    imageUrl: string | null;
  }[];
}

// --- Client Flow (Leads / Kanban) ---
export async function createClientFlow(data: {
  productId: string;
  clientName: string;
  clientContact: string;
  description?: string;
}): Promise<ClientFlow> {
  return request<ClientFlow>("/client-flow", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function listClientFlows(): Promise<ClientFlow[]> {
  return request<ClientFlow[]>("/client-flow");
}

export async function updateClientFlowStatus(id: string, data: {
  currentStatus: ClientFlowStatus;
  description?: string;
  nextFollowUpAt?: string;
}): Promise<ClientFlow> {
  return request<ClientFlow>(`/client-flow/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function findClientFlowByContact(contact: string): Promise<ClientFlow | null> {
  try {
    return await request<ClientFlow | null>(`/client-flow/find-by-contact/${encodeURIComponent(contact)}`);
  } catch {
    return null;
  }
}

export async function trackClientFlow(token: string): Promise<void> {
  await fetch(`${API_BASE}/client-flow/track/${token}`, { method: "PUT" });
}

export async function getPublicProduct(productId: string): Promise<PublicProductData> {
  const response = await fetch(`${API_BASE}/products/${productId}/share`);
  const result = await response.json();

  if (!response.ok || result.ok === false) {
    const msg =
      typeof result.error === "string"
        ? result.error
        : result.error?.message || "Erro ao carregar produto.";
    throw new Error(msg);
  }

  return result.data as PublicProductData;
}
