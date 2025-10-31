import { test, expect } from '@playwright/test';

test.describe('Projects Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000); // Ждем автологин
  });

  test('should load projects page', async ({ page }) => {
    // Переходим на проекты
    const projectsLink = page.locator('button:has-text("Проекты")').or(page.locator('text=Проекты').first());
    await projectsLink.click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    
    // Проверяем заголовок страницы
    await expect(page.locator('h1:has-text("Проекты")').or(page.locator('text=Проекты').first())).toBeVisible({ timeout: 5000 });
    
    // Проверяем кнопку создания
    const createButton = page.locator('button:has-text("Создать проект")').or(page.locator('button:has-text("Добавить")'));
    await expect(createButton.first()).toBeVisible({ timeout: 5000 });
  });

  test('should create a new project', async ({ page }) => {
    // Переходим на проекты
    const projectsLink = page.locator('button:has-text("Проекты")').or(page.locator('text=Проекты').first());
    await projectsLink.click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    
    // Открываем диалог создания проекта
    const createButton = page.locator('button:has-text("Создать проект")').or(page.locator('button:has-text("Добавить")'));
    await createButton.first().click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    
    // Проверяем, что диалог открылся
    await expect(page.locator('text=Новый проект').or(page.locator('text=Создать проект')).first()).toBeVisible({ timeout: 5000 });
    
    // Заполняем форму
    const projectName = `Тест ${Date.now()}`;
    await page.fill('input[name="title"], input[placeholder*="название"]', projectName);
    
    // Выбираем клиента (если есть)
    const clientSelect = page.locator('button[role="combobox"]').first();
    const selectExists = await clientSelect.isVisible({ timeout: 3000 }).catch(() => false);
    if (selectExists) {
      await clientSelect.click();
      await page.waitForTimeout(500);
      // Выбираем первого клиента из списка
      const firstClient = page.locator('button[role="option"]').first();
      if (await firstClient.isVisible({ timeout: 2000 }).catch(() => false)) {
        await firstClient.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Сохраняем
    const saveButton = page.locator('button:has-text("Создать")').or(page.locator('button:has-text("Сохранить")'));
    await saveButton.click();
    
    // Ждем успешного создания
    await page.waitForTimeout(3000);
    
    // Проверяем отсутствие ошибок
    const errorMessage = page.locator('text=Ошибка при создании').or(page.locator('text=Failed to create'));
    await expect(errorMessage.first()).not.toBeVisible({ timeout: 3000 });
  });
});

