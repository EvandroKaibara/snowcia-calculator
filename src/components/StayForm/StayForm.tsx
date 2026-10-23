import type { StayForm as Form } from '../../hooks/useStayForm'
import DateTimeField from '../DateTimeField/DateTimeField'
import styles from './StayForm.module.css'

interface Props {
  form: Form
  onChange: (field: keyof Form, value: string) => void
}

export default function StayForm({ form, onChange }: Props) {
  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
      <label className={styles.pet}>
        Nome do pet (opcional)
        <input value={form.pet} onChange={(e) => onChange('pet', e.target.value)} autoComplete="off" />
      </label>
      <DateTimeField
        legend="Entrada"
        date={form.entradaData}
        time={form.entradaHora}
        onDate={(v) => onChange('entradaData', v)}
        onTime={(v) => onChange('entradaHora', v)}
      />
      <DateTimeField
        legend="Saída"
        date={form.saidaData}
        time={form.saidaHora}
        onDate={(v) => onChange('saidaData', v)}
        onTime={(v) => onChange('saidaHora', v)}
      />
    </form>
  )
}
