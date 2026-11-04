import type { Config } from '../config/defaults'
import { holidaysFor, toKey } from './holidays'
import { parseLocal, type QuoteError } from './pricing'

export interface PasseioInput {
  data: string
  caes: number
  passeios: number
}

export interface PasseioQuote {
  ok: true
  data: Date
  caes: number
  passeios: number
  feriado?: string // só informativo: passeio não tem taxa de feriado
  base: number
  adicionalCaes: number
  desconto: number
  total: number
}

const erro = (msg: string): QuoteError => ({ ok: false, vazio: false, erro: msg })

export function passeioQuote({ data, caes, passeios }: PasseioInput, config: Config): PasseioQuote | QuoteError {
  if (!data) return { ok: false, vazio: true, erro: 'Preencha a data do atendimento.' }
  const dia = parseLocal(data, '00:00')
  if (!dia) return erro('Data inválida.')
  if (!Number.isInteger(caes) || caes < 1) return erro('Informe ao menos 1 cachorro.')
  if (!Number.isInteger(passeios) || passeios < 1) return erro('Informe ao menos 1 passeio.')

  // O desconto vale uma vez por passeio adicional, seja qual for o número de cachorros.
  const base = passeios * config.pasBase
  const adicionalCaes = passeios * (caes - 1) * config.pasAdicionalCao
  const desconto = (passeios - 1) * config.pasDesconto

  return {
    ok: true,
    data: dia,
    caes,
    passeios,
    feriado: holidaysFor(dia.getFullYear(), config.feriadosExtras).get(toKey(dia)),
    base,
    adicionalCaes,
    desconto,
    total: base + adicionalCaes - desconto,
  }
}
