import { checkEmpty, checkNumberEmpty } from "./common.js"
import { RegisterMovementUseCaseRequest, ListMovementsUseCaseRequest, GetDashboardDataUseCaseRequest } from "../ucio/Movement.js"
import { MOVEMENT_TYPES } from "../ucio/Movement.js"

class RegisterMovementValidate {
  async registerMovementValidate(req: RegisterMovementUseCaseRequest): Promise<string | null> {
    if (checkEmpty(req.variantId)) return "O ID da variação é obrigatório."
    if (checkEmpty(req.type)) return "O tipo (IN/OUT) é obrigatório."
    if (!MOVEMENT_TYPES.includes(req.type)) return "Tipo de movimentação inválido. Deve ser IN ou OUT."
    if (checkNumberEmpty(req.quantity) || req.quantity <= 0) return "A quantidade deve ser maior que zero."
    return null
  }
}

class ListMovementsValidate {
  async listMovementsValidate(req: ListMovementsUseCaseRequest): Promise<string | null> {
    if (checkEmpty(req.userId)) return "Usuário não autenticado."
    if (req.limit <= 0) return "O limite deve ser maior que zero."
    return null
  }
}

class GetDashboardDataValidate {
  async getDashboardDataValidate(req: GetDashboardDataUseCaseRequest): Promise<string | null> {
    if (checkEmpty(req.userId)) return "Usuário não autenticado."
    return null
  }
}

export {
  RegisterMovementValidate, ListMovementsValidate, GetDashboardDataValidate,
}
