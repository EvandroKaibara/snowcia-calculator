import { useCallback, useEffect, useRef, useState } from 'react'

export type CopyState = 'idle' | 'copied' | 'failed'

export function useCopyToClipboard(resetMs = 2000) {
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = useCallback(
    async (text: string) => {
      window.clearTimeout(timer.current)
      try {
        await navigator.clipboard.writeText(text)
        setState('copied')
        timer.current = window.setTimeout(() => setState('idle'), resetMs)
      } catch {
        setState('failed') // sem permissão ou sem HTTPS: a tela mostra o texto para copiar à mão
      }
    },
    [resetMs],
  )

  return { state, copy }
}
