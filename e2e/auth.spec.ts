import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should automatically login with default user', async ({ page }) => {
    await page.goto('/');
    
    // Ждем, пока страница загрузится и произойдет автологин
    await page.waitForTimeout(3000);
    
    // Проверяем, что мы залогинены (поищем элементы, которые видны только после входа)
    const nav = page.locator('text=Панель управления').or(page.locator('text=Проекты')).or(page.locator('text=Клиенты'));
    await expect(nav.first()).toBeVisible({ timeout: 10000 });
  });

  test('should show user email or name in header', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Проверяем, что пользователь залогинен (ищем avatar или имя пользователя)
    const userIndicator = page.locator('[data-testid="user-avatar"]').or(page.locator('text=Илья')).or(page.locator('text=fominsevil@gmail.com'));
    await expect(userIndicator.first()).toBeVisible({ timeout: 10000 });
  });
});

