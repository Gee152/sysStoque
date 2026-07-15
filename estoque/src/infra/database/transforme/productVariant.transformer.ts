import { ProductVariantAssociation } from "../../../domain/association/association.js"
import { ProductVariantEntity } from "../entities/ProductVariantEntity.js"

export function toProductVariantDomain(e: ProductVariantEntity): ProductVariantAssociation {
  return new ProductVariantAssociation(
    e.variantId,
    e.productId,
    e.size,
    e.color,
    e.stock,
    e.imageUrl,
    e.createdAt,
    e.updatedAt
  )
}

export function toProductVariantEntity(d: ProductVariantAssociation): ProductVariantEntity {
  const entity = new ProductVariantEntity(
    d.id,
    d.productId,
    null as any,
    d.size,
    d.color,
    d.stock,
    d.imageUrl,
    d.createdAt
  )
  return entity
}
