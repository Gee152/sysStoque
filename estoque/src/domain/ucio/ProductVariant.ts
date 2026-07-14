export class CreateVariantDTO {
  public productId: string
  public size: string
  public color: string
  public stock: number
  public imageUrl?: string

  constructor(productId: string, size: string, color: string, stock: number = 0, imageUrl?: string) {
    this.productId = productId
    this.size = size
    this.color = color
    this.stock = stock
    this.imageUrl = imageUrl
  }
}
