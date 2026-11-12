import type { Config } from '../../config/defaults'
import { formatBRL, formatDate, formatDayMonth } from '../../lib/format'
import { buildPasseioMessage } from '../../lib/message'
import { describeDay, type PasseioDayEdit, type PasseioQuote } from '../../lib/passeio'
import type { Daily, QuoteError } from '../../lib/pricing'
import CopyButton from '../CopyButton/CopyButton'
import DailyList from '../DailyList/DailyList'
import PaymentSummary from '../PaymentSummary/PaymentSummary'
import styles from '../QuoteResult/QuoteResult.module.css'

interface Props {
  result: PasseioQuote | QuoteError
  nomes: string
  config: Config
  onDay: (data: string, edit: PasseioDayEdit) => void
}

export default function PasseioResult({ result, nomes, config, onDay }: Props) {
  if (!result.ok) {
    return (
      <p role={result.vazio ? 'status' : 'alert'} className={result.vazio ? styles.hint : styles.error}>
        {result.erro}
      </p>
    )
  }

  const nome = nomes.trim()
  const periodo = result.modo === 'periodo'
  const feriado = result.dias[0].feriado
  const diarias: Daily[] = result.dias.map((d) => ({
    inicio: d.data,
    classe: d.feriado ? 'feriado' : 'semana',
    rotulo: d.feriado ? `Feriado: ${d.feriado} (sem taxa) · ${describeDay(d)}` : describeDay(d),
    centavos: d.subtotal,
  }))

  const numero = (i: number, campo: 'passeios' | 'limpezas', rotulo: string) => (
    <label>
      {rotulo}
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={result.dias[i][campo]}
        aria-label={`${rotulo} em ${formatDayMonth(result.dias[i].data)}`}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          const v = e.currentTarget.valueAsNumber
          if (Number.isFinite(v) && v >= 0) onDay(result.dias[i].chave, { [campo]: Math.floor(v) })
        }}
      />
    </label>
  )

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
          <dt>{periodo ? 'Período' : 'Data'}</dt>
          <dd>{periodo ? `${formatDate(result.inicio)} a ${formatDate(result.fim)}` : formatDate(result.inicio)}</dd>
        </div>
        {periodo && (
          <div>
            <dt>Dias com atendimento</dt>
            <dd>{result.diasComAtendimento}</dd>
          </div>
        )}
        <div>
          <dt>Total de passeios</dt>
          <dd>{result.passeios}</dd>
        </div>
        <div>
          <dt>Total de limpezas / trocas</dt>
          <dd>{result.limpezas}</dd>
        </div>
        <div>
          <dt>Valor de 1 passeio</dt>
          <dd>{formatBRL(config.pasBase + (result.caes - 1) * config.pasAdicionalCao)}</dd>
        </div>
        {!periodo && feriado && (
          <div>
            <dt>Feriado</dt>
            <dd>{feriado} (sem taxa)</dd>
          </div>
        )}
      </dl>
      {periodo && (
        <DailyList
          diarias={diarias}
          extra={(i) => (
            <>
              {numero(i, 'passeios', 'Passeios')}
              {numero(i, 'limpezas', 'Limpezas')}
              <label>
                Horários
                <input
                  type="text"
                  value={result.dias[i].horarios}
                  placeholder="opcional"
                  aria-label={`Horários em ${formatDayMonth(result.dias[i].data)}`}
                  onChange={(e) => onDay(result.dias[i].chave, { horarios: e.currentTarget.value })}
                />
              </label>
            </>
          )}
        />
      )}
      <PaymentSummary
        linhas={[
          ['Valor total', result.total],
          ['Passeios (valor bruto)', result.bruto],
          ['Descontos por passeios adicionais', -result.desconto],
          ['Passeios (valor líquido)', result.liquido],
          ['Limpeza / troca de ração e água', result.limpezaValor],
        ]}
      />
      <CopyButton text={buildPasseioMessage(result, nomes)} />
    </section>
  )
}
