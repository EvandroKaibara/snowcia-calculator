import type { Config } from '../../config/defaults'
import { formatBRL, formatDateTime, formatDuration } from '../../lib/format'
import { buildMessage } from '../../lib/message'
import type { Quote, QuoteError } from '../../lib/pricing'
import CopyButton from '../CopyButton/CopyButton'
import DailyList from '../DailyList/DailyList'
import PaymentSummary from '../PaymentSummary/PaymentSummary'
import styles from './QuoteResult.module.css'

interface Props {
  result: Quote | QuoteError
  pet: string
  config: Config
}

export default function QuoteResult({ result, pet, config }: Props) {
  if (!result.ok) {
    return (
      <p role={result.vazio ? 'status' : 'alert'} className={result.vazio ? styles.hint : styles.error}>
        {result.erro}
      </p>
    )
  }

  const nome = pet.trim()
  return (
    <section className={styles.card} aria-label="Orçamento">
      <dl className={styles.summary}>
        {nome && (
          <div>
            <dt>Pet</dt>
            <dd>{nome}</dd>
          </div>
        )}
        <div>
          <dt>Entrada</dt>
          <dd>{formatDateTime(result.entrada)}</dd>
        </div>
        <div>
          <dt>Saída</dt>
          <dd>{formatDateTime(result.saida)}</dd>
        </div>
        <div>
          <dt>Duração</dt>
          <dd>{formatDuration(result.minutos)}</dd>
        </div>
        <div>
          <dt>Diárias cobradas</dt>
          <dd>{result.n}</dd>
        </div>
      </dl>

      {result.promoAplicada && (
        <p className={styles.promo}>
          Promoção aplicada: acima de {config.limitePromo} diárias, os períodos comuns saem a {formatBRL(config.promo)}.
        </p>
      )}

      <DailyList diarias={result.diarias} />
      <PaymentSummary
        linhas={[
          ['Total', result.total],
          ['Sinal de 50%', result.sinal],
          ['Saldo restante de 75%', result.saldo],
        ]}
      />
      <CopyButton text={buildMessage(result, pet, config)} />
    </section>
  )
}
