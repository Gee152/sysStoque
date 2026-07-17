import { ClientFlowAssociation } from "../association/association.js"

export interface CreateClientFlowRepository {
  createClientFlow(data: {
    trackingToken: string
    productId: string
    clientName: string
    clientContact: string
    userId: string
    description?: string
  }): Promise<ClientFlowAssociation>
}

export interface FindClientFlowByTokenRepository {
  findByToken(token: string): Promise<ClientFlowAssociation | null>
}

export interface FindClientFlowByIdRepository {
  findById(id: string): Promise<ClientFlowAssociation | null>
}

export interface UpdateClientFlowRepository {
  updateClientFlow(id: string, data: {
    currentStatus?: string
    description?: string
    nextFollowUpAt?: Date | null
    updatedAt?: Date
  }): Promise<ClientFlowAssociation>
}

export interface ListClientFlowsByUserIdRepository {
  findByUserId(userId: string): Promise<ClientFlowAssociation[]>
}

export interface FindClientFlowByContactRepository {
  findByContact(contact: string, userId: string): Promise<ClientFlowAssociation | null>
}
