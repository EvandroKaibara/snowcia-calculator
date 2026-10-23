import { useCallback, useState } from 'react'
import type { StayInput } from '../lib/pricing'

export interface StayForm extends StayInput {
  pet: string
}

const EMPTY: StayForm = { pet: '', entradaData: '', entradaHora: '', saidaData: '', saidaHora: '' }

export function useStayForm() {
  const [form, setForm] = useState<StayForm>(EMPTY)
  const setField = useCallback((field: keyof StayForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
  }, [])
  return { form, setField }
}
