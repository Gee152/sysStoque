import { test, expect } from '@playwright/test';
import { login, registerAndLogin, TEST_USER } from './helpers';

test.describe('Autenticação', () => {

  test('CT01 - Login com credenciais válidas', async ({ page }) => {
    await page.goto('/');
    await page.fill('#auth-input-email', 'gabrielvictos152@gmail.com');
    await page.fill('#auth-input-password', '123');
    await page.click('#auth-btn-submit');
    await expect(page.locator('#nav-tab-dashboard')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Resumo Geral')).toBeVisible();
  });

  test('CT02 - Login com email incorreto', async ({ page }) => {
    await page.goto('/');
    await page.fill('#auth-input-email', 'inexistente@email.com');
    await page.fill('#auth-input-password', '123');
    await page.click('#auth-btn-submit');
    await expect(page.locator('text=Credenciais incorretas')).toBeVisible({ timeout: 10000 });
  });

  test('CT03 - Login com senha incorreta', async ({ page }) => {
    await page.goto('/');
    await page.fill('#auth-input-email', 'gabrielvictos152@gmail.com');
    await page.fill('#auth-input-password', 'senha_errada');
    await page.click('#auth-btn-submit');
    await expect(page.locator('text=Credenciais incorretas')).toBeVisible({ timeout: 10000 });
  });

  test('CT04 - Registrar novo usuário com dados válidos', async ({ page }) => {
    const email = `qa+${Date.now()}@teste.com`;
    await page.goto('/');
    await page.click('#auth-tab-register');
    await page.fill('#auth-input-name', 'Novo Usuário');
    await page.fill('#auth-input-email', email);
    await page.fill('#auth-input-password', '123456');
    await page.click('#auth-btn-submit');
    await expect(page.locator('#nav-tab-dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('CT05 - Registrar com email já existente', async ({ page }) => {
    await page.goto('/');
    await page.click('#auth-tab-register');
    await page.fill('#auth-input-name', 'Duplicado');
    await page.fill('#auth-input-email', 'gabrielvictos152@gmail.com');
    await page.fill('#auth-input-password', '123456');
    await page.click('#auth-btn-submit');
    await expect(page.locator('text=email já está sendo utilizado')).toBeVisible({ timeout: 10000 });
  });

  test('CT06 - Acessar rota protegida sem token', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#auth-tab-login')).toBeVisible();
  });
});
