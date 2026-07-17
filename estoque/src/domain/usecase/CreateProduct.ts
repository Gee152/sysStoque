import { CreateProductValidate } from "../validate/product.js"
import type { CreateProductRepository, CreateVariantRepository } from "../repository/product.js"
import { PreconditionError, InternalServerError, TAG_PRE_CONDITION_ERROR, TAG_INTERNAL_SERVER_ERROR } from "../association/error.js"
import { CreateProductUseCaseRequest, CreateProductUseCaseResponse } from "../ucio/Product.js"
import { ProductVariantAssociation } from "../association/association.js"

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

      const createdVariants: ProductVariantAssociation[] = []
      for (const variant of req.variants) {
        const v = await this.variantRepository.createVariant({
          productId: product.id,
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
          imageUrl: variant.imageUrl,
        })
        createdVariants.push(v)
      }

      return new CreateProductUseCaseResponse(product, createdVariants, null)
    } catch (error: any) {
      console.log(TAG_INTERNAL_SERVER_ERROR, error)
      return new CreateProductUseCaseResponse(null, [], new InternalServerError(error.message))
    }
  }
}
