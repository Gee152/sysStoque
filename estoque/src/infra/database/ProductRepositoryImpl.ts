import { ProductAssociation, ProductVariantAssociation } from "../../domain/association/association.js"
import { toProductDomain } from "./transforme/product.transformer.js"
import { toProductVariantDomain } from "./transforme/productVariant.transformer.js"
import { AppDataSource } from "./data-source.js"
import { ProductEntity } from "./entities/ProductEntity.js"
import { ProductVariantEntity } from "./entities/ProductVariantEntity.js"
import { CreateVariantDTO } from "../../domain/ucio/ProductVariant.js"
import type { CreateProductRepository, FindProductByIdRepository, FindProductsByUserIdRepository, UpdateProductRepository, DeleteProductRepository, CreateVariantRepository, FindVariantByIdRepository, UpdateVariantStockRepository, DeleteVariantsByProductIdRepository } from "../../domain/repository/product.js"

export class ProductRepositoryImpl implements CreateProductRepository, FindProductByIdRepository, FindProductsByUserIdRepository, UpdateProductRepository, DeleteProductRepository, CreateVariantRepository, FindVariantByIdRepository, UpdateVariantStockRepository, DeleteVariantsByProductIdRepository {
  async createProduct(data: { userId: string; name: string; category?: string; costPrice: number; salePrice: number; imageUrl?: string }): Promise<ProductAssociation> {
    const repository = AppDataSource.getRepository(ProductEntity)
    const entity = repository.create(data)
    const saved = await repository.save(entity)
    return toProductDomain(saved)
  }

  async findById(id: string): Promise<{ product: ProductAssociation; variants: ProductVariantAssociation[] } | null> {
    const repository = AppDataSource.getRepository(ProductEntity)
    const product = await repository.findOne({ where: { productId: id }, relations: ["variants"] })
    if (!product) return null
    return {
      product: toProductDomain(product),
      variants: product.variants.map((v) => toProductVariantDomain(v)),
    }
  }

  async findByUserId(userId: string): Promise<{ product: ProductAssociation; variants: ProductVariantAssociation[] }[]> {
    const repository = AppDataSource.getRepository(ProductEntity)
    const products = await repository.find({ where: { userId }, relations: ["variants"], order: { createdAt: "DESC" } })
    return products.map((p) => ({
      product: toProductDomain(p),
      variants: p.variants.map((v) => toProductVariantDomain(v)),
    }))
  }

  async update(id: string, data: { name?: string; category?: string; costPrice?: number; salePrice?: number; imageUrl?: string }): Promise<ProductAssociation> {
    const repository = AppDataSource.getRepository(ProductEntity)
    await repository.update({ productId: id }, data)
    const updated = await repository.findOneByOrFail({ productId: id })
    return toProductDomain(updated)
  }

  async delete(id: string): Promise<void> {
    const repository = AppDataSource.getRepository(ProductEntity)
    await repository.delete(id)
  }

  async createVariant(data: CreateVariantDTO): Promise<ProductVariantAssociation> {
    const repository = AppDataSource.getRepository(ProductVariantEntity)
    const variant = repository.create(data)
    const saved = await repository.save(variant)
    return toProductVariantDomain(saved)
  }

  async findVariantById(id: string): Promise<ProductVariantAssociation | null> {
    const repository = AppDataSource.getRepository(ProductVariantEntity)
    const variant = await repository.findOneBy({ variantId: id })
    return variant ? toProductVariantDomain(variant) : null
  }

  async updateVariantStock(variantId: string, newStock: number): Promise<void> {
    const repository = AppDataSource.getRepository(ProductVariantEntity)
    await repository.update(variantId, { stock: newStock })
  }

  async deleteVariantsByProductId(productId: string): Promise<void> {
    const repository = AppDataSource.getRepository(ProductVariantEntity)
    await repository.delete({ productId })
  }
}
