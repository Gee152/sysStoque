import { MovementAssociation } from "../association/association.js"
import { ErrorEntity } from "../association/error.js"

export const MOVEMENT_TYPES = ['IN', 'OUT'] as const
export type MovementType = (typeof MOVEMENT_TYPES)[number]

class RegisterMovementUseCaseRequest {
  public userId: string
  public variantId: string
  public type: MovementType
  public quantity: number
  public reason: string

  constructor(userId: string, variantId: string, type: MovementType, quantity: number, reason: string = "") {
    this.userId = userId
    this.variantId = variantId
    this.type = type
    this.quantity = quantity
    this.reason = reason
  }
}

class RegisterMovementUseCaseResponse {
  public movement: MovementAssociation | null
  public error: ErrorEntity | null

  constructor(movement: MovementAssociation | null, error: ErrorEntity | null) {
    this.movement = movement
    this.error = error
  }
}

class ListMovementsUseCaseRequest {
  public userId: string
  public limit: number

  constructor(userId: string, limit: number = 50) {
    this.userId = userId
    this.limit = limit
  }
}

class ListMovementsUseCaseResponse {
  public movements: any[]
  public error: ErrorEntity | null

  constructor(movements: any[], error: ErrorEntity | null) {
    this.movements = movements
    this.error = error
  }
}

class GetDashboardDataUseCaseRequest {
  public userId: string

  constructor(userId: string) {
    this.userId = userId
  }
}

class GetDashboardDataUseCaseResponse {
  public data: any
  public error: ErrorEntity | null

  constructor(data: any, error: ErrorEntity | null) {
    this.data = data
    this.error = error
  }
}

export {
  RegisterMovementUseCaseRequest, RegisterMovementUseCaseResponse,
  ListMovementsUseCaseRequest, ListMovementsUseCaseResponse,
  GetDashboardDataUseCaseRequest, GetDashboardDataUseCaseResponse,
}
