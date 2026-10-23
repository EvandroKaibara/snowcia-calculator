import { describe, expect, it } from 'vitest'
import { holidaysFor } from './holidays'

describe('feriados de São Paulo', () => {
  const h2026 = holidaysFor(2026)

  it.each(['2026-01-25', '2026-04-03', '2026-04-21', '2026-06-04', '2026-07-09', '2026-11-20', '2026-12-25'])(
    'reconhece %s em 2026',
    (data) => expect(h2026.has(data)).toBe(true),
  )

  it('não trata Carnaval como feriado', () => {
    expect(h2026.has('2026-02-16')).toBe(false)
    expect(h2026.has('2026-02-17')).toBe(false)
  })

  it('calcula a Páscoa de outros anos', () => {
    const h2027 = holidaysFor(2027)
    expect(h2027.get('2027-03-26')).toBe('Sexta-feira da Paixão')
    expect(h2027.get('2027-05-27')).toBe('Corpus Christi')
  })

  it('aceita feriado extra e renomeia um existente', () => {
    const h = holidaysFor(2026, [
      { data: '2026-03-10', nome: 'Aniversário do hotel' },
      { data: '2026-04-21', nome: 'Tiradentes (ajustado)' },
    ])
    expect(h.get('2026-03-10')).toBe('Aniversário do hotel')
    expect(h.get('2026-04-21')).toBe('Tiradentes (ajustado)')
    expect(holidaysFor(2027, [{ data: '2026-03-10', nome: 'x' }]).has('2026-03-10')).toBe(false)
  })
})
