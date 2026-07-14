import { ProductAssociation } from "../association/association.js"
import { ErrorEntity } from "../association/error.js"
import { ProductVariantAssociation } from "../association/association.js"

class CreateProductUseCaseRequest {
  public userId: string
  public name: string
  public category?: string
  public costPrice: number
  public salePrice: number
  public imageUrl?: string

  constructor(userId: string, name: string, costPrice: number, salePrice: number, category?: string, imageUrl?: string) {
    this.userId = userId
    this.name = name
    this.costPrice = costPrice
    this.salePrice = salePrice
    this.category = category
    this.imageUrl = imageUrl
  }
}

class CreateProductUseCaseResponse {
  public product: ProductAssociation | null
  public variants: ProductVariantAssociation[]
  public error: ErrorEntity | null

  constructor(product: ProductAssociation | null, variants: ProductVariantAssociation[], error: ErrorEntity | null) {
    this.product = product
    this.variants = variants
    this.error = error
  }
}

class ListProductsUseCaseRequest {
  public userId: string

  constructor(userId: string) {
    this.userId = userId
  }
}

class ListProductsUseCaseResponse {
  public products: ProductAssociation[]
  public variants: ProductVariantAssociation[][]
  public error: ErrorEntity | null

  constructor(products: ProductAssociation[], variants: ProductVariantAssociation[][], error: ErrorEntity | null) {
    this.products = products
    this.variants = variants
    this.error = error
  }
}

class UpdateProductUseCaseRequest {
  public userId: string
  public productId: string
  public name?: string
  public category?: string
  public costPrice?: number
  public salePrice?: number
  public imageUrl?: string

  constructor(userId: string, productId: string, name?: string, category?: string, costPrice?: number, salePrice?: number, imageUrl?: string) {
    this.userId = userId
    this.productId = productId
    this.name = name
    this.category = category
    this.costPrice = costPrice
    this.salePrice = salePrice
    this.imageUrl = imageUrl
  }
}

class UpdateProductUseCaseResponse {
  public error: ErrorEntity | null

  constructor(error: ErrorEntity | null) {
    this.error = error
  }
}

class DeleteProductUseCaseRequest {
  public userId: string
  public productId: string

  constructor(userId: string, productId: string) {
    this.userId = userId
    this.productId = productId
  }
}

class DeleteProductUseCaseResponse {
  public error: ErrorEntity | null

  constructor(error: ErrorEntity | null) {
    this.error = error
  }
}

class ShareProductUseCaseRequest {
  public productId: string

  constructor(productId: string) {
    this.productId = productId
  }
}

class ShareProductUseCaseResponse {
  public data: any
  public error: ErrorEntity | null

  constructor(data: any, error: ErrorEntity | null) {
    this.data = data
    this.error = error
  }
}

export {
  CreateProductUseCaseRequest, CreateProductUseCaseResponse,
  ListProductsUseCaseRequest, ListProductsUseCaseResponse,
  UpdateProductUseCaseRequest, UpdateProductUseCaseResponse,
  DeleteProductUseCaseRequest, DeleteProductUseCaseResponse,
  ShareProductUseCaseRequest, ShareProductUseCaseResponse,
}
