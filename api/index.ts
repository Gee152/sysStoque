import "reflect-metadata"
import type { Application } from "express"
import { createApp } from "../estoque/backend/src/delivery/cmd/bootstrap.js"

let app: Application | null = null

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await createApp()
  }
  req.url = req.url.replace(/^\/api/, "") || "/"
  return app(req, res)
}