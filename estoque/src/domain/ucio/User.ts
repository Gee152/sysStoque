import { UserAssociation } from "../association/association.js"
import { ErrorEntity } from "../association/error.js"

class CreateUserUseCaseRequest {
  public name: string
  public email: string
  public passwordHash: string
  public phone?: string

  constructor(name: string, email: string, passwordHash: string, phone?: string) {
    this.name = name
    this.email = email
    this.passwordHash = passwordHash
    this.phone = phone
  }
}

class CreateUserUseCaseResponse {
  public token: string | null
  public user: UserAssociation | null
  public error: ErrorEntity | null

  constructor(token: string | null, user: UserAssociation | null, error: ErrorEntity | null) {
    this.token = token
    this.user = user
    this.error = error
  }
}

class GetLoginUserUseCaseRequest {
  public email: string
  public passwordHash: string

  constructor(email: string, passwordHash: string) {
    this.email = email
    this.passwordHash = passwordHash
  }
}

class GetLoginUserUseCaseResponse {
  public token: string | null
  public user: UserAssociation | null
  public error: ErrorEntity | null

  constructor(token: string | null, user: UserAssociation | null, error: ErrorEntity | null) {
    this.token = token
    this.user = user
    this.error = error
  }
}

export {
  CreateUserUseCaseRequest, CreateUserUseCaseResponse,
  GetLoginUserUseCaseRequest, GetLoginUserUseCaseResponse,
}
