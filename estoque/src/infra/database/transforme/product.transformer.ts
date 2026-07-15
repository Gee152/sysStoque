import { ProductAssociation } from "../../../domain/association/association.js"
import { ProductEntity } from "../entities/ProductEntity.js"

export function toProductDomain(e: ProductEntity): ProductAssociation {
  return new ProductAssociation(
    e.productId,
    e.userId,
    e.name,
    e.category,
    e.costPrice,
    e.salePrice,
    e.imageUrl,
    e.createdAt,
    e.updatedAt
  )
}

export function toProductEntity(d: ProductAssociation): ProductEntity {
  const entity = new ProductEntity(
    d.id,
    d.userId,
    d.name,
    d.category || "",
    d.costPrice,
    d.salePrice,
    d.imageUrl || "",
    d.createdAt
  )
  return entity
}
