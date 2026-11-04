import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from '../config/defaults'
import { passeioQuote, type PasseioInput, type PasseioQuote } from './passeio'

// 02/03/2026 é uma segunda-feira comum; 21/04/2026 é Tiradentes.
const base: PasseioInput = { data: '2026-03-02', caes: 1, passeios: 1 }
function ok(extra: Partial<PasseioInput> = {}, config = DEFAULT_CONFIG): PasseioQuote {
  const r = passeioQuote({ ...base, ...extra }, config)
  if (!r.ok) throw new Error(r.erro)
  return r
}
const total = (extra: Partial<PasseioInput>) => ok(extra).total

describe('valores por passeios e cachorros', () => {
  it.each([
    [1, 1, 2000],
    [1, 2, 3500],
    [1, 3, 5000],
    [1, 4, 6500],
    [2, 1, 3500],
    [2, 2, 6500],
    [2, 3, 9500],
    [2, 4, 12500],
    [3, 1, 5000],
    [4, 1, 6500],
  ])('%i cachorro(s), %i passeio(s): %i centavos', (caes, passeios, esperado) => {
    expect(total({ caes, passeios })).toBe(esperado)
  })
})

describe('detalhamento', () => {
  it('separa base, adicionais e desconto, e a soma fecha com o total', () => {
    const q = ok({ caes: 3, passeios: 3 })
    expect(q).toMatchObject({ base: 6000, adicionalCaes: 9000, desconto: 1000, total: 14000 })
  })

  it('feriado é informado, mas não altera o preço', () => {
    expect(ok({ data: '2026-04-21' })).toMatchObject({ total: 2000, feriado: 'Tiradentes' })
    expect(ok().feriado).toBeUndefined()
  })

  it('a configuração altera o cálculo', () => {
    expect(total({ passeios: 2 })).toBe(3500)
    expect(ok({ passeios: 2 }, { ...DEFAULT_CONFIG, pasDesconto: 0 }).total).toBe(4000)
  })
})

describe('validação', () => {
  it('data em branco é só dica', () => {
    expect(passeioQuote({ ...base, data: '' }, DEFAULT_CONFIG)).toMatchObject({ ok: false, vazio: true })
  })
  it('rejeita data inexistente, zero cachorros e zero passeios', () => {
    expect(passeioQuote({ ...base, data: '2026-02-30' }, DEFAULT_CONFIG)).toMatchObject({ ok: false, vazio: false })
    expect(passeioQuote({ ...base, caes: 0 }, DEFAULT_CONFIG)).toMatchObject({ ok: false })
    expect(passeioQuote({ ...base, passeios: 0 }, DEFAULT_CONFIG)).toMatchObject({ ok: false })
  })
})
