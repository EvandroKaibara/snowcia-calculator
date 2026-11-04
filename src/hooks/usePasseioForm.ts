import { useCallback, useMemo, useState } from 'react'
import type { Config } from '../config/defaults'
import { passeioQuote, type PasseioInput } from '../lib/passeio'

export interface PasseioForm extends PasseioInput {
  nomes: string
}

const EMPTY: PasseioForm = { nomes: '', data: '', caes: 1, passeios: 1 }

export function usePasseioForm(config: Config) {
  const [form, setForm] = useState<PasseioForm>(EMPTY)
  const setField = useCallback(<K extends keyof PasseioForm>(field: K, value: PasseioForm[K]) => {
    setForm((f) => ({ ...f, [field]: value }))
  }, [])
  const result = useMemo(() => passeioQuote(form, config), [form, config])
  return { form, setField, result }
}
