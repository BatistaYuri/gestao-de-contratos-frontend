import { expect, test } from '@playwright/test'
import { client, contract, login, mockApi, testCredentials } from './fixtures/api'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear())
  await mockApi(page)
})

test('protege a aplicação e autentica o usuário', async ({ page }) => {
  await page.goto('/contracts')
  await expect(page).toHaveURL(/\/login$/)

  await page.getByLabel('Usuário').fill('invalido')
  await page.getByLabel('Senha').fill('invalida')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByRole('alert')).toHaveText('Usuário ou senha inválidos.')

  await page.getByLabel('Usuário').fill(testCredentials.username)
  await page.getByLabel('Senha').fill(testCredentials.password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/contracts$/)
  await expect(page.getByRole('heading', { name: 'Contratos', exact: true })).toBeVisible()
})

test('cadastra um cliente pelo fluxo completo da interface', async ({ page }) => {
  await login(page)
  await page.getByRole('button', { name: 'Novo cliente' }).click()

  const dialog = page.getByRole('dialog', { name: 'Novo cliente' })
  await dialog.getByLabel('Nome').fill('Nova Empresa')
  await dialog.getByLabel('Documento').fill('12.345.678/0001-99')
  await dialog.getByRole('button', { name: 'Cadastrar cliente' }).click()

  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('status')).toHaveText('Cliente cadastrado com sucesso.')
  await expect(page.getByRole('cell', { name: 'Nova Empresa', exact: true })).toBeVisible()
})

test('aplica filtros e envia um contrato para aprovação', async ({ page }) => {
  await login(page)
  await expect(page.getByRole('cell', { name: contract.number, exact: true })).toBeVisible()

  await page.getByLabel('Aprovação').selectOption('DRAFT')
  const filteredRequest = page.waitForRequest((request) =>
    request.url().includes('/api/contracts?') && request.url().includes('approvalStatus=DRAFT'),
  )
  await page.getByRole('button', { name: 'Aplicar filtros' }).click()
  await filteredRequest
  await expect(page).toHaveURL(/approvalStatus=DRAFT/)
  await expect(page.getByRole('cell', { name: contract.number, exact: true })).toBeVisible()

  const actions = page.getByRole('button', { name: `Abrir ações do contrato ${contract.number}` })
  await actions.focus()
  await actions.press('Enter')
  await expect(actions).toHaveAttribute('aria-expanded', 'true')
  await page.getByRole('button', { name: 'Enviar para aprovação' }).click()
  const confirmation = page.getByRole('alertdialog', { name: 'Confirmar ação' })
  await expect(confirmation).toContainText(`enviar para aprovação o contrato ${contract.number}`)
  const submitRequest = page.waitForRequest((request) =>
    request.method() === 'PATCH' && request.url().endsWith(`/api/contracts/${contract.id}/submit`),
  )
  await confirmation.getByRole('button', { name: 'OK' }).click()

  await submitRequest
  await expect(page.getByText('Nenhum contrato encontrado.')).toBeVisible()
})

test('encerra a sessão pelo cabeçalho', async ({ page }) => {
  await login(page)
  await expect(page.getByRole('cell', { name: client.name, exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Sair' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.evaluate(() => localStorage.getItem('auth_token'))).resolves.toBeNull()
})
