import { checkEmpty, validateEmail } from "./common.js"
import { CreateUserUseCaseRequest, GetLoginUserUseCaseRequest } from "../ucio/User.js"

class CreateUserValidate {
  async createUserValidate(req: CreateUserUseCaseRequest): Promise<string | null> {
    if (checkEmpty(req.name)) return "O nome não pode ser vazio."
    if (checkEmpty(req.email)) return "O e-mail não pode ser vazio."
    if (!validateEmail(req.email)) return "Formato de e-mail inválido."
    if (checkEmpty(req.passwordHash)) return "A senha não pode ser vazia."
    if (req.passwordHash.length < 8) return "A senha deve ter no mínimo 8 caracteres."
    return null
  }
}

class GetLoginUserValidate {
  async getLoginUserValidate(req: GetLoginUserUseCaseRequest): Promise<string | null> {
    if (checkEmpty(req.email)) return "O e-mail não pode ser vazio."
    if (checkEmpty(req.passwordHash)) return "A senha não pode ser vazia."
    return null
  }
}

export {
  CreateUserValidate, GetLoginUserValidate,
}
