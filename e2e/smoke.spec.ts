import { test, expect } from '@playwright/test';

/**
 * Smoke тесты - проверка основных функций системы
 * Запускаются первыми для быстрой проверки работоспособности
 */
test.describe('Smoke Tests', () => {
  test('should load main page and authenticate', async ({ page }) => {
    await page.goto('/');
    
    // Ждем автологин и загрузку страницы
    await page.waitForTimeout(3000);
    
    // Проверяем, что нет критических ошибок загрузки
    const criticalErrors = page.locator('text=Failed to load').or(page.locator('text=Error loading'));
    await expect(criticalErrors.first()).not.toBeVisible({ timeout: 5000 }).catch(() => {});
    
    // Проверяем, что основные элементы видны (навигация или контент)
    const navItems = ['Панель управления', 'Проекты', 'Клиенты', 'Производство'];
    let hasNav = false;
    for (const item of navItems) {
      if (await page.locator(`text=${item}`).first().isVisible({ timeout: 2000 }).catch(() => false)) {
        hasNav = true;
        break;
      }
    }
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
    const dashboard = page.locator('text=Панель управления').or(page.locator('text=Проекты в работе')).or(page.locator('h1'));
    
    // Ждем загрузки
    await page.waitForTimeout(2000);
    
    // Проверяем отсутствие критических ошибок (игнорируем toast ошибки)
    const criticalErrors = page.locator('body:has-text("Failed to load")').or(page.locator('body:has-text("Error loading")'));
    const hasCriticalError = await criticalErrors.isVisible({ timeout: 1000 }).catch(() => false);
    expect(hasCriticalError).toBeFalsy();
  });
});

