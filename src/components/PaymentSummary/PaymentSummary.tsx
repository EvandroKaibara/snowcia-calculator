import { formatBRL } from '../../lib/format'
import styles from './PaymentSummary.module.css'

interface Props {
  total: number
  sinal: number
  saldo: number
}

export default function PaymentSummary({ total, sinal, saldo }: Props) {
  return (
    <dl className={styles.box}>
      <div className={styles.total}>
        <dt>Total</dt>
        <dd>{formatBRL(total)}</dd>
      </div>
      <div>
        <dt>Sinal de 25%</dt>
        <dd>{formatBRL(sinal)}</dd>
      </div>
      <div>
        <dt>Saldo restante de 75%</dt>
        <dd>{formatBRL(saldo)}</dd>
      </div>
    </dl>
  )
}
