import { formatBRL, formatDayMonth } from '../../lib/format'
import type { Daily } from '../../lib/pricing'
import styles from './DailyList.module.css'

const diaCurto = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })

export default function DailyList({ diarias }: { diarias: Daily[] }) {
  return (
    <ol className={styles.list}>
      {diarias.map((d, i) => (
        <li key={i} className={`${styles.item} ${styles[d.classe]}`}>
          <span className={styles.date}>
            {formatDayMonth(d.inicio)} <small>{diaCurto.format(d.inicio).replace('.', '')}</small>
          </span>
          <span className={styles.label}>{d.rotulo}</span>
          <strong>{formatBRL(d.centavos)}</strong>
        </li>
      ))}
    </ol>
  )
}
