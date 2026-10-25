import { useCallback, useState } from 'react'
import type { CatsitterInput } from '../lib/catsitter'

export interface CatsitterForm extends CatsitterInput {
  nomes: string
}

const EMPTY: CatsitterForm = { nomes: '', inicioData: '', fimData: '', gatos: 1, extrasPorDia: 0, extrasPorData: {} }

export function useCatsitterForm() {
  const [form, setForm] = useState<CatsitterForm>(EMPTY)
  const setField = useCallback(<K extends keyof CatsitterForm>(field: K, value: CatsitterForm[K]) => {
    // Mudar o padrão de visitas por dia vale para todos os dias: descarta os ajustes de dias avulsos.
    setForm((f) => ({ ...f, [field]: value, ...(field === 'extrasPorDia' && { extrasPorData: {} }) }))
  }, [])
  const setExtrasDoDia = useCallback((data: string, n: number) => {
    setForm((f) => ({ ...f, extrasPorData: { ...f.extrasPorData, [data]: n } }))
  }, [])
  return { form, setField, setExtrasDoDia }
}
