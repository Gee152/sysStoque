import { UserAssociation } from "../../../domain/association/association.js"
import { UserEntity } from "../entities/UserEntity.js"

export function toUserDomain(e: UserEntity): UserAssociation {
  return new UserAssociation(
    e.userID,
    e.email,
    e.passwordHash,
    e.name,
    e.phone,
    e.onboardingDone,
    e.createdAt,
    e.updatedAt
  )
}

export function toUserEntity(d: UserAssociation): UserEntity {
  return new UserEntity(
    d.userID,
    d.email,
    d.passwordHash,
    d.name,
    d.phone,
    d.createdAt,
    d.onboardingDone
  )
}
