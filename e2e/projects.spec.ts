import { test, expect } from '@playwright/test';

test.describe('Projects Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000); // Ждем автологин
  });

  test('should load projects page', async ({ page }) => {
    await page.click('text=Проекты');
    await page.waitForTimeout(1000);
    
    await expect(page.locator('text=Проекты').first()).toBeVisible();
    await expect(page.locator('button:has-text("Создать проект")').or(page.locator('button:has-text("Добавить")'))).toBeVisible();
  });

  test('should create a new project', async ({ page }) => {
    await page.click('text=Проекты');
    await page.waitForTimeout(1000);
    
    // Открываем диалог создания проекта
    const createButton = page.locator('button:has-text("Создать проект")').or(page.locator('button:has-text("Добавить")'));
    await createButton.click();
    await page.waitForTimeout(500);
    
    // Заполняем форму
    await page.fill('input[name="title"], input[placeholder*="название"]', `Тестовый проект ${Date.now()}`);
    
    // Выбираем клиента (если есть)
    const clientSelect = page.locator('select, button[role="combobox"]').first();
    if (await clientSelect.isVisible()) {
      await clientSelect.click();
      await page.waitForTimeout(300);
      // Выбираем первого клиента из списка
      await page.click('text=Клиент, button[role="option"]', { timeout: 2000 }).catch(() => {});
    }
    
    // Сохраняем
    const saveButton = page.locator('button:has-text("Создать")').or(page.locator('button:has-text("Сохранить")'));
    await saveButton.click();
    
    // Ждем успешного создания
    await page.waitForTimeout(2000);
    
    // Проверяем отсутствие ошибок
    const errorMessage = page.locator('text=Ошибка').or(page.locator('text=Failed'));
    await expect(errorMessage.first()).not.toBeVisible({ timeout: 3000 });
  });
});

