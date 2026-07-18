import { ClientFlowAssociation } from "../../../domain/association/association.js";
import { ClientFlowEntity } from "../entities/ClientFlowEntity.js";

export function toClientFlowDomain(e: ClientFlowEntity): ClientFlowAssociation {
  return new ClientFlowAssociation(
    e.id,
    e.trackingToken,
    e.productId,
    e.clientName,
    e.clientContact,
    e.userId,
    e.description,
    e.currentStatus,
    e.nextFollowUpAt,
    e.createdAt,
    e.updatedAt,
    e.updates as Array<{ status: string; description: string; timestamp: string }> | undefined
  );
}

export function toClientFlowEntity(d: ClientFlowAssociation): ClientFlowEntity {
  return new ClientFlowEntity(
    d.id,
    d.trackingToken,
    d.productId,
    d.clientName,
    d.clientContact,
    d.userId,
    d.description,
    d.currentStatus,
    d.nextFollowUpAt,
    d.createdAt,
    d.updatedAt,
    d.updates
  );
}
