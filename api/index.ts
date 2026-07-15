import "reflect-metadata"
import type { Application } from "express"

let appPromise: Promise<Application> | null = null

async function getApp(): Promise<Application> {
  if (!appPromise) {
    appPromise = import("../estoque/dist/delivery/cmd/bootstrap.js").then(({ createApp }) => createApp())
  }
  return appPromise
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  req.url = req.url.replace(/^\/api/, "") || "/"
  const app = await getApp()
  return app(req, res)
}