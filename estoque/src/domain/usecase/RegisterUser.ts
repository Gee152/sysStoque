import { CreateUserValidate } from "../validate/user.js"
import type { CreateUserRepository, GetLoginUserRepository } from "../repository/user.js"
import { PreconditionError, InternalServerError, TAG_PRE_CONDITION_ERROR, TAG_INTERNAL_SERVER_ERROR } from "../association/error.js"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { JwtService } from "../../infra/auth/JwtService.js"
import { CreateUserUseCaseRequest, CreateUserUseCaseResponse } from "../ucio/User.js"

export class RegisterUser {
  constructor(
    private validate: CreateUserValidate = new CreateUserValidate(),
    private createRepository: CreateUserRepository,
    private checkRepository: GetLoginUserRepository
  ) {}

  async execute(req: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    try {
      const error = await this.validate.createUserValidate(req)
      if (error) {
        console.log(TAG_PRE_CONDITION_ERROR, error)
        return new CreateUserUseCaseResponse(null, null, new PreconditionError(error))
      }

      const existing = await this.checkRepository.getLoginUser(req.email.toLowerCase())
      if (existing) {
        return new CreateUserUseCaseResponse(null, null, new PreconditionError("Este e-mail já está cadastrado."))
      }

      const hashedPassword = await bcrypt.hash(req.passwordHash, 10)
      const user = await this.createRepository.createUser({
        userID: uuidv4(),
        name: req.name,
        email: req.email.toLowerCase(),
        passwordHash: hashedPassword,
        phone: req.phone || null,
        createdAt: new Date(),
      })

      const token = JwtService.sign({ userID: user.userID })

      return new CreateUserUseCaseResponse(token, user, null)
    } catch (error: any) {
      console.log(TAG_INTERNAL_SERVER_ERROR, error)
      return new CreateUserUseCaseResponse(null, null, new InternalServerError(error.message))
    }
  }
}
