import { GetDashboardDataValidate } from "../validate/movement.js"
import type { GetDashboardDataRepository } from "../repository/movement.js"
import { PreconditionError, InternalServerError, TAG_PRE_CONDITION_ERROR, TAG_INTERNAL_SERVER_ERROR } from "../association/error.js"
import { GetDashboardDataUseCaseRequest, GetDashboardDataUseCaseResponse } from "../ucio/Movement.js"

export class GetDashboardData {
  constructor(
    private validate: GetDashboardDataValidate = new GetDashboardDataValidate(),
    private repository: GetDashboardDataRepository
  ) {}

  async execute(req: GetDashboardDataUseCaseRequest): Promise<GetDashboardDataUseCaseResponse> {
    try {
      const error = await this.validate.getDashboardDataValidate(req)
      if (error) {
        console.log(TAG_PRE_CONDITION_ERROR, error)
        return new GetDashboardDataUseCaseResponse(null, new PreconditionError(error))
      }

      const data = await this.repository.getDashboardData(req.userId)
      return new GetDashboardDataUseCaseResponse(data, null)
    } catch (error: any) {
      console.log(TAG_INTERNAL_SERVER_ERROR, error)
      return new GetDashboardDataUseCaseResponse(null, new InternalServerError(error.message))
    }
  }
}
