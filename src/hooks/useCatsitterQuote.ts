import { useMemo } from 'react'
import type { Config } from '../config/defaults'
import { catsitterQuote } from '../lib/catsitter'
import type { CatsitterForm } from './useCatsitterForm'

export function useCatsitterQuote(form: CatsitterForm, config: Config) {
  const { inicioData, fimData, gatos, extrasPorDia, extrasPorData } = form
  return useMemo(
    () => catsitterQuote({ inicioData, fimData, gatos, extrasPorDia, extrasPorData }, config),
    [inicioData, fimData, gatos, extrasPorDia, extrasPorData, config],
  )
}
