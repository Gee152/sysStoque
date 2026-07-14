import { checkEmpty, checkNumberEmpty } from "./common.js"
import { CreateProductUseCaseRequest, UpdateProductUseCaseRequest, DeleteProductUseCaseRequest, ListProductsUseCaseRequest, ShareProductUseCaseRequest } from "../ucio/Product.js"

class CreateProductValidate {
  async createProductValidate(req: CreateProductUseCaseRequest): Promise<string | null> {
    if (checkEmpty(req.name)) return "O nome do produto é obrigatório."
    if (!req.userId) return "Usuário não autenticado."
    if (checkNumberEmpty(req.costPrice)) return "O preço de custo é obrigatório."
    if (checkNumberEmpty(req.salePrice)) return "O preço de venda é obrigatório."
    if (req.costPrice < 0) return "O preço de custo não pode ser negativo."
    if (req.salePrice < 0) return "O preço de venda não pode ser negativo."
    return null
  }
}

class ListProductsValidate {
  async listProductsValidate(req: ListProductsUseCaseRequest): Promise<string | null> {
    if (checkEmpty(req.userId)) return "Usuário não autenticado."
    return null
  }
}

class UpdateProductValidate {
  async updateProductValidate(req: UpdateProductUseCaseRequest): Promise<string | null> {
    if (checkEmpty(req.productId)) return "O ID do produto é obrigatório."
    if (req.costPrice !== undefined && req.costPrice < 0) return "O preço de custo não pode ser negativo."
    if (req.salePrice !== undefined && req.salePrice < 0) return "O preço de venda não pode ser negativo."
    return null
  }
}

class DeleteProductValidate {
  async deleteProductValidate(req: DeleteProductUseCaseRequest): Promise<string | null> {
    if (checkEmpty(req.productId)) return "O ID do produto é obrigatório."
    return null
  }
}

class ShareProductValidate {
  async shareProductValidate(req: ShareProductUseCaseRequest): Promise<string | null> {
    if (checkEmpty(req.productId)) return "O ID do produto é obrigatório."
    return null
  }
}

export {
  CreateProductValidate, ListProductsValidate, UpdateProductValidate, DeleteProductValidate,
  ShareProductValidate,
}
