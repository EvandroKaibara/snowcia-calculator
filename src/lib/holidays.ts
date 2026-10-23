import type { ExtraHoliday } from '../config/defaults'

const pad = (n: number) => String(n).padStart(2, '0')

export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Nacionais, estadual de SP e municipais de São Paulo (capital). Carnaval e pontes são ponto facultativo e ficam fora.
const FIXOS: [string, string][] = [
  ['01-01', 'Confraternização Universal'],
  ['01-25', 'Aniversário de São Paulo'],
  ['04-21', 'Tiradentes'],
  ['05-01', 'Dia do Trabalho'],
  ['07-09', 'Revolução Constitucionalista'],
  ['09-07', 'Independência'],
  ['10-12', 'Nossa Senhora Aparecida'],
  ['11-02', 'Finados'],
  ['11-15', 'Proclamação da República'],
  ['11-20', 'Consciência Negra'],
  ['12-25', 'Natal'],
]

// Algoritmo de Meeus/Jones/Butcher (calendário gregoriano).
function easter(y: number): Date {
  const a = y % 19
  const b = Math.floor(y / 100)
  const c = y % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(y, month - 1, day)
}

const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

export function holidaysFor(year: number, extras: ExtraHoliday[] = []): Map<string, string> {
  const map = new Map<string, string>()
  for (const [md, nome] of FIXOS) map.set(`${year}-${md}`, nome)
  const pascoa = easter(year)
  map.set(toKey(addDays(pascoa, -2)), 'Sexta-feira da Paixão')
  map.set(toKey(addDays(pascoa, 60)), 'Corpus Christi')
  // Extra da administradora vale por cima: corrige o nome ou cadastra data especial.
  for (const x of extras) if (x.data.startsWith(`${year}-`)) map.set(x.data, x.nome)
  return map
}
