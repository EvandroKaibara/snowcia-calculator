import type { Config } from '../../config/defaults'
import { formatBRL, formatDate } from '../../lib/format'
import { buildPasseioMessage } from '../../lib/message'
import type { PasseioQuote } from '../../lib/passeio'
import type { QuoteError } from '../../lib/pricing'
import CopyButton from '../CopyButton/CopyButton'
import PaymentSummary from '../PaymentSummary/PaymentSummary'
import styles from '../QuoteResult/QuoteResult.module.css'

interface Props {
  result: PasseioQuote | QuoteError
  nomes: string
  config: Config
}

export default function PasseioResult({ result, nomes, config }: Props) {
  if (!result.ok) {
    return (
      <p role={result.vazio ? 'status' : 'alert'} className={result.vazio ? styles.hint : styles.error}>
        {result.erro}
      </p>
    )
  }

  const nome = nomes.trim()
  return (
    <section className={styles.card} aria-label="Orçamento">
      <dl className={styles.summary}>
        {nome && (
          <div>
            <dt>Cachorro(s)</dt>
            <dd>{nome}</dd>
          </div>
        )}
        <div>
          <dt>Quantidade de cachorros</dt>
          <dd>{result.caes}</dd>
        </div>
        <div>
          <dt>Data</dt>
          <dd>{formatDate(result.data)}</dd>
        </div>
        <div>
          <dt>Total de passeios</dt>
          <dd>{result.passeios}</dd>
        </div>
        <div>
          <dt>Valor de 1 passeio</dt>
          <dd>{formatBRL(config.pasBase + (result.caes - 1) * config.pasAdicionalCao)}</dd>
        </div>
        {result.feriado && (
          <div>
            <dt>Feriado</dt>
            <dd>{result.feriado} (sem taxa)</dd>
          </div>
        )}
      </dl>
      <PaymentSummary
        linhas={[
          ['Valor total', result.total],
          ['Passeios-base', result.base],
          ['Adicionais por cachorro', result.adicionalCaes],
          ['Descontos por passeios adicionais', -result.desconto],
        ]}
      />
      <CopyButton text={buildPasseioMessage(result, nomes)} />
    </section>
  )
}
