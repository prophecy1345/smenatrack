import { test, expect } from '@playwright/test';

test('регистрация, логин и создание привычки', async ({ page }) => {
  const email = `test-${Date.now()}@example.com`;

  await page.goto('/register');
  await page.locator('input[name=email]').fill(email);
  await page.locator('input[name=password]').fill('password123');
  await page.locator('select[name=shiftPattern]').selectOption('2/2');
  await page.locator('button[type=submit]').click();

  await page.waitForURL('/login');
  await page.locator('input[name=email]').fill(email);
  await page.locator('input[name=password]').fill('password123');
  await page.locator('button[type=submit]').click();

  await page.waitForURL('/');
  await page.locator('input[placeholder="Название привычки"]').fill('Бег');
  await page.getByRole('button', { name: 'Добавить' }).click();

  await expect(page.getByText('Бег')).toBeVisible();

  // отмечаем привычку выполненной на экране деталей и проверяем, что запись появилась
  await page.getByRole('link', { name: 'Бег' }).click();
  await page.getByRole('button', { name: 'Отметить сегодня выполненной' }).click();
  await expect(page.getByText('Всего отметок: 1')).toBeVisible();
  await expect(page.getByText('Сегодня уже отмечено')).toBeVisible();
});
