import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique, Relation } from "typeorm";
// 1. A palavra 'type' precisa estar aqui logo após o import
import type { ProductEntity } from "./ProductEntity.js";

@Entity("product_variants")
@Unique(["product", "size", "color"])
export class ProductVariantEntity {
  @PrimaryGeneratedColumn("uuid", { name: "variant_id" })
  public variantId!: string;

  @Column('uuid', { name: "product_id" })
  public productId!: string;

  // 2. Aqui mudamos de () => ProductEntity para a string "ProductEntity"
  @ManyToOne("ProductEntity", (product: ProductEntity) => product.variants)
  @JoinColumn({ name: "product_id" })
  public product!: Relation<ProductEntity>;

  @Column('varchar', { name: 'size' })
  public size!: string;

  @Column('varchar', { name: 'color' })
  public color!: string;

  @Column('int', { name: 'stock', default: 0 })
  public stock!: number;

  @Column('text', { name: 'image_url', nullable: true })
  public imageUrl!: string | null;

  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;

  constructor(variantId: string, productId: string, product: ProductEntity, size: string, color: string, stock: number, imageUrl: string | null, createdAt: Date) {
    this.variantId = variantId;
    this.productId = productId;
    this.product = product;
    this.size = size;
    this.color = color;
    this.stock = stock;
    this.imageUrl = imageUrl;
    this.createdAt = createdAt;
  }
}