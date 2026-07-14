import { UserAssociation } from "../../domain/association/association.js"
import { toUserDomain } from "./transforme/user.transformer.js"
import { AppDataSource } from "./data-source.js"
import { UserEntity } from "./entities/UserEntity.js"
import type { CreateUserRepository, GetLoginUserRepository, FindUserByIdRepository } from "../../domain/repository/user.js"

export class UserRepositoryImpl implements CreateUserRepository, GetLoginUserRepository, FindUserByIdRepository {
  async createUser(data: { userID: string; name: string; email: string; passwordHash: string; phone?: string | null; createdAt: Date }): Promise<UserAssociation> {
    const repository = AppDataSource.getRepository(UserEntity)
    const user = repository.create({
      userID: data.userID,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      phone: data.phone || null,
      createdAt: data.createdAt,
    })
    const saved = await repository.save(user)
    return toUserDomain(saved)
  }

  async getLoginUser(email: string): Promise<UserAssociation | null> {
    const repository = AppDataSource.getRepository(UserEntity)
    const user = await repository.findOneBy({ email })
    return user ? toUserDomain(user) : null
  }

  async findById(userID: string): Promise<UserAssociation | null> {
    const repository = AppDataSource.getRepository(UserEntity)
    const user = await repository.findOneBy({ userID })
    return user ? toUserDomain(user) : null
  }

  async updateUser(data: { userID: string; name: string; email: string; passwordHash: string; phone?: string | null }): Promise<void> {
    const repository = AppDataSource.getRepository(UserEntity)
    const user = await repository.findOneByOrFail({ userID: data.userID })
    user.name = data.name
    user.email = data.email
    user.passwordHash = data.passwordHash
    if (data.phone !== undefined) user.phone = data.phone
    await repository.save(user)
  }

  async deleteUserRepository(userID: string): Promise<void> {
    const repository = AppDataSource.getRepository(UserEntity)
    await repository.delete({ userID })
  }
}
