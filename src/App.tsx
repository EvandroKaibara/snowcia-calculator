import Header from './components/Header/Header'
import QuoteResult from './components/QuoteResult/QuoteResult'
import SettingsPanel from './components/SettingsPanel/SettingsPanel'
import StayForm from './components/StayForm/StayForm'
import { useConfig } from './hooks/useConfig'
import { useQuote } from './hooks/useQuote'
import { useStayForm } from './hooks/useStayForm'

export default function App() {
  const { config, update, reset } = useConfig()
  const { form, setField } = useStayForm()
  const result = useQuote(form, config)

  return (
    <>
      <Header />
      <main style={{ display: 'grid', gap: 16 }}>
        <StayForm form={form} onChange={setField} />
        <QuoteResult result={result} pet={form.pet} config={config} />
      </main>
      <SettingsPanel config={config} onChange={update} onReset={reset} />
    </>
  )
}
