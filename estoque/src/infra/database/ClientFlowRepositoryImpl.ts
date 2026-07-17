import { AppDataSource } from "./data-source.js"
import { ClientFlowEntity } from "./entities/ClientFlowEntity.js"
import { toClientFlowDomain } from "./transforme/clientFlow.transformer.js"
import { ClientFlowAssociation } from "../../domain/association/association.js"
import type { CreateClientFlowRepository, FindClientFlowByTokenRepository, FindClientFlowByIdRepository, UpdateClientFlowRepository, ListClientFlowsByUserIdRepository } from "../../domain/repository/clientFlow.js"

export class ClientFlowRepositoryImpl implements
  CreateClientFlowRepository,
  FindClientFlowByTokenRepository,
  FindClientFlowByIdRepository,
  UpdateClientFlowRepository,
  ListClientFlowsByUserIdRepository {

  async createClientFlow(data: {
    trackingToken: string
    productId: string
    clientName: string
    clientContact: string
    userId: string
    description?: string
  }): Promise<ClientFlowAssociation> {
    const repo = AppDataSource.getRepository(ClientFlowEntity)
    const entity = repo.create({
      trackingToken: data.trackingToken,
      productId: data.productId,
      clientName: data.clientName,
      clientContact: data.clientContact,
      userId: data.userId,
      description: data.description,
      currentStatus: "ENVIADO",
    })
    const saved = await repo.save(entity)
    return toClientFlowDomain(saved)
  }

  async findByToken(token: string): Promise<ClientFlowAssociation | null> {
    const repo = AppDataSource.getRepository(ClientFlowEntity)
    const entity = await repo.findOne({ where: { trackingToken: token } })
    return entity ? toClientFlowDomain(entity) : null
  }

  async findById(id: string): Promise<ClientFlowAssociation | null> {
    const repo = AppDataSource.getRepository(ClientFlowEntity)
    const entity = await repo.findOne({ where: { id } })
    return entity ? toClientFlowDomain(entity) : null
  }

  async updateClientFlow(id: string, data: {
    currentStatus?: string
    description?: string
    nextFollowUpAt?: Date | null
    updatedAt?: Date
  }): Promise<ClientFlowAssociation> {
    const repo = AppDataSource.getRepository(ClientFlowEntity)
    const updateData: any = { ...data }
    if (data.nextFollowUpAt === null) {
      updateData.nextFollowUpAt = null
    }
    await repo.update(id, updateData)
    const entity = await repo.findOne({ where: { id } })
    return toClientFlowDomain(entity!)
  }

  async findByUserId(userId: string): Promise<ClientFlowAssociation[]> {
    const repo = AppDataSource.getRepository(ClientFlowEntity)
    const entities = await repo.find({
      where: { userId },
      order: { createdAt: "DESC" },
    })
    return entities.map(toClientFlowDomain)
  }
}
