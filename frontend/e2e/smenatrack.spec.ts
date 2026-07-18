import { test, expect } from '@playwright/test'

test('регистрация, логин и создание привычки', async ({ page }) => {
  const email = `test-${Date.now()}@example.com`

  await page.goto('/register')
  await page.locator('input[name=email]').fill(email)
  await page.locator('input[name=password]').fill('password123')
  await page.locator('select[name=shiftPattern]').selectOption('2/2')
  await page.locator('input[name=shiftStartDate]').fill('2026-07-18')
  await page.locator('button[type=submit]').click()

  await page.waitForURL('/login')
  await page.locator('input[name=email]').fill(email)
  await page.locator('input[name=password]').fill('password123')
  await page.locator('button[type=submit]').click()

  await page.waitForURL('/')
  await page.locator('input[placeholder="Название привычки"]').fill('Бег')
  await page.getByRole('button', { name: 'Добавить' }).click()

  await expect(page.getByText('Бег')).toBeVisible()

  // отмечаем прямо из списка: чекбокс шлёт POST на серверную дату today
  await expect(page.getByText('Отмечено сегодня: 0')).toBeVisible()
  await page.locator('[data-habit-card] input[type=checkbox]').check()
  await expect(page.getByText('Отмечено сегодня: 1')).toBeVisible()

  // экран деталей знает про ту же отметку — источник истины один, backend
  await page.getByRole('link', { name: 'Бег' }).click()
  await expect(page.getByText('Всего отметок: 1')).toBeVisible()
  await expect(page.getByText('Сегодня уже отмечено')).toBeVisible()
})
