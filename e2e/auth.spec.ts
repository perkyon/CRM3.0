import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should automatically login with default user', async ({ page }) => {
    await page.goto('/');
    
    // Ждем, пока страница загрузится и произойдет автологин
    await page.waitForTimeout(2000);
    
    // Проверяем, что мы залогинены (поищем элементы, которые видны только после входа)
    const dashboard = page.locator('text=Dashboard').or(page.locator('text=Дашборд'));
    await expect(dashboard.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show user email in header', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Проверяем, что email пользователя отображается (обычно в header)
    const userEmail = page.locator('text=fominsevil@gmail.com');
    await expect(userEmail.first()).toBeVisible({ timeout: 10000 });
  });
});

