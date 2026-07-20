const quantityPattern = /^\d+(?:[.,]\d{1,3})?$/
const moneyPattern = /^\d+(?:[.,]\d{1,2})?$/

function scaledInteger(value: string, scale: number) {
  const [integer, fraction = ''] = value.replace(',', '.').split('.')
  return BigInt(integer) * 10n ** BigInt(scale) + BigInt(fraction.padEnd(scale, '0'))
}

export function normalizeDecimal(value: string) {
  return value.trim().replace(',', '.')
}

export function isValidQuantity(value: string) {
  return quantityPattern.test(value.trim()) && scaledInteger(value.trim(), 3) > 0n
}

export function isValidMoney(value: string) {
  return moneyPattern.test(value.trim())
}

export function moneyToCents(value: string) {
  return scaledInteger(value.trim(), 2)
}

export function itemTotalInCents(quantity: string, unitPrice: string) {
  if (!isValidQuantity(quantity) || !isValidMoney(unitPrice)) return null
  const product = scaledInteger(quantity.trim(), 3) * moneyToCents(unitPrice)
  return (product + 500n) / 1000n
}

export function formatBRLCents(cents: bigint) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(Number(cents) / 100)
}
