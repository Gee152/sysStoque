import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Movimentações de Estoque', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('CT17 - Registrar entrada (IN) de estoque', async ({ page }) => {
    await page.click('#nav-tab-movements');
    await page.click('#mov-btn-open-add-modal');

    await page.selectOption('#form-mov-product', 'p-1');
    await page.waitForTimeout(300);
    await page.selectOption('#form-mov-variant', { index: 1 });
    await page.click('#form-flow-in');
    await page.fill('#form-mov-qty', '5');
    await page.fill('#form-mov-reason', 'Reposição de Estoque');
    await page.click('#form-mov-btn-submit');

    await expect(page.locator('text=Movimentações')).toBeVisible({ timeout: 10000 });
  });

  test('CT18 - Registrar saída (OUT) com estoque suficiente', async ({ page }) => {
    await page.click('#nav-tab-movements');
    await page.click('#mov-btn-open-add-modal');

    await page.selectOption('#form-mov-product', 'p-1');
    await page.waitForTimeout(300);
    await page.selectOption('#form-mov-variant', { index: 1 });
    await page.click('#form-flow-out');
    await page.fill('#form-mov-qty', '2');
    await page.fill('#form-mov-reason', 'Venda');
    await page.click('#form-mov-btn-submit');

    await expect(page.locator('text=Movimentações')).toBeVisible({ timeout: 10000 });
  });

  test('CT19 - Registrar saída com estoque insuficiente', async ({ page }) => {
    await page.click('#nav-tab-movements');
    await page.click('#mov-btn-open-add-modal');

    await page.selectOption('#form-mov-product', 'p-2');
    await page.waitForTimeout(300);
    await page.selectOption('#form-mov-variant', { index: 2 });
    await page.click('#form-flow-out');
    await page.fill('#form-mov-qty', '999');
    await page.fill('#form-mov-reason', 'Teste');
    await page.click('#form-mov-btn-submit');

    await expect(page.locator('text=Quantidade indisponível')).toBeVisible({ timeout: 10000 });
  });

  test('CT21 - Filtrar movimentações por tipo IN', async ({ page }) => {
    await page.click('#nav-tab-movements');
    await page.click('#mov-filter-in');
    const inCards = page.locator('svg.text-emerald-600');
    await expect(inCards.first()).toBeVisible();
  });

  test('CT21b - Filtrar movimentações por tipo OUT', async ({ page }) => {
    await page.click('#nav-tab-movements');
    await page.click('#mov-filter-out');
    const outCards = page.locator('svg.text-rose-600');
    await expect(outCards.first()).toBeVisible();
  });

  test('CT22 - Visualizar histórico de movimentações', async ({ page }) => {
    await page.click('#nav-tab-movements');
    await expect(page.locator('text=Movimentações')).toBeVisible();
    const movementCards = page.locator('text=Camiseta Classic Penteada');
    await expect(movementCards.first()).toBeVisible();
  });
});
