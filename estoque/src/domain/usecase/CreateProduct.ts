import { CreateProductValidate } from "../validate/product.js"
import type { CreateProductRepository, CreateVariantRepository } from "../repository/product.js"
import { PreconditionError, InternalServerError, TAG_PRE_CONDITION_ERROR, TAG_INTERNAL_SERVER_ERROR } from "../association/error.js"
import { CreateProductUseCaseRequest, CreateProductUseCaseResponse } from "../ucio/Product.js"

export class CreateProduct {
  constructor(
    private validate: CreateProductValidate = new CreateProductValidate(),
    private productRepository: CreateProductRepository,
    private variantRepository: CreateVariantRepository
  ) {}

  async execute(req: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
    try {
      const error = await this.validate.createProductValidate(req)
      if (error) {
        console.log(TAG_PRE_CONDITION_ERROR, error)
        return new CreateProductUseCaseResponse(null, [], new PreconditionError(error))
      }

      const product = await this.productRepository.createProduct({
        userId: req.userId,
        name: req.name,
        category: req.category,
        costPrice: req.costPrice,
        salePrice: req.salePrice,
        imageUrl: req.imageUrl,
      })

      return new CreateProductUseCaseResponse(product, [], null)
    } catch (error: any) {
      console.log(TAG_INTERNAL_SERVER_ERROR, error)
      return new CreateProductUseCaseResponse(null, [], new InternalServerError(error.message))
    }
  }
}
