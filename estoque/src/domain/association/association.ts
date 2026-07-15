export class UserAssociation {
  public userID: string
  public email: string
  public passwordHash: string
  public name: string
  public phone: string | null
  public createdAt: Date
  public updatedAt: Date

  constructor(
    userID: string,
    email: string,
    passwordHash: string,
    name: string,
    phone: string | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.userID = userID
    this.email = email
    this.passwordHash = passwordHash
    this.name = name
    this.phone = phone
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }

  get id(): string {
    return this.userID
  }
}

export class ProductAssociation {
  public id: string
  public userId: string
  public name: string
  public category: string | null
  public costPrice: number
  public salePrice: number
  public imageUrl: string | null
  public createdAt: Date
  public updatedAt: Date

  constructor(
    id: string,
    userId: string,
    name: string,
    category: string | null,
    costPrice: number,
    salePrice: number,
    imageUrl: string | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id
    this.userId = userId
    this.name = name
    this.category = category
    this.costPrice = costPrice
    this.salePrice = salePrice
    this.imageUrl = imageUrl
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }
}

export class ProductVariantAssociation {
  public id: string
  public productId: string
  public size: string
  public color: string
  public stock: number
  public imageUrl: string | null
  public createdAt: Date
  public updatedAt: Date

  constructor(
    id: string,
    productId: string,
    size: string,
    color: string,
    stock: number,
    imageUrl: string | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id
    this.productId = productId
    this.size = size
    this.color = color
    this.stock = stock
    this.imageUrl = imageUrl
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }
}

export class MovementAssociation {
  public id: string
  public variantId: string
  public productId: string
  public userId: string
  public type: "IN" | "OUT"
  public quantity: number
  public reason: string
  public createdAt: Date
  public updatedAt: Date

  constructor(
    id: string,
    variantId: string,
    productId: string,
    userId: string,
    type: "IN" | "OUT",
    quantity: number,
    reason: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id
    this.variantId = variantId
    this.productId = productId
    this.userId = userId
    this.type = type
    this.quantity = quantity
    this.reason = reason
    this.createdAt = createdAt
    this.updatedAt = updatedAt
  }
}
