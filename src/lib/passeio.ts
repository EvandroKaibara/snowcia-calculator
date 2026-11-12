import type { Config } from '../config/defaults'
import { holidaysFor, toKey } from './holidays'
import { parseLocal, type QuoteError } from './pricing'

// Ajustes de um dia avulso; o que faltar vem do padrão do formulário.
export interface PasseioDayEdit {
  passeios?: number
  limpezas?: number
  horarios?: string
}

export interface PasseioInput {
  modo: 'unica' | 'periodo'
  inicioData: string
  fimData: string // ignorado na data única
  caes: number
  passeiosPorDia: number
  limpezasPorDia: number
  porData: Record<string, PasseioDayEdit> // ignorado na data única
}

export interface PasseioDay {
  data: Date
  chave: string
  feriado?: string // só informativo: passeio não tem taxa de feriado
  passeios: number
  limpezas: number
  horarios: string
  desconto: number
  subtotal: number
}

export interface PasseioQuote {
  ok: true
  modo: PasseioInput['modo']
  inicio: Date
  fim: Date
  caes: number
  n: number
  dias: PasseioDay[]
  diasComAtendimento: number
  passeios: number
  limpezas: number
  bruto: number
  desconto: number
  liquido: number
  limpezaValor: number
  total: number
}

const MAX_DIAS = 365

const erro = (msg: string): QuoteError => ({ ok: false, vazio: false, erro: msg })

export function describeDay({ passeios, limpezas }: Pick<PasseioDay, 'passeios' | 'limpezas'>, completo = false) {
  const partes = [
    passeios && `${passeios} ${passeios === 1 ? 'passeio' : 'passeios'}`,
    limpezas &&
      (completo
        ? `${limpezas} ${limpezas === 1 ? 'limpeza / troca' : 'limpezas / trocas'} de ração e água`
        : `${limpezas} ${limpezas === 1 ? 'limpeza' : 'limpezas'}`),
  ].filter(Boolean)
  return partes.length ? partes.join(' + ') : 'Sem serviços'
}

export function passeioQuote(input: PasseioInput, config: Config): PasseioQuote | QuoteError {
  const { modo, inicioData, caes, passeiosPorDia, limpezasPorDia } = input
  const fimData = modo === 'unica' ? inicioData : input.fimData
  const porData = modo === 'unica' ? {} : input.porData
  if (!inicioData || !fimData) {
    return {
      ok: false,
      vazio: true,
      erro: modo === 'unica' ? 'Preencha a data do atendimento.' : 'Preencha as datas de início e de término.',
    }
  }
  const inicio = parseLocal(inicioData, '00:00')
  const fim = parseLocal(fimData, '00:00')
  if (!inicio || !fim) return erro('Data inválida.')
  if (fim < inicio) return erro('O término precisa ser no mesmo dia do início ou depois.')
  if (!Number.isInteger(caes) || caes < 1) return erro('Informe ao menos 1 cachorro.')

  // Datas locais à meia-noite: a diferença arredonda para absorver qualquer variação de fuso.
  const n = Math.round((fim.getTime() - inicio.getTime()) / 86400000) + 1
  if (n > MAX_DIAS) return erro(`O limite é de ${MAX_DIAS} dias por orçamento.`)

  const feriados = new Map<string, string>()
  for (let y = inicio.getFullYear(); y <= fim.getFullYear(); y++) {
    holidaysFor(y, config.feriadosExtras).forEach((nome, data) => feriados.set(data, nome))
  }

  const unitario = config.pasBase + (caes - 1) * config.pasAdicionalCao
  const dias = Array.from({ length: n }, (_, i): PasseioDay => {
    const data = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i)
    const chave = toKey(data)
    const edit = porData[chave]
    const passeios = edit?.passeios ?? passeiosPorDia
    const limpezas = edit?.limpezas ?? limpezasPorDia
    // O desconto vale uma vez por passeio adicional do próprio dia, seja qual for o número de cachorros.
    const desconto = Math.max(0, passeios - 1) * config.pasDesconto
    return {
      data,
      chave,
      feriado: feriados.get(chave),
      passeios,
      limpezas,
      horarios: edit?.horarios ?? '',
      desconto,
      subtotal: passeios * unitario - desconto + limpezas * config.pasLimpeza,
    }
  })

  const soma = (campo: 'passeios' | 'limpezas' | 'desconto' | 'subtotal') => dias.reduce((s, d) => s + d[campo], 0)
  const passeios = soma('passeios')
  const limpezas = soma('limpezas')
  const bruto = passeios * unitario
  const desconto = soma('desconto')

  return {
    ok: true,
    modo,
    inicio,
    fim,
    caes,
    n,
    dias,
    diasComAtendimento: dias.filter((d) => d.passeios || d.limpezas).length,
    passeios,
    limpezas,
    bruto,
    desconto,
    liquido: bruto - desconto,
    limpezaValor: limpezas * config.pasLimpeza,
    total: soma('subtotal'),
  }
}
