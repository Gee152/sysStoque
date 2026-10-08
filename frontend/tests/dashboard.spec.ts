import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('CT07 - Visualizar dashboard com dados do estoque', async ({ page }) => {
    await expect(page.locator('#nav-tab-dashboard')).toHaveClass(/text-indigo/);
    await expect(page.locator('text=Valor Total do Estoque')).toBeVisible();
    await expect(page.locator('text=Fluxo de Movimentação')).toBeVisible();
    await expect(page.locator('text=Atividades Recentes')).toBeVisible();
  });

  test('CT09 - Ver alerta de estoque crítico', async ({ page }) => {
    await expect(page.locator('text=Estoque Crítico')).toBeVisible();
    await expect(page.locator('text=Alerta de reposição necessária')).toBeVisible();
  });

  test('CT08 - Navegar para produtos pelo dashboard', async ({ page }) => {
    await page.click('#dash-btn-all-movements');
    await expect(page.locator('#nav-tab-movements')).toBeVisible();
  });

  test('KPI cards visíveis e com valores', async ({ page }) => {
    await expect(page.locator('text=Produtos')).toBeVisible();
    await expect(page.locator('text=Variantes')).toBeVisible();
    await expect(page.locator('text=Unidades')).toBeVisible();
  });

  test('Tema escuro funciona', async ({ page }) => {
    const themeBtn = page.locator('button:has(svg.lucide-sun-moon)').first();
    await themeBtn.click();
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');
  });
});
