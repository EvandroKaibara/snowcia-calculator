import styles from './NumberField.module.css'

interface Props {
  label: string
  value: number
  step?: number
  min?: number
  onChange: (value: number) => void
}

// Não controlado de propósito: o texto parcial ("50.") não pode ser sobrescrito enquanto a pessoa digita.
// O pai troca a `key` para repor os valores ao restaurar o padrão.
export default function NumberField({ label, value, step = 1, min = 0, onChange }: Props) {
  return (
    <label className={styles.label}>
      {label}
      <input
        type="number"
        inputMode="decimal"
        defaultValue={value}
        step={step}
        min={min}
        onChange={(e) => {
          const v = e.currentTarget.valueAsNumber
          if (Number.isFinite(v) && v >= min) onChange(v)
        }}
      />
    </label>
  )
}
