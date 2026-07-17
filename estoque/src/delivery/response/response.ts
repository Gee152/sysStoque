import { Response } from "express"
import { ErrorEntity } from "../../domain/association/error.js"

class SuccessResponse {
  success(res: Response, body: any): void {
    if (body && body.error instanceof ErrorEntity) {
      const statusCode = body.error.code === 2 ? 500 : 400
      res.status(statusCode).json({
        ok: false,
        error: {
          code: body.error.code === 2 ? "INTERNAL_SERVER_ERROR" : "VALIDATION_ERROR",
          message: body.error.message,
        },
      })
      return
    }

    const data = this.extractData(body)
    res.status(200).json({ ok: true, data })
  }

  created(res: Response, body: any): void {
    if (body && body.error instanceof ErrorEntity) {
      const statusCode = body.error.code === 2 ? 500 : 400
      res.status(statusCode).json({
        ok: false,
        error: {
          code: body.error.code === 2 ? "INTERNAL_SERVER_ERROR" : "VALIDATION_ERROR",
          message: body.error.message,
        },
      })
      return
    }

    const data = this.extractData(body)
    res.status(201).json({ ok: true, data })
  }

  private extractData(body: any): any {
    if (!body) return null
    const KEYS = ["token", "user", "product", "variants", "movement", "products", "movements", "flow", "flows", "data", "deletedId"]
    const result: any = {}
    for (const key of KEYS) {
      if (body[key] !== undefined) result[key] = body[key]
    }
    if (Object.keys(result).length > 0) {
      const entries = Object.keys(result)
      return entries.length === 1 ? result[entries[0]] : result
    }
    return body
  }
}

export { SuccessResponse }
