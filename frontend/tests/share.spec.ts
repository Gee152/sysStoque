import { test, expect } from '@playwright/test';

test.describe('Compartilhamento Público', () => {
  test('CT26 - Acessar link público de produto existente', async ({ page }) => {
    await page.goto('/compartilhar/p-1');
    await expect(page.locator('text=Camiseta Classic Penteada')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Opções disponíveis')).toBeVisible();
  });

  test('CT27 - Acessar link público de produto inexistente', async ({ page }) => {
    await page.goto('/compartilhar/id-invalido');
    await expect(page.locator('text=Produto não encontrado')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=não encontrado')).toBeVisible();
  });

  test('CT28 - Selecionar variante no produto compartilhado', async ({ page }) => {
    await page.goto('/compartilhar/p-1');
    await page.waitForSelector('text=P / Azul', { timeout: 10000 });
    await page.locator('text=M / Azul').click();
    const selected = page.locator('button.border-emerald-500');
    await expect(selected).toBeVisible();
  });

  test('CT29 - Botão Comprar via WhatsApp visível', async ({ page }) => {
    await page.goto('/compartilhar/p-1');
    await expect(page.locator('text=Comprar via WhatsApp')).toBeVisible({ timeout: 10000 });
  });

  test('Quantidade pode ser ajustada na página de produto', async ({ page }) => {
    await page.goto('/compartilhar/p-1');
    await expect(page.locator('text=1')).toBeVisible();
    const plusBtn = page.locator('button:has(svg.lucide-plus)');
    await plusBtn.click();
    await expect(page.locator('text=2')).toBeVisible();
  });

  test('Variante com estoque zero aparece como indisponível', async ({ page }) => {
    await page.goto('/compartilhar/p-2');
    await expect(page.locator('text=Switch Blue')).toBeVisible();
    await expect(page.locator('text=Indisponível')).toBeVisible();
  });
});
