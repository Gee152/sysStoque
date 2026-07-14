import { SuccessResponse } from "../response/response.js"
import type { Request, Response } from "express"
import { PreconditionError } from "../../domain/association/error.js"
import { SupabaseStorage } from "../../infra/storage/SupabaseService.js"

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "products"

export class UploadController {
  async upload(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      new SuccessResponse().success(res, { error: new PreconditionError("Nenhum arquivo enviado.") })
      return
    }

    try {
      const url = await SupabaseStorage.upload(BUCKET, req.file.buffer, req.file.mimetype)
      new SuccessResponse().created(res, { data: { url } })
    } catch (err: any) {
      new SuccessResponse().success(res, { error: new PreconditionError(err.message) })
    }
  }

  async uploadMultiple(req: Request, res: Response): Promise<void> {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      new SuccessResponse().success(res, { error: new PreconditionError("Nenhum arquivo enviado.") })
      return
    }

    try {
      const results = await Promise.all(
        req.files.map(async (file: Express.Multer.File) => {
          const url = await SupabaseStorage.upload(BUCKET, file.buffer, file.mimetype)
          return { originalName: file.originalname, url }
        })
      )
      new SuccessResponse().created(res, { data: results })
    } catch (err: any) {
      new SuccessResponse().success(res, { error: new PreconditionError(err.message) })
    }
  }
}
