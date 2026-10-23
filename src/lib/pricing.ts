import type { Config } from '../config/defaults'
import { holidaysFor, toKey } from './holidays'

export type Classe = 'feriado' | 'altaTemporada' | 'promo' | 'fimDeSemana' | 'semana'

export interface StayInput {
  entradaData: string
  entradaHora: string
  saidaData: string
  saidaHora: string
}

export interface Daily {
  inicio: Date
  classe: Classe
  rotulo: string
  centavos: number
}

export interface Quote {
  ok: true
  entrada: Date
  saida: Date
  minutos: number
  n: number
  diarias: Daily[]
  promoAplicada: boolean
  total: number
  sinal: number
  saldo: number
}

export interface QuoteError {
  ok: false
  erro: string
  vazio: boolean // campos ainda em branco: a tela mostra uma dica, não um erro
}

const MAX_DIARIAS = 365

export function parseLocal(data: string, hora: string): Date | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data)
  const t = /^(\d{2}):(\d{2})$/.exec(hora)
  if (!d || !t) return null
  const [y, m, day, h, min] = [d[1], d[2], d[3], t[1], t[2]].map(Number)
  const date = new Date(y, m - 1, day, h, min)
  const igual = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === day
  return igual && h < 24 && min < 60 ? date : null
}

export function countDailies(minutos: number, c: Pick<Config, 'duracaoMin' | 'toleranciaMin'>): number {
  return Math.max(1, Math.ceil((minutos - c.toleranciaMin) / Math.max(1, c.duracaoMin)))
}

export function splitDeposit(total: number) {
  const sinal = Math.round(total * 0.25)
  return { sinal, saldo: total - sinal }
}

function classify(inicio: Date, promo: boolean, feriados: Map<string, string>, c: Config): Daily {
  const nome = feriados.get(toKey(inicio))
  const mes = inicio.getMonth()
  const dia = inicio.getDay()
  if (nome) return { inicio, classe: 'feriado', rotulo: `Feriado: ${nome}`, centavos: c.feriado }
  if (mes === 11 || mes === 0) {
    return { inicio, classe: 'altaTemporada', rotulo: mes === 11 ? 'Dezembro' : 'Janeiro', centavos: c.altaTemporada }
  }
  if (promo) return { inicio, classe: 'promo', rotulo: 'Promoção', centavos: c.promo }
  if (dia === 0 || dia >= 5) return { inicio, classe: 'fimDeSemana', rotulo: 'Sex a dom', centavos: c.fimDeSemana }
  return { inicio, classe: 'semana', rotulo: 'Seg a qui', centavos: c.semana }
}

export function quote(input: StayInput, config: Config): Quote | QuoteError {
  const { entradaData, entradaHora, saidaData, saidaHora } = input
  if (!entradaData || !entradaHora || !saidaData || !saidaHora) {
    return { ok: false, vazio: true, erro: 'Preencha data e horário de entrada e de saída.' }
  }
  const entrada = parseLocal(entradaData, entradaHora)
  const saida = parseLocal(saidaData, saidaHora)
  if (!entrada || !saida) return { ok: false, vazio: false, erro: 'Data ou horário inválido.' }

  const minutos = Math.round((saida.getTime() - entrada.getTime()) / 60000)
  if (minutos <= 0) return { ok: false, vazio: false, erro: 'A saída precisa ser depois da entrada.' }

  const n = countDailies(minutos, config)
  if (n > MAX_DIARIAS) return { ok: false, vazio: false, erro: `O limite é de ${MAX_DIARIAS} diárias por orçamento.` }

  const feriados = new Map<string, string>()
  for (let y = entrada.getFullYear(); y <= saida.getFullYear(); y++) {
    holidaysFor(y, config.feriadosExtras).forEach((nome, data) => feriados.set(data, nome))
  }

  const promo = n > config.limitePromo
  // shortcut: soma milissegundos fixos, correto sem horário de verão (Brasil não usa desde 2019); revisar se isso mudar.
  const diarias = Array.from({ length: n }, (_, i) =>
    classify(new Date(entrada.getTime() + i * config.duracaoMin * 60000), promo, feriados, config),
  )
  const total = diarias.reduce((soma, d) => soma + d.centavos, 0)

  return {
    ok: true,
    entrada,
    saida,
    minutos,
    n,
    diarias,
    promoAplicada: diarias.some((d) => d.classe === 'promo'),
    total,
    ...splitDeposit(total),
  }
}
