import type { FindClientFlowByTokenRepository, UpdateClientFlowRepository } from "../repository/clientFlow.js"
import { PreconditionError, InternalServerError } from "../association/error.js"
import { TrackClientFlowUseCaseRequest, TrackClientFlowUseCaseResponse } from "../ucio/ClientFlow.js"

export class TrackClientFlow {
  constructor(
    private findRepo: FindClientFlowByTokenRepository,
    private updateRepo: UpdateClientFlowRepository,
  ) {}

  async execute(req: TrackClientFlowUseCaseRequest): Promise<TrackClientFlowUseCaseResponse> {
    try {
      if (!req.trackingToken) {
        return new TrackClientFlowUseCaseResponse(false, new PreconditionError("Token de rastreamento inválido."))
      }

      const flow = await this.findRepo.findByToken(req.trackingToken)
      if (!flow) {
        return new TrackClientFlowUseCaseResponse(false, new PreconditionError("Registro não encontrado."))
      }

      // RN-003: Only update if current status is ENVIADO
      if (flow.currentStatus === "ENVIADO") {
        await this.updateRepo.updateClientFlow(flow.id, {
          currentStatus: "NEGOCIANDO",
          updatedAt: new Date(),
        })
      }

      return new TrackClientFlowUseCaseResponse(true, null)
    } catch (error: any) {
      return new TrackClientFlowUseCaseResponse(false, new InternalServerError(error.message))
    }
  }
}
