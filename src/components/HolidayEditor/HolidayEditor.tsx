import { useState } from 'react'
import type { ExtraHoliday } from '../../config/defaults'
import styles from './HolidayEditor.module.css'

interface Props {
  extras: ExtraHoliday[]
  onChange: (extras: ExtraHoliday[]) => void
}

const formatBR = (iso: string) => iso.split('-').reverse().join('/')

export default function HolidayEditor({ extras, onChange }: Props) {
  const [data, setData] = useState('')
  const [nome, setNome] = useState('')

  const add = () => {
    if (!data || !nome.trim()) return
    // Mesma data substitui a anterior em vez de duplicar.
    onChange([...extras.filter((x) => x.data !== data), { data, nome: nome.trim() }].sort((a, b) => a.data.localeCompare(b.data)))
    setData('')
    setNome('')
  }

  return (
    <fieldset className={styles.box}>
      <legend>Feriados e datas especiais</legend>
      <p className={styles.help}>
        Os feriados nacionais, de SP e da capital já vêm prontos. Cadastre aqui uma data extra ou corrija o nome de uma existente.
      </p>
      <div className={styles.form}>
        <input type="date" value={data} onChange={(e) => setData(e.target.value)} aria-label="Data do feriado" />
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" aria-label="Nome do feriado" />
        <button type="button" onClick={add} disabled={!data || !nome.trim()}>
          Adicionar
        </button>
      </div>
      <ul className={styles.list}>
        {extras.map((x) => (
          <li key={x.data}>
            <span>
              {formatBR(x.data)} · {x.nome}
            </span>
            <button
              type="button"
              className={styles.remove}
              aria-label={`Remover ${x.nome}`}
              onClick={() => onChange(extras.filter((e) => e.data !== x.data))}
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
    </fieldset>
  )
}
