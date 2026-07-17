import { v4 as uuidv4 } from "uuid"
import { CreateClientFlowValidate } from "../validate/clientFlow.js"
import type { CreateClientFlowRepository } from "../repository/clientFlow.js"
import { PreconditionError, InternalServerError } from "../association/error.js"
import { CreateClientFlowUseCaseRequest, CreateClientFlowUseCaseResponse } from "../ucio/ClientFlow.js"

export class CreateClientFlow {
  constructor(
    private validate: CreateClientFlowValidate = new CreateClientFlowValidate(),
    private clientFlowRepository: CreateClientFlowRepository,
  ) {}

  async execute(req: CreateClientFlowUseCaseRequest): Promise<CreateClientFlowUseCaseResponse> {
    try {
      const error = await this.validate.validate(req)
      if (error) {
        return new CreateClientFlowUseCaseResponse(null, new PreconditionError(error))
      }

      const trackingToken = uuidv4()

      const flow = await this.clientFlowRepository.createClientFlow({
        trackingToken,
        productId: req.productId,
        clientName: req.clientName,
        clientContact: req.clientContact,
        userId: req.userId,
        description: req.description,
      })

      return new CreateClientFlowUseCaseResponse(flow, null)
    } catch (error: any) {
      return new CreateClientFlowUseCaseResponse(null, new InternalServerError(error.message))
    }
  }
}
