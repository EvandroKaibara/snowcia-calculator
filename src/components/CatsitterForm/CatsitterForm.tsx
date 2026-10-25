import type { CatsitterForm as Form } from '../../hooks/useCatsitterForm'
import DateTimeField from '../DateTimeField/DateTimeField'
import NumberField from '../NumberField/NumberField'
import styles from '../StayForm/StayForm.module.css'

interface Props {
  form: Form
  onChange: <K extends keyof Form>(field: K, value: Form[K]) => void
}

export default function CatsitterForm({ form, onChange }: Props) {
  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
      <label className={styles.pet}>
        Nome do(s) gato(s) (opcional)
        <input value={form.nomes} onChange={(e) => onChange('nomes', e.target.value)} autoComplete="off" />
      </label>
      <NumberField label="Quantidade de gatos" value={form.gatos} min={1} onChange={(v) => onChange('gatos', Math.floor(v))} />
      <DateTimeField legend="Início do serviço" date={form.inicioData} onDate={(v) => onChange('inicioData', v)} />
      <DateTimeField legend="Término do serviço" date={form.fimData} onDate={(v) => onChange('fimData', v)} />
      <NumberField
        label="Visitas adicionais por dia (além das 2 incluídas)"
        value={form.extrasPorDia}
        onChange={(v) => onChange('extrasPorDia', Math.floor(v))}
      />
    </form>
  )
}
