import { UpdateProductValidate } from "../validate/product.js"
import type { FindProductByIdRepository, UpdateProductRepository, DeleteVariantsByProductIdRepository, CreateVariantRepository } from "../repository/product.js"
import { PreconditionError, InternalServerError, TAG_PRE_CONDITION_ERROR, TAG_INTERNAL_SERVER_ERROR } from "../association/error.js"
import { UpdateProductUseCaseRequest, UpdateProductUseCaseResponse } from "../ucio/Product.js"

export class UpdateProduct {
  constructor(
    private validate: UpdateProductValidate = new UpdateProductValidate(),
    private findRepository: FindProductByIdRepository,
    private updateRepository: UpdateProductRepository,
    private deleteVariantsRepository: DeleteVariantsByProductIdRepository,
    private createVariantRepository: CreateVariantRepository,
  ) {}

  async execute(req: UpdateProductUseCaseRequest): Promise<UpdateProductUseCaseResponse> {
    try {
      const error = await this.validate.updateProductValidate(req)
      if (error) {
        console.log(TAG_PRE_CONDITION_ERROR, error)
        return new UpdateProductUseCaseResponse(null, [], new PreconditionError(error))
      }

      const existing = await this.findRepository.findById(req.productId)
      if (!existing) {
        return new UpdateProductUseCaseResponse(null, [], new PreconditionError("Produto não encontrado."))
      }

      if (existing.product.userId !== req.userId) {
        return new UpdateProductUseCaseResponse(null, [], new PreconditionError("Você não tem permissão para alterar este produto."))
      }

      await this.updateRepository.update(req.productId, {
        name: req.name,
        category: req.category,
        costPrice: req.costPrice,
        salePrice: req.salePrice,
        imageUrl: req.imageUrl,
      })

      if (req.variants) {
        await this.deleteVariantsRepository.deleteVariantsByProductId(req.productId)

        for (const variant of req.variants) {
          await this.createVariantRepository.createVariant({
            productId: req.productId,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
            imageUrl: variant.imageUrl,
          })
        }
      }

      const updated = await this.findRepository.findById(req.productId)
      return new UpdateProductUseCaseResponse(updated?.product || null, updated?.variants || [], null)
    } catch (error: any) {
      console.log(TAG_INTERNAL_SERVER_ERROR, error)
      return new UpdateProductUseCaseResponse(null, [], new InternalServerError(error.message))
    }
  }
}
