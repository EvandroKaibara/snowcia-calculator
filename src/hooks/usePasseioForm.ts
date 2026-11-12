import { useCallback, useMemo, useState } from 'react'
import type { Config } from '../config/defaults'
import { passeioQuote, type PasseioDayEdit, type PasseioInput } from '../lib/passeio'

export interface PasseioForm extends PasseioInput {
  nomes: string
}

const EMPTY: PasseioForm = {
  nomes: '',
  modo: 'unica',
  inicioData: '',
  fimData: '',
  caes: 1,
  passeiosPorDia: 1,
  limpezasPorDia: 0,
  porData: {},
}

export function usePasseioForm(config: Config) {
  const [form, setForm] = useState<PasseioForm>(EMPTY)
  const setField = useCallback(<K extends keyof PasseioForm>(field: K, value: PasseioForm[K]) => {
    setForm((f) => ({ ...f, [field]: value }))
  }, [])
  const setDia = useCallback((data: string, edit: PasseioDayEdit) => {
    setForm((f) => ({ ...f, porData: { ...f.porData, [data]: { ...f.porData[data], ...edit } } }))
  }, [])
  // Sobrescreve passeios e limpezas de todos os dias; os horários digitados ficam.
  const aplicarATodos = useCallback(() => {
    setForm((f) => ({
      ...f,
      porData: Object.fromEntries(
        Object.entries(f.porData).map(([data, { horarios }]) => [data, { horarios }]),
      ),
    }))
  }, [])
  const result = useMemo(() => passeioQuote(form, config), [form, config])
  return { form, setField, setDia, aplicarATodos, result }
}
