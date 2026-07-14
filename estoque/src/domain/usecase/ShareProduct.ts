import { ShareProductValidate } from "../validate/product.js"
import type { FindProductByIdRepository } from "../repository/product.js"
import type { FindUserByIdRepository } from "../repository/user.js"
import { PreconditionError, InternalServerError, TAG_PRE_CONDITION_ERROR, TAG_INTERNAL_SERVER_ERROR } from "../association/error.js"
import { ShareProductUseCaseRequest, ShareProductUseCaseResponse } from "../ucio/Product.js"

export class ShareProduct {
  constructor(
    private validate: ShareProductValidate = new ShareProductValidate(),
    private productRepository: FindProductByIdRepository,
    private userRepository: FindUserByIdRepository
  ) {}

  async execute(req: ShareProductUseCaseRequest): Promise<ShareProductUseCaseResponse> {
    try {
      const error = await this.validate.shareProductValidate(req)
      if (error) {
        console.log(TAG_PRE_CONDITION_ERROR, error)
        return new ShareProductUseCaseResponse(null, new PreconditionError(error))
      }

      const result = await this.productRepository.findById(req.productId)
      if (!result) {
        return new ShareProductUseCaseResponse(null, new PreconditionError("Produto não encontrado."))
      }

      let sellerPhone: string | null = null
      const user = await this.userRepository.findById(result.product.userId)
      if (user) sellerPhone = user.phone

      const data = {
        id: result.product.id,
        name: result.product.name,
        category: result.product.category,
        salePrice: result.product.salePrice,
        imageUrl: result.product.imageUrl,
        sellerPhone,
        variants: result.variants.map((v) => ({
          id: v.id,
          name: v.color && v.color !== "default" ? `${v.size} / ${v.color}` : v.size,
          stock: v.stock,
          price: result.product.salePrice,
          imageUrl: v.imageUrl,
        })),
      }

      return new ShareProductUseCaseResponse(data, null)
    } catch (error: any) {
      console.log(TAG_INTERNAL_SERVER_ERROR, error)
      return new ShareProductUseCaseResponse(null, new InternalServerError(error.message))
    }
  }
}
