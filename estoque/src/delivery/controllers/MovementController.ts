import { RegisterMovement } from "../../domain/usecase/RegisterMovement.js"
import { ListMovements } from "../../domain/usecase/ListMovements.js"
import { GetDashboardData } from "../../domain/usecase/GetDashboardData.js"
import type { FindVariantByIdRepository, UpdateVariantStockRepository } from "../../domain/repository/product.js"
import type { CreateMovementRepository, FindMovementsByUserIdRepository, GetDashboardDataRepository } from "../../domain/repository/movement.js"
import { RegisterMovementUseCaseRequest, ListMovementsUseCaseRequest, GetDashboardDataUseCaseRequest, MOVEMENT_TYPES } from "../../domain/ucio/Movement.js"
import { SuccessResponse } from "../response/response.js"
import type { Request, Response } from "express"

export class MovementController {
  private readonly registerUseCase: RegisterMovement
  private readonly listUseCase: ListMovements
  private readonly dashboardUseCase: GetDashboardData

  constructor(
    variantRepo: FindVariantByIdRepository,
    movementRepo: CreateMovementRepository,
    listRepo: FindMovementsByUserIdRepository,
    dashboardRepo: GetDashboardDataRepository,
    stockRepo: UpdateVariantStockRepository,
  ) {
    this.registerUseCase = new RegisterMovement(undefined, variantRepo, movementRepo, stockRepo)
    this.listUseCase = new ListMovements(undefined, listRepo)
    this.dashboardUseCase = new GetDashboardData(undefined, dashboardRepo)
  }

  async create(req: Request, res: Response): Promise<void> {
    const { variantId, type, quantity, reason } = req.body
    const movType = type === "OUT" ? "OUT" : "IN"
    const ucReq = new RegisterMovementUseCaseRequest(req.userId || "", variantId, movType, Number(quantity), reason || "")
    const ucRes = await this.registerUseCase.execute(ucReq)
    new SuccessResponse().success(res, ucRes)
  }

  async list(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit ? Number(req.query.limit) : 50
    const ucReq = new ListMovementsUseCaseRequest(req.userId || "", limit)
    const ucRes = await this.listUseCase.execute(ucReq)
    new SuccessResponse().success(res, ucRes)
  }

  async dashboard(req: Request, res: Response): Promise<void> {
    const ucReq = new GetDashboardDataUseCaseRequest(req.userId || "")
    const ucRes = await this.dashboardUseCase.execute(ucReq)
    new SuccessResponse().success(res, ucRes)
  }
}
