import type { ListClientFlowsByUserIdRepository } from "../repository/clientFlow.js"
import { InternalServerError } from "../association/error.js"
import { ListClientFlowsUseCaseRequest, ListClientFlowsUseCaseResponse } from "../ucio/ClientFlow.js"

export class ListClientFlows {
  constructor(
    private clientFlowRepository: ListClientFlowsByUserIdRepository,
  ) {}

  async execute(req: ListClientFlowsUseCaseRequest): Promise<ListClientFlowsUseCaseResponse> {
    try {
      if (!req.userId) {
        return new ListClientFlowsUseCaseResponse([], new InternalServerError("Usuário não autenticado."))
      }

      const flows = await this.clientFlowRepository.findByUserId(req.userId)
      return new ListClientFlowsUseCaseResponse(flows, null)
    } catch (error: any) {
      return new ListClientFlowsUseCaseResponse([], new InternalServerError(error.message))
    }
  }
}
