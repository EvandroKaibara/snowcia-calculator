import { useState } from 'react'
import type { Config } from '../../config/defaults'
import HolidayEditor from '../HolidayEditor/HolidayEditor'
import NumberField from '../NumberField/NumberField'
import styles from './SettingsPanel.module.css'

interface Props {
  config: Config
  onChange: <K extends keyof Config>(key: K, value: Config[K]) => void
  onReset: () => void
}

type Tarifa = 'semana' | 'fimDeSemana' | 'altaTemporada' | 'feriado' | 'promo' | 'catBase' | 'catAdicionalGato' | 'catVisitaExtra' | 'catFeriado'

const TARIFAS: [Tarifa, string][] = [
  ['semana', 'Segunda a quinta (R$)'],
  ['fimDeSemana', 'Sexta a domingo (R$)'],
  ['altaTemporada', 'Dezembro e janeiro (R$)'],
  ['feriado', 'Feriados (R$)'],
  ['promo', 'Valor promocional (R$)'],
]

const CAT_TARIFAS: [Tarifa, string][] = [
  ['catBase', 'Valor-base, 1 gato (R$)'],
  ['catAdicionalGato', 'Adicional por gato (R$)'],
  ['catVisitaExtra', 'Visita adicional (R$)'],
  ['catFeriado', 'Taxa de feriado por dia (R$)'],
]

export default function SettingsPanel({ config, onChange, onReset }: Props) {
  // Trocar a key refaz os campos não controlados com os valores padrão.
  const [nonce, setNonce] = useState(0)
  const campos = (lista: [Tarifa, string][]) =>
    lista.map(([campo, label]) => (
      <NumberField
        key={campo}
        label={label}
        value={config[campo] / 100}
        step={0.01}
        onChange={(v) => onChange(campo, Math.round(v * 100))}
      />
    ))

  return (
    <details className={styles.panel}>
      <summary className={styles.summary}>Configurações de preços</summary>
      <div className={styles.body} key={nonce}>
        <div className={styles.grid}>
          <h3 className={styles.group}>Hospedagem</h3>
          {campos(TARIFAS)}
          <NumberField
            label="Promoção acima de (diárias)"
            value={config.limitePromo}
            onChange={(v) => onChange('limitePromo', Math.floor(v))}
          />
          <NumberField
            label="Duração da diária (min)"
            value={config.duracaoMin}
            min={1}
            onChange={(v) => onChange('duracaoMin', Math.floor(v))}
          />
          <NumberField
            label="Tolerância de saída (min)"
            value={config.toleranciaMin}
            onChange={(v) => onChange('toleranciaMin', Math.floor(v))}
          />
          <h3 className={styles.group}>Catsitter</h3>
          {campos(CAT_TARIFAS)}
          <NumberField
            label="Visitas incluídas por dia"
            value={config.catVisitasIncluidas}
            onChange={(v) => onChange('catVisitasIncluidas', Math.floor(v))}
          />
        </div>
        <HolidayEditor extras={config.feriadosExtras} onChange={(x) => onChange('feriadosExtras', x)} />
        <button
          type="button"
          className={styles.reset}
          onClick={() => {
            onReset()
            setNonce((n) => n + 1)
          }}
        >
          Restaurar padrão
        </button>
        <p className={styles.note}>As alterações ficam salvas neste aparelho.</p>
      </div>
    </details>
  )
}
