import { DeleteProductValidate } from "../validate/product.js"
import type { FindProductByIdRepository, DeleteProductRepository, DeleteVariantsByProductIdRepository } from "../repository/product.js"
import type { DeleteMovementsByProductIdRepository } from "../repository/movement.js"
import { PreconditionError, InternalServerError, TAG_PRE_CONDITION_ERROR, TAG_INTERNAL_SERVER_ERROR } from "../association/error.js"
import { DeleteProductUseCaseRequest, DeleteProductUseCaseResponse } from "../ucio/Product.js"

export class DeleteProduct {
  constructor(
    private validate: DeleteProductValidate = new DeleteProductValidate(),
    private findRepository: FindProductByIdRepository,
    private deleteRepository: DeleteProductRepository,
    private deleteVariantsRepository: DeleteVariantsByProductIdRepository,
    private deleteMovementsRepository: DeleteMovementsByProductIdRepository,
  ) {}

  async execute(req: DeleteProductUseCaseRequest): Promise<DeleteProductUseCaseResponse> {
    try {
      const error = await this.validate.deleteProductValidate(req)
      if (error) {
        console.log(TAG_PRE_CONDITION_ERROR, error)
        return new DeleteProductUseCaseResponse(null, new PreconditionError(error))
      }

      const existing = await this.findRepository.findById(req.productId)
      if (!existing) {
        return new DeleteProductUseCaseResponse(null, new PreconditionError("Produto não encontrado."))
      }

      if (existing.product.userId !== req.userId) {
        return new DeleteProductUseCaseResponse(null, new PreconditionError("Você não tem permissão para deletar este produto."))
      }

      await this.deleteMovementsRepository.deleteMovementsByProductId(req.productId)
      await this.deleteVariantsRepository.deleteVariantsByProductId(req.productId)
      await this.deleteRepository.delete(req.productId)

      return new DeleteProductUseCaseResponse(req.productId, null)
    } catch (error: any) {
      console.log(TAG_INTERNAL_SERVER_ERROR, error)
      return new DeleteProductUseCaseResponse(null, new InternalServerError(error.message))
    }
  }
}
