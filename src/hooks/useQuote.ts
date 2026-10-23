import { useMemo } from 'react'
import type { Config } from '../config/defaults'
import { quote } from '../lib/pricing'
import type { StayForm } from './useStayForm'

export function useQuote(form: StayForm, config: Config) {
  const { entradaData, entradaHora, saidaData, saidaHora } = form
  return useMemo(
    () => quote({ entradaData, entradaHora, saidaData, saidaHora }, config),
    [entradaData, entradaHora, saidaData, saidaHora, config],
  )
}
