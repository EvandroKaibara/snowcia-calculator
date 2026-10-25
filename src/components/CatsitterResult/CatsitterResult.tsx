import type { Config } from '../../config/defaults'
import type { CatsitterQuote } from '../../lib/catsitter'
import { formatBRL, formatDate, formatDayMonth } from '../../lib/format'
import { buildCatsitterMessage } from '../../lib/message'
import type { Daily, QuoteError } from '../../lib/pricing'
import CopyButton from '../CopyButton/CopyButton'
import DailyList from '../DailyList/DailyList'
import PaymentSummary from '../PaymentSummary/PaymentSummary'
import styles from '../QuoteResult/QuoteResult.module.css'

interface Props {
  result: CatsitterQuote | QuoteError
  nomes: string
  config: Config
  onExtras: (data: string, n: number) => void
}

export default function CatsitterResult({ result, nomes, config, onExtras }: Props) {
  if (!result.ok) {
    return (
      <p role={result.vazio ? 'status' : 'alert'} className={result.vazio ? styles.hint : styles.error}>
        {result.erro}
      </p>
    )
  }

  const nome = nomes.trim()
  const feriados = result.dias.filter((d) => d.feriado)
  const diarias: Daily[] = result.dias.map((d) => ({
    inicio: d.data,
    classe: d.feriado ? 'feriado' : 'semana',
    rotulo: d.feriado ? `Feriado: ${d.feriado}` : 'Dia comum',
    centavos: d.subtotal,
  }))

  return (
    <section className={styles.card} aria-label="Orçamento">
      <dl className={styles.summary}>
        {nome && (
          <div>
            <dt>Gato(s)</dt>
            <dd>{nome}</dd>
          </div>
        )}
        <div>
          <dt>Quantidade de gatos</dt>
          <dd>{result.gatos}</dd>
        </div>
        <div>
          <dt>Período</dt>
          <dd>
            {formatDate(result.inicio)} a {formatDate(result.fim)}
          </dd>
        </div>
        <div>
          <dt>Dias de serviço</dt>
          <dd>{result.n}</dd>
        </div>
        <div>
          <dt>Valor por dia (sem adicionais)</dt>
          <dd>{formatBRL(config.catBase + (result.gatos - 1) * config.catAdicionalGato)}</dd>
        </div>
        <div>
          <dt>Visitas incluídas</dt>
          <dd>{config.catVisitasIncluidas} por dia</dd>
        </div>
        <div>
          <dt>Visitas adicionais</dt>
          <dd>{result.visitasExtras}</dd>
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
            Visitas extras
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={result.dias[i].extras}
              aria-label={`Visitas adicionais em ${formatDayMonth(result.dias[i].data)}`}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => {
                const v = e.currentTarget.valueAsNumber
                if (Number.isFinite(v) && v >= 0) onExtras(result.dias[i].chave, Math.floor(v))
              }}
            />
          </>
        )}
      />
      <PaymentSummary
        linhas={[
          ['Valor total', result.total],
          ['Serviço-base', result.base],
          ['Adicionais por gatos', result.adicionalGatos],
          ['Visitas adicionais', result.visitas],
          ['Taxas de feriado', result.feriados],
        ]}
      />
      <CopyButton text={buildCatsitterMessage(result, nomes, config)} />
    </section>
  )
}
