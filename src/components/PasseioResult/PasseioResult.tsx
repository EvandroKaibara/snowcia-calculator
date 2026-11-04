import type { Config } from '../../config/defaults'
import { formatBRL, formatDate, formatDayMonth } from '../../lib/format'
import { buildPasseioMessage } from '../../lib/message'
import type { PasseioQuote } from '../../lib/passeio'
import type { Daily, QuoteError } from '../../lib/pricing'
import CopyButton from '../CopyButton/CopyButton'
import DailyList from '../DailyList/DailyList'
import PaymentSummary from '../PaymentSummary/PaymentSummary'
import styles from '../QuoteResult/QuoteResult.module.css'

interface Props {
  result: PasseioQuote | QuoteError
  nomes: string
  config: Config
  onPasseios: (data: string, n: number) => void
}

export default function PasseioResult({ result, nomes, config, onPasseios }: Props) {
  if (!result.ok) {
    return (
      <p role={result.vazio ? 'status' : 'alert'} className={result.vazio ? styles.hint : styles.error}>
        {result.erro}
      </p>
    )
  }

  const nome = nomes.trim()
  const atendidos = result.dias.filter((d) => d.passeios > 0)
  const feriados = atendidos.filter((d) => d.feriado)
  const diarias: Daily[] = result.dias.map((d) => ({
    inicio: d.data,
    classe: d.feriado ? 'feriado' : 'semana',
    rotulo: d.feriado ? `Feriado: ${d.feriado}` : d.passeios ? 'Dia comum' : 'Sem passeio',
    centavos: d.subtotal,
  }))

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
          <dt>Período</dt>
          <dd>
            {formatDate(result.inicio)} a {formatDate(result.fim)}
          </dd>
        </div>
        <div>
          <dt>Dias de atendimento</dt>
          <dd>{result.diasAtendidos}</dd>
        </div>
        <div>
          <dt>Total de passeios</dt>
          <dd>{result.passeios}</dd>
        </div>
        <div>
          <dt>Valor de 1 passeio</dt>
          <dd>{formatBRL(config.pasBase + (result.caes - 1) * config.pasAdicionalCao)}</dd>
        </div>
        <div>
          <dt>Feriados</dt>
          <dd>{feriados.length ? feriados.map((d) => formatDayMonth(d.data)).join(', ') : 'Nenhum'}</dd>
        </div>
      </dl>

      <DailyList
        diarias={diarias}
        extra={(i) => (
          <>
            Passeios
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={result.dias[i].passeios}
              aria-label={`Passeios em ${formatDayMonth(result.dias[i].data)}`}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => {
                const v = e.currentTarget.valueAsNumber
                if (Number.isFinite(v) && v >= 0) onPasseios(result.dias[i].chave, Math.floor(v))
              }}
            />
          </>
        )}
      />
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
