import { useId } from 'react'
import { parseLocal } from '../../lib/pricing'
import styles from './DateTimeField.module.css'

const diaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })
const mes = new Intl.DateTimeFormat('pt-BR', { month: 'long' })

interface Props {
  legend: string
  date: string
  time?: string // sem `onTime`, só a data é pedida
  onDate: (value: string) => void
  onTime?: (value: string) => void
}

export default function DateTimeField({ legend, date, time, onDate, onTime }: Props) {
  const id = useId()
  const dia = parseLocal(date, '00:00')

  return (
    <fieldset className={styles.field}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.row} style={onTime ? undefined : { gridTemplateColumns: '1fr' }}>
        <label htmlFor={`${id}-d`} className={styles.label}>
          Data
          <input id={`${id}-d`} type="date" value={date} onChange={(e) => onDate(e.target.value)} required />
        </label>
        {onTime && (
          <label htmlFor={`${id}-t`} className={styles.label}>
            Horário
            <input id={`${id}-t`} type="time" value={time} onChange={(e) => onTime(e.target.value)} required />
          </label>
        )}
      </div>
      <p className={styles.caption} aria-live="polite">
        {dia ? `${diaSemana.format(dia)} · ${mes.format(dia)}` : ' '}
      </p>
    </fieldset>
  )
}
