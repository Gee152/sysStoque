import { CreateClientFlow } from "../../domain/usecase/CreateClientFlow.js"
import { ListClientFlows } from "../../domain/usecase/ListClientFlows.js"
import { TrackClientFlow } from "../../domain/usecase/TrackClientFlow.js"
import { UpdateClientFlowStatus } from "../../domain/usecase/UpdateClientFlowStatus.js"
import type { CreateClientFlowRepository, FindClientFlowByTokenRepository, FindClientFlowByIdRepository, UpdateClientFlowRepository, ListClientFlowsByUserIdRepository, FindClientFlowByContactRepository } from "../../domain/repository/clientFlow.js"
import { CreateClientFlowUseCaseRequest, ListClientFlowsUseCaseRequest, TrackClientFlowUseCaseRequest, UpdateClientFlowStatusUseCaseRequest } from "../../domain/ucio/ClientFlow.js"
import { SuccessResponse } from "../response/response.js"
import type { Request, Response } from "express"

export class ClientFlowController {
  private readonly createUseCase: CreateClientFlow
  private readonly listUseCase: ListClientFlows
  private readonly trackUseCase: TrackClientFlow
  private readonly updateStatusUseCase: UpdateClientFlowStatus

  constructor(
    createRepo: CreateClientFlowRepository,
    listRepo: ListClientFlowsByUserIdRepository,
    findByTokenRepo: FindClientFlowByTokenRepository,
    findByIdRepo: FindClientFlowByIdRepository,
    updateRepo: UpdateClientFlowRepository,
    private findByContactRepo: FindClientFlowByContactRepository,
  ) {
    this.createUseCase = new CreateClientFlow(undefined, createRepo)
    this.listUseCase = new ListClientFlows(listRepo)
    this.trackUseCase = new TrackClientFlow(findByTokenRepo, updateRepo)
    this.updateStatusUseCase = new UpdateClientFlowStatus(undefined, findByIdRepo, updateRepo)
  }

  async create(req: Request, res: Response): Promise<void> {
    const { productId, clientName, clientContact, description } = req.body
    const ucReq = new CreateClientFlowUseCaseRequest(req.userId || "", productId, clientName, clientContact, description)
    const ucRes = await this.createUseCase.execute(ucReq)
    new SuccessResponse().success(res, ucRes)
  }

  async list(req: Request, res: Response): Promise<void> {
    const ucReq = new ListClientFlowsUseCaseRequest(req.userId || "")
    const ucRes = await this.listUseCase.execute(ucReq)
    new SuccessResponse().success(res, ucRes)
  }

  async track(req: Request, res: Response): Promise<void> {
    const token = req.params.token as string
    const ucReq = new TrackClientFlowUseCaseRequest(token)
    const ucRes = await this.trackUseCase.execute(ucReq)
    new SuccessResponse().success(res, ucRes)
  }

  async findByContact(req: Request, res: Response): Promise<void> {
    const contact = req.params.contact as string
    const flow = await this.findByContactRepo.findByContact(contact, req.userId || "")
    new SuccessResponse().success(res, { flow })
  }

  async updateStatus(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string
    const { currentStatus, description, nextFollowUpAt } = req.body
    const ucReq = new UpdateClientFlowStatusUseCaseRequest(id, currentStatus, description, nextFollowUpAt)
    const ucRes = await this.updateStatusUseCase.execute(ucReq)
    new SuccessResponse().success(res, ucRes)
  }
}
