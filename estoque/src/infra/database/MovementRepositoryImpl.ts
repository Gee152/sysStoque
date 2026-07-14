import { MovementAssociation } from "../../domain/association/association.js"
import { toMovementDomain } from "./transforme/movement.transformer.js"
import { AppDataSource } from "./data-source.js"
import { MovementEntity } from "./entities/MovementEntity.js"
import { ProductEntity } from "./entities/ProductEntity.js"
import { ProductVariantEntity } from "./entities/ProductVariantEntity.js"
import { RegisterMovementUseCaseRequest } from "../../domain/ucio/Movement.js"
import type { CreateMovementRepository, FindMovementsByUserIdRepository, GetDashboardDataRepository } from "../../domain/repository/movement.js"

export class MovementRepositoryImpl implements CreateMovementRepository, FindMovementsByUserIdRepository, GetDashboardDataRepository {
  async createMovement(data: RegisterMovementUseCaseRequest & { productId: string }): Promise<MovementAssociation> {
    const repository = AppDataSource.getRepository(MovementEntity)
    const movement = repository.create(data)
    const saved = await repository.save(movement)
    return toMovementDomain(saved)
  }

  async findByUserId(userId: string, limit = 50): Promise<any[]> {
    const repository = AppDataSource.getRepository(MovementEntity)
    const movements = await repository.find({
      where: { userId },
      relations: ["product", "variant"],
      order: { createdAt: "DESC" },
      take: limit,
    })
    return movements.map((m) => ({
      ...toMovementDomain(m),
      productName: m.product.name,
      variantSize: m.variant.size,
      variantColor: m.variant.color,
    }))
  }

  async findByProductId(productId: string): Promise<MovementAssociation[]> {
    const repository = AppDataSource.getRepository(MovementEntity)
    const movements = await repository.find({ where: { productId }, order: { createdAt: "DESC" } })
    return movements.map((m) => toMovementDomain(m))
  }

  async getDashboardData(userId: string, periodDays = 30): Promise<any> {
    const runner = AppDataSource.createQueryBuilder()

    const totalPiecesResult = await runner
      .select("COALESCE(SUM(pv.stock), 0)", "total")
      .from(ProductVariantEntity, "pv")
      .innerJoin("pv.product", "p")
      .where("p.userId = :userId", { userId })
      .getRawOne()

    const totalValueResult = await runner
      .select("COALESCE(SUM(pv.stock * p.cost_price), 0)", "total")
      .from(ProductVariantEntity, "pv")
      .innerJoin("pv.product", "p")
      .where("p.userId = :userId", { userId })
      .getRawOne()

    const salesResult = await runner
      .select("COALESCE(SUM(m.quantity), 0)", "volume")
      .addSelect("COALESCE(SUM(m.quantity * p.sale_price), 0)", "value")
      .from(MovementEntity, "m")
      .innerJoin("m.product", "p")
      .where("m.userId = :userId", { userId })
      .andWhere("m.type = 'OUT'")
      .andWhere("m.createdAt >= now() - :interval::interval", { interval: `${periodDays} days` })
      .getRawOne()

    const recentMovements = await this.findByUserId(userId, 20)

    const abcResult = await runner
      .select("p.id", "productId")
      .addSelect("p.name", "productName")
      .addSelect("COALESCE(SUM(m.quantity), 0)", "totalSold")
      .addSelect("COALESCE(SUM(m.quantity * p.sale_price), 0)", "revenue")
      .from(ProductEntity, "p")
      .leftJoin("movements", "m", "m.product_id = p.id AND m.type = 'OUT' AND m.created_at >= now() - :interval::interval", { interval: `${periodDays} days` })
      .where("p.userId = :userId", { userId })
      .groupBy("p.id, p.name")
      .orderBy("revenue", "DESC")
      .getRawMany()

    const abcData = this.classifyABC(abcResult)

    return {
      totalPieces: Number(totalPiecesResult.total),
      totalValue: Number(totalValueResult.total),
      salesVolume: Number(salesResult.volume),
      salesValue: Number(salesResult.value),
      recentMovements,
      abcData,
    }
  }

  private classifyABC(rows: { productId: string; productName: string; totalSold: string; revenue: string }[]): any[] {
    const totalRevenue = rows.reduce((sum, r) => sum + Number(r.revenue), 0)
    if (totalRevenue === 0) {
      return rows.map((r) => ({
        productId: r.productId,
        productName: r.productName,
        totalSold: Number(r.totalSold),
        revenue: Number(r.revenue),
        classification: "C" as const,
      }))
    }

    let cumulative = 0
    return rows.map((r) => {
      cumulative += Number(r.revenue)
      const percentage = (cumulative / totalRevenue) * 100
      let classification: "A" | "B" | "C"
      if (percentage <= 80) classification = "A"
      else if (percentage <= 95) classification = "B"
      else classification = "C"
      return { productId: r.productId, productName: r.productName, totalSold: Number(r.totalSold), revenue: Number(r.revenue), classification }
    })
  }
}
