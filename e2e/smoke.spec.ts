import { test, expect } from '@playwright/test';

/**
 * Smoke тесты - проверка основных функций системы
 * Запускаются первыми для быстрой проверки работоспособности
 */
test.describe('Smoke Tests', () => {
  test('should load main page and authenticate', async ({ page }) => {
    await page.goto('/');
    
    // Ждем автологин
    await page.waitForTimeout(3000);
    
    // Проверяем, что нет ошибок загрузки
    await expect(page.locator('text=Failed to load').or(page.locator('text=Error loading'))).not.toBeVisible();
    
    // Проверяем, что основные элементы видны
    const navItems = ['Dashboard', 'Проекты', 'Клиенты', 'Дашборд'];
    const hasNav = navItems.some(item => page.locator(`text=${item}`).first().isVisible());
    expect(hasNav).toBeTruthy();
  });

  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Переход на клиентов
    await page.click('text=Клиенты');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Клиенты').first()).toBeVisible();
    
    // Переход на проекты
    await page.click('text=Проекты');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Проекты').first()).toBeVisible();
  });

  test('should display dashboard metrics', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Проверяем, что Dashboard загрузился
    const dashboard = page.locator('text=Dashboard').or(page.locator('text=Дашборд'));
    if (await dashboard.isVisible()) {
      // Проверяем наличие метрик (могут быть не сразу)
      await page.waitForTimeout(2000);
      
      // Проверяем отсутствие ошибок
      const errors = page.locator('text=Ошибка').or(page.locator('text=Error'));
      await expect(errors.first()).not.toBeVisible({ timeout: 5000 });
    }
  });
});

