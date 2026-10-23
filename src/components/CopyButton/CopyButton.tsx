import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import styles from './CopyButton.module.css'

export default function CopyButton({ text }: { text: string }) {
  const { state, copy } = useCopyToClipboard()

  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.button} onClick={() => copy(text)}>
        {state === 'copied' ? 'Copiado!' : 'Copiar orçamento'}
      </button>
      <p role="status" className={styles.status}>
        {state === 'failed' && 'Não consegui copiar sozinho. Selecione o texto abaixo e copie.'}
      </p>
      {state === 'failed' && (
        <textarea
          readOnly
          rows={12}
          value={text}
          aria-label="Orçamento para copiar"
          onFocus={(e) => e.currentTarget.select()}
        />
      )}
    </div>
  )
}
