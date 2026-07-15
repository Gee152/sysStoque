import "reflect-metadata"
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { getDataSource } from "../../infra/database/data-source.js"
import { errorHandler } from "../middlewares/errorHandler.js"
import { createRouter } from "../router/router.js"

dotenv.config()

export async function createApp(): Promise<express.Application> {
  const app = express()

  // CORS simplificado: O asterisco '*' libera a API para receber requisições de qualquer lugar
  app.use(cors({
    origin: '*'
  }))

  app.use(express.json())

  app.use(createRouter())
  app.use(errorHandler)

  await getDataSource()
  console.log("[DB] Data Source initialized")

  return app
}

export async function bootstrap(): Promise<void> {
  const port = process.env.PORT || 3333
  const app = await createApp()

  app.listen(port, () => {
    console.log(`[Server] running on http://localhost:${port}`)
  })
}