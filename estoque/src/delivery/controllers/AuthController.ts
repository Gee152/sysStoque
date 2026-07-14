import { RegisterUser } from "../../domain/usecase/RegisterUser.js"
import { AuthenticateUser } from "../../domain/usecase/AuthenticateUser.js"
import type { CreateUserRepository, GetLoginUserRepository } from "../../domain/repository/user.js"
import { CreateUserUseCaseRequest, GetLoginUserUseCaseRequest } from "../../domain/ucio/User.js"
import { SuccessResponse } from "../response/response.js"
import type { Request, Response } from "express"

export class AuthController {
  private readonly registerUseCase: RegisterUser
  private readonly loginUseCase: AuthenticateUser

  constructor(createRepository: CreateUserRepository & GetLoginUserRepository, loginRepository: GetLoginUserRepository) {
    this.registerUseCase = new RegisterUser(undefined, createRepository, createRepository)
    this.loginUseCase = new AuthenticateUser(undefined, loginRepository)
  }

  async register(req: Request, res: Response): Promise<void> {
    const { name, email, passwordHash } = req.body
    const ucReq = new CreateUserUseCaseRequest(name, email, passwordHash, req.body.phone)
    const ucRes = await this.registerUseCase.execute(ucReq)
    new SuccessResponse().success(res, ucRes)
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, passwordHash } = req.body
    const ucReq = new GetLoginUserUseCaseRequest(email, passwordHash)
    const ucRes = await this.loginUseCase.execute(ucReq)
    new SuccessResponse().success(res, ucRes)
  }
}
