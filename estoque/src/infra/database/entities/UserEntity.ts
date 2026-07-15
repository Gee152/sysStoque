import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn("uuid", { name: "user_id" })
  public userID!: string;

  @Column('varchar', { name: 'email', unique: true })
  public email!: string;

  @Column('varchar', { name: "password_hash" })
  public passwordHash!: string;

  @Column('varchar', { name: 'name' })
  public name!: string;

  @Column('varchar', { name: 'phone', nullable: true })
  public phone!: string | null;

  @CreateDateColumn({ name: "created_at" })
  public createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  public updatedAt!: Date;

  constructor(userID: string, email: string, passwordHash: string, name: string, phone: string | null, createdAt: Date) {
    this.userID = userID
    this.email = email;
    this.passwordHash = passwordHash;
    this.name = name;
    this.phone = phone;
    this.createdAt = createdAt;
  }
}
