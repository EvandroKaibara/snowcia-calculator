import type { PasseioForm as Form } from '../../hooks/usePasseioForm'
import DateTimeField from '../DateTimeField/DateTimeField'
import NumberField from '../NumberField/NumberField'
import styles from '../StayForm/StayForm.module.css'

interface Props {
  form: Form
  onChange: <K extends keyof Form>(field: K, value: Form[K]) => void
}

export default function PasseioForm({ form, onChange }: Props) {
  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
      <label className={styles.pet}>
        Nome do(s) cachorro(s) (opcional)
        <input value={form.nomes} onChange={(e) => onChange('nomes', e.target.value)} autoComplete="off" />
      </label>
      <NumberField label="Quantidade de cachorros" value={form.caes} min={1} onChange={(v) => onChange('caes', Math.floor(v))} />
      <DateTimeField legend="Data do atendimento" date={form.data} onDate={(v) => onChange('data', v)} />
      <NumberField label="Quantidade de passeios" value={form.passeios} min={1} onChange={(v) => onChange('passeios', Math.floor(v))} />
    </form>
  )
}
