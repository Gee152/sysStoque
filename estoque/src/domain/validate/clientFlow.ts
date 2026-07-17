import { checkEmpty } from "./common.js"
import {
  CreateClientFlowUseCaseRequest,
  UpdateClientFlowStatusUseCaseRequest,
} from "../ucio/ClientFlow.js"

const E164_REGEX = /^\d{10,13}$/

class CreateClientFlowValidate {
  async validate(req: CreateClientFlowUseCaseRequest): Promise<string | null> {
    if (checkEmpty(req.clientName)) return "O nome do cliente é obrigatório."
    if (checkEmpty(req.clientContact)) return "O contato do cliente é obrigatório."
    if (!E164_REGEX.test(req.clientContact)) return "O contato deve estar no formato E.164 (11999999999)."
    if (checkEmpty(req.productId)) return "O ID do produto é obrigatório."
    if (!req.userId) return "Usuário não autenticado."
    return null
  }
}

class UpdateClientFlowStatusValidate {
  async validate(req: UpdateClientFlowStatusUseCaseRequest): Promise<string | null> {
    if (checkEmpty(req.flowId)) return "O ID do fluxo é obrigatório."
    if (checkEmpty(req.currentStatus)) return "O status é obrigatório."
    const validStatuses = ["ENVIADO", "NEGOCIANDO", "FECHADO", "NOTAS"]
    if (!validStatuses.includes(req.currentStatus)) return "Status inválido."

    if (req.currentStatus === "NOTAS") {
      if (checkEmpty(req.description)) return "Ao mover para NOTAS, a descrição da objeção é obrigatória."
      if (checkEmpty(req.nextFollowUpAt)) return "Ao mover para NOTAS, a data de retorno é obrigatória."
      const followUpDate = new Date(req.nextFollowUpAt!)
      const now = new Date()
      if (followUpDate <= now) return "A data de retorno não pode estar no passado."
    }
    return null
  }
}

export { CreateClientFlowValidate, UpdateClientFlowStatusValidate }
