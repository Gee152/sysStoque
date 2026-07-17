import { CreateProduct } from "../../domain/usecase/CreateProduct.js"
import { ListProducts } from "../../domain/usecase/ListProducts.js"
import { UpdateProduct } from "../../domain/usecase/UpdateProduct.js"
import { DeleteProduct } from "../../domain/usecase/DeleteProduct.js"
import { ShareProduct } from "../../domain/usecase/ShareProduct.js"
import type { CreateProductRepository, FindProductByIdRepository, FindProductsByUserIdRepository, UpdateProductRepository, DeleteProductRepository, CreateVariantRepository, DeleteVariantsByProductIdRepository } from "../../domain/repository/product.js"
import type { CreateMovementRepository } from "../../domain/repository/movement.js"
import type { FindUserByIdRepository } from "../../domain/repository/user.js"
import { CreateProductUseCaseRequest, ListProductsUseCaseRequest, UpdateProductUseCaseRequest, DeleteProductUseCaseRequest, ShareProductUseCaseRequest } from "../../domain/ucio/Product.js"
import { SuccessResponse } from "../response/response.js"
import type { Request, Response } from "express"

export class ProductController {
  private readonly createUseCase: CreateProduct
  private readonly listUseCase: ListProducts
  private readonly updateUseCase: UpdateProduct
  private readonly deleteUseCase: DeleteProduct
  private readonly shareUseCase: ShareProduct

  constructor(
    createRepo: CreateProductRepository,
    createVariantRepo: CreateVariantRepository,
    findRepo: FindProductByIdRepository,
    listRepo: FindProductsByUserIdRepository,
    updateRepo: UpdateProductRepository,
    deleteRepo: DeleteProductRepository,
    deleteVariantsRepo: DeleteVariantsByProductIdRepository,
    userRepo: FindUserByIdRepository,
    movementRepo: CreateMovementRepository,
  ) {
    this.createUseCase = new CreateProduct(undefined, createRepo, createVariantRepo, movementRepo)
    this.listUseCase = new ListProducts(undefined, listRepo)
    this.updateUseCase = new UpdateProduct(undefined, findRepo, updateRepo, deleteVariantsRepo, createVariantRepo)
    this.deleteUseCase = new DeleteProduct(undefined, findRepo, deleteRepo, deleteVariantsRepo)
    this.shareUseCase = new ShareProduct(undefined, findRepo, userRepo)
  }

  async create(req: Request, res: Response): Promise<void> {
    const { name, category, costPrice, salePrice, imageUrl, variants } = req.body
    const ucReq = new CreateProductUseCaseRequest(req.userId || "", name, costPrice, salePrice, category, imageUrl, variants || [])
    const ucRes = await this.createUseCase.execute(ucReq)
    new SuccessResponse().success(res, ucRes)
  }

  async list(req: Request, res: Response): Promise<void> {
    const ucReq = new ListProductsUseCaseRequest(req.userId || "")
    const ucRes = await this.listUseCase.execute(ucReq)
    new SuccessResponse().success(res, ucRes)
  }

  async update(req: Request, res: Response): Promise<void> {
    const { name, category, costPrice, salePrice, imageUrl, variants } = req.body
    const ucReq = new UpdateProductUseCaseRequest(req.userId || "", req.params.id as string, name, category, costPrice, salePrice, imageUrl, variants)
    const ucRes = await this.updateUseCase.execute(ucReq)
    new SuccessResponse().success(res, ucRes)
  }

  async delete(req: Request, res: Response): Promise<void> {
    const ucReq = new DeleteProductUseCaseRequest(req.userId || "", req.params.id as string)
    const ucRes = await this.deleteUseCase.execute(ucReq)
    new SuccessResponse().success(res, ucRes)
  }

  async share(req: Request, res: Response): Promise<void> {
    const ucReq = new ShareProductUseCaseRequest(req.params.id as string)
    const ucRes = await this.shareUseCase.execute(ucReq)
    new SuccessResponse().success(res, ucRes)
  }
}
