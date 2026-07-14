import { ListMovementsValidate } from "../validate/movement.js"
import type { FindMovementsByUserIdRepository } from "../repository/movement.js"
import { PreconditionError, InternalServerError, TAG_PRE_CONDITION_ERROR, TAG_INTERNAL_SERVER_ERROR } from "../association/error.js"
import { ListMovementsUseCaseRequest, ListMovementsUseCaseResponse } from "../ucio/Movement.js"

export class ListMovements {
  constructor(
    private validate: ListMovementsValidate = new ListMovementsValidate(),
    private repository: FindMovementsByUserIdRepository
  ) {}

  async execute(req: ListMovementsUseCaseRequest): Promise<ListMovementsUseCaseResponse> {
    try {
      const error = await this.validate.listMovementsValidate(req)
      if (error) {
        console.log(TAG_PRE_CONDITION_ERROR, error)
        return new ListMovementsUseCaseResponse([], new PreconditionError(error))
      }

      const movements = await this.repository.findByUserId(req.userId, req.limit)
      return new ListMovementsUseCaseResponse(movements, null)
    } catch (error: any) {
      console.log(TAG_INTERNAL_SERVER_ERROR, error)
      return new ListMovementsUseCaseResponse([], new InternalServerError(error.message))
    }
  }
}
