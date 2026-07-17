import { RegisterMovementValidate } from "../validate/movement.js"
import type { FindVariantByIdRepository, UpdateVariantStockRepository } from "../repository/product.js"
import type { CreateMovementRepository } from "../repository/movement.js"
import { PreconditionError, InternalServerError, TAG_PRE_CONDITION_ERROR, TAG_INTERNAL_SERVER_ERROR } from "../association/error.js"
import { RegisterMovementUseCaseRequest, RegisterMovementUseCaseResponse } from "../ucio/Movement.js"

export class RegisterMovement {
  constructor(
    private validate: RegisterMovementValidate = new RegisterMovementValidate(),
    private variantRepository: FindVariantByIdRepository,
    private movementRepository: CreateMovementRepository,
    private stockRepository: UpdateVariantStockRepository,
  ) {}

  async execute(req: RegisterMovementUseCaseRequest): Promise<RegisterMovementUseCaseResponse> {
    try {
      const error = await this.validate.registerMovementValidate(req)
      if (error) {
        console.log(TAG_PRE_CONDITION_ERROR, error)
        return new RegisterMovementUseCaseResponse(null, new PreconditionError(error))
      }

      const variant = await this.variantRepository.findVariantById(req.variantId)
      if (!variant) {
        return new RegisterMovementUseCaseResponse(null, new PreconditionError("Variação de produto não encontrada."))
      }

      if (req.type === "OUT" && variant.stock < req.quantity) {
        return new RegisterMovementUseCaseResponse(null, new PreconditionError(`Saldo insuficiente. Estoque atual: ${variant.stock}`))
      }

      const movement = await this.movementRepository.createMovement({
        userId: req.userId,
        variantId: req.variantId,
        productId: variant.productId,
        type: req.type,
        quantity: req.quantity,
        reason: req.reason,
      })

      const newStock = req.type === "IN"
        ? variant.stock + req.quantity
        : variant.stock - req.quantity
      await this.stockRepository.updateVariantStock(req.variantId, newStock)

      return new RegisterMovementUseCaseResponse(movement, null)
    } catch (error: any) {
      console.log(TAG_INTERNAL_SERVER_ERROR, error)
      return new RegisterMovementUseCaseResponse(null, new InternalServerError(error.message))
    }
  }
}
