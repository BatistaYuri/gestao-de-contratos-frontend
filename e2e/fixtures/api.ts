import type { Page, Route } from '@playwright/test'

const username = process.env.ADMIN_USERNAME
const password = process.env.ADMIN_PASSWORD

if (!username || !password) {
  throw new Error('Defina ADMIN_USERNAME e ADMIN_PASSWORD no arquivo .env para executar os testes E2E.')
}

export const testCredentials = { username, password }

export const client = {
  id: 'client-1',
  name: 'Empresa Exemplo',
  document: '12345678000190',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

export const contract = {
  id: 'contract-1',
  number: 'CT-2026-001',
  type: 'SERVICE',
  dueDate: '2026-12-31T00:00:00.000Z',
  status: 'ACTIVE',
  approvalStatus: 'DRAFT',
  currency: 'BRL',
  discount: '0.00',
  additionalFees: '0.00',
  subtotal: '1500.00',
  value: '1500.00',
  closedAt: null,
  client,
  items: [{ id: 'item-1', description: 'Consultoria', quantity: '10', unitPrice: '150.00' }],
}

const pagination = (total: number) => ({ page: 1, pageSize: 10, total, totalPages: total ? 1 : 0 })
const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })

export async function mockApi(page: Page) {
  const state = { clients: [structuredClone(client)], contracts: [structuredClone(contract)] }

  await page.route(/^https?:\/\/[^/]+\/api\//, async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.replace(/^\/api/, '')

    if (path === '/auth/login' && request.method() === 'POST') {
      const submitted = request.postDataJSON()
      return submitted.username === testCredentials.username && submitted.password === testCredentials.password
        ? json(route, { token: 'e2e-token' })
        : json(route, { message: 'Unauthorized' }, 401)
    }
    if (path === '/clients' && request.method() === 'GET') {
      const pageSize = Number(url.searchParams.get('pageSize'))
      return json(route, { data: state.clients, pagination: { ...pagination(state.clients.length), pageSize } })
    }
    if (path === '/clients' && request.method() === 'POST') {
      const input = request.postDataJSON()
      const created = { ...client, ...input, id: `client-${state.clients.length + 1}` }
      state.clients.push(created)
      return json(route, created, 201)
    }
    if (path === '/contracts/summary' && request.method() === 'GET') {
      const active = state.contracts.filter((item) => item.status === 'ACTIVE').length
      return json(route, { active, expired: 0, closed: 0, total: state.contracts.length })
    }
    if (path === '/contracts' && request.method() === 'GET') {
      const approval = url.searchParams.get('approvalStatus')
      const data = approval ? state.contracts.filter((item) => item.approvalStatus === approval) : state.contracts
      return json(route, { data, pagination: pagination(data.length) })
    }
    const transition = /^\/contracts\/([^/]+)\/(submit|approve|close)$/.exec(path)
    if (transition && request.method() === 'PATCH') {
      const item = state.contracts.find(({ id }) => id === transition[1])!
      item.approvalStatus = transition[2] === 'submit' ? 'PENDING' : transition[2] === 'approve' ? 'APPROVED' : item.approvalStatus
      if (transition[2] === 'close') item.status = 'CLOSED'
      return json(route, item)
    }
    return json(route, { message: `Rota E2E não simulada: ${request.method()} ${path}` }, 501)
  })

  return state
}

export async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Usuário').fill(testCredentials.username)
  await page.getByLabel('Senha').fill(testCredentials.password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/contracts')
}
