/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

export type MovementType = 'IN' | 'OUT';

export interface Movement {
  id: string;
  variantId: string;
  productId: string;
  type: MovementType;
  quantity: number;
  reason?: string; // e.g., "Compra", "Venda", "Ajuste de inventário"
  userId: string;
  userName: string;
  date: string;
  // Included for rich UI logs
  productName: string;
  variantName: string;
}

export type ClientFlowStatus = "ENVIADO" | "NEGOCIANDO" | "NOTAS" | "FECHADO";

export interface ClientFlow {
  id: string;
  trackingToken: string;
  productId: string;
  clientName: string;
  clientContact: string;
  description?: string;
  currentStatus: ClientFlowStatus;
  nextFollowUpAt?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalVariants: number;
  totalStockValue: number;
  totalItemsInStock: number;
  lowStockItemsCount: number;
  recentMovements: Movement[];
  stockByCategory: { category: string; count: number; value: number }[];
  movementsSummary: {
    entries: number;
    exits: number;
  };
}
