import { JwtService } from '../../infra/auth/JwtService.js';
import { AppError } from '../../shared/Result.js';
import type { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(AppError.unauthorized('Token de autenticação não fornecido.'));
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(AppError.unauthorized('Formato do token de autenticação inválido.'));
  }

  try {
    const payload = JwtService.verify(token);
    req.userId = payload.userID;
    next();
  } catch (error) {
    return next(AppError.unauthorized('Token de autenticação expirado ou inválido.'));
  }
}
