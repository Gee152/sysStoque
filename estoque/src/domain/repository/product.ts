import { ProductAssociation, ProductVariantAssociation } from "../association/association.js"
import { CreateVariantDTO } from "../ucio/ProductVariant.js"

export interface CreateProductRepository {
  createProduct(data: {
    userId: string
    name: string
    category?: string
    costPrice: number
    salePrice: number
    imageUrl?: string
  }): Promise<ProductAssociation>
}

export interface FindProductByIdRepository {
  findById(id: string): Promise<{ product: ProductAssociation; variants: ProductVariantAssociation[] } | null>
}

export interface FindProductsByUserIdRepository {
  findByUserId(userId: string): Promise<{ product: ProductAssociation; variants: ProductVariantAssociation[] }[]>
}

export interface UpdateProductRepository {
  update(id: string, data: {
    name?: string
    category?: string
    costPrice?: number
    salePrice?: number
    imageUrl?: string
  }): Promise<ProductAssociation>
}

export interface DeleteProductRepository {
  delete(id: string): Promise<void>
}

export interface CreateVariantRepository {
  createVariant(data: CreateVariantDTO): Promise<ProductVariantAssociation>
}

export interface FindVariantByIdRepository {
  findVariantById(id: string): Promise<ProductVariantAssociation | null>
}

export interface UpdateVariantStockRepository {
  updateVariantStock(variantId: string, newStock: number): Promise<void>
}

export interface DeleteVariantsByProductIdRepository {
  deleteVariantsByProductId(productId: string): Promise<void>
}
