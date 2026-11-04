import type { Config } from '../config/defaults'
import { holidaysFor, toKey } from './holidays'
import { parseLocal, splitDeposit, type QuoteError } from './pricing'

export type Modalidade = 'meio' | 'integral'

export interface DaycareInput {
  data: string
  entradaHora: string
  saidaHora: string
  caes: number
  modalidade: Modalidade
  passeiosExtras: number
  caesPasseio: number
}

export interface DaycareQuote {
  ok: true
  data: Date
  entrada: Date
  saida: Date
  minutos: number
  modalidade: Modalidade
  caes: number
  incluidos: number
  horasExtras: number
  passeiosExtras: number
  caesPasseio: number
  feriado?: string
  base: number
  horasExtrasValor: number
  passeiosValor: number
  taxaFeriado: number
  total: number
  sinal: number
  saldo: number
}

const erro = (msg: string): QuoteError => ({ ok: false, vazio: false, erro: msg })

export function daycareQuote(input: DaycareInput, config: Config): DaycareQuote | QuoteError {
  const { data, entradaHora, saidaHora, caes, modalidade, passeiosExtras, caesPasseio } = input
  if (!data || !entradaHora || !saidaHora) {
    return { ok: false, vazio: true, erro: 'Preencha a data e os horários de entrada e de saída.' }
  }
  const entrada = parseLocal(data, entradaHora)
  const saida = parseLocal(data, saidaHora)
  if (!entrada || !saida) return erro('Data ou horário inválido.')
  const minutos = Math.round((saida.getTime() - entrada.getTime()) / 60000)
  if (minutos <= 0) return erro('A saída precisa ser depois da entrada.')
  if (!Number.isInteger(caes) || caes < 1) return erro('Informe ao menos 1 cachorro.')
  if (!Number.isInteger(passeiosExtras) || passeiosExtras < 0) return erro('Quantidade de passeios extras inválida.')
  if (passeiosExtras > 0 && (!Number.isInteger(caesPasseio) || caesPasseio < 1 || caesPasseio > caes)) {
    return erro('Os cachorros nos passeios extras devem ser de 1 até o total de cachorros.')
  }

  const meio = modalidade === 'meio'
  const limite = meio ? config.dcLimiteMeioMin : config.dcLimiteIntegralMin
  const horasExtras = Math.max(0, Math.ceil((minutos - limite) / 60))
  const feriado = holidaysFor(entrada.getFullYear(), config.feriadosExtras).get(toKey(entrada))

  const base = (meio ? config.dcMeio : config.dcIntegral) * caes
  const horasExtrasValor = horasExtras * config.dcHoraExtra * caes
  const passeiosValor = passeiosExtras * (config.dcPasseioExtra + (caesPasseio - 1) * config.dcPasseioExtraCao)
  const taxaFeriado = feriado ? config.dcFeriado * caes : 0
  const total = base + horasExtrasValor + (passeiosExtras ? passeiosValor : 0) + taxaFeriado

  return {
    ok: true,
    data: new Date(entrada.getFullYear(), entrada.getMonth(), entrada.getDate()),
    entrada,
    saida,
    minutos,
    modalidade,
    caes,
    incluidos: meio ? config.dcPasseiosMeio : config.dcPasseiosIntegral,
    horasExtras,
    passeiosExtras,
    caesPasseio,
    feriado,
    base,
    horasExtrasValor,
    passeiosValor: passeiosExtras ? passeiosValor : 0,
    taxaFeriado,
    total,
    ...splitDeposit(total, config.dcSinalPct),
  }
}
