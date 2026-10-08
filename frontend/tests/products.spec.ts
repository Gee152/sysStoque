import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Produtos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('CT10 - Cadastrar produto com variantes', async ({ page }) => {
    await page.click('#nav-tab-products');
    await page.click('#prod-btn-open-add-modal');

    await page.fill('#form-product-name', 'Bermuda Jeans');
    await page.selectOption('#form-product-category', 'Vestuário');
    await page.fill('#form-product-sku', 'BERM-JEANS');

    const variantInputs = page.locator('#form-btn-add-variant-row');
    await variantInputs.click();

    await page.fill('input[placeholder="Especificação (ex: Azul / M, 110V)"]', 'M / Azul');
    await page.fill('input[placeholder="Preço R$"]', '89.90');
    await page.fill('input[placeholder="Estoque"]', '10');

    await page.click('#form-btn-submit');
    await expect(page.locator('text=Bermuda Jeans')).toBeVisible({ timeout: 10000 });
  });

  test('CT11 - Cadastrar produto sem variantes (cria Padrão)', async ({ page }) => {
    await page.click('#nav-tab-products');
    await page.click('#prod-btn-open-add-modal');

    await page.fill('#form-product-name', 'Produto Sem Variante');
    await page.selectOption('#form-product-category', 'Outros');
    await page.fill('#form-product-sku', 'PSV-001');

    await page.click('#form-btn-submit');
    await expect(page.locator('text=Produto Sem Variante')).toBeVisible({ timeout: 10000 });
  });

  test('CT12 - Buscar produto por nome', async ({ page }) => {
    await page.click('#nav-tab-products');
    await page.fill('#prod-input-search', 'Camiseta');
    await expect(page.locator('text=Camiseta Classic Penteada')).toBeVisible();
  });

  test('CT13 - Filtrar produtos por categoria', async ({ page }) => {
    await page.click('#nav-tab-products');
    await page.getByRole('button', { name: 'Periféricos', exact: true }).click();
    await expect(page.locator('text=Teclado Mecânico Outemu')).toBeVisible();
    await expect(page.locator('text=Camiseta Classic Penteada')).not.toBeVisible();
  });

  test('CT14 - Expandir produto para ver variantes', async ({ page }) => {
    await page.click('#nav-tab-products');
    await page.locator('text=Camiseta Classic Penteada').click();
    await expect(page.locator('text=P / Azul')).toBeVisible();
    await expect(page.locator('text=M / Azul')).toBeVisible();
  });

  test('CT15 - Compartilhar produto (copiar link)', async ({ page }) => {
    await page.click('#nav-tab-products');
    const shareBtn = page.locator('button[title="Copiar link de compartilhamento"]').first();
    await shareBtn.click();
    const copyIcon = page.locator('svg.text-emerald-500').first();
    await expect(copyIcon).toBeVisible({ timeout: 3000 });
  });

  test('CT16 - Visualizar página pública de produto', async ({ page }) => {
    await page.goto('/compartilhar/p-1');
    await expect(page.locator('text=Camiseta Classic Penteada')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=P / Azul')).toBeVisible();
  });
});
