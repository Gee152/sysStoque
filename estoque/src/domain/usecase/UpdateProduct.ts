import { UpdateProductValidate } from "../validate/product.js"
import type { FindProductByIdRepository, UpdateProductRepository } from "../repository/product.js"
import { PreconditionError, InternalServerError, TAG_PRE_CONDITION_ERROR, TAG_INTERNAL_SERVER_ERROR } from "../association/error.js"
import { UpdateProductUseCaseRequest, UpdateProductUseCaseResponse } from "../ucio/Product.js"

export class UpdateProduct {
  constructor(
    private validate: UpdateProductValidate = new UpdateProductValidate(),
    private findRepository: FindProductByIdRepository,
    private updateRepository: UpdateProductRepository
  ) {}

  async execute(req: UpdateProductUseCaseRequest): Promise<UpdateProductUseCaseResponse> {
    try {
      const error = await this.validate.updateProductValidate(req)
      if (error) {
        console.log(TAG_PRE_CONDITION_ERROR, error)
        return new UpdateProductUseCaseResponse(new PreconditionError(error))
      }

      const existing = await this.findRepository.findById(req.productId)
      if (!existing) {
        return new UpdateProductUseCaseResponse(new PreconditionError("Produto não encontrado."))
      }

      if (existing.product.userId !== req.userId) {
        return new UpdateProductUseCaseResponse(new PreconditionError("Você não tem permissão para alterar este produto."))
      }

      await this.updateRepository.update(req.productId, {
        name: req.name,
        category: req.category,
        costPrice: req.costPrice,
        salePrice: req.salePrice,
        imageUrl: req.imageUrl,
      })

      return new UpdateProductUseCaseResponse(null)
    } catch (error: any) {
      console.log(TAG_INTERNAL_SERVER_ERROR, error)
      return new UpdateProductUseCaseResponse(new InternalServerError(error.message))
    }
  }
}
