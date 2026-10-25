import { formatBRL } from '../../lib/format'
import styles from './PaymentSummary.module.css'

// A primeira linha é o total e ganha destaque.
export default function PaymentSummary({ linhas }: { linhas: [string, number][] }) {
  return (
    <dl className={styles.box}>
      {linhas.map(([rotulo, centavos], i) => (
        <div key={rotulo} className={i === 0 ? styles.total : undefined}>
          <dt>{rotulo}</dt>
          <dd>{formatBRL(centavos)}</dd>
        </div>
      ))}
    </dl>
  )
}
