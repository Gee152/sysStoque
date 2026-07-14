import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  passwordHash: z.string().min(6, 'A senha deve conter pelo menos 6 caracteres.'),
  name: z.string().min(2, 'O nome deve conter pelo menos 2 caracteres.'),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  passwordHash: z.string().min(1, 'A senha é obrigatória.'),
});
