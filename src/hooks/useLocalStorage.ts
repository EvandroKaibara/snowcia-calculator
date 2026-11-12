import { useEffect, useState } from 'react'

// Mescla com o valor inicial: chaves novas de uma versão futura ganham o padrão em vez de ficarem undefined.
export function useLocalStorage<T extends object>(key: string, initial: T, migrate: (stored: T) => T = (v) => v) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? migrate({ ...initial, ...JSON.parse(raw) }) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Navegação privativa ou armazenamento cheio: segue funcionando só na sessão.
    }
  }, [key, value])

  return [value, setValue] as const
}
