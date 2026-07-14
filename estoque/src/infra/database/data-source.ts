import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserEntity } from "./entities/UserEntity.js";
import { ProductEntity } from "./entities/ProductEntity.js";
import { ProductVariantEntity } from "./entities/ProductVariantEntity.js";
import { MovementEntity } from "./entities/MovementEntity.js";
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV === "development",
  entities: [UserEntity, ProductEntity, ProductVariantEntity, MovementEntity],
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    max: 1,
    idleTimeoutMillis: 3000,
    connectionTimeoutMillis: 5000,
  },
  migrations: [],
  subscribers: [],
});

let initialized = false;

export async function getDataSource(): Promise<DataSource> {
  if (!initialized) {
    await AppDataSource.initialize();
    initialized = true;
  }
  return AppDataSource;
}