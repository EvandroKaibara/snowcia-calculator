import { useState } from 'react'
import styles from './App.module.css'
import CatsitterForm from './components/CatsitterForm/CatsitterForm'
import CatsitterResult from './components/CatsitterResult/CatsitterResult'
import Header from './components/Header/Header'
import QuoteResult from './components/QuoteResult/QuoteResult'
import SettingsPanel from './components/SettingsPanel/SettingsPanel'
import StayForm from './components/StayForm/StayForm'
import { useCatsitterForm } from './hooks/useCatsitterForm'
import { useCatsitterQuote } from './hooks/useCatsitterQuote'
import { useConfig } from './hooks/useConfig'
import { useQuote } from './hooks/useQuote'
import { useStayForm } from './hooks/useStayForm'

const ABAS = [
  ['hospedagem', 'Hospedagem', 'Calculadora de hospedagem'],
  ['catsitter', 'Catsitter', 'Calculadora de Catsitter'],
] as const

export default function App() {
  const { config, update, reset } = useConfig()
  const { form, setField } = useStayForm()
  const result = useQuote(form, config)
  const cat = useCatsitterForm()
  const catResult = useCatsitterQuote(cat.form, config)
  // Os dois formulários vivem aqui para que trocar de aba não apague o que foi preenchido.
  const [aba, setAba] = useState<(typeof ABAS)[number][0]>('hospedagem')

  return (
    <>
      <Header title={ABAS.find(([id]) => id === aba)![2]} />
      <div role="tablist" aria-label="Serviço" className={styles.tabs}>
        {ABAS.map(([id, nome]) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`aba-${id}`}
            aria-selected={aba === id}
            aria-controls="painel"
            className={styles.tab}
            onClick={() => setAba(id)}
          >
            {nome}
          </button>
        ))}
      </div>
      <main id="painel" role="tabpanel" aria-labelledby={`aba-${aba}`} style={{ display: 'grid', gap: 16 }}>
        {aba === 'hospedagem' ? (
          <>
            <StayForm form={form} onChange={setField} />
            <QuoteResult result={result} pet={form.pet} config={config} />
          </>
        ) : (
          <>
            <CatsitterForm form={cat.form} onChange={cat.setField} />
            <CatsitterResult result={catResult} nomes={cat.form.nomes} config={config} onExtras={cat.setExtrasDoDia} />
          </>
        )}
      </main>
      <SettingsPanel config={config} onChange={update} onReset={reset} />
    </>
  )
}
