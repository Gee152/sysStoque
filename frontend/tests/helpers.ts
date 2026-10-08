import { Page } from '@playwright/test';

export const TEST_USER = {
  name: 'Teste QA',
  email: 'qa@teste.com',
  password: '123456',
};

export async function login(page: Page, email = TEST_USER.email, password = TEST_USER.password) {
  await page.goto('/');
  await page.fill('#auth-input-email', email);
  await page.fill('#auth-input-password', password);
  await page.click('#auth-btn-submit');
  await page.waitForSelector('#nav-tab-dashboard', { timeout: 10000 });
}

export async function registerAndLogin(page: Page) {
  await page.goto('/');
  await page.click('#auth-tab-register');
  await page.fill('#auth-input-name', TEST_USER.name);
  await page.fill('#auth-input-email', TEST_USER.email);
  await page.fill('#auth-input-password', TEST_USER.password);
  await page.click('#auth-btn-submit');
  await page.waitForSelector('#nav-tab-dashboard', { timeout: 10000 });
}
