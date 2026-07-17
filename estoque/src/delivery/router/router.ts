import { Router } from "express"
import multer from "multer"
import { AuthController } from "../controllers/AuthController.js"
import { ProductController } from "../controllers/ProductController.js"
import { MovementController } from "../controllers/MovementController.js"
import { UploadController } from "../controllers/UploadController.js"
import { authMiddleware } from "../middlewares/authMiddleware.js"
import { UserRepositoryImpl } from "../../infra/database/UserRepositoryImpl.js"
import { ProductRepositoryImpl } from "../../infra/database/ProductRepositoryImpl.js"
import { MovementRepositoryImpl } from "../../infra/database/MovementRepositoryImpl.js"

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Formato de imagem não suportado. Use JPG, PNG, GIF, WebP ou SVG."))
    }
  },
})

export function createRouter(): Router {
  const router = Router()

  const userRepo = new UserRepositoryImpl()
  const productRepo = new ProductRepositoryImpl()
  const movementRepo = new MovementRepositoryImpl()

  const authController = new AuthController(userRepo, userRepo)
  const productController = new ProductController(productRepo, productRepo, productRepo, productRepo, productRepo, productRepo, productRepo, userRepo, movementRepo)
  const movementController = new MovementController(productRepo, movementRepo, movementRepo, movementRepo, productRepo)
  const uploadController = new UploadController()

  router.get("/health", (_req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date() })
  })

  router.post("/auth/register", (req, res) => authController.register(req, res))
  router.post("/auth/login", (req, res) => authController.login(req, res))

  router.get("/products/:id/share", (req, res) => productController.share(req, res))

  router.get("/products", authMiddleware, (req, res) => productController.list(req, res))
  router.post("/products", authMiddleware, (req, res) => productController.create(req, res))
  router.put("/products/:id", authMiddleware, (req, res) => productController.update(req, res))
  router.delete("/products/:id", authMiddleware, (req, res) => productController.delete(req, res))

  router.post("/upload", authMiddleware, upload.single("image"), (req, res) => uploadController.upload(req, res))
  router.post("/upload/multiple", authMiddleware, upload.array("images", 10), (req, res) => uploadController.uploadMultiple(req, res))

  router.post("/movements", authMiddleware, (req, res) => movementController.create(req, res))
  router.get("/movements", authMiddleware, (req, res) => movementController.list(req, res))
  router.get("/dashboard", authMiddleware, (req, res) => movementController.dashboard(req, res))

  return router
}
