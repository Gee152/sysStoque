import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserEntity } from "./entities/UserEntity.js";
import { ProductEntity } from "./entities/ProductEntity.js";
import { ProductVariantEntity } from "./entities/ProductVariantEntity.js";
import { MovementEntity } from "./entities/MovementEntity.js";
import { ClientFlowEntity } from "./entities/ClientFlowEntity.js";
import dotenv from 'dotenv';

// 1. Só carrega o dotenv se estiver rodando localmente na sua máquina.
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

// 2. Trava de Segurança: Verifica imediatamente se a variável existe.
if (!process.env.DATABASE_URL) {
  console.error("🚨 ERRO CRÍTICO: A variável DATABASE_URL não foi encontrada pelo Vercel!");
}

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [UserEntity, ProductEntity, ProductVariantEntity, MovementEntity, ClientFlowEntity],
  ssl: {
    rejectUnauthorized: false,
  },
  extra: {
    max: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 15000,
  },
  migrations: [],
  subscribers: [],
});

let initialized = false;

export async function getDataSource(): Promise<DataSource> {
  const currentDatabaseUrl = process.env.DATABASE_URL;

  console.log("🔌 Iniciando conexão com o banco. Status da URL:", currentDatabaseUrl ? "✅ Presente e capturada" : "❌ VAZIA/UNDEFINED");

  if (!initialized) {
    // Atualiza a URL dinamicamente no momento da execução para evitar cache estático do build
    AppDataSource.setOptions({
      url: currentDatabaseUrl,
    });
    
    await AppDataSource.initialize();
    initialized = true;

    console.log("✅ Conexão com o Supabase estabelecida com sucesso!");
  } else if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  return AppDataSource;
}