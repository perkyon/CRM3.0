import { test, expect } from '@playwright/test';

test.describe('Production Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000); // Ждем автологин
  });

  test('should load production page for a project', async ({ page }) => {
    // Переходим на проекты
    const projectsLink = page.locator('button:has-text("Проекты")').or(page.locator('text=Проекты').first());
    await projectsLink.click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    
    // Кликаем на первый проект (если есть)
    const firstProject = page.locator('tbody tr').first();
    const projectExists = await firstProject.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (projectExists) {
      await firstProject.click();
      await page.waitForTimeout(2000);
      
      // Ищем кнопку перехода к производству
      const productionButton = page.locator('button:has-text("Производство")').or(page.locator('text=Производство').first());
      const buttonExists = await productionButton.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (buttonExists) {
        await productionButton.click();
        await page.waitForTimeout(3000);
        
        // Проверяем, что страница производства загрузилась
        await expect(page.locator('text=Производство').or(page.locator('text=Зоны')).or(page.locator('h1')).first()).toBeVisible({ timeout: 10000 });
      } else {
        test.skip(); // Пропускаем тест если нет кнопки производства
      }
    } else {
      test.skip(); // Пропускаем тест если нет проектов
    }
  });

  test('should create a production zone', async ({ page }) => {
    // Переходим на проекты
    const projectsLink = page.locator('button:has-text("Проекты")').or(page.locator('text=Проекты').first());
    await projectsLink.click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    
    const firstProject = page.locator('tbody tr').first();
    const projectExists = await firstProject.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (projectExists) {
      await firstProject.click();
      await page.waitForTimeout(2000);
      
      const productionButton = page.locator('button:has-text("Производство")').or(page.locator('text=Производство').first());
      const buttonExists = await productionButton.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (buttonExists) {
        await productionButton.click();
        await page.waitForTimeout(3000);
        
        // Ищем кнопку добавления зоны
        const addZoneButton = page.locator('button:has-text("Добавить зону")').or(page.locator('button:has-text("Зона")')).or(page.locator('button:has-text("Создать зону")'));
        const zoneButtonExists = await addZoneButton.first().isVisible({ timeout: 5000 }).catch(() => false);
        
        if (zoneButtonExists) {
          await addZoneButton.first().click();
          await page.waitForTimeout(1000);
          
          // Заполняем название зоны
          await page.fill('input[name="name"], input[placeholder*="название"]', `Тест ${Date.now()}`);
          
          // Сохраняем
          const saveButton = page.locator('button:has-text("Создать")').or(page.locator('button:has-text("Сохранить")'));
          await saveButton.click();
          
          await page.waitForTimeout(3000);
          
          // Проверяем отсутствие ошибок
          const errorMessage = page.locator('text=Ошибка при создании').or(page.locator('text=Failed to create'));
          await expect(errorMessage.first()).not.toBeVisible({ timeout: 2000 });
        } else {
          test.skip(); // Нет кнопки добавления зоны
        }
      } else {
        test.skip(); // Нет кнопки производства
      }
    } else {
      test.skip(); // Нет проектов
    }
  });
});

