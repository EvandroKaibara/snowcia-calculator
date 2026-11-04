import type { Config } from '../config/defaults'
import { holidaysFor, toKey } from './holidays'
import { parseLocal, type QuoteError } from './pricing'

export interface PasseioInput {
  inicioData: string
  fimData: string
  caes: number
  passeiosPorDia: number
  // Só os dias em que a quantidade difere do padrão. 0 tira o dia da cobrança.
  passeiosPorData: Record<string, number>
}

export interface PasseioDay {
  data: Date
  chave: string
  feriado?: string
  passeios: number
  subtotal: number
}

export interface PasseioQuote {
  ok: true
  inicio: Date
  fim: Date
  caes: number
  dias: PasseioDay[]
  diasAtendidos: number
  passeios: number
  base: number
  adicionalCaes: number
  desconto: number
  total: number
}

const MAX_DIAS = 365

export function passeioQuote(input: PasseioInput, config: Config): PasseioQuote | QuoteError {
  const { inicioData, fimData, caes, passeiosPorDia, passeiosPorData } = input
  if (!inicioData || !fimData) {
    return { ok: false, vazio: true, erro: 'Preencha as datas de início e de término.' }
  }
  const inicio = parseLocal(inicioData, '00:00')
  const fim = parseLocal(fimData, '00:00')
  if (!inicio || !fim) return { ok: false, vazio: false, erro: 'Data inválida.' }
  if (fim < inicio) return { ok: false, vazio: false, erro: 'O término precisa ser no mesmo dia do início ou depois.' }
  if (!Number.isInteger(caes) || caes < 1) return { ok: false, vazio: false, erro: 'Informe ao menos 1 cachorro.' }
  if (!Number.isInteger(passeiosPorDia) || passeiosPorDia < 0) {
    return { ok: false, vazio: false, erro: 'Informe a quantidade de passeios por dia.' }
  }

  const n = Math.round((fim.getTime() - inicio.getTime()) / 86400000) + 1
  if (n > MAX_DIAS) return { ok: false, vazio: false, erro: `O limite é de ${MAX_DIAS} dias por orçamento.` }

  const feriados = new Map<string, string>()
  for (let y = inicio.getFullYear(); y <= fim.getFullYear(); y++) {
    holidaysFor(y, config.feriadosExtras).forEach((nome, data) => feriados.set(data, nome))
  }

  // Valor integral de um passeio; o desconto vale uma vez por passeio adicional, seja qual for o número de cães.
  const unitario = config.pasBase + (caes - 1) * config.pasAdicionalCao
  const dias = Array.from({ length: n }, (_, i): PasseioDay => {
    const data = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i)
    const chave = toKey(data)
    const passeios = passeiosPorData[chave] ?? passeiosPorDia
    const subtotal = passeios > 0 ? unitario + (passeios - 1) * (unitario - config.pasDesconto) : 0
    return { data, chave, feriado: feriados.get(chave), passeios, subtotal }
  })

  const atendidos = dias.filter((d) => d.passeios > 0)
  const passeios = atendidos.reduce((s, d) => s + d.passeios, 0)
  const base = passeios * config.pasBase
  const adicionalCaes = passeios * (caes - 1) * config.pasAdicionalCao
  const desconto = (passeios - atendidos.length) * config.pasDesconto
  if (passeios === 0) return { ok: false, vazio: true, erro: 'Informe ao menos 1 passeio em algum dia.' }

  return {
    ok: true,
    inicio,
    fim,
    caes,
    dias,
    diasAtendidos: atendidos.length,
    passeios,
    base,
    adicionalCaes,
    desconto,
    total: base + adicionalCaes - desconto,
  }
}
