import { test, expect } from '@playwright/test';

test.describe('Production Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Ждем автологин
  });

  test('should load production page for a project', async ({ page }) => {
    await page.click('text=Проекты');
    await page.waitForTimeout(1000);
    
    // Кликаем на первый проект
    const firstProject = page.locator('tbody tr').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForTimeout(1000);
      
      // Ищем кнопку перехода к производству
      const productionButton = page.locator('text=Производство').or(page.locator('button:has-text("Производство")'));
      if (await productionButton.isVisible()) {
        await productionButton.click();
        await page.waitForTimeout(2000);
        
        // Проверяем, что страница производства загрузилась
        await expect(page.locator('text=Производство').or(page.locator('text=Зоны')).first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should create a production zone', async ({ page }) => {
    await page.click('text=Проекты');
    await page.waitForTimeout(1000);
    
    const firstProject = page.locator('tbody tr').first();
    if (await firstProject.isVisible()) {
      await firstProject.click();
      await page.waitForTimeout(1000);
      
      const productionButton = page.locator('text=Производство').or(page.locator('button:has-text("Производство")'));
      if (await productionButton.isVisible()) {
        await productionButton.click();
        await page.waitForTimeout(2000);
        
        // Ищем кнопку добавления зоны
        const addZoneButton = page.locator('button:has-text("Добавить зону")').or(page.locator('button:has-text("Зона")'));
        if (await addZoneButton.isVisible()) {
          await addZoneButton.click();
          await page.waitForTimeout(500);
          
          // Заполняем название зоны
          await page.fill('input[name="name"], input[placeholder*="название"]', `Тестовая зона ${Date.now()}`);
          
          // Сохраняем
          const saveButton = page.locator('button:has-text("Создать")').or(page.locator('button:has-text("Сохранить")'));
          await saveButton.click();
          
          await page.waitForTimeout(2000);
          
          // Проверяем отсутствие ошибок
          const errorMessage = page.locator('text=Ошибка').or(page.locator('text=Failed'));
          await expect(errorMessage.first()).not.toBeVisible({ timeout: 3000 });
        }
      }
    }
  });
});

