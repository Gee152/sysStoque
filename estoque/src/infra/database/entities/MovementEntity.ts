import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { ProductVariantEntity } from "./ProductVariantEntity.js";
import { ProductEntity } from "./ProductEntity.js";
import { UserEntity } from "./UserEntity.js";

@Entity("movements")
export class MovementEntity {
  @PrimaryGeneratedColumn("uuid", { name: "movement_id" })
  public movementId!: string;

  @Column('uuid', { name: "variant_id" })
  public variantId!: string;

  @ManyToOne(() => ProductVariantEntity)
  @JoinColumn({ name: "variant_id" })
  public variant!: ProductVariantEntity;

  @Column('uuid', { name: "product_id" })
  public productId!: string;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: "product_id" })
  public product!: ProductEntity;

  @Column('uuid', { name: "user_id" })
  public userId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: "user_id" })
  public user!: UserEntity;

  @Column('varchar', { name: "type" })
  public type!: "IN" | "OUT";

  @Column('int', { name: "quantity" })
  public quantity!: number;

  @Column('varchar', { name: "reason", nullable: true })
  public reason?: string;

  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt!: Date;

  constructor(movementId: string, variantId: string, variant: ProductVariantEntity, productId: string, product: ProductEntity, userId: string, user: UserEntity, type: "IN" | "OUT", quantity: number, reason: string, createdAt: Date) {
    this.movementId = movementId;
    this.variantId = variantId;
    this.variant = variant;
    this.productId = productId;
    this.product = product;
    this.userId = userId;
    this.user = user;
    this.type = type; 
    this.quantity = quantity;
    this.reason = reason;
    this.createdAt = createdAt;
  }
}
