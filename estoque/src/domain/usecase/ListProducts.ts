import { ListProductsValidate } from "../validate/product.js"
import type { FindProductsByUserIdRepository } from "../repository/product.js"
import { PreconditionError, InternalServerError, TAG_PRE_CONDITION_ERROR, TAG_INTERNAL_SERVER_ERROR } from "../association/error.js"
import { ListProductsUseCaseRequest, ListProductsUseCaseResponse } from "../ucio/Product.js"

export class ListProducts {
  constructor(
    private validate: ListProductsValidate = new ListProductsValidate(),
    private repository: FindProductsByUserIdRepository
  ) {}

  async execute(req: ListProductsUseCaseRequest): Promise<ListProductsUseCaseResponse> {
    try {
      const error = await this.validate.listProductsValidate(req)
      if (error) {
        console.log(TAG_PRE_CONDITION_ERROR, error)
        return new ListProductsUseCaseResponse([], [], new PreconditionError(error))
      }

      const results = await this.repository.findByUserId(req.userId)
      const products = results.map((r) => r.product)
      const variants = results.map((r) => r.variants)

      return new ListProductsUseCaseResponse(products, variants, null)
    } catch (error: any) {
      console.log(TAG_INTERNAL_SERVER_ERROR, error)
      return new ListProductsUseCaseResponse([], [], new InternalServerError(error.message))
    }
  }
}
