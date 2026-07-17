import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("client_flow")
export class ClientFlowEntity {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  public id!: string;

  @Column("varchar", { name: "tracking_token", unique: true, length: 255 })
  public trackingToken!: string;

  @Column("uuid", { name: "product_id" })
  public productId!: string;

  @Column("varchar", { name: "client_name", length: 100 })
  public clientName!: string;

  @Column("varchar", { name: "client_contact", length: 20 })
  public clientContact!: string;

  @Column("text", { name: "description", nullable: true })
  public description?: string;

  @Column({ type: "enum", enum: ["ENVIADO", "NEGOCIANDO", "FECHADO", "NOTAS"], name: "current_status", default: "ENVIADO" })
  public currentStatus!: string;

  @Column("timestamp", { name: "next_follow_up_at", nullable: true })
  public nextFollowUpAt?: Date;

  @Column("uuid", { name: "user_id" })
  public userId!: string;

  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt!: Date;

  constructor(
    id: string,
    trackingToken: string,
    productId: string,
    clientName: string,
    clientContact: string,
    userId: string,
    description?: string,
    currentStatus?: string,
    nextFollowUpAt?: Date,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.trackingToken = trackingToken;
    this.productId = productId;
    this.clientName = clientName;
    this.clientContact = clientContact;
    this.userId = userId;
    this.description = description;
    this.currentStatus = currentStatus || "ENVIADO";
    this.nextFollowUpAt = nextFollowUpAt;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }
}
