import type { DaycareForm as Form } from '../../hooks/useDaycareForm'
import type { Modalidade } from '../../lib/daycare'
import DateTimeField from '../DateTimeField/DateTimeField'
import NumberField from '../NumberField/NumberField'
import styles from '../StayForm/StayForm.module.css'

interface Props {
  form: Form
  onChange: <K extends keyof Form>(field: K, value: Form[K]) => void
}

export default function DaycareForm({ form, onChange }: Props) {
  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
      <label className={styles.pet}>
        Nome do(s) cachorro(s) (opcional)
        <input value={form.nomes} onChange={(e) => onChange('nomes', e.target.value)} autoComplete="off" />
      </label>
      <NumberField label="Quantidade de cachorros" value={form.caes} min={1} onChange={(v) => onChange('caes', Math.floor(v))} />
      <DateTimeField legend="Data do atendimento" date={form.data} onDate={(v) => onChange('data', v)} />
      <label className={styles.pet}>
        Entrada
        <input type="time" value={form.entradaHora} onChange={(e) => onChange('entradaHora', e.target.value)} required />
      </label>
      <label className={styles.pet}>
        Saída
        <input type="time" value={form.saidaHora} onChange={(e) => onChange('saidaHora', e.target.value)} required />
      </label>
      <label className={styles.pet}>
        Modalidade
        <select value={form.modalidade} onChange={(e) => onChange('modalidade', e.target.value as Modalidade)}>
          <option value="meio">Meio período</option>
          <option value="integral">Integral</option>
        </select>
      </label>
      <NumberField
        label="Passeios extras de 20 minutos"
        value={form.passeiosExtras}
        onChange={(v) => onChange('passeiosExtras', Math.floor(v))}
      />
      {form.passeiosExtras > 0 && (
        // A key refaz o campo não controlado quando o total de cachorros reajusta o valor.
        <NumberField
          key={form.caesPasseio}
          label="Cachorros nos passeios extras"
          value={form.caesPasseio}
          min={1}
          onChange={(v) => onChange('caesPasseio', Math.floor(v))}
        />
      )}
    </form>
  )
}
