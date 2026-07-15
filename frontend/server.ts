/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import sharp from "sharp";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";

interface UserDb {
  id: string;
  name: string;
  email: string;
  password?: string;
}

interface ProductVariantDb {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProductDb {
  id: string;
  name: string;
  description: string;
  category: string;
  sku: string;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariantDb[];
}

interface MovementDb {
  id: string;
  variantId: string;
  productId: string;
  type: "IN" | "OUT";
  quantity: number;
  reason: string;
  userId: string;
  userName: string;
  date: string;
  productName: string;
  variantName: string;
}

const DB_FILE = path.join(process.cwd(), "db.json");

// Helper to load database
function loadDb(): { users: UserDb[]; products: ProductDb[]; movements: MovementDb[] } {
  if (!fs.existsSync(DB_FILE)) {
    const SALT = bcrypt.genSaltSync(10);
    const HASHED_PASSWORD = bcrypt.hashSync("123", SALT);
    const initialDb: { users: UserDb[]; products: ProductDb[]; movements: MovementDb[] } = {
      users: [
        { id: "u-1", name: "Gabriel Victor", email: "gabrielvictos152@gmail.com", password: HASHED_PASSWORD }
      ],
      products: [
        {
          id: "p-1",
          name: "Camiseta Classic Penteada",
          description: "Camiseta 100% algodão fio 30.1 penteado premium.",
          category: "Vestuário",
          sku: "CAM-CLASSIC",
          createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
          variants: [
            { id: "v-1", productId: "p-1", name: "P / Azul", sku: "CAM-CLA-P-AZ", price: 59.90, stock: 12, imageUrl: null, createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), updatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString() },
            { id: "v-2", productId: "p-1", name: "M / Azul", sku: "CAM-CLA-M-AZ", price: 59.90, stock: 3, imageUrl: null, createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), updatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString() },
            { id: "v-3", productId: "p-1", name: "G / Azul", sku: "CAM-CLA-G-AZ", price: 59.90, stock: 22, imageUrl: null, createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), updatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString() },
            { id: "v-4", productId: "p-1", name: "M / Preto", sku: "CAM-CLA-M-PR", price: 59.90, stock: 1, imageUrl: null, createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), updatedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString() }
          ]
        },
        {
          id: "p-2",
          name: "Teclado Mecânico Outemu",
          description: "Teclado mecânico compacto com retroiluminação RGB e switch brown.",
          category: "Periféricos",
          sku: "TEC-RGB-MEC",
          createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
          variants: [
            { id: "v-5", productId: "p-2", name: "Switch Brown", sku: "TEC-RGB-BROWN", price: 289.90, stock: 8, imageUrl: null, createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString() },
            { id: "v-6", productId: "p-2", name: "Switch Blue", sku: "TEC-RGB-BLUE", price: 289.90, stock: 0, imageUrl: null, createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString() }
          ]
        },
        {
          id: "p-3",
          name: "Caneca de Cerâmica Minimalist",
          description: "Caneca com acabamento fosco 350ml.",
          category: "Utensílios",
          sku: "CAN-MIN",
          createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
          variants: [
            { id: "v-7", productId: "p-3", name: "Preta Fosca", sku: "CAN-MIN-PRE", price: 34.90, stock: 45, imageUrl: null, createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(), updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString() },
            { id: "v-8", productId: "p-3", name: "Cinza Concreto", sku: "CAN-MIN-CZ", price: 34.90, stock: 4, imageUrl: null, createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(), updatedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString() }
          ]
        }
      ],
      movements: [
        {
          id: "m-1",
          variantId: "v-1",
          productId: "p-1",
          type: "IN",
          quantity: 12,
          reason: "Entrada inicial de estoque",
          userId: "u-1",
          userName: "Gabriel Victor",
          date: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
          productName: "Camiseta Classic Penteada",
          variantName: "P / Azul"
        },
        {
          id: "m-2",
          variantId: "v-2",
          productId: "p-1",
          type: "IN",
          quantity: 3,
          reason: "Entrada inicial de estoque",
          userId: "u-1",
          userName: "Gabriel Victor",
          date: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
          productName: "Camiseta Classic Penteada",
          variantName: "M / Azul"
        },
        {
          id: "m-3",
          variantId: "v-6",
          productId: "p-2",
          type: "OUT",
          quantity: 2,
          reason: "Saída por quebra ou defeito no lote",
          userId: "u-1",
          userName: "Gabriel Victor",
          date: new Date(Date.now() - 3600000 * 12).toISOString(),
          productName: "Teclado Mecânico Outemu",
          variantName: "Switch Blue"
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf8");
    return initialDb;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch (err) {
    console.error("Erro ao ler db.json, reinicializando...", err);
    return { users: [], products: [], movements: [] };
  }
}

function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Erro ao salvar db.json:", err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check for Playwright
  app.get('/health', (_req, res) => res.json({ status: 'OK' }));

  // Store active sessions: Token -> User context
  const sessions: Record<string, UserDb> = {};

  // Auth Middleware supporting both '/api' prefix and direct pathing
  const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ ok: false, error: "Acesso não autorizado. Faça login primeiro." });
    }
    const token = authHeader.split(" ")[1];
    const user = sessions[token];
    if (!user) {
      return res.status(401).json({ ok: false, error: "Sessão inválida ou expirada." });
    }
    (req as any).user = user;
    next();
  };

  // --- File Upload ---
  const UPLOADS_DIR = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const storage = multer.memoryStorage();
  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (_req, file, cb) => {
      const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Formato de imagem não permitido. Use JPEG, PNG, GIF ou WebP."));
      }
    },
  });

  // POST /upload — receives image, converts to WebP, saves to uploads/
  app.post(["/upload", "/api/upload"], authenticate, (req, res) => {
    upload.single("image")(req, res, async (err) => {
      if (err) {
        const msg = err instanceof multer.MulterError ? "Arquivo muito grande (máx 10MB)." : err.message;
        return res.status(400).json({ ok: false, error: msg });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ ok: false, error: "Nenhuma imagem enviada." });
      }

      try {
        const hash = crypto.randomBytes(16).toString("hex");
        const filename = `${hash}.webp`;

        await sharp(file.buffer)
          .webp({ quality: 75 })
          .toFile(path.join(UPLOADS_DIR, filename));

        const url = `/uploads/${filename}`;
        res.json({ ok: true, data: { url } });
      } catch (convertErr) {
        console.error("Erro ao converter imagem:", convertErr);
        res.status(500).json({ ok: false, error: "Erro ao processar imagem." });
      }
    });
  });

  // Serve uploaded files statically
  app.use("/uploads", express.static(UPLOADS_DIR));

  // --- API ROUTES ---

  // Auth Register
  app.post(["/auth/register", "/api/auth/register"], async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, error: "Preencha todos os campos obrigatórios (nome, email, senha)." });
    }

    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: "A senha deve ter no mínimo 6 caracteres." });
    }

    const db = loadDb();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ ok: false, error: "Este email já está sendo utilizado." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: UserDb = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      password: passwordHash
    };

    db.users.push(newUser);
    saveDb(db);

    // Auto-login upon registration
    const token = crypto.randomBytes(32).toString("hex");
    const { password: _, ...cleanUser } = newUser;
    sessions[token] = cleanUser;

    res.json({
      ok: true,
      data: {
        token,
        user: cleanUser
      }
    });
  });

  // Auth Login
  app.post(["/auth/login", "/api/auth/login"], async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "Email e senha são obrigatórios." });
    }

    const db = loadDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !user.password) {
      return res.status(401).json({ ok: false, error: "Credenciais incorretas." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ ok: false, error: "Credenciais incorretas." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const { password: _, ...cleanUser } = user;
    sessions[token] = cleanUser;

    res.json({
      ok: true,
      data: {
        token,
        user: cleanUser
      }
    });
  });

  // GET Products
  app.get(["/products", "/api/products"], authenticate, (req, res) => {
    const db = loadDb();
    res.json({ ok: true, data: db.products });
  });

  // POST Products (creates product and variants)
  app.post(["/products", "/api/products"], authenticate, (req, res) => {
    const { name, description, category, sku, variants } = req.body;
    if (!name || !category || !sku) {
      return res.status(400).json({ ok: false, error: "Nome, Categoria e SKU base são obrigatórios." });
    }

    const db = loadDb();
    const productId = "p-" + Math.random().toString(36).substr(2, 9);
    
    // Process input variants
    const processedVariants: ProductVariantDb[] = [];
    if (Array.isArray(variants) && variants.length > 0) {
      variants.forEach((v: any, index: number) => {
        processedVariants.push({
          id: "v-" + Math.random().toString(36).substr(2, 9),
          productId,
          name: v.name || `Variante ${index + 1}`,
          sku: v.sku || `${sku}-${index + 1}`,
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
          imageUrl: v.imageUrl || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
    } else {
      // Create a default variant if none are specified
      processedVariants.push({
        id: "v-" + Math.random().toString(36).substr(2, 9),
        productId,
        name: "Padrão",
        sku,
        price: 0,
        stock: 0,
        imageUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const newProduct: ProductDb = {
      id: productId,
      name,
      description: description || "",
      category,
      sku,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variants: processedVariants
    };

    db.products.push(newProduct);
    
    // Record initial stock as movements if variants had positive stock
    const user = (req as any).user;
    processedVariants.forEach(variant => {
      if (variant.stock > 0) {
        db.movements.push({
          id: "m-" + Math.random().toString(36).substr(2, 9),
          variantId: variant.id,
          productId,
          type: "IN",
          quantity: variant.stock,
          reason: "Cadastro inicial do produto",
          userId: user.id,
          userName: user.name,
          date: new Date().toISOString(),
          productName: newProduct.name,
          variantName: variant.name
        });
      }
    });

    saveDb(db);
    res.json({ ok: true, data: newProduct });
  });

  // PUT Products (update)
  app.put(["/products/:id", "/api/products/:id"], authenticate, (req, res) => {
    const db = loadDb();
    const productIndex = db.products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) {
      return res.status(404).json({ ok: false, error: "Produto não encontrado." });
    }

    const { name, category, costPrice, salePrice } = req.body;
    const nowStr = new Date().toISOString();

    if (name !== undefined) db.products[productIndex].name = name;
    if (category !== undefined) db.products[productIndex].category = category;
    if (costPrice !== undefined) (db.products[productIndex] as any).costPrice = costPrice;
    if (salePrice !== undefined) (db.products[productIndex] as any).salePrice = salePrice;

    db.products[productIndex].updatedAt = nowStr;

    saveDb(db);
    res.json({ ok: true, data: db.products[productIndex] });
  });

  // DELETE Products
  app.delete(["/products/:id", "/api/products/:id"], authenticate, (req, res) => {
    const db = loadDb();
    const productIndex = db.products.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) {
      return res.status(404).json({ ok: false, error: "Produto não encontrado." });
    }

    // Remove associated movements
    db.movements = db.movements.filter(m => m.productId !== req.params.id);
    // Remove product
    db.products.splice(productIndex, 1);
    saveDb(db);

    res.json({ ok: true, data: null });
  });

  // POST Movement
  app.post(["/movements", "/api/movements"], authenticate, (req, res) => {
    const { variantId, type, quantity, reason } = req.body;
    console.log(req.body)
    const numQty = Number(quantity);
    
    if (!variantId || !type || isNaN(numQty) || numQty <= 0) {
      return res.status(400).json({ ok: false, error: "Campos variantId, type ('IN' | 'OUT') e quantidade > 0 são obrigatórios." });
    }
    if (type !== "IN" && type !== "OUT") {
      return res.status(400).json({ ok: false, error: "Tipo de movimentação deve ser 'IN' ou 'OUT'." });
    }

    const db = loadDb();
    
    // Find variant and its corresponding product
    let foundVariant: ProductVariantDb | null = null;
    let foundProduct: ProductDb | null = null;

    for (const product of db.products) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) {
        foundVariant = variant;
        foundProduct = product;
        break;
      }
    }

    if (!foundVariant || !foundProduct) {
      return res.status(404).json({ ok: false, error: "Variante do produto não encontrada." });
    }

    // Process output constraint
    if (type === "OUT" && foundVariant.stock < numQty) {
      return res.status(400).json({ ok: false, error: `Estoque insuficiente para esta variante. Estoque disponível: ${foundVariant.stock}.` });
    }

    // Apply movement
    if (type === "IN") {
      foundVariant.stock += numQty;
    } else {
      foundVariant.stock -= numQty;
    }

    const nowStr = new Date().toISOString();
    foundVariant.updatedAt = nowStr;
    foundProduct.updatedAt = nowStr;

    const user = (req as any).user;
    const newMovement: MovementDb = {
      id: "m-" + Math.random().toString(36).substr(2, 9),
      variantId,
      productId: foundProduct.id,
      type,
      quantity: numQty,
      reason: reason || (type === "IN" ? "Entrada de estoque" : "Saída de estoque"),
      userId: user.id,
      userName: user.name,
      date: nowStr,
      productName: foundProduct.name,
      variantName: foundVariant.name
    };

    db.movements.push(newMovement);
    saveDb(db);

    res.json({ ok: true, data: newMovement });
  });

  // GET Dashboard
  app.get(["/dashboard", "/api/dashboard"], authenticate, (req, res) => {
    const db = loadDb();
    
    const totalProducts = db.products.length;
    let totalVariants = 0;
    let totalStockValue = 0;
    let totalItemsInStock = 0;
    let lowStockItemsCount = 0;
    const categoriesMap: Record<string, { count: number; value: number }> = {};

    db.products.forEach(p => {
      const cat = p.category || "Sem categoria";
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = { count: 0, value: 0 };
      }
      
      p.variants.forEach(v => {
        totalVariants++;
        totalItemsInStock += v.stock;
        const variantValue = v.price * v.stock;
        totalStockValue += variantValue;
        
        // Low stock threshold: <= 5 items
        if (v.stock <= 5) {
          lowStockItemsCount++;
        }

        categoriesMap[cat].count += v.stock;
        categoriesMap[cat].value += variantValue;
      });
    });

    // Recent movements: last 15 sorted by date descending
    const recentMovements = [...db.movements]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15);

    // Aggregate movements totals
    let entriesQty = 0;
    let exitsQty = 0;
    db.movements.forEach(m => {
      if (m.type === "IN") {
        entriesQty += m.quantity;
      } else {
        exitsQty += m.quantity;
      }
    });

    const stockByCategory = Object.keys(categoriesMap).map(category => ({
      category,
      count: categoriesMap[category].count,
      value: Math.round(categoriesMap[category].value * 100) / 100
    }));

    res.json({
      ok: true,
      data: {
        totalProducts,
        totalVariants,
        totalStockValue: Math.round(totalStockValue * 100) / 100,
        totalItemsInStock,
        lowStockItemsCount,
        recentMovements,
        stockByCategory,
        movementsSummary: {
          entries: entriesQty,
          exits: exitsQty
        }
      }
    });
  });

  // --- VITE DEV OR STATIC PROD SERVING ---

  const PORT = 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical server failure:", err);
});
