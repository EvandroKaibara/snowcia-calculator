export interface ExtraHoliday {
  data: string // AAAA-MM-DD
  nome: string
}

// Valores em centavos, para nunca somar ponto flutuante.
export interface Config {
  semana: number
  fimDeSemana: number
  altaTemporada: number
  feriado: number
  promo: number
  limitePromo: number
  duracaoMin: number
  toleranciaMin: number
  feriadosExtras: ExtraHoliday[]
}

export const DEFAULT_CONFIG: Config = {
  semana: 5000,
  fimDeSemana: 6000,
  altaTemporada: 6000,
  feriado: 7500,
  promo: 5000,
  limitePromo: 6,
  duracaoMin: 24 * 60,
  toleranciaMin: 60,
  feriadosExtras: [],
}
