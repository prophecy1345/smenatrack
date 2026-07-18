import { test, expect } from '@playwright/test'

test('карта переходов: весь путь кликами, без адресной строки', async ({ page }) => {
  const email = `map${Date.now()}@e.com`

  await page.goto('/') // guard → /login
  await expect(page).toHaveURL(/\/login$/)

  await page.getByRole('link', { name: 'Зарегистрироваться' }).click()
  await expect(page).toHaveURL(/\/register$/)
  await page.locator('input[name=email]').fill(email)
  await page.locator('input[name=password]').fill('password123')
  await page.locator('select[name=shiftPattern]').selectOption('2/2')
  await page.locator('input[name=shiftStartDate]').fill('2026-07-18')
  await page.locator('button[type=submit]').click() // /register → /login
  await expect(page).toHaveURL(/\/login$/)

  await page.locator('input[name=email]').fill(email)
  await page.locator('input[name=password]').fill('password123')
  await page.locator('button[type=submit]').click() // /login → /
  await expect(page).toHaveURL('http://localhost:5173/')

  await page.locator('input[placeholder="Название привычки"]').fill('Бег утром')
  await page.getByRole('button', { name: 'Добавить' }).click()
  await page.getByRole('link', { name: 'Бег утром' }).click() // / → /habits/:id
  await expect(page).toHaveURL(/\/habits\/[0-9a-f-]+$/)

  await page.getByRole('button', { name: 'Отметить сегодня выполненной' }).click()
  await expect(page.getByText('Сегодня уже отмечено')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Отметить сегодня выполненной' })).toHaveCount(0)

  await page.getByRole('link', { name: 'SmenaTrack' }).click() // /habits/:id → /
  await expect(page).toHaveURL('http://localhost:5173/')

  await page.getByRole('button', { name: 'Выйти' }).click() // → /login
  await expect(page).toHaveURL(/\/login$/)
})
