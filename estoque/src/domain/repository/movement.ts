import { MovementAssociation } from "../association/association.js"
import type { RegisterMovementUseCaseRequest } from "../ucio/Movement.js"

export interface CreateMovementRepository {
  createMovement(data: RegisterMovementUseCaseRequest & { productId: string }): Promise<MovementAssociation>
}

export interface FindMovementsByUserIdRepository {
  findByUserId(userId: string, limit?: number): Promise<any[]>
}

export interface GetDashboardDataRepository {
  getDashboardData(userId: string, periodDays?: number): Promise<any>
}

export interface DeleteMovementsByProductIdRepository {
  deleteMovementsByProductId(productId: string): Promise<void>
}
