import { useCallback } from 'react'
import { DEFAULT_CONFIG, type Config } from '../config/defaults'
import { useLocalStorage } from './useLocalStorage'

// O R$ 20,00 do primeiro passeio foi substituído por R$ 25,00; o valor antigo ficou salvo nos navegadores que já abriram o app.
const OLD_PAS_BASE = 2000

export function useConfig() {
  const [config, setConfig] = useLocalStorage<Config>('snowcia-config', DEFAULT_CONFIG, (c) =>
    c.pasBase === OLD_PAS_BASE ? { ...c, pasBase: DEFAULT_CONFIG.pasBase } : c,
  )
  const update = useCallback(<K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig((c) => ({ ...c, [key]: value }))
  }, [setConfig])
  const reset = useCallback(() => setConfig(DEFAULT_CONFIG), [setConfig])
  return { config, update, reset }
}
