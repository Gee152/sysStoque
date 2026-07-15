import "reflect-metadata";
import { DataSource } from "typeorm";
import { UserEntity } from "./entities/UserEntity.js";
import { ProductEntity } from "./entities/ProductEntity.js";
import { ProductVariantEntity } from "./entities/ProductVariantEntity.js";
import { MovementEntity } from "./entities/MovementEntity.js";
import dotenv from 'dotenv';

// 1. Só carrega o dotenv se estiver rodando localmente na sua máquina.
// Isso evita que o Vercel se confunda caso o arquivo .env tenha ido parar no GitHub.
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
    // 3. Log de diagnóstico para termos certeza do que está acontecendo na nuvem
    console.log("🔌 Iniciando conexão com o banco. Status da URL:", process.env.DATABASE_URL ? "✅ Presente e capturada" : "❌ VAZIA/UNDEFINED");
    
    await AppDataSource.initialize();
    initialized = true;

    console.log("✅ Conexão com o Supabase estabelecida com sucesso!");
  }
  return AppDataSource;
}