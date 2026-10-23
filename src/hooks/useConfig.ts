import { useCallback } from 'react'
import { DEFAULT_CONFIG, type Config } from '../config/defaults'
import { useLocalStorage } from './useLocalStorage'

export function useConfig() {
  const [config, setConfig] = useLocalStorage<Config>('snowcia-config', DEFAULT_CONFIG)
  const update = useCallback(<K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig((c) => ({ ...c, [key]: value }))
  }, [setConfig])
  const reset = useCallback(() => setConfig(DEFAULT_CONFIG), [setConfig])
  return { config, update, reset }
}
