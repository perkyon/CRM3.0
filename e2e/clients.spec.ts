import { test, expect } from '@playwright/test';

test.describe('Clients Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Ждем автологин
  });

  test('should load clients page', async ({ page }) => {
    await page.click('text=Клиенты');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=Клиенты').first()).toBeVisible();
    await expect(page.locator('text=Добавить клиента').or(page.locator('button:has-text("Добавить")'))).toBeVisible();
  });

  test('should create a new client', async ({ page }) => {
    await page.click('text=Клиенты');
    await page.waitForTimeout(1000);
    
    // Открываем диалог создания клиента
    await page.click('button:has-text("Добавить клиента")');
    await page.waitForTimeout(500);
    
    // Заполняем форму
    await page.fill('input[name="name"], input[placeholder*="имя"]', `Тестовый клиент ${Date.now()}`);
    await page.fill('input[name="phone"], input[placeholder*="телефон"]', '+79951234567');
    await page.fill('input[name="email"], input[placeholder*="email"]', `test${Date.now()}@test.ru`);
    
    // Сохраняем
    const saveButton = page.locator('button:has-text("Создать")').or(page.locator('button:has-text("Сохранить")'));
    await saveButton.click();
    
    // Ждем успешного создания (появление toast или обновление списка)
    await page.waitForTimeout(2000);
    
    // Проверяем, что клиент появился в списке
    await expect(page.locator('text=Тестовый клиент').first()).toBeVisible({ timeout: 5000 });
  });
});

