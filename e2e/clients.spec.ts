import { test, expect } from '@playwright/test';

test.describe('Clients Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000); // Ждем автологин и загрузку
  });

  test('should load clients page', async ({ page }) => {
    // Ищем и кликаем на "Клиенты" в навигации
    const clientsLink = page.locator('button:has-text("Клиенты")').or(page.locator('text=Клиенты').first());
    await clientsLink.click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    
    // Проверяем заголовок страницы
    await expect(page.locator('h1:has-text("Клиенты")').or(page.locator('text=Клиенты').first())).toBeVisible({ timeout: 5000 });
    
    // Проверяем кнопку добавления
    const addButton = page.locator('button:has-text("Добавить клиента")').or(page.locator('button:has-text("Добавить")'));
    await expect(addButton.first()).toBeVisible({ timeout: 5000 });
  });

  test('should create a new client', async ({ page }) => {
    // Переходим на страницу клиентов
    const clientsLink = page.locator('button:has-text("Клиенты")').or(page.locator('text=Клиенты').first());
    await clientsLink.click({ timeout: 5000 });
    await page.waitForTimeout(2000);
    
    // Открываем диалог создания клиента
    const addButton = page.locator('button:has-text("Добавить клиента")').or(page.locator('button:has-text("Добавить")'));
    await addButton.first().click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    
    // Проверяем, что диалог открылся
    await expect(page.locator('text=Новый клиент').or(page.locator('text=Создать клиента')).first()).toBeVisible({ timeout: 5000 });
    
    // Заполняем форму
    const clientName = `Тест ${Date.now()}`;
    await page.fill('input[name="name"], input[placeholder*="имя"], input[placeholder*="название"]', clientName);
    await page.fill('input[name="phone"], input[placeholder*="телефон"]', '+79951234567');
    await page.fill('input[name="email"], input[placeholder*="email"]', `test${Date.now()}@test.ru`);
    
    // Сохраняем
    const saveButton = page.locator('button:has-text("Создать")').or(page.locator('button:has-text("Сохранить")'));
    await saveButton.click();
    
    // Ждем успешного создания (появление toast успеха или обновление списка)
    await page.waitForTimeout(3000);
    
    // Проверяем отсутствие ошибок (toast с ошибкой)
    const errorToast = page.locator('text=Ошибка при создании').or(page.locator('text=Failed'));
    await expect(errorToast.first()).not.toBeVisible({ timeout: 2000 });
  });
});

