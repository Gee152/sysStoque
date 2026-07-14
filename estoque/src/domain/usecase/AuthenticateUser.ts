import { GetLoginUserValidate } from "../validate/user.js"
import type { GetLoginUserRepository } from "../repository/user.js"
import { PreconditionError, InternalServerError, TAG_PRE_CONDITION_ERROR, TAG_INTERNAL_SERVER_ERROR } from "../association/error.js"
import bcrypt from "bcryptjs"
import { JwtService } from "../../infra/auth/JwtService.js"
import { GetLoginUserUseCaseRequest, GetLoginUserUseCaseResponse } from "../ucio/User.js"

export class AuthenticateUser {
  constructor(
    private validate: GetLoginUserValidate = new GetLoginUserValidate(),
    private repository: GetLoginUserRepository
  ) {}

  async execute(req: GetLoginUserUseCaseRequest): Promise<GetLoginUserUseCaseResponse> {
    try {
      const error = await this.validate.getLoginUserValidate(req)
      if (error) {
        console.log(TAG_PRE_CONDITION_ERROR, error)
        return new GetLoginUserUseCaseResponse(null, null, new PreconditionError(error))
      }

      const user = await this.repository.getLoginUser(req.email.toLowerCase())
      if (!user || !(await bcrypt.compare(req.passwordHash, user.passwordHash))) {
        return new GetLoginUserUseCaseResponse(null, null, new PreconditionError("Usuário não cadastrado ou senha inválida"))
      }

      const token = JwtService.sign({ userID: user.userID })

      return new GetLoginUserUseCaseResponse(token, user, null)
    } catch (error: any) {
      console.log(TAG_INTERNAL_SERVER_ERROR, error)
      return new GetLoginUserUseCaseResponse(null, null, new InternalServerError(error.message))
    }
  }
}
