import type { Config } from '../../config/defaults'
import type { DaycareQuote } from '../../lib/daycare'
import { formatBRL, formatDate, formatDuration, formatTime } from '../../lib/format'
import { buildDaycareMessage } from '../../lib/message'
import type { QuoteError } from '../../lib/pricing'
import CopyButton from '../CopyButton/CopyButton'
import PaymentSummary from '../PaymentSummary/PaymentSummary'
import styles from '../QuoteResult/QuoteResult.module.css'

interface Props {
  result: DaycareQuote | QuoteError
  nomes: string
  config: Config
}

export default function DaycareResult({ result, nomes, config }: Props) {
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
          <dt>Data</dt>
          <dd>{formatDate(result.data)}</dd>
        </div>
        <div>
          <dt>Horário</dt>
          <dd>
            {formatTime(result.entrada)} às {formatTime(result.saida)}
          </dd>
        </div>
        <div>
          <dt>Duração</dt>
          <dd>{formatDuration(result.minutos)}</dd>
        </div>
        <div>
          <dt>Modalidade</dt>
          <dd>{result.modalidade === 'meio' ? 'Meio período' : 'Integral'}</dd>
        </div>
        <div>
          <dt>Quantidade de cachorros</dt>
          <dd>{result.caes}</dd>
        </div>
        <div>
          <dt>Horas adicionais</dt>
          <dd>{result.horasExtras}</dd>
        </div>
        <div>
          <dt>Passeios</dt>
          <dd>
            {result.incluidos} incluído(s) + {result.passeiosExtras} extra(s)
          </dd>
        </div>
        {result.feriado && (
          <div>
            <dt>Feriado</dt>
            <dd>{result.feriado}</dd>
          </div>
        )}
      </dl>
      <PaymentSummary
        linhas={[
          ['Total', result.total],
          ['DayCare', result.base],
          ['Horas adicionais', result.horasExtrasValor],
          ['Passeios extras', result.passeiosValor],
          ['Adicional de feriado', result.taxaFeriado],
          [`Sinal de ${config.dcSinalPct}%`, result.sinal],
          ['Saldo restante', result.saldo],
        ]}
      />
      <CopyButton text={buildDaycareMessage(result, nomes, config)} />
    </section>
  )
}
