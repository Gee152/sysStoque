import { MovementAssociation } from "../../../domain/association/association.js"
import { MovementEntity } from "../entities/MovementEntity.js"

export function toMovementDomain(e: MovementEntity): MovementAssociation {
  return new MovementAssociation(
    e.movementId,
    e.variantId,
    e.productId,
    e.userId,
    e.type,
    e.quantity,
    e.reason || "",
    e.createdAt
  )
}

export function toMovementEntity(d: MovementAssociation): MovementEntity {
  const entity = new MovementEntity(
    d.id,
    d.variantId,
    null as any,
    d.productId,
    null as any,
    d.userId,
    null as any,
    d.type,
    d.quantity,
    d.reason,
    d.createdAt
  )
  return entity
}
