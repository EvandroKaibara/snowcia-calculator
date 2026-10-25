import type { Config } from '../config/defaults'
import { holidaysFor, toKey } from './holidays'
import { parseLocal, type QuoteError } from './pricing'

export interface CatsitterInput {
  inicioData: string
  fimData: string
  gatos: number
  extrasPorDia: number
  // Só os dias em que a quantidade difere do padrão.
  extrasPorData: Record<string, number>
}

export interface CatsitterDay {
  data: Date
  chave: string
  feriado?: string
  extras: number
  subtotal: number
}

export interface CatsitterQuote {
  ok: true
  inicio: Date
  fim: Date
  gatos: number
  n: number
  dias: CatsitterDay[]
  diasFeriado: number
  visitasExtras: number
  base: number
  adicionalGatos: number
  visitas: number
  feriados: number
  total: number
}

const MAX_DIAS = 365

export function catsitterQuote(input: CatsitterInput, config: Config): CatsitterQuote | QuoteError {
  const { inicioData, fimData, gatos, extrasPorDia, extrasPorData } = input
  if (!inicioData || !fimData) {
    return { ok: false, vazio: true, erro: 'Preencha as datas de início e de término.' }
  }
  const inicio = parseLocal(inicioData, '00:00')
  const fim = parseLocal(fimData, '00:00')
  if (!inicio || !fim) return { ok: false, vazio: false, erro: 'Data inválida.' }
  if (fim < inicio) return { ok: false, vazio: false, erro: 'O término precisa ser no mesmo dia do início ou depois.' }
  if (!Number.isInteger(gatos) || gatos < 1) return { ok: false, vazio: false, erro: 'Informe ao menos 1 gato.' }

  // Datas locais à meia-noite: a diferença arredonda para absorver qualquer variação de fuso.
  const n = Math.round((fim.getTime() - inicio.getTime()) / 86400000) + 1
  if (n > MAX_DIAS) return { ok: false, vazio: false, erro: `O limite é de ${MAX_DIAS} dias por orçamento.` }

  const feriados = new Map<string, string>()
  for (let y = inicio.getFullYear(); y <= fim.getFullYear(); y++) {
    holidaysFor(y, config.feriadosExtras).forEach((nome, data) => feriados.set(data, nome))
  }

  const dias = Array.from({ length: n }, (_, i): CatsitterDay => {
    const data = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i)
    const chave = toKey(data)
    const feriado = feriados.get(chave)
    const extras = extrasPorData[chave] ?? extrasPorDia
    const subtotal =
      config.catBase + (gatos - 1) * config.catAdicionalGato + extras * config.catVisitaExtra + (feriado ? config.catFeriado : 0)
    return { data, chave, feriado, extras, subtotal }
  })

  const diasFeriado = dias.filter((d) => d.feriado).length
  const visitasExtras = dias.reduce((s, d) => s + d.extras, 0)
  const adicionalGatos = n * (gatos - 1) * config.catAdicionalGato
  const visitas = visitasExtras * config.catVisitaExtra
  const feriadosValor = diasFeriado * config.catFeriado
  const base = n * config.catBase

  return {
    ok: true,
    inicio,
    fim,
    gatos,
    n,
    dias,
    diasFeriado,
    visitasExtras,
    base,
    adicionalGatos,
    visitas,
    feriados: feriadosValor,
    total: dias.reduce((s, d) => s + d.subtotal, 0),
  }
}
