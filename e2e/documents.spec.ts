import { test, expect } from '@playwright/test';

test.describe('Documents Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Ждем автологин
  });

  test('should load client documents', async ({ page }) => {
    await page.click('text=Клиенты');
    await page.waitForTimeout(1000);
    
    // Кликаем на первого клиента
    const firstClient = page.locator('tbody tr').first();
    if (await firstClient.isVisible()) {
      await firstClient.click();
      await page.waitForTimeout(1000);
      
      // Переходим на вкладку Документы
      await page.click('text=Документы');
      await page.waitForTimeout(500);
      
      // Проверяем, что вкладка документов открыта
      await expect(page.locator('text=Документы клиента').or(page.locator('text=Добавить документ'))).toBeVisible();
    }
  });

  test('should open upload document dialog', async ({ page }) => {
    await page.click('text=Клиенты');
    await page.waitForTimeout(1000);
    
    // Кликаем на первого клиента
    const firstClient = page.locator('tbody tr').first();
    if (await firstClient.isVisible()) {
      await firstClient.click();
      await page.waitForTimeout(1000);
      
      // Переходим на вкладку Документы
      await page.click('text=Документы');
      await page.waitForTimeout(500);
      
      // Открываем диалог загрузки
      const uploadButton = page.locator('button:has-text("Добавить документ")').or(page.locator('button:has-text("Загрузить")'));
      if (await uploadButton.isVisible()) {
        await uploadButton.click();
        await page.waitForTimeout(500);
        
        // Проверяем, что диалог открылся
        await expect(page.locator('text=Добавить документ').or(page.locator('text=Категория'))).toBeVisible();
      }
    }
  });
});

