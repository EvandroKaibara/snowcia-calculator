import { useCallback, useMemo, useState } from 'react'
import type { Config } from '../config/defaults'
import { passeioQuote, type PasseioInput } from '../lib/passeio'

export interface PasseioForm extends PasseioInput {
  nomes: string
}

const EMPTY: PasseioForm = { nomes: '', inicioData: '', fimData: '', caes: 1, passeiosPorDia: 1, passeiosPorData: {} }

export function usePasseioForm(config: Config) {
  const [form, setForm] = useState<PasseioForm>(EMPTY)
  const setField = useCallback(<K extends keyof PasseioForm>(field: K, value: PasseioForm[K]) => {
    // Mudar o padrão por dia vale para todos os dias: descarta os ajustes de dias avulsos.
    setForm((f) => ({ ...f, [field]: value, ...(field === 'passeiosPorDia' && { passeiosPorData: {} }) }))
  }, [])
  const setPasseiosDoDia = useCallback((data: string, n: number) => {
    setForm((f) => ({ ...f, passeiosPorData: { ...f.passeiosPorData, [data]: n } }))
  }, [])
  const { inicioData, fimData, caes, passeiosPorDia, passeiosPorData } = form
  const result = useMemo(
    () => passeioQuote({ inicioData, fimData, caes, passeiosPorDia, passeiosPorData }, config),
    [inicioData, fimData, caes, passeiosPorDia, passeiosPorData, config],
  )
  return { form, setField, setPasseiosDoDia, result }
}
