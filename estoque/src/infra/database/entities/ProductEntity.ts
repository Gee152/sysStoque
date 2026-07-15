import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany, Relation } from "typeorm";
// 1. A palavra 'type' foi adicionada aqui nas duas importações
import type { ProductVariantEntity } from "./ProductVariantEntity.js";
import type { UserEntity } from "./UserEntity.js";

@Entity("products")
export class ProductEntity {
  @PrimaryGeneratedColumn("uuid", { name: "product_id" })
  public productId!: string;

  @Column('uuid', { name: "user_id" })
  public userId!: string;

  // 2. Mudamos de () => UserEntity para a string "UserEntity"
  @ManyToOne("UserEntity")
  @JoinColumn({ name: "user_id" })
  public user!: Relation<UserEntity>;

  @Column('varchar', { name: "name" })
  public name!: string;

  @Column('varchar', { name: "category", nullable: true })
  public category!: string;

  @Column({ name: "cost_price", type: "decimal", precision: 10, scale: 2, default: 0 })
  public costPrice!: number;

  @Column({ name: "sale_price", type: "decimal", precision: 10, scale: 2, default: 0 })
  public salePrice!: number;

  @Column({ name: "image_url", type: "text", nullable: true })
  public imageUrl!: string;

  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;

  // 3. Mudamos de () => ProductVariantEntity para a string "ProductVariantEntity"
  @OneToMany("ProductVariantEntity", (variant: ProductVariantEntity) => variant.product)
  public variants!: Relation<ProductVariantEntity[]>;

  constructor(productId: string, userId: string, name: string, category: string, costPrice: number, salePrice: number, imageUrl: string, createdAt: Date) {
    this.productId = productId;
    this.userId = userId;
    this.name = name;
    this.category = category;
    this.costPrice = costPrice;
    this.salePrice = salePrice;
    this.imageUrl = imageUrl;
    this.createdAt = createdAt;
  }
}