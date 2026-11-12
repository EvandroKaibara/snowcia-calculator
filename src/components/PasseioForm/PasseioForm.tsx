import type { PasseioForm as Form } from '../../hooks/usePasseioForm'
import DateTimeField from '../DateTimeField/DateTimeField'
import NumberField from '../NumberField/NumberField'
import styles from '../StayForm/StayForm.module.css'

interface Props {
  form: Form
  onChange: <K extends keyof Form>(field: K, value: Form[K]) => void
  onApplyAll: () => void
}

export default function PasseioForm({ form, onChange, onApplyAll }: Props) {
  const periodo = form.modo === 'periodo'
  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
      <label className={styles.pet}>
        Nome do(s) cachorro(s) (opcional)
        <input value={form.nomes} onChange={(e) => onChange('nomes', e.target.value)} autoComplete="off" />
      </label>
      <NumberField label="Quantidade de cachorros" value={form.caes} min={1} onChange={(v) => onChange('caes', Math.floor(v))} />
      <fieldset className={styles.modo}>
        <legend>Datas</legend>
        {(
          [
            ['unica', 'Data única'],
            ['periodo', 'Período'],
          ] as const
        ).map(([modo, nome]) => (
          <label key={modo}>
            <input type="radio" name="modo-passeio" checked={form.modo === modo} onChange={() => onChange('modo', modo)} />
            {nome}
          </label>
        ))}
      </fieldset>
      <DateTimeField
        legend={periodo ? 'Início do atendimento' : 'Data do atendimento'}
        date={form.inicioData}
        onDate={(v) => onChange('inicioData', v)}
      />
      {periodo && <DateTimeField legend="Término do atendimento" date={form.fimData} onDate={(v) => onChange('fimData', v)} />}
      <NumberField
        label={periodo ? 'Passeios por dia (padrão)' : 'Quantidade de passeios'}
        value={form.passeiosPorDia}
        onChange={(v) => onChange('passeiosPorDia', Math.floor(v))}
      />
      <NumberField
        label={periodo ? 'Limpezas / trocas de ração e água por dia (padrão)' : 'Limpezas / trocas de ração e água'}
        value={form.limpezasPorDia}
        onChange={(v) => onChange('limpezasPorDia', Math.floor(v))}
      />
      {periodo && (
        <button type="button" className={styles.apply} onClick={onApplyAll}>
          Aplicar a todos os dias
        </button>
      )}
    </form>
  )
}
