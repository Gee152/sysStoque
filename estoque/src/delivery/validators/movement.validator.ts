import { z } from 'zod';

export const createMovementSchema = z.object({
  variantId: z.string().uuid('ID da variação inválido (deve ser UUID).'),
  type: z.enum(['IN', 'OUT'], {
    errorMap: () => ({ message: "Tipo inválido. Deve ser 'IN' ou 'OUT'." }),
  }),
  quantity: z.number().int().positive('A quantidade deve ser um número inteiro maior que zero.'),
  reason: z.string().optional().default(''),
});
