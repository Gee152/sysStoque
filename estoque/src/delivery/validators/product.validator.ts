import { z } from 'zod';

const variantSchema = z.object({
  size: z.string().min(1, 'Tamanho é obrigatório.'),
  color: z.string().min(1, 'Cor é obrigatória.'),
  stock: z.number().int().nonnegative('Estoque não pode ser negativo.').optional(),
  imageUrl: z.string().optional(),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Nome do produto é obrigatório.'),
  category: z.string().optional(),
  costPrice: z.number().nonnegative('Preço de custo não pode ser negativo.'),
  salePrice: z.number().nonnegative('Preço de venda não pode ser negativo.'),
  imageUrl: z.string().url('URL da imagem inválida.').optional().or(z.literal('')),
  variants: z.array(variantSchema).optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Nome do produto não pode ser vazio.').optional(),
  category: z.string().optional(),
  costPrice: z.number().nonnegative('Preço de custo não pode ser negativo.').optional(),
  salePrice: z.number().nonnegative('Preço de venda não pode ser negativo.').optional(),
  imageUrl: z.string().url('URL da imagem inválida.').optional().or(z.literal('')),
  variants: z.array(variantSchema).optional(),
});
