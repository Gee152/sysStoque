import { UserAssociation } from "../association/association.js"

export interface CreateUserRepository {
  createUser(data: {
    userID: string
    name: string
    email: string
    passwordHash: string
    phone?: string | null
    createdAt: Date
  }): Promise<UserAssociation>
}

export interface GetLoginUserRepository {
  getLoginUser(email: string): Promise<UserAssociation | null>
}

export interface FindUserByIdRepository {
  findById(userID: string): Promise<UserAssociation | null>
}

export interface UpdateUserOnboardingRepository {
  markOnboardingDone(userID: string): Promise<void>
}
