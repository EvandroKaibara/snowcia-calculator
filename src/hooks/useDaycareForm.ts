import { useCallback, useMemo, useState } from 'react'
import type { Config } from '../config/defaults'
import { daycareQuote, type DaycareInput } from '../lib/daycare'

export interface DaycareForm extends DaycareInput {
  nomes: string
}

const EMPTY: DaycareForm = {
  nomes: '',
  data: '',
  entradaHora: '',
  saidaHora: '',
  caes: 1,
  modalidade: 'meio',
  passeiosExtras: 0,
  caesPasseio: 1,
}

export function useDaycareForm(config: Config) {
  const [form, setForm] = useState<DaycareForm>(EMPTY)
  const setField = useCallback(<K extends keyof DaycareForm>(field: K, value: DaycareForm[K]) => {
    setForm((f) => {
      const next = { ...f, [field]: value }
      // Os passeios extras acompanham o total de cachorros, a menos que a pessoa os tenha reduzido.
      if (field === 'caes') {
        const n = value as number
        next.caesPasseio = f.caesPasseio === f.caes || f.caesPasseio > n ? n : f.caesPasseio
      }
      return next
    })
  }, [])
  const result = useMemo(() => daycareQuote(form, config), [form, config])
  return { form, setField, result }
}
