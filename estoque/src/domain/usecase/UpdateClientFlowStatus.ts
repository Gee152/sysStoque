import { UpdateClientFlowStatusValidate } from "../validate/clientFlow.js"
import type { FindClientFlowByIdRepository, UpdateClientFlowRepository } from "../repository/clientFlow.js"
import { PreconditionError, InternalServerError } from "../association/error.js"
import { UpdateClientFlowStatusUseCaseRequest, UpdateClientFlowStatusUseCaseResponse } from "../ucio/ClientFlow.js"

export class UpdateClientFlowStatus {
  constructor(
    private validate: UpdateClientFlowStatusValidate = new UpdateClientFlowStatusValidate(),
    private findRepo: FindClientFlowByIdRepository,
    private updateRepo: UpdateClientFlowRepository,
  ) {}

  async execute(req: UpdateClientFlowStatusUseCaseRequest): Promise<UpdateClientFlowStatusUseCaseResponse> {
    try {
      const error = await this.validate.validate(req)
      if (error) {
        return new UpdateClientFlowStatusUseCaseResponse(null, new PreconditionError(error))
      }

      const existing = await this.findRepo.findById(req.flowId)
      if (!existing) {
        return new UpdateClientFlowStatusUseCaseResponse(null, new PreconditionError("Registro não encontrado."))
      }

      const updates = [...existing.updates]
      if (req.description?.trim()) {
        updates.push({
          status: req.currentStatus,
          description: req.description,
          timestamp: new Date().toISOString(),
        })
      }

      const updateData: any = {
        currentStatus: req.currentStatus,
        description: req.description || existing.description,
        updates,
        updatedAt: new Date(),
      }

      if (req.currentStatus === "NOTAS") {
        updateData.nextFollowUpAt = req.nextFollowUpAt ? new Date(req.nextFollowUpAt) : null
      }

      const flow = await this.updateRepo.updateClientFlow(req.flowId, updateData)
      return new UpdateClientFlowStatusUseCaseResponse(flow, null)
    } catch (error: any) {
      return new UpdateClientFlowStatusUseCaseResponse(null, new InternalServerError(error.message))
    }
  }
}
